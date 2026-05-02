"""Load and manage real transaction data from creditcard.csv for ML-based fraud detection."""

from __future__ import annotations

import logging
import pandas as pd
import random
from pathlib import Path
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

CSV_PATH = Path(__file__).parent.parent / "creditcard.csv"


class TransactionDataLoader:
    """Load and manage real transaction data for ML-based predictions."""

    def __init__(self):
        self.df = None
        self.current_index = 0
        self._load_data()

    def _load_data(self):
        """Load creditcard.csv data."""
        try:
            if CSV_PATH.exists():
                self.df = pd.read_csv(CSV_PATH)
                logger.info(f"✅ Loaded {len(self.df)} transactions from {CSV_PATH.name}")
            else:
                logger.warning(f"⚠️ {CSV_PATH.name} not found")
        except Exception as e:
            logger.error(f"❌ Error loading CSV: {e}")
            self.df = None

    def get_random_transaction(self) -> Optional[Dict[str, Any]]:
        """Get a random real transaction with actual features."""
        if self.df is None or len(self.df) == 0:
            return None

        row = self.df.sample(1).iloc[0]
        return self._row_to_features(row)

    def get_next_transaction(self) -> Optional[Dict[str, Any]]:
        """Get next transaction sequentially (round-robin)."""
        if self.df is None or len(self.df) == 0:
            return None

        row = self.df.iloc[self.current_index % len(self.df)]
        self.current_index += 1
        return self._row_to_features(row)

    def get_batch(self, n: int = 100) -> List[Dict[str, Any]]:
        """Get a batch of transactions."""
        if self.df is None or len(self.df) == 0:
            return []

        # Get random transactions
        batch_df = self.df.sample(min(n, len(self.df)))
        return [self._row_to_features(row) for _, row in batch_df.iterrows()]

    @staticmethod
    def _row_to_features(row) -> Dict[str, Any]:
        """Convert CSV row to feature dict for ML model."""
        features = {}

        # Extract PCA-transformed features (V1-V28)
        for i in range(1, 29):
            key = f"V{i}"
            features[key] = float(row[key]) if key in row else 0.0

        # Time and Amount (actual from CSV)
        features["Time"] = float(row["Time"]) if "Time" in row else 0.0
        features["Amount"] = float(row["Amount"]) if "Amount" in row else 0.0

        # Add true label if available (1=fraud, 0=normal)
        features["_true_label"] = int(row["Class"]) if "Class" in row else 0

        return features

    def get_stats(self) -> Dict[str, Any]:
        """Get statistics about loaded data."""
        if self.df is None:
            return {}

        return {
            "total_transactions": len(self.df),
            "fraud_count": int((self.df["Class"] == 1).sum()) if "Class" in self.df else 0,
            "legitimate_count": int((self.df["Class"] == 0).sum()) if "Class" in self.df else 0,
            "avg_amount": float(self.df["Amount"].mean()) if "Amount" in self.df else 0,
            "max_amount": float(self.df["Amount"].max()) if "Amount" in self.df else 0,
            "min_amount": float(self.df["Amount"].min()) if "Amount" in self.df else 0,
        }


# Global loader instance
_loader = TransactionDataLoader()


def get_real_transaction() -> Optional[Dict[str, Any]]:
    """Get a random real transaction with actual ML features."""
    return _loader.get_random_transaction()


def get_next_transaction() -> Optional[Dict[str, Any]]:
    """Get next transaction sequentially."""
    return _loader.get_next_transaction()


def get_transactions_batch(n: int = 100) -> List[Dict[str, Any]]:
    """Get a batch of real transactions."""
    return _loader.get_batch(n)


def get_loader() -> TransactionDataLoader:
    """Get the data loader instance."""
    return _loader
