import csv

from data_gen import config

FIELDNAMES = ["txn_id", "value_date", "utr", "credited_amount", "narration"]


def generate_bank_statement(plan, path=None):
    path = path or config.BANK_STATEMENT_CSV
    rows = []

    for s in plan["settlements"]:
        if not s["has_bank_credit"]:
            continue
        rows.append({
            "txn_id": s["bank_txn_id"],
            "value_date": s["bank_date"],
            "utr": s["utr"],
            "credited_amount": s["bank_credited_amount"],
            "narration": f"NEFT-RAZORPAY-{s['utr']}",
        })

    rows.extend(plan["unlinked_credits"])
    rows.sort(key=lambda r: r["value_date"])

    with open(path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)

    print(f"[generate_bank_statement] wrote {len(rows)} bank rows -> {path}")
    return rows


if __name__ == "__main__":
    from data_gen.inject_anomalies import build_plan
    generate_bank_statement(build_plan())
