import os

from data_gen import config as datagen_config

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEDGER_CSV = os.path.join(BASE_DIR, "data", "generated", "ledger.csv")
SETTLEMENTS_CSV = os.path.join(BASE_DIR, "data", "generated", "settlements.csv")
BANK_STATEMENT_CSV = os.path.join(BASE_DIR, "data", "generated", "bank_statement.csv")
ANSWER_KEY_JSON = os.path.join(BASE_DIR, "data", "ground_truth", "answer_key.json")


LEDGER_LOOKBACK_DAYS = datagen_config.LEDGER_LOOKBACK_DAYS
MATCH_TOLERANCE_RUPEES = datagen_config.MATCH_TOLERANCE_RUPEES
MAX_COMBINATION_SIZE = datagen_config.MAX_COMBINATION_SIZE
BANK_MATCH_WINDOW_DAYS = 3  # settlement_date -> settlement_date + 3, for bank matching


N_SIMULATIONS = 10000
HORIZON_DAYS = 7


RISK_BASE_RATES = {
    "missing_bank_credit": {"on_time": 0.60, "delayed": 0.25, "failed": 0.15},
    "unresolved_batch": {"on_time": 0.70, "delayed": 0.20, "failed": 0.10},
    "ambiguous_batch": {"on_time": 0.80, "delayed": 0.15, "failed": 0.05},
}

AGE_ADJUSTMENT = {
    "mid": {"min_days": 3, "max_days": 5, "shift": 0.10, "from": "on_time", "to": "delayed"},
    "old": {"min_days": 6, "max_days": None, "shift": 0.10, "from": "delayed", "to": "failed"},
}
