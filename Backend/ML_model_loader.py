"""
ML_model_loader.py — Thin wrapper to import from "ML model/" folder.

Python cannot import from folders with spaces in their names using
the normal `import` statement. This module uses importlib to load
predictor.py from the "ML model" directory and re-exports its
public API so the rest of the backend can do:

    from ML_model_loader import predict_disease, get_all_symptoms
"""

import importlib.util
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

_BACKEND_DIR = Path(__file__).resolve().parent
_PREDICTOR_PATH = _BACKEND_DIR / "ML model" / "predictor.py"
_MODEL_PATH = _BACKEND_DIR / "ML model" / "disease_classifier.pkl"
_SYMPTOMS_PATH = _BACKEND_DIR / "ML model" / "symptoms_list.pkl"


def _load_predictor_module():
    """Load predictor.py via importlib (bypasses folder-name restriction)."""
    spec   = importlib.util.spec_from_file_location("predictor", _PREDICTOR_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to create import spec for {_PREDICTOR_PATH}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def validate_model_artifacts() -> None:
    """Ensure required ML model artifacts are present."""
    missing = [str(p) for p in (_MODEL_PATH, _SYMPTOMS_PATH) if not p.exists()]
    if missing:
        raise RuntimeError(
            "Missing required ML artifacts. Train the model first. Missing: "
            + ", ".join(missing)
        )


try:
    validate_model_artifacts()
    _predictor_module = _load_predictor_module()
    logger.info("ML model loaded successfully from %s", _PREDICTOR_PATH)
except Exception as exc:
    _predictor_module = None
    logger.error("Failed to load ML model: %s", exc)


# ── Re-exported API ───────────────────────────────────────────

def predict_disease(user_symptoms: list, top_n: int = 3) -> list:
    """Delegates to predictor.predict_disease()."""
    if _predictor_module is None:
        raise RuntimeError(
            "ML model not loaded. Run: python \"ML model/train_model.py\" first."
        )
    return _predictor_module.predict_disease(user_symptoms, top_n)


def get_all_symptoms() -> list:
    """Returns the full symptom vocabulary list."""
    if _predictor_module is None:
        return []
    return _predictor_module.ALL_SYMPTOMS


def get_predictor():
    """Returns the raw sklearn model object (or None if not loaded)."""
    if _predictor_module is None:
        return None
    return _predictor_module._model
