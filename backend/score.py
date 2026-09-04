import json

from backend import config as cfg


def load_answer_key():
    with open(cfg.ANSWER_KEY_JSON) as f:
        return json.load(f)


def _index_answer_key(answer_key):
    return {e["settlement_id"]: e for e in answer_key["settlements"]}


def _index_predictions(reconciliation_result):
    preds = {}

    for m in reconciliation_result["matches"]:
        preds[m["settlement_id"]] = {
            "outcome": "matched",
            "bank_txn_id": m["bank_txn_id"],
            "order_ids": set(m["order_ids"]),
        }

    for e in reconciliation_result["exceptions"]:
        if e["exception_type"] == "unlinked_credit":
            continue  # not settlement-keyed, scored separately
        preds[e["settlement_id"]] = {
            "outcome": e["exception_type"],
            "bank_txn_id": e.get("bank_txn_id"),
            "order_ids": None,
        }

    return preds


def _prf1(tp, fp, fn):
    precision = tp / (tp + fp) if (tp + fp) else 0.0
    recall = tp / (tp + fn) if (tp + fn) else 0.0
    f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) else 0.0
    return {
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1": round(f1, 4),
        "tp": tp, "fp": fp, "fn": fn,
    }


def score_bank_tier(preds, gt_index):
    tp = fp = fn = 0
    for sid, gt in gt_index.items():
        pred = preds.get(sid)
        predicted_txn = pred["bank_txn_id"] if pred else None
        actual_txn = gt["matched_txn_id"]

        if predicted_txn is not None and actual_txn is not None and predicted_txn == actual_txn:
            tp += 1
        elif predicted_txn is not None:
            fp += 1
        elif actual_txn is not None:
            fn += 1
        # both None -> correctly identified missing_bank_credit; not counted here
    return _prf1(tp, fp, fn)


def score_ledger_tier(preds, gt_index):
    tp = fp = fn = 0
    for sid, gt in gt_index.items():
        if gt["anomaly_type"] not in ("clean", "batched_settlement"):
            continue
        pred = preds.get(sid)
        gt_orders = set(gt["matched_order_ids"])

        if pred and pred["outcome"] == "matched" and pred["order_ids"] == gt_orders:
            tp += 1
        elif pred and pred["outcome"] == "matched":
            fp += 1
        else:
            fn += 1
    return _prf1(tp, fp, fn)


def score_end_to_end(preds, gt_index):
    tp = fp = fn = 0
    for sid, gt in gt_index.items():
        if gt["anomaly_type"] not in ("clean", "batched_settlement"):
            continue
        pred = preds.get(sid)
        gt_orders = set(gt["matched_order_ids"])
        gt_txn = gt["matched_txn_id"]

        fully_correct = (
            pred is not None
            and pred["outcome"] == "matched"
            and pred["bank_txn_id"] == gt_txn
            and pred["order_ids"] == gt_orders
        )
        claimed_match = pred is not None and pred["outcome"] == "matched"

        if fully_correct:
            tp += 1
        elif claimed_match:
            fp += 1
        else:
            fn += 1
    return _prf1(tp, fp, fn)


def score_exception_types(preds, gt_index):
    types = ["missing_bank_credit", "unresolved_batch", "ambiguous_batch"]
    results = {}
    for t in types:
        tp = fp = fn = 0
        for sid, gt in gt_index.items():
            pred = preds.get(sid)
            predicted_type = pred["outcome"] if pred else None
            actual_is_t = gt["anomaly_type"] == t
            predicted_is_t = predicted_type == t

            if predicted_is_t and actual_is_t:
                tp += 1
            elif predicted_is_t and not actual_is_t:
                fp += 1
            elif actual_is_t and not predicted_is_t:
                fn += 1
        results[t] = _prf1(tp, fp, fn)
    return results


def score_unlinked_credits(reconciliation_result, answer_key):
    predicted_ids = {
        e["txn_id"] for e in reconciliation_result["exceptions"]
        if e["exception_type"] == "unlinked_credit"
    }
    actual_ids = set(answer_key["unlinked_credit_txn_ids"])

    tp = len(predicted_ids & actual_ids)
    fp = len(predicted_ids - actual_ids)
    fn = len(actual_ids - predicted_ids)
    return _prf1(tp, fp, fn)


def false_positive_cost(preds, gt_index, settlements_by_id):
    cost = 0.0
    for sid, gt in gt_index.items():
        pred = preds.get(sid)
        if not pred or pred["outcome"] != "matched":
            continue
        gt_orders = set(gt["matched_order_ids"])
        correct = (
            gt["anomaly_type"] in ("clean", "batched_settlement")
            and pred["bank_txn_id"] == gt["matched_txn_id"]
            and pred["order_ids"] == gt_orders
        )
        if not correct:
            cost += settlements_by_id[sid]["gross_amount"]
    return round(cost, 2)


def compute_scores(reconciliation_result, settlements):
    answer_key = load_answer_key()
    gt_index = _index_answer_key(answer_key)
    preds = _index_predictions(reconciliation_result)
    settlements_by_id = {s["settlement_id"]: s for s in settlements}

    return {
        "bank_tier": score_bank_tier(preds, gt_index),
        "ledger_tier": score_ledger_tier(preds, gt_index),
        "end_to_end_tier": score_end_to_end(preds, gt_index),
        "exception_type_metrics": score_exception_types(preds, gt_index),
        "unlinked_credit_metrics": score_unlinked_credits(reconciliation_result, answer_key),
        "false_positive_cost_inr": false_positive_cost(preds, gt_index, settlements_by_id),
    }


if __name__ == "__main__":
    from backend.reconciliation.pipeline import run_reconciliation, load_data

    settlements, ledger, bank = load_data()
    result = run_reconciliation(settlements, ledger, bank)
    scores = compute_scores(result, settlements)
    print(json.dumps(scores, indent=2))
