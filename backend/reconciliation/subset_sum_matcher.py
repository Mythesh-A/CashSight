"""
subset_sum_matcher.py

Step 2 of reconciliation: given a settlement's gross_amount (with no
order_ids to lean on), search a date-windowed pool of ledger orders for
every combination — size 1 up to MAX_COMBINATION_SIZE — that sums to
the settlement's amount within tolerance. This is the file that proves
batching is genuinely discovered, not read off a label.

Returns ALL valid combinations found, including more than one — it is
ambiguity_resolver.py's job, not this file's, to decide what to do when
more than one exists.
"""

import itertools
from datetime import datetime, timedelta

from backend import config as cfg


def _parse_date(s):
    return datetime.strptime(s, "%Y-%m-%d")


def find_order_combinations(settlement, ledger_orders):
    """
    settlement: dict with gross_amount, settlement_date
    ledger_orders: list of dicts with order_id, order_date, gross_amount

    Returns a list of candidate combinations, each a sorted list of
    order_ids:
      []              -> no combination found (unresolved_batch)
      [combo]          -> exactly one valid combination (confident match)
      [combo1, combo2] -> 2+ valid combinations (ambiguous_batch)
    """
    settlement_date = _parse_date(settlement["settlement_date"])
    window_start = settlement_date - timedelta(days=cfg.LEDGER_LOOKBACK_DAYS)

    pool = [
        o for o in ledger_orders
        if window_start <= _parse_date(o["order_date"]) <= settlement_date
    ]

    target = settlement["gross_amount"]
    found = []
    seen = set()

    for size in range(1, cfg.MAX_COMBINATION_SIZE + 1):
        for combo in itertools.combinations(pool, size):
            total = round(sum(o["gross_amount"] for o in combo), 2)
            if abs(total - target) <= cfg.MATCH_TOLERANCE_RUPEES:
                order_ids = tuple(sorted(o["order_id"] for o in combo))
                if order_ids in seen:
                    continue
                seen.add(order_ids)
                found.append(list(order_ids))

    return found
