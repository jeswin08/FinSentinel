"""Seed FinSentinel MongoDB with sample transactions from creditcard.csv.

Usage:
    python seed_data.py

Optional environment variables:
    MONGO_URL     MongoDB connection string
    DB_NAME       Database name (default: finsentinel)
    SEED_COUNT    Number of sample transactions to insert (default: 500)
    SAMPLE_MODE   first or random (default: first)
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import os
import random
from datetime import datetime, timedelta, timezone
from pathlib import Path

import certifi
from dotenv import load_dotenv
from pymongo import MongoClient

# Import Config to use same database URL as backend
from config import Config


BASE_DIR = Path(__file__).resolve().parent
CSV_PATH = BASE_DIR / "creditcard.csv"
DEFAULT_COUNT = 300000  # Loads all available rows from CSV
ALLOWED_SAMPLE_MODES = {"first", "random"}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Seed MongoDB with sample transactions.")
    parser.add_argument("--count", type=int, default=int(os.getenv("SEED_COUNT", DEFAULT_COUNT)))
    parser.add_argument("--csv", dest="csv_path", default=str(CSV_PATH))
    parser.add_argument("--db-name", default=os.getenv("DB_NAME", Config.DB_NAME))
    parser.add_argument("--mongo-url", default=os.getenv("MONGO_URL", Config.MONGO_URL))
    parser.add_argument(
        "--sample-mode",
        choices=sorted(ALLOWED_SAMPLE_MODES),
        default=os.getenv("SAMPLE_MODE", "first"),
        help="Choose the source rows from creditcard.csv",
    )
    return parser


def get_mongo_client(mongo_url: str) -> MongoClient:
    kwargs = {"serverSelectionTimeoutMS": 10000}
    if mongo_url.startswith("mongodb+srv://"):
        kwargs["tlsCAFile"] = certifi.where()
    return MongoClient(mongo_url, **kwargs)


def load_credit_card_rows(csv_path: Path) -> list[dict[str, str]]:
    with csv_path.open(newline="", encoding="utf-8") as csv_file:
        reader = csv.DictReader(csv_file)
        return list(reader)


def select_rows(rows: list[dict[str, str]], limit: int, sample_mode: str) -> list[dict[str, str]]:
    if len(rows) <= limit:
        return rows

    if sample_mode == "random":
        return random.sample(rows, limit)

    return rows[:limit]


def risk_profile(amount: float, is_fraud: bool) -> tuple[float, float, float, str, str]:
    ml_score = round(random.uniform(0, 100), 2)

    amount_factor = min(amount / 1000.0, 100.0)
    label_boost = 35.0 if is_fraud else 8.0
    rule_score = round(min(100.0, amount_factor * 0.5 + label_boost + random.uniform(0, 20)), 2)

    final_score = round(min(100.0, ml_score * 0.6 + rule_score * 0.4), 2)

    if final_score >= 75:
        risk_level = "Fraud"
        decision = "Blocked"
    elif final_score >= 40:
        risk_level = "Suspicious"
        decision = "OTP Required"
    else:
        risk_level = "Safe"
        decision = "Approved"

    return ml_score, rule_score, final_score, risk_level, decision


def build_transaction(row: dict[str, str], index: int) -> dict[str, object]:
    amount = float(row.get("Amount", 0) or 0)
    is_fraud = str(row.get("Class", "0")).strip().strip('"') == "1"
    ml_score, rule_score, final_score, risk_level, decision = risk_profile(amount, is_fraud)

    start_time = datetime(2026, 1, 1, tzinfo=timezone.utc)
    timestamp_offset = int(float(row.get("Time", 0) or 0))
    row_fingerprint = f"{row.get('Time', '')}:{row.get('Amount', '')}:{row.get('Class', '')}:{index}"
    transaction_id = f"TXN-{hashlib.sha1(row_fingerprint.encode('utf-8')).hexdigest()[:12].upper()}"

    user_id = f"USR-{random.randint(1000, 9999)}"
    location = random.choice(
        [
            "New York, US",
            "Los Angeles, US",
            "Chicago, US",
            "Houston, US",
            "London, UK",
            "Paris, FR",
            "Tokyo, JP",
            "Sydney, AU",
            "Unknown Location",
            "VPN Detected",
        ]
    )
    device_id = f"DEV-{random.randint(10000000, 99999999)}"

    return {
        "transaction_id": transaction_id,
        "user_id": user_id,
        "amount": round(amount, 2),
        "location": location,
        "device_id": device_id,
        "ml_score": ml_score,
        "rule_score": rule_score,
        "final_score": final_score,
        "risk_level": risk_level,
        "decision": decision,
        "timestamp": (start_time + timedelta(seconds=timestamp_offset)).isoformat(),
    }


def seed_transactions(collection, transactions: list[dict[str, object]]) -> tuple[int, int]:
    inserted = 0
    updated = 0

    for transaction in transactions:
        result = collection.update_one(
            {"transaction_id": transaction["transaction_id"]},
            {"$set": transaction},
            upsert=True,
        )
        if result.upserted_id is not None:
            inserted += 1
        elif result.modified_count > 0:
            updated += 1

    return inserted, updated


def main() -> int:
    load_dotenv()
    parser = build_parser()
    args = parser.parse_args()

    mongo_url = args.mongo_url or os.getenv("MONGO_URL")
    if not mongo_url:
        raise SystemExit("MONGO_URL is not set. Export it or pass --mongo-url.")

    csv_path = Path(args.csv_path)
    if not csv_path.exists():
        raise SystemExit(f"CSV file not found: {csv_path}")

    if args.sample_mode not in ALLOWED_SAMPLE_MODES:
        raise SystemExit(f"Unsupported sample mode: {args.sample_mode}")

    rows = select_rows(load_credit_card_rows(csv_path), args.count, args.sample_mode)
    if not rows:
        raise SystemExit("No rows were read from creditcard.csv")

    client = get_mongo_client(mongo_url)
    db = client[args.db_name]
    collection = db["transactions"]

    transactions = [build_transaction(row, index) for index, row in enumerate(rows)]
    inserted, updated = seed_transactions(collection, transactions)

    print(
        f"Seeded {len(transactions)} sample transactions into {args.db_name}.transactions "
        f"({inserted} inserted, {updated} updated)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())