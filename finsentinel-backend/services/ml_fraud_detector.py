"""Real ML-based fraud detection using trained XGBoost model."""

from __future__ import annotations

import logging
import numpy as np
import joblib
from pathlib import Path
from typing import Dict, Any, Tuple

logger = logging.getLogger(__name__)

# Paths to trained models
MODEL_PATH = Path(__file__).parent.parent / "model" / "fraud_model.pkl"
SCALER_PATH = Path(__file__).parent.parent / "model" / "scaler.pkl"


class MLFraudDetector:
    """Real fraud detection using trained XGBoost model."""

    def __init__(self):
        self.model = None
        self.scaler = None
        self._load_models()

    def _load_models(self):
        """Load trained model and scaler."""
        try:
            if MODEL_PATH.exists() and SCALER_PATH.exists():
                self.model = joblib.load(MODEL_PATH)
                self.scaler = joblib.load(SCALER_PATH)
                logger.info("✅ ML models loaded successfully")
            else:
                logger.warning(f"⚠️ Models not found at {MODEL_PATH} or {SCALER_PATH}")
                self.model = None
                self.scaler = None
        except Exception as e:
            logger.error(f"❌ Error loading models: {e}")
            self.model = None
            self.scaler = None

    def is_ready(self) -> bool:
        """Check if models are loaded."""
        return self.model is not None and self.scaler is not None

    def predict(self, transaction_features: Dict[str, float]) -> Tuple[float, str]:
        """
        Predict fraud risk using real ML model.
        
        Args:
            transaction_features: Dict with keys V1-V28, Time, Amount
            
        Returns:
            (fraud_probability: float 0-100, risk_level: str)
        """
        if not self.is_ready():
            logger.warning("Models not ready, using fallback scoring")
            return self._fallback_score(transaction_features)

        try:
            # Extract features in correct order (V1-V28, Time, Amount)
            feature_keys = [f"V{i}" for i in range(1, 29)] + ["Time", "Amount"]
            features = np.array([[transaction_features.get(key, 0.0) for key in feature_keys]])

            # Scale features using trained scaler
            scaled_features = self.scaler.transform(features)

            # Get prediction probability
            fraud_prob = self.model.predict_proba(scaled_features)[0][1]
            fraud_score = float(fraud_prob * 100)

            # Determine risk level
            if fraud_score >= 80:
                risk_level = "Fraud"
            elif fraud_score >= 50:
                risk_level = "Suspicious"
            else:
                risk_level = "Safe"

            logger.debug(f"ML prediction: {fraud_score:.2f}% ({risk_level})")
            return fraud_score, risk_level

        except Exception as e:
            logger.error(f"Error in ML prediction: {e}")
            return self._fallback_score(transaction_features)

    def _fallback_score(self, transaction_features: Dict[str, float]) -> Tuple[float, str]:
        """Fallback scoring when models aren't available."""
        # Use heuristics based on actual features
        amount = transaction_features.get("Amount", 0)
        time_of_day = (transaction_features.get("Time", 0) % 86400) / 86400 * 24

        # Simple heuristic: high amounts at odd hours are more suspicious
        score = 30  # baseline
        if amount > 2000:
            score += 20
        elif amount > 500:
            score += 10

        if 22 <= time_of_day or time_of_day <= 5:
            score += 15

        # Add some variation based on V features if available
        for i in range(1, 10):
            v_key = f"V{i}"
            if v_key in transaction_features:
                # Extreme values are more suspicious
                v_val = abs(transaction_features[v_key])
                if v_val > 3:
                    score += 10
                elif v_val > 2:
                    score += 5

        score = min(score, 95)

        if score >= 80:
            risk_level = "Fraud"
        elif score >= 50:
            risk_level = "Suspicious"
        else:
            risk_level = "Safe"

        return score, risk_level


# Global detector instance
_detector = MLFraudDetector()


def predict_fraud(transaction_features: Dict[str, float]) -> Tuple[float, str]:
    """Predict fraud risk for a transaction."""
    return _detector.predict(transaction_features)


def get_detector() -> MLFraudDetector:
    """Get the fraud detector instance."""
    return _detector
