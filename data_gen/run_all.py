import os

from data_gen import config
from data_gen.inject_anomalies import build_plan
from data_gen.generate_ledger import generate_ledger
from data_gen.generate_settlements import generate_settlements
from data_gen.generate_bank_statement import generate_bank_statement
from data_gen.build_answer_key import build_answer_key


def main():
    os.makedirs(config.GENERATED_DIR, exist_ok=True)
    os.makedirs(config.GROUND_TRUTH_DIR, exist_ok=True)

    plan = build_plan()

    generate_ledger(plan)
    generate_settlements(plan)
    generate_bank_statement(plan)
    build_answer_key(plan)

    n_settlements = len(plan["settlements"])
    n_orders = sum(len(s["orders"]) + len(s["decoy_orders"]) for s in plan["settlements"])
    n_orders += len(plan["distractor_orders"])
    n_bank_rows = sum(1 for s in plan["settlements"] if s["has_bank_credit"])
    n_bank_rows += len(plan["unlinked_credits"])

    print("\n[run_all] Done.")
    print(f"  settlements : {n_settlements}")
    print(f"  ledger rows : {n_orders}  (incl. decoys + distractors)")
    print(f"  bank rows   : {n_bank_rows}")
    print(f"\nFiles:")
    print(f"  {config.LEDGER_CSV}")
    print(f"  {config.SETTLEMENTS_CSV}")
    print(f"  {config.BANK_STATEMENT_CSV}")
    print(f"  {config.ANSWER_KEY_JSON}")


if __name__ == "__main__":
    main()
