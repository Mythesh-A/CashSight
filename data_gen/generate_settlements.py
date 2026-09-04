import csv

from data_gen import config

FIELDNAMES = [
    "settlement_id", "utr", "settlement_date", "gross_amount",
    "razorpay_fee", "gst_on_fee", "tds_deducted", "net_amount",
]


def generate_settlements(plan, path=None):
    path = path or config.SETTLEMENTS_CSV
    rows = []

    for s in plan["settlements"]:
        rows.append({
            "settlement_id": s["settlement_id"],
            "utr": s["utr"],
            "settlement_date": s["settlement_date"],
            "gross_amount": s["gross_amount"],
            "razorpay_fee": s["razorpay_fee"],
            "gst_on_fee": s["gst_on_fee"],
            "tds_deducted": s["tds_deducted"],
            "net_amount": s["net_amount"],
        })

    with open(path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDNAMES)
        writer.writeheader()
        writer.writerows(rows)

    print(f"[generate_settlements] wrote {len(rows)} settlements -> {path}")
    return rows


if __name__ == "__main__":
    from data_gen.inject_anomalies import build_plan
    generate_settlements(build_plan())
