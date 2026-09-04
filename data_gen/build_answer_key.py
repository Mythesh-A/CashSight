import json

from data_gen import config


def build_answer_key(plan, path=None):
    path = path or config.ANSWER_KEY_JSON
    entries = []

    for s in plan["settlements"]:
        entries.append({
            "settlement_id": s["settlement_id"],
            "matched_txn_id": s["bank_txn_id"],  # None if missing_bank_credit
            "matched_order_ids": [o["order_id"] for o in s["orders"]],
            "decoy_order_ids": [o["order_id"] for o in s["decoy_orders"]],
            "anomaly_type": s["anomaly_type"],
        })

    payload = {
        "settlements": entries,
        "unlinked_credit_txn_ids": [u["txn_id"] for u in plan["unlinked_credits"]],
    }

    with open(path, "w") as f:
        json.dump(payload, f, indent=2)

    print(f"[build_answer_key] wrote {len(entries)} answer-key entries -> {path}")
    return payload


if __name__ == "__main__":
    from data_gen.inject_anomalies import build_plan
    build_answer_key(build_plan())
