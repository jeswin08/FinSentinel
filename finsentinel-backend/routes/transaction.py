from fastapi import APIRouter
from typing import List
from model.transaction import Transaction
from services.transaction_service import get_all_transactions, add_transaction

router = APIRouter()

@router.options("/transactions")
async def options_transactions():
    """Handle CORS preflight requests"""
    return {"status": "ok"}

@router.get("/transactions", response_model=List[Transaction])
async def read_transactions():
    return await get_all_transactions()

@router.post("/transactions", response_model=Transaction)
async def create_transaction(transaction: Transaction):
    return await add_transaction(transaction)
