def get_explanation(exception_record):

    etype = exception_record.get("exception_type", "unknown")
    
    explanation_generators = {
        "missing_bank_credit": _explain_missing_bank_credit,
        "ambiguous_batch": _explain_ambiguous_batch,
        "unresolved_batch": _explain_unresolved_batch,
        "unlinked_credit": _explain_unlinked_credit,
    }
    
    generator = explanation_generators.get(etype, _explain_unknown)
    return generator(exception_record)


def _explain_missing_bank_credit(record):
    """Generate explanation for missing bank credit"""
    record_id = record.get("settlement_id", "Unknown")
    amount = record.get("amount", 0)
    utr = record.get("utr", "N/A")
    detail = record.get("detail", "")
    settlement_date = record.get("settlement_date", "")
    
    
    age_days = "unknown"
    if settlement_date:
        try:
            from datetime import datetime
            s_date = datetime.strptime(settlement_date, "%Y-%m-%d")
            age_days = (datetime.now() - s_date).days
        except:
            pass
    
    
    if age_days != "unknown":
        if age_days <= 1:
            urgency = "⏳ Normal - Bank settlements typically take 1-2 business days."
        elif age_days <= 3:
            urgency = "⏳ Monitor - This is taking longer than usual. Check with your bank."
        else:
            urgency = "🚨 Urgent - This settlement is significantly overdue. Contact Razorpay support immediately."
    else:
        urgency = "📋 Please verify the settlement date and check with your bank."
    
    return f"""🔴 Missing Bank Credit

We found a settlement in Razorpay that has not yet appeared in your bank statement.

Settlement ID: {record_id}
UTR: {utr}
Amount: ₹{amount:,.2f}

What this means:
The settlement was created by Razorpay on {settlement_date or 'the settlement date'} but the funds have not been credited to your bank account.

This typically happens when:
  • The bank is processing the transfer (1-2 business days)
  • The UTR number was entered incorrectly
  • The funds were sent to a different bank account

What you should do:
  • Check your bank statement for UTR: {utr}
  • Verify the settlement amount: ₹{amount:,.2f}
  • {urgency}
  • If not resolved in 3 days, contact Razorpay support with this UTR

{detail if detail else 'No additional details available.'}"""


def _explain_ambiguous_batch(record):
    """Generate explanation for ambiguous batch"""
    record_id = record.get("settlement_id", "Unknown")
    amount = record.get("amount", 0)
    gross_amount = record.get("gross_amount", 0)
    utr = record.get("utr", "N/A")
    candidates = record.get("candidate_combinations", [])
    detail = record.get("detail", "")
    
    # Build candidate combinations text
    combo_text = ""
    if candidates:
        combo_text = "Possible order combinations:"
        for i, combo in enumerate(candidates, 1):
            if isinstance(combo, list):
                combo_text += f"\n  {i}. {', '.join(combo)}"
            else:
                combo_text += f"\n  {i}. {combo}"
    else:
        combo_text = "Multiple valid combinations were found by the system."
    
    batch_size = len(candidates) if candidates else 0
    if batch_size <= 2:
        batch_hint = "There are 2 possible combinations. Review the orders carefully."
    elif batch_size <= 4:
        batch_hint = f"There are {batch_size} possible combinations. Review each one carefully."
    else:
        batch_hint = f"There are {batch_size} possible combinations. The system needs your input."
    
    return f"""🟠 Ambiguous Batch

Settlement ID: {record_id}
UTR: {utr}
Amount: ₹{amount:,.2f}
Gross Amount: ₹{gross_amount:,.2f}

What this means:
The settlement amount of ₹{amount:,.2f} can be created by different combinations of orders.

This happens when:
  • Multiple orders have amounts that sum to the same total
  • The system cannot determine which combination is correct
  • Human review is required to make the final decision

{combo_text}

What you should do:
  • {batch_hint}
  • Check the order dates to ensure they match the settlement period
  • Verify the order amounts are correct in your ledger
  • Select the combination that matches your business records

{detail if detail else 'No additional details available.'}"""


def _explain_unresolved_batch(record):
    """Generate explanation for unresolved batch"""
    record_id = record.get("settlement_id", "Unknown")
    amount = record.get("amount", 0)
    gross_amount = record.get("gross_amount", 0)
    utr = record.get("utr", "N/A")
    bank_txn_id = record.get("bank_txn_id", "Unknown")
    detail = record.get("detail", "")
    
    return f"""🟡 Unresolved Batch

A bank credit was found, but the system could not match it to any combination of orders.

Settlement ID: {record_id}
UTR: {utr}
Bank Transaction: {bank_txn_id}
Amount: ₹{amount:,.2f}
Gross Amount: ₹{gross_amount:,.2f}

What this means:
The bank credited ₹{amount:,.2f} to your account, but we couldn't find any orders in your ledger that add up to this amount.

This could happen if:
  • Orders are missing from your ledger
  • Some orders have incorrect amounts
  • This credit belongs to a different merchant
  • The settlement amount was calculated differently

What you should do:
  • Verify the settlement amount: ₹{amount:,.2f}
  • Check if any orders are missing from your ledger
  • Look for orders with amounts that match the settlement
  • If the amount seems correct but orders are missing, add them to your ledger
  • If the credit doesn't belong to you, contact your bank

{detail if detail else 'No additional details available.'}"""


def _explain_unlinked_credit(record):
    """Generate explanation for unlinked credit"""
    record_id = record.get("txn_id", "Unknown")
    amount = record.get("amount", 0)
    utr = record.get("utr", "N/A")
    value_date = record.get("value_date", "")
    detail = record.get("detail", "")
    
    # Determine possible source
    amount_category = "large" if amount > 10000 else "small"
    source_hint = ""
    if amount_category == "large":
        source_hint = "This is a significant amount. Check if it's a refund, chargeback reversal, or settlement from another merchant."
    else:
        source_hint = "This is a smaller amount. It could be a test transaction, small refund, or a settlement that wasn't recorded properly."
    
    return f"""🔵 Unlinked Credit

Money appeared in your bank account, but there is no matching settlement in Razorpay.

Transaction ID: {record_id}
UTR: {utr}
Amount: ₹{amount:,.2f}
Value Date: {value_date or 'Unknown'}

What this means:
Your bank received ₹{amount:,.2f}, but we couldn't find a corresponding settlement record in Razorpay.

This could be:
  • A refund from a customer
  • A chargeback reversal
  • A settlement from a different merchant
  • A test transaction
  • Interest or fee reversal from Razorpay

What you should do:
  • Check the bank narration for details about this credit
  • Verify if this matches any refund or reversal you were expecting
  • Check Razorpay dashboard for any pending or completed refunds
  • {source_hint}
  • If you cannot identify the source, mark it as an orphan credit

{detail if detail else 'No additional details available.'}"""


def _explain_unknown(record):
    """Generate explanation for unknown exception type"""
    record_id = record.get("settlement_id") or record.get("txn_id", "Unknown")
    amount = record.get("amount", 0)
    etype = record.get("exception_type", "unknown")
    detail = record.get("detail", "")
    
    return f"""⚠️ Exception Detected

An exception of type '{etype}' was detected that requires your attention.

Record ID: {record_id}
Amount: ₹{amount:,.2f}

What this means:
The system identified an issue with this transaction that requires manual review.

What you should do:
  • Review the transaction details carefully
  • Check the corresponding records in your bank and Razorpay
  • Verify the amount and UTR are correct
  • Take appropriate action based on your findings

{detail if detail else 'No additional details available.'}"""