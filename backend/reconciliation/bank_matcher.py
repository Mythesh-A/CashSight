"""
bank_matcher.py

Step 1 of reconciliation: match each settlement to its bank credit by
UTR, within a date window, within an amount tolerance. This file does
NOT know about ledger orders or the answer key — it only ever sees
settlements.csv and bank_statement.csv.
"""

from datetime import datetime, timedelta

from backend import config as cfg


def _parse_date(s):
    return datetime.strptime(s, "%Y-%m-%d")


def match_settlement_to_bank(settlement, bank_transactions):
    """
    settlement: dict with settlement_id, utr, settlement_date, net_amount
    bank_transactions: list of dicts with txn_id, value_date, utr, credited_amount

    Returns the matched bank transaction dict, or None if no candidate
    satisfies UTR + date window + amount tolerance.
    """
    settlement_date = _parse_date(settlement["settlement_date"])
    window_end = settlement_date + timedelta(days=cfg.BANK_MATCH_WINDOW_DAYS)

    candidates = []
    for txn in bank_transactions:
        if txn["utr"] != settlement["utr"]:
            continue
        txn_date = _parse_date(txn["value_date"])
        if not (settlement_date <= txn_date <= window_end):
            continue
        if abs(txn["credited_amount"] - settlement["net_amount"]) > cfg.MATCH_TOLERANCE_RUPEES:
            continue
        candidates.append(txn)

    if not candidates:
        return None

    # UTR + date window + amount tolerance is already a tight filter.
    # If more than one candidate somehow still qualifies, prefer the
    # closest amount match rather than guessing arbitrarily.
    candidates.sort(key=lambda t: abs(t["credited_amount"] - settlement["net_amount"]))
    return candidates[0]


def match_all_settlements_to_bank(settlements, bank_transactions):
    """Returns dict: settlement_id -> matched bank txn dict, or None."""
    return {s["settlement_id"]: match_settlement_to_bank(s, bank_transactions) for s in settlements}
