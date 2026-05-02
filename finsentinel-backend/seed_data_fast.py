"""Optimized fast seed with batch inserts for all creditcard.csv transactions."""

import csv
import hashlib
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path

import certifi
from pymongo import MongoClient, UpdateOne
from config import Config

BASE_DIR = Path(__file__).resolve().parent
CSV_PATH = BASE_DIR / "creditcard.csv"
BATCH_SIZE = 5000


def risk_profile(amount: float, is_fraud: bool) -> tuple[float, float, float, str, str]:
    ml_score = round(random.uniform(0, 100), 2)
    amount_factor = min(amount / 1000.0, 100.0)
    label_boost = 35.0 if is_fraud else 8.0
    rule_score = round(min(100.0, amount_factor * 0.5 + label_boost + random.uniform(0, 20)), 2)
    final_score = round(min(100.0, ml_score * 0.6 + rule_score * 0.4), 2)

    if final_score >= 75:
        risk_level, decision = "Fraud", "Blocked"
    elif final_score >= 40:
        risk_level, decision = "Suspicious", "OTP Required"
    else:
        risk_level, decision = "Safe", "Approved"

    return ml_score, rule_score, final_score, risk_level, decision


def build_transaction(row: dict[str, str], index: int) -> dict[str, object]:
    amount = float(row.get("Amount", 0) or 0)
    is_fraud = str(row.get("Class", "0")).strip().strip('"') == "1"
    ml_score, rule_score, final_score, risk_level, decision = risk_profile(amount, is_fraud)

    start_time = datetime(2026, 1, 1, tzinfo=timezone.utc)
    timestamp_offset = int(float(row.get("Time", 0) or 0))
    row_fingerprint = f"{row.get('Time', '')}:{row.get('Amount', '')}:{row.get('Class', '')}:{index}"
    transaction_id = f"TXN-{hashlib.sha1(row_fingerprint.encode('utf-8')).hexdigest()[:12].upper()}"

    return {
        "transaction_id": transaction_id,
        "user_id": f"USR-{random.randint(1000, 9999)}",
        "amount": round(amount, 2),
        "location": random.choice([
            "New York, US", "Los Angeles, US", "Chicago, US", "Houston, US",
            "London, UK", "Paris, FR", "Tokyo, JP", "Sydney, AU",
            "Unknown Location", "VPN Detected"
        ]),
        "device_id": f"DEV-{random.randint(10000000, 99999999)}",
        "ml_score": ml_score,
        "rule_score": rule_score,
        "final_score": final_score,
        "risk_level": risk_level,
        "decision": decision,
        "timestamp": (start_time + timedelta(seconds=timestamp_offset)).isoformat(),
    }


def seed_transactions_batch(collection, csv_path: Path) -> None:
    """Load all transactions from CSV using batch operations."""
    with csv_path.open(newline="", encoding="utf-8") as csv_file:
        reader = csv.DictReader(csv_file)
        batch = []
        total = 0

        for index, row in enumerate(reader):
            transaction = build_transaction(row, index)
            batch.append(
                UpdateOne(
                    {"transaction_id": transaction["transaction_id"]},
                    {"$set": transaction},
                    upsert=True
                )
            )

            if len(batch) >= BATCH_SIZE:
                collection.bulk_write(batch)
                total += len(batch)
                print(f"Processed {total} transactions...", flush=True)
                batch = []

        # Final batch
        if batch:
            collection.bulk_write(batch)
            total += len(batch)
            print(f"Processed {total} transactions...", flush=True)

    print(f"✅ Seeded {total} transactions into {collection.database.name}.{collection.name}")


def main() -> int:
    if not CSV_PATH.exists():
        raise SystemExit(f"CSV file not found: {CSV_PATH}")

    client = MongoClient(Config.MONGO_URL, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=10000)
    db = client[Config.DB_NAME]
    collection = db["transactions"]

    print(f"Loading all transactions from {CSV_PATH.name}...")
    seed_transactions_batch(collection, CSV_PATH)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
