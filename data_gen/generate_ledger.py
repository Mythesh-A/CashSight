import csv

from data_gen import config

FIELDNAMES = ["order_id", "order_date", "gross_amount", "customer_id", "status"]


def generate_ledger(plan, path=None):
    path = path or config.LEDGER_CSV
    rows = []

    for settlement in plan["settlements"]:
        rows.extend(settlement["orders"])
        rows.extend(settlement["decoy_orders"])

    rows.extend(plan["distractor_orders"])
    rows.sort(key=lambda r: r["order_id"])

    with open(path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)

    print(f"[generate_ledger] wrote {len(rows)} orders -> {path}")
    return rows


if __name__ == "__main__":
    from data_gen.inject_anomalies import build_plan
    generate_ledger(build_plan())
