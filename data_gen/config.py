import os

SEED = 42

# ---- Paths -----------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GENERATED_DIR = os.path.join(BASE_DIR, "data", "generated")
GROUND_TRUTH_DIR = os.path.join(BASE_DIR, "data", "ground_truth")

LEDGER_CSV = os.path.join(GENERATED_DIR, "ledger.csv")
SETTLEMENTS_CSV = os.path.join(GENERATED_DIR, "settlements.csv")
BANK_STATEMENT_CSV = os.path.join(GENERATED_DIR, "bank_statement.csv")
ANSWER_KEY_JSON = os.path.join(GROUND_TRUTH_DIR, "answer_key.json")

# ---- Volume ------------------------------------------------------------
N_SETTLEMENTS = 60          # total settlement records (the "50+ record batch")
N_DISTRACTOR_ORDERS = 25    # extra ledger orders that belong to no settlement,
                             # so subset-sum search is actually stress-tested

# ---- Anomaly type distribution (must sum to 1.0) ------------------------
# unlinked_credit is handled as an orphan bank row, not a settlement-level
# anomaly, but is expressed as a fraction of N_SETTLEMENTS for convenience.
ANOMALY_DISTRIBUTION = {
    "clean": 0.60,
    "batched_settlement": 0.20,
    "missing_bank_credit": 0.10,
    "unlinked_credit": 0.05,
    "ambiguous_batch": 0.05,
}

# ---- Amounts -------------------------------------------------------------
MIN_ORDER_AMOUNT = 500
MAX_ORDER_AMOUNT = 5000

# ---- Fee structure ---------------------------------------------------
RAZORPAY_FEE_RATE = 0.02
GST_ON_FEE_RATE = 0.18
TDS_RATE = 0.01

# ---- Timing ------------------------------------------------------------
BASE_DATE = "2026-07-01"       # first order date in the synthetic timeline
SETTLEMENT_LAG_DAYS = 2        # order_date -> settlement_date
BANK_LAG_MIN_DAYS = 0
BANK_LAG_MAX_DAYS = 2

# ---- Matching engine parameters (both data_gen and backend must agree) --
LEDGER_LOOKBACK_DAYS = 7
MATCH_TOLERANCE_RUPEES = 1.0
MAX_COMBINATION_SIZE = 3
