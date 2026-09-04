from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class Order:
    order_id: str
    order_date: str
    gross_amount: float
    customer_id: str
    status: str


@dataclass
class Settlement:
    settlement_id: str
    utr: str
    settlement_date: str
    gross_amount: float
    razorpay_fee: float
    gst_on_fee: float
    tds_deducted: float
    net_amount: float


@dataclass
class BankTransaction:
    txn_id: str
    value_date: str
    utr: str
    credited_amount: float
    narration: str


@dataclass
class MatchResult:
    settlement_id: str
    match_type: str  # "clean" | "batched_settlement"
    bank_txn_id: str
    order_ids: List[str] = field(default_factory=list)


@dataclass
class ExceptionRecord:
    id: str
    exception_type: str  # missing_bank_credit | unresolved_batch | ambiguous_batch | unlinked_credit
    detail: str = ""
    settlement_id: Optional[str] = None
    txn_id: Optional[str] = None
    bank_txn_id: Optional[str] = None
    candidate_combinations: Optional[List[List[str]]] = None
