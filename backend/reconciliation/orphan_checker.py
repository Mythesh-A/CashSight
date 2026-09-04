"""
orphan_checker.py

Step 3 of reconciliation: finds bank transactions whose UTR doesn't
correspond to any settlement at all — real money in, with nothing to
reconcile it against. Flagged as unlinked_credit.
"""


def find_orphan_credits(bank_transactions, settlements):
    """
    Find bank transactions that don't match any settlement.
    
    Args:
        bank_transactions: list of bank transaction dicts
        settlements: list of settlement dicts
    
    Returns:
        list of orphan bank transactions with additional fields
    """
    settlement_utrs = {s["utr"] for s in settlements}
    
    orphans = []
    for txn in bank_transactions:
        if txn["utr"] not in settlement_utrs:
            # Return the full transaction with amount explicitly included
            orphans.append({
                "txn_id": txn.get("txn_id"),
                "utr": txn.get("utr"),
                "value_date": txn.get("value_date"),
                "credited_amount": txn.get("credited_amount", 0),
                "amount": txn.get("credited_amount", 0),  # ← ADDED for consistency
                "narration": txn.get("narration", ""),
            })
    
    return orphans