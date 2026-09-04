"""
pipeline.py - FIXED: Proper amount calculation
"""

import csv
from backend import config as cfg
from backend.reconciliation.bank_matcher import match_all_settlements_to_bank
from backend.reconciliation.subset_sum_matcher import find_order_combinations
from backend.reconciliation.ambiguity_resolver import resolve
from backend.reconciliation.orphan_checker import find_orphan_credits


def _load_csv(path):
    with open(path, newline="") as f:
        return list(csv.DictReader(f))


def _coerce_numeric(rows, fields):
    for r in rows:
        for f in fields:
            if r.get(f) not in (None, ""):
                r[f] = float(r[f])
    return rows


def load_data():
    settlements = _coerce_numeric(
        _load_csv(cfg.SETTLEMENTS_CSV),
        ["gross_amount", "razorpay_fee", "gst_on_fee", "tds_deducted", "net_amount"],
    )
    ledger = _coerce_numeric(_load_csv(cfg.LEDGER_CSV), ["gross_amount"])
    bank = _coerce_numeric(_load_csv(cfg.BANK_STATEMENT_CSV), ["credited_amount"])
    return settlements, ledger, bank


def run_reconciliation(settlements=None, ledger=None, bank=None):
    """
    Runs the full reconciliation pipeline end to end.
    """
    if settlements is None or ledger is None or bank is None:
        settlements, ledger, bank = load_data()

    bank_match_map = match_all_settlements_to_bank(settlements, bank)

    matches = []
    exceptions = []
    
    # 🔥 Track amounts properly
    total_matched_amount = 0
    total_exception_amount = 0
    matched_count = 0
    exception_count = 0

    for s in settlements:
        sid = s["settlement_id"]
        bank_txn = bank_match_map.get(sid)
        
        # 🔥 Get the net amount from settlement
        net_amount = s.get("net_amount", 0)
        gross_amount = s.get("gross_amount", 0)

        if bank_txn is None:
            # 🔥 Missing bank credit - this is a pending settlement
            total_exception_amount += net_amount
            exception_count += 1
            exceptions.append({
                "id": sid,
                "exception_type": "missing_bank_credit",
                "settlement_id": sid,
                "detail": f"No bank credit found for UTR {s['utr']} within the match window.",
                "amount": net_amount,
                "gross_amount": gross_amount,
                "utr": s.get("utr"),
                "settlement_date": s.get("settlement_date"),
            })
            continue

        candidates = find_order_combinations(s, ledger)
        status, order_ids = resolve(candidates)

        if status == "resolved":
            match_type = "batched_settlement" if len(order_ids) > 1 else "clean"
            # 🔥 This is a matched settlement - add to matched amount
            total_matched_amount += net_amount
            matched_count += 1
            matches.append({
                "settlement_id": sid,
                "bank_txn_id": bank_txn["txn_id"],
                "order_ids": order_ids,
                "match_type": match_type,
                "net_amount": net_amount,
                "gross_amount": gross_amount,
                "razorpay_fee": s.get("razorpay_fee", 0),
                "gst_on_fee": s.get("gst_on_fee", 0),
                "tds_deducted": s.get("tds_deducted", 0),
                "settlement_date": s.get("settlement_date"),
                "utr": s.get("utr"),
            })
        elif status == "ambiguous":
            total_exception_amount += net_amount
            exception_count += 1
            exceptions.append({
                "id": sid,
                "exception_type": "ambiguous_batch",
                "settlement_id": sid,
                "bank_txn_id": bank_txn["txn_id"],
                "candidate_combinations": candidates,
                "detail": f"{len(candidates)} equally valid order combinations found",
                "amount": net_amount,
                "gross_amount": gross_amount,
                "utr": s.get("utr"),
            })
        else:  # unresolved
            total_exception_amount += net_amount
            exception_count += 1
            exceptions.append({
                "id": sid,
                "exception_type": "unresolved_batch",
                "settlement_id": sid,
                "bank_txn_id": bank_txn["txn_id"],
                "detail": "Bank credit found, but no combination of ledger orders explains the amount.",
                "amount": net_amount,
                "gross_amount": gross_amount,
                "utr": s.get("utr"),
            })

    # 🔥 Check for orphan bank credits
    orphans = find_orphan_credits(bank, settlements)
    for o in orphans:
        exceptions.append({
            "id": o["txn_id"],
            "exception_type": "unlinked_credit",
            "txn_id": o["txn_id"],
            "detail": f"Bank credit of Rs.{o['credited_amount']} (UTR {o['utr']}) has no matching settlement.",
            "amount": o["credited_amount"],
            "utr": o.get("utr"),
            "value_date": o.get("value_date"),
        })

    # 🔥 Print debug info
    print(f"\n🔍 Reconciliation Results:")
    print(f"   Total Matched Amount: ₹{total_matched_amount:,.2f}")
    print(f"   Total Exception Amount: ₹{total_exception_amount:,.2f}")
    print(f"   Matched Count: {matched_count}")
    print(f"   Exception Count: {exception_count}")
    print(f"   Total Settlements: {len(settlements)}")

    return {
        "matches": matches, 
        "exceptions": exceptions,
        "summary": {
            "total_matched_amount": total_matched_amount,
            "total_exception_amount": total_exception_amount,
            "matched_count": matched_count,
            "exception_count": exception_count,
            "total_settlements": len(settlements)
        }
    }