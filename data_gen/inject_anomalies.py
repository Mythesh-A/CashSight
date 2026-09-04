import random
from datetime import datetime, timedelta

from data_gen import config


def _add_days(date_str, days):
    d = datetime.strptime(date_str, "%Y-%m-%d") + timedelta(days=days)
    return d.strftime("%Y-%m-%d")


def _split_settlement_counts():
    """Turns ANOMALY_DISTRIBUTION fractions into integer settlement counts."""
    counts = {}
    remaining = config.N_SETTLEMENTS
    items = list(config.ANOMALY_DISTRIBUTION.items())
    for i, (atype, frac) in enumerate(items):
        if i == len(items) - 1:
            counts[atype] = remaining
        else:
            n = round(config.N_SETTLEMENTS * frac)
            counts[atype] = n
            remaining -= n
    return counts


def _make_order(order_id, order_date):
    amt = round(random.uniform(config.MIN_ORDER_AMOUNT, config.MAX_ORDER_AMOUNT), 2)
    return {
        "order_id": order_id,
        "order_date": order_date,
        "gross_amount": amt,
        "customer_id": f"CUST-{random.randint(1000, 9999)}",
        "status": "paid",
    }, amt


def _make_decoy_combination(target_amount, order_date, id_gen):
    """
    Builds a second, distinct pair of orders whose amounts also sum to
    target_amount within tolerance. This is what makes an ambiguous_batch
    case genuinely ambiguous: the reconciliation engine will find TWO
    valid combinations, not one it's told is "the" answer.
    """
    lo = config.MIN_ORDER_AMOUNT
    hi = max(lo, target_amount - lo)
    first = round(random.uniform(lo, hi), 2)
    second = round(target_amount - first, 2)
    if second < config.MIN_ORDER_AMOUNT:
        # fall back to an even split if the random draw was too lopsided
        first = round(target_amount / 2, 2)
        second = round(target_amount - first, 2)

    decoys = []
    for amt in (first, second):
        oid = next(id_gen)
        decoys.append({
            "order_id": oid,
            "order_date": order_date,
            "gross_amount": amt,
            "customer_id": f"CUST-{random.randint(1000, 9999)}",
            "status": "paid",
        })
    return decoys


def build_plan():
    random.seed(config.SEED)

    def order_id_gen():
        n = 1
        while True:
            yield f"ORD-{n:04d}"
            n += 1

    id_gen = order_id_gen()

    counts = _split_settlement_counts()
    n_unlinked = counts.pop("unlinked_credit", 0)

    settlement_types = []
    for atype, n in counts.items():
        settlement_types.extend([atype] * n)
    random.shuffle(settlement_types)

    plan = []
    current_date = config.BASE_DATE

    for i, atype in enumerate(settlement_types):
        settlement_num = i + 1
        order_date = current_date
        settlement_date = _add_days(order_date, config.SETTLEMENT_LAG_DAYS)

        if atype == "clean":
            n_orders = 1
        elif atype in ("batched_settlement", "ambiguous_batch"):
            n_orders = random.choice([2, 3])
        else:  # missing_bank_credit
            n_orders = 1

        orders = []
        amounts = []
        for _ in range(n_orders):
            oid = next(id_gen)
            order, amt = _make_order(oid, order_date)
            orders.append(order)
            amounts.append(amt)

        gross_amount = round(sum(amounts), 2)

        decoy_orders = []
        if atype == "ambiguous_batch":
            decoy_orders = _make_decoy_combination(gross_amount, order_date, id_gen)

        has_bank_credit = atype != "missing_bank_credit"
        bank_lag = random.randint(config.BANK_LAG_MIN_DAYS, config.BANK_LAG_MAX_DAYS)
        bank_date = _add_days(settlement_date, bank_lag)

        settlement_id = f"STL-{settlement_num:04d}"
        utr = f"UTR-{settlement_num:06d}"
        txn_id = f"TXN-{settlement_num:06d}"

        fee = round(gross_amount * config.RAZORPAY_FEE_RATE, 2)
        gst = round(fee * config.GST_ON_FEE_RATE, 2)
        tds = round(gross_amount * config.TDS_RATE, 2)
        net_amount = round(gross_amount - fee - gst - tds, 2)

        plan.append({
            "settlement_id": settlement_id,
            "utr": utr,
            "settlement_date": settlement_date,
            "gross_amount": gross_amount,
            "razorpay_fee": fee,
            "gst_on_fee": gst,
            "tds_deducted": tds,
            "net_amount": net_amount,
            "anomaly_type": atype,
            "orders": orders,
            "decoy_orders": decoy_orders,
            "has_bank_credit": has_bank_credit,
            "bank_txn_id": txn_id if has_bank_credit else None,
            "bank_date": bank_date if has_bank_credit else None,
            "bank_credited_amount": net_amount if has_bank_credit else None,
        })

        # Spread settlement dates out deliberately. Packing many settlements
        # into the same or nearby dates floods the LEDGER_LOOKBACK_DAYS
        # window with unrelated orders, which causes spurious subset-sum
        # collisions (accidental combinations that coincidentally sum to
        # an unrelated settlement's amount) — this was caught by running
        # the reconciliation engine against the generated data and seeing
        # far more ambiguous_batch exceptions than were deliberately
        # planted. Wider spacing keeps each settlement's real 7-day pool
        # small, so ambiguity in the output reflects genuinely planted
        # ambiguous_batch cases, not generator density artifacts.
        current_date = _add_days(current_date, random.choice([1, 2, 2, 3]))

    # Distractor orders: belong to no settlement, scattered across the same
    # date range, so subset-sum search has real noise to search through.
    distractor_orders = []
    for _ in range(config.N_DISTRACTOR_ORDERS):
        d_date = _add_days(config.BASE_DATE, random.randint(0, len(settlement_types)))
        oid = next(id_gen)
        order, _ = _make_order(oid, d_date)
        distractor_orders.append(order)

    # Unlinked bank credits: real money in, but no settlement UTR maps to it.
    unlinked_credits = []
    for i in range(n_unlinked):
        u_date = _add_days(config.BASE_DATE, random.randint(0, len(settlement_types)))
        unlinked_credits.append({
            "txn_id": f"TXN-ORPHAN-{i + 1:03d}",
            "value_date": u_date,
            "utr": f"UTR-ORPHAN-{i + 1:03d}",
            "credited_amount": round(
                random.uniform(config.MIN_ORDER_AMOUNT, config.MAX_ORDER_AMOUNT), 2
            ),
            "narration": "NEFT-UNKNOWN-CREDIT",
        })

    return {
        "settlements": plan,
        "distractor_orders": distractor_orders,
        "unlinked_credits": unlinked_credits,
    }
