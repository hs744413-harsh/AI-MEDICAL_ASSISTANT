"""
ML model/train_model.py — Model training script.

Fixed issues:
 - Import now uses sys.path injection so it works from any CWD
 - Output paths are absolute (relative to this file)
 - Removed unused imports (OneVsRestClassifier, MultiLabelBinarizer)
 - Added MLflow tracking with proper URI
 - Added logging
"""

import importlib.util
import logging
from pathlib import Path

_THIS_DIR = Path(__file__).resolve().parent
_BACKEND_DIR = _THIS_DIR.parent

import numpy as np
import pandas as pd
import joblib
import mlflow
import mlflow.sklearn

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

def _load_disease_symptoms():
    ds_path = _THIS_DIR / "disease_symptoms.py"
    spec = importlib.util.spec_from_file_location("disease_symptoms", ds_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load disease symptoms from {ds_path}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.DISEASE_SYMPTOMS, module.ALL_SYMPTOMS


DISEASE_SYMPTOMS, ALL_SYMPTOMS = _load_disease_symptoms()

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

# ── Output paths (always relative to this file, not CWD) ─────────────────────
MODEL_PATH    = _THIS_DIR / "disease_classifier.pkl"
SYMPTOMS_PATH = _THIS_DIR / "symptoms_list.pkl"

# ── MLflow URI (project-root/mlruns) ─────────────────────────────────────────
MLFLOW_URI = str(_BACKEND_DIR.parent / "mlruns")


# =============================================================================
# Data Generation
# =============================================================================

def generate_training_data() -> pd.DataFrame:
    """
    Synthetically generates 200 labelled samples per disease with:
      - 60–100% of that disease's known symptoms
      - 0–2 random noise symptoms
    """
    logger.info("Generating training data for %d diseases…", len(DISEASE_SYMPTOMS))
    rows = []

    for disease, symptoms in DISEASE_SYMPTOMS.items():
        for _ in range(200):
            row = {s: 0 for s in ALL_SYMPTOMS}

            # Sample 60–100% of the disease's defining symptoms
            num_selected = max(1, int(len(symptoms) * np.random.uniform(0.6, 1.0)))
            selected = np.random.choice(symptoms, num_selected, replace=False)
            for s in selected:
                row[s] = 1

            # Add 0–2 noise symptoms
            noise_count = np.random.randint(0, 3)
            if noise_count:
                noise = np.random.choice(ALL_SYMPTOMS, noise_count, replace=False)
                for n in noise:
                    row[n] = 1

            row["disease"] = disease
            rows.append(row)

    df = pd.DataFrame(rows)
    logger.info("Generated %d training samples across %d classes.", len(df), len(DISEASE_SYMPTOMS))
    return df


# =============================================================================
# Training
# =============================================================================

def train_model():
    df = generate_training_data()

    X = df[ALL_SYMPTOMS]
    y = df["disease"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    logger.info("Training Random Forest…")
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    # ── Evaluate ──────────────────────────────────────────────────────────────
    y_pred   = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    logger.info("Model accuracy: %.2f%%", accuracy * 100)

    # ── Log to MLflow ─────────────────────────────────────────────────────────
    try:
        mlflow.set_tracking_uri(MLFLOW_URI)
        mlflow.set_experiment("disease-classifier-training")
        with mlflow.start_run():
            mlflow.log_param("n_estimators", 200)
            mlflow.log_param("max_depth",    15)
            mlflow.log_param("diseases",     len(DISEASE_SYMPTOMS))
            mlflow.log_param("symptoms",     len(ALL_SYMPTOMS))
            mlflow.log_metric("accuracy",    accuracy)
            mlflow.sklearn.log_model(model, "disease_classifier")
        logger.info("MLflow run logged to %s", MLFLOW_URI)
    except Exception as exc:
        logger.warning("MLflow logging failed (non-fatal): %s", exc)

    # ── Save locally ──────────────────────────────────────────────────────────
    joblib.dump(model,        MODEL_PATH)
    joblib.dump(ALL_SYMPTOMS, SYMPTOMS_PATH)
    logger.info("Model saved to:    %s", MODEL_PATH)
    logger.info("Symptoms saved to: %s", SYMPTOMS_PATH)

    print(f"\n📊 Classification Report:\n{classification_report(y_test, y_pred)}")
    print("✅ Training complete!")


if __name__ == "__main__":
    train_model()