from typing import List
from database.mongo import get_database
from model.transaction import Transaction

async def get_all_transactions() -> List[Transaction]:
    db = get_database()
    transactions = []
    async for transaction in db.transactions.find():
        transaction['id'] = str(transaction.pop('_id'))
        transactions.append(Transaction(**transaction))
    return transactions

async def add_transaction(transaction: Transaction) -> Transaction:
    db = get_database()
    transaction_dict = transaction.dict(by_alias=True, exclude_none=True)
    if 'id' in transaction_dict:
        del transaction_dict['id']
    result = await db.transactions.insert_one(transaction_dict)
    created_transaction = await db.transactions.find_one({"_id": result.inserted_id})
    created_transaction['id'] = str(created_transaction['_id'])
    # Remove _id to avoid Pydantic validation error
    del created_transaction['_id']
    return Transaction(**created_transaction)
