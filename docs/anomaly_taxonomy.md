# Anomaly Taxonomy

CashSight's synthetic dataset (`data_gen/`) injects exactly 5 anomaly
types. Each has a precise definition — precise enough that a judge can
check the engine's classification against it directly.

| Type | Meaning | Where it comes from |
|---|---|---|
| `clean` | One order, one settlement, one bank credit — everything lines up. | Baseline case, 60% of settlements. |
| `batched_settlement` | 2–3 orders are paid out together as a single settlement/UTR. The engine must discover this by searching combinations of ledger orders that sum to the settlement's gross amount — the settlement file itself carries no order-level detail. | `inject_anomalies.py`, 20% of settlements. |
| `missing_bank_credit` | The gateway settlement report shows a settlement exists, but no corresponding bank credit appears within the match window. The settlement itself is real — money just hasn't landed yet (or never will). | `inject_anomalies.py`, 10% of settlements. |
| `unlinked_credit` | A bank credit exists with a UTR that doesn't correspond to any settlement in the gateway report at all. Real money in, nothing to reconcile it against. | `inject_anomalies.py`, planted as orphan bank rows, ~5% of settlement-count-equivalent. |
| `ambiguous_batch` | A settlement's gross amount is validly explained by **two distinct, non-overlapping combinations** of ledger orders — genuine ambiguity, not just a mislabeled batch. The engine must detect that more than one valid explanation exists and refuse to guess. | `inject_anomalies.py`, deliberately plants a second "decoy" combination summing to the same target, 5% of settlements. |

## Related engine-only outcome

`unresolved_batch` is not injected by the generator — it's an outcome
the reconciliation engine can produce on its own if no combination of
ledger orders (up to size 3, within the lookback window) explains a
settlement's amount at all. In the current dataset this doesn't occur
naturally (every real settlement has a discoverable explanation), but
the engine and scoring both support it, and `backend/tests/` exercises
it directly with a synthetic example that has no valid combination.
