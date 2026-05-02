from pydantic import BaseModel, Field
from typing import Optional, List


class Transaction(BaseModel):
    id: Optional[str] = None
    transaction_id: Optional[str] = None
    user_id: Optional[str] = None
    amount: float = 0
    currency: str = "USD"
    merchant: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    device_id: Optional[str] = None
    risk_score: float = 0
    risk_level: Optional[str] = None
    decision: Optional[str] = None
    flagged_rules: List[str] = []
    timestamp: Optional[str] = None
    explanation: Optional[str] = None

    # Legacy credit-card CSV fields (V1..V28, Time, Class)
    Time: Optional[int] = None
    V1: Optional[float] = None
    V2: Optional[float] = None
    V3: Optional[float] = None
    V4: Optional[float] = None
    V5: Optional[float] = None
    V6: Optional[float] = None
    V7: Optional[float] = None
    V8: Optional[float] = None
    V9: Optional[float] = None
    V10: Optional[float] = None
    V11: Optional[float] = None
    V12: Optional[float] = None
    V13: Optional[float] = None
    V14: Optional[float] = None
    V15: Optional[float] = None
    V16: Optional[float] = None
    V17: Optional[float] = None
    V18: Optional[float] = None
    V19: Optional[float] = None
    V20: Optional[float] = None
    V21: Optional[float] = None
    V22: Optional[float] = None
    V23: Optional[float] = None
    V24: Optional[float] = None
    V25: Optional[float] = None
    V26: Optional[float] = None
    V27: Optional[float] = None
    V28: Optional[float] = None
    Class: Optional[int] = None
    Amount: Optional[float] = None

    class Config:
        populate_by_name = True
