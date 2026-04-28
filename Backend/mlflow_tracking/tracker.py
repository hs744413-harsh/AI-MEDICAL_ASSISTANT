"""
mlflow_tracking/tracker.py — MLflow logging helpers.

Fixed issues:
 - Tracking URI is now absolute (relative to project root via pathlib)
 - All MLflow calls wrapped in try/except — a tracking failure NEVER
   kills the API response.
 - Added proper logging.
"""

import logging
from pathlib import Path

logger = logging.getLogger(__name__)

# ── Absolute tracking URI: Medical_Assistant AI/mlruns ───────────────────────
_PROJECT_ROOT = Path(__file__).resolve().parents[2]   # …/Medical_Assistant AI
_MLFLOW_URI   = str(_PROJECT_ROOT / "mlruns")

try:
    import mlflow
    mlflow.set_tracking_uri(_MLFLOW_URI)
    _mlflow_available = True
    logger.info("MLflow tracking URI: %s", _MLFLOW_URI)
except ImportError:
    _mlflow_available = False
    logger.warning("mlflow not installed — tracking disabled.")


# =============================================================================
# Log ML Prediction
# =============================================================================

def log_prediction(
    symptoms: list,
    top_disease: str,
    confidence: float,
    response_time: float,
) -> None:
    """Logs an ML prediction event to MLflow (non-fatal on failure)."""
    if not _mlflow_available:
        return

    try:
        mlflow.set_experiment("medical-ai-predictions")
        with mlflow.start_run():
            mlflow.log_param("symptoms_count", len(symptoms))
            mlflow.log_param("symptoms",       str(symptoms)[:500])
            mlflow.log_param("top_disease",    top_disease)
            mlflow.log_metric("confidence",    confidence)
            mlflow.log_metric("response_time", response_time)
        logger.debug("MLflow: logged prediction — %s (%.1f%%)", top_disease, confidence)
    except Exception as exc:
        logger.warning("MLflow log_prediction failed (non-fatal): %s", exc)


# =============================================================================
# Log RAG / Pipeline Query
# =============================================================================

def log_query(
    question: str,
    answer: str,
    sources_used: int,
    response_time: float,
) -> None:
    """Logs a pipeline / RAG query event to MLflow (non-fatal on failure)."""
    if not _mlflow_available:
        return

    try:
        mlflow.set_experiment("medical-ai-pipeline-queries")
        with mlflow.start_run():
            mlflow.log_param("question_length", len(question))
            mlflow.log_param("question",        question[:200])
            mlflow.log_metric("sources_used",   sources_used)
            mlflow.log_metric("response_time",  response_time)
            mlflow.log_text(answer[:5000], "answer.txt")
        logger.debug("MLflow: logged query — sources=%d", sources_used)
    except Exception as exc:
        logger.warning("MLflow log_query failed (non-fatal): %s", exc)


# =============================================================================
# Log Symptom Extraction Event
# =============================================================================

def log_extraction(
    raw_text: str,
    extracted_symptoms: list,
    response_time: float,
) -> None:
    """Logs a symptom extraction event to MLflow (non-fatal on failure)."""
    if not _mlflow_available:
        return

    try:
        mlflow.set_experiment("medical-ai-symptom-extractions")
        with mlflow.start_run():
            mlflow.log_param("raw_text_length",     len(raw_text))
            mlflow.log_param("raw_text",            raw_text[:200])
            mlflow.log_param("extracted_symptoms",  str(extracted_symptoms))
            mlflow.log_metric("symptom_count",      len(extracted_symptoms))
            mlflow.log_metric("response_time",      response_time)
        logger.debug("MLflow: logged extraction — %d symptoms", len(extracted_symptoms))
    except Exception as exc:
        logger.warning("MLflow log_extraction failed (non-fatal): %s", exc)