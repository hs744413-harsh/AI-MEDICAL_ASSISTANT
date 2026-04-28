"""
ML model/predictor.py — Disease prediction from symptom list.
"""

import logging
import importlib.util
import numpy as np
import joblib
from pathlib import Path

logger   = logging.getLogger(__name__)
_BASE_DIR = Path(__file__).resolve().parent   # …/ML model/


# =============================================================================
# Load DISEASE_SYMPTOMS via importlib (avoids folder-with-space import issue)
# =============================================================================

def _load_disease_symptoms() -> dict:
    ds_path = _BASE_DIR / "disease_symptoms.py"
    spec    = importlib.util.spec_from_file_location("disease_symptoms", ds_path)
    module  = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.DISEASE_SYMPTOMS


try:
    DISEASE_SYMPTOMS: dict = _load_disease_symptoms()
    logger.info("disease_symptoms loaded — %d diseases", len(DISEASE_SYMPTOMS))
except Exception as exc:
    DISEASE_SYMPTOMS = {}
    logger.error("Failed to load disease_symptoms.py: %s", exc)


# =============================================================================
# Load ML Model
# =============================================================================

try:
    _model            = joblib.load(_BASE_DIR / "disease_classifier.pkl")
    _ALL_SYMPTOMS: list = joblib.load(_BASE_DIR / "symptoms_list.pkl")
    logger.info("ML model loaded — %d symptom features", len(_ALL_SYMPTOMS))
except FileNotFoundError as exc:
    _model        = None
    _ALL_SYMPTOMS = []
    logger.error(
        "ML model files not found: %s\n"
        "→ Run:  python 'ML model/train_model.py'  to train and save the model.",
        exc
    )

# Exposed for import by other modules
ALL_SYMPTOMS: list = _ALL_SYMPTOMS


# =============================================================================
# Critical Disease Registry
# =============================================================================

CRITICAL_DISEASES = {
    "Tuberculosis", "HIV/AIDS", "Leukemia", "Lung Cancer", "Breast Cancer",
    "Cervical Cancer", "Skin Cancer", "Stroke", "Heart Failure",
    "Pulmonary Embolism", "Coronary Artery Disease", "Cardiac Arrhythmia",
    "Meningitis", "Sepsis",
}

URGENCY_MAP = {
    "Stroke":                 "EMERGENCY — call emergency services immediately",
    "Heart Failure":          "URGENT — seek emergency care now",
    "Pulmonary Embolism":     "URGENT — seek emergency care now",
    "Tuberculosis":           "HIGH — see a doctor within 24 hours",
    "HIV/AIDS":               "HIGH — consult a specialist promptly",
    "Leukemia":               "HIGH — consult a specialist promptly",
    "Lung Cancer":            "HIGH — consult a specialist promptly",
    "Breast Cancer":          "HIGH — consult a specialist promptly",
    "Cervical Cancer":        "HIGH — consult a specialist promptly",
    "Cardiovascular Disease": "HIGH — see a doctor within 24 hours",
    "Cardiac Arrhythmia":     "HIGH — see a doctor within 24 hours",
}

DEFAULT_URGENCY = "MODERATE — consult a doctor for proper evaluation"
LOW_CONF_ADVICE = (
    "Confidence is low. This result should not be relied upon. "
    "Please consult a qualified healthcare professional for an accurate diagnosis."
)
STANDARD_ADVICE = (
    "This is an educational prediction only — not a medical diagnosis. "
    "Please consult a qualified healthcare professional for proper evaluation."
)

# Confidence threshold below which LOW_CONF_ADVICE is used.
# Loaded from config so it can be tuned via .env without code changes.
# Value in .env is a percentage (e.g. 20.0 means 20%).
# We compare against the 0.0–1.0 probability, so divide by 100.
try:
    from config import settings as _settings
    _LOW_CONF_THRESHOLD: float = _settings.ML_CONFIDENCE_THRESHOLD / 100.0
except Exception:
    _LOW_CONF_THRESHOLD = 0.20   # fallback: 20 %


# =============================================================================
# Symptom Normalisation
# =============================================================================

def _normalize_symptoms(user_symptoms: list) -> set:
    """
    Lower-cases, strips whitespace, and replaces spaces/hyphens with
    underscores so that user inputs like 'Dry Cough' → 'dry_cough'
    match the model vocabulary.
    """
    return {
        s.lower().strip().replace(" ", "_").replace("-", "_")
        for s in user_symptoms
        if isinstance(s, str) and s.strip()
    }


# =============================================================================
# Core Prediction
# =============================================================================

def predict_disease(user_symptoms: list, top_n: int = 3) -> list:
    """
    Predicts the top N diseases from a list of symptom strings.

    Args:
        user_symptoms : Raw symptom strings from user (any casing / spaces)
        top_n         : How many top diseases to return (default 3)

    Returns:
        List of dicts, each containing:
          disease, confidence (0.0–1.0), is_critical, urgency,
          key_symptoms_present, key_symptoms_missing, advice

        confidence is returned as a probability fraction (0.0–1.0).
        Multiply by 100 to display as a percentage.

    Raises:
        RuntimeError: If the model was not loaded (files missing).
    """
    if _model is None:
        raise RuntimeError(
            "Disease classifier not loaded. "
            "Run:  python \"ML model/train_model.py\"  to generate the model files."
        )

    normalized = _normalize_symptoms(user_symptoms)

    # ── Build feature vector ──────────────────────────────────
    feature_vector = [
        1 if symptom in normalized else 0
        for symptom in _ALL_SYMPTOMS
    ]
    input_array = np.array(feature_vector).reshape(1, -1)

    # ── Predict ───────────────────────────────────────────────
    probabilities = _model.predict_proba(input_array)[0]
    classes       = _model.classes_

    ranked = sorted(
        zip(classes, probabilities),
        key=lambda x: x[1],
        reverse=True,
    )

    # ── Build rich result dicts ───────────────────────────────
    results = []
    for disease, prob in ranked[:top_n]:
        if prob < 0.01:      # skip < 1% noise
            continue

        # FIXED: return raw probability (0.0–1.0) so the frontend can
        # display it as (confidence * 100)%. Previously returned 0–100
        # which caused the frontend to render e.g. 85.3 as 8530%.
        confidence  = round(float(prob), 4)
        is_critical = disease in CRITICAL_DISEASES
        urgency     = URGENCY_MAP.get(
            disease,
            "EMERGENCY — call emergency services immediately" if is_critical
            else DEFAULT_URGENCY
        )

        # Symptoms the model expects that the user reported / missed
        disease_syms = set(DISEASE_SYMPTOMS.get(disease, []))
        present      = sorted(disease_syms & normalized)
        missing      = sorted(disease_syms - normalized)

        # FIXED: use settings.ML_CONFIDENCE_THRESHOLD instead of hardcoded 20
        advice = LOW_CONF_ADVICE if confidence < _LOW_CONF_THRESHOLD else STANDARD_ADVICE

        results.append({
            "disease":              disease,
            "confidence":           confidence,   # 0.0–1.0 fraction
            "is_critical":          is_critical,
            "urgency":              urgency,
            "key_symptoms_present": present,
            "key_symptoms_missing": missing,
            "advice":               advice,
        })

    logger.info(
        "predict_disease: top=%s (%.1f%%) for symptoms=%s",
        results[0]["disease"]    if results else "none",
        results[0]["confidence"] * 100 if results else 0.0,
        list(normalized),
    )
    return results


# =============================================================================
# CLI Test
# =============================================================================

if __name__ == "__main__":
    symptoms = ["fever", "cough", "fatigue", "night_sweats"]
    preds    = predict_disease(symptoms)

    print("\n🔬 Top Predicted Diseases:")
    for p in preds:
        flag = "🚨" if p["is_critical"] else "✅"
        print(
            f"  {flag} {p['disease']:40s} "
            f"Confidence: {p['confidence']*100:5.1f}%  "
            f"Urgency: {p['urgency']}"
        )
        print(f"     Present : {p['key_symptoms_present']}")
        print(f"     Missing : {p['key_symptoms_missing']}")