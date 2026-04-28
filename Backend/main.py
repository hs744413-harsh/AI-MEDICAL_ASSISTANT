"""
Medical Assistant AI - FastAPI Backend

Endpoints:
  GET  /          → service info
  GET  /health    → dependency health check
  GET  /symptoms  → full symptom vocabulary
  POST /research  → General medical research (Wikipedia + AI)
  POST /predict   → ML-only prediction from symptom list
  POST /analyze   → Full diagnosis pipeline (text → ML → research)
"""

import logging
import time
from uuid import uuid4
from typing import List

import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator

# ── Internal imports ──────────────────────────────────────────
from config import settings
from ML_model_loader import predict_disease, get_all_symptoms, _predictor_module
from Agents.symptom_extractor import extract_symptoms
from Pipeline.pipeline import PipelineError, run_pipeline


# =============================================================================
# Logging
# =============================================================================

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
)
logger = logging.getLogger("main")


# =============================================================================
# App Setup
# =============================================================================

app = FastAPI(
    title="Medical AI Assistant API",
    version="1.0.0",
    description="ML + LLM powered medical research and diagnosis system.",
)

# FIXED: use settings.CORS_ORIGINS instead of wildcard "*".
# allow_credentials=True + allow_origins=["*"] is invalid per the CORS spec
# and browsers reject it. Using the explicit origin list from .env fixes this.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Startup Validation
# =============================================================================

@app.on_event("startup")
async def startup_checks():
    """Log configuration status on startup so problems are visible immediately."""
    logger.info("=== Medical AI Assistant — Startup ===")
    logger.info("ML model   : %s", "loaded" if _predictor_module else "NOT LOADED — run train_model.py")
    logger.info("Groq LLM   : %s", "configured" if settings.GROQ_API_KEY else "MISSING — set GROQ_API_KEY")
    logger.info("Tavily     : %s", "configured" if settings.TAVILY_API_KEY else "MISSING — set TAVILY_API_KEY")
    logger.info("CORS origins: %s", settings.CORS_ORIGINS)

    if not settings.GROQ_API_KEY:
        logger.error("GROQ_API_KEY is not set — LLM calls will fail.")
    if not settings.TAVILY_API_KEY:
        logger.warning("TAVILY_API_KEY is not set — /research endpoint will not work.")


# =============================================================================
# Request / Response Models
# =============================================================================

class PredictRequest(BaseModel):
    symptoms: List[str]

    @field_validator("symptoms")
    @classmethod
    def symptoms_must_have_items(cls, v: List[str]) -> List[str]:
        cleaned = [s.strip() for s in v if s.strip()]
        if len(cleaned) < 3:
            raise ValueError("At least 3 non-empty symptoms are required.")
        return cleaned


class AnalyzeRequest(BaseModel):
    text: str

    @field_validator("text")
    @classmethod
    def text_must_be_reasonable(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 10:
            raise ValueError("Symptom description is too short (minimum 10 characters).")
        if len(v) > 2000:
            raise ValueError("Symptom description is too long (maximum 2000 characters).")
        return v


class ResearchRequest(BaseModel):
    query: str

    @field_validator("query")
    @classmethod
    def query_must_not_be_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Query cannot be empty.")
        if len(v) > 500:
            raise ValueError("Query is too long (maximum 500 characters).")
        return v


# =============================================================================
# Routes
# =============================================================================

@app.get("/")
def root():
    return {
        "message": "Medical AI Assistant Running",
        "version": "1.0.0",
        "endpoints": {
            "/research": "POST — General medical research (Wikipedia + AI)",
            "/predict":  "POST — ML prediction from symptom list",
            "/analyze":  "POST — Full AI diagnosis pipeline",
            "/symptoms": "GET  — Full symptom vocabulary",
            "/health":   "GET  — Service health check",
        },
    }


@app.get("/health")
def health():
    """
    Dependency health check.
    Returns status of ML model, Groq, and Tavily so load balancers and
    monitoring tools can make informed decisions.
    """
    return {
        "status":    "ok",
        "ml_model":  "loaded"     if _predictor_module  else "not_loaded",
        "groq":      "configured" if settings.GROQ_API_KEY    else "missing",
        "tavily":    "configured" if settings.TAVILY_API_KEY  else "missing",
    }


@app.get("/symptoms")
def symptoms():
    """Returns the full symptom vocabulary understood by the ML model."""
    syms = get_all_symptoms()
    return {"count": len(syms), "symptoms": syms}


# =============================================================================
# 1️⃣ RESEARCH MODE (No ML — Wikipedia + AI)
# =============================================================================

@app.post("/research")
async def research(req: ResearchRequest):
    """
    General medical research pipeline.
    Input : { "query": "What is hypertension?" }
    Output: { query, summary, report, analysis, response_time }
    """
    start      = time.time()
    request_id = str(uuid4())

    try:
        logger.info("[%s] RESEARCH query=%r", request_id, req.query)

        result = await run_in_threadpool(run_pipeline, req.query, request_id)

        return {
            "query":         req.query,
            "summary":       result.get("search_summary", ""),
            "report":        result.get("report", ""),
            "analysis":      result.get("analysis", ""),
            "response_time": round(time.time() - start, 2),
        }

    except PipelineError as e:
        logger.error("[%s] RESEARCH pipeline error: %s", request_id, e)
        raise HTTPException(status_code=502, detail=str(e))

    except Exception as e:
        logger.exception("[%s] RESEARCH unexpected error", request_id)
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# 2️⃣ ML-ONLY PREDICTION
# =============================================================================

@app.post("/predict")
async def predict(req: PredictRequest):
    """
    ML-only disease prediction from an explicit symptom list.
    Input : { "symptoms": ["fever", "headache", "fatigue"] }
    Output: { "predictions": [{ disease, confidence, urgency, ... }] }

    Note: confidence is a 0.0–1.0 probability fraction.
    """
    try:
        predictions = await run_in_threadpool(predict_disease, req.symptoms)
        return {"predictions": predictions}

    except RuntimeError as e:
        # ML model not loaded
        raise HTTPException(status_code=503, detail=str(e))

    except Exception as e:
        logger.exception("PREDICT unexpected error")
        raise HTTPException(status_code=500, detail=f"Prediction error: {e}")


# =============================================================================
# 3️⃣ FULL PIPELINE (Text → Symptom Extraction → ML → Research)
# =============================================================================

@app.post("/analyze")
async def analyze(req: AnalyzeRequest):
    """
    Full diagnosis pipeline.
    Input : { "text": "I have fever, headache and fatigue for 3 days" }
    Output: { extracted_symptoms, predictions, disease, summary, report, analysis, ... }

    Pipeline steps:
      1. LLM extracts symptom keywords from free-form text
      2. ML model predicts top N diseases
      3. Research pipeline (search → scrape → writer → critical) on top disease
    """
    start      = time.time()
    request_id = str(uuid4())

    try:
        logger.info("[%s] ANALYZE text=%r", request_id, req.text[:80])

        # ── Step 1: Extract symptoms from text via LLM ─────────
        all_symptoms = get_all_symptoms()
        extracted = await run_in_threadpool(
            extract_symptoms, req.text, all_symptoms, request_id
        )

        if len(extracted) < 3:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Only {len(extracted)} recognisable symptom(s) found "
                    "(minimum 3 required). Try describing your symptoms in "
                    "more detail, e.g. 'I have fever, headache and fatigue'."
                ),
            )

        # ── Step 2: ML Prediction ───────────────────────────────
        predictions = await run_in_threadpool(predict_disease, extracted)

        if not predictions:
            raise HTTPException(
                status_code=422,
                detail="ML model could not produce a prediction for the given symptoms.",
            )

        top_disease = predictions[0]["disease"]
        logger.info("[%s] top_disease=%r confidence=%.3f",
                    request_id, top_disease, predictions[0]["confidence"])

        # ── Step 3: Research pipeline on top predicted disease ──
        pipeline_result = await run_in_threadpool(
            run_pipeline, top_disease, request_id
        )

        return {
            "input_text":         req.text,
            "extracted_symptoms": extracted,
            "predictions":        predictions,
            "disease":            top_disease,
            "summary":            pipeline_result.get("search_summary", ""),
            "report":             pipeline_result.get("report", ""),
            "analysis":           pipeline_result.get("analysis", ""),
            "response_time":      round(time.time() - start, 2),
        }

    except HTTPException:
        raise  # re-raise 400/422 from validation above

    except PipelineError as e:
        logger.error("[%s] ANALYZE pipeline error: %s", request_id, e)
        raise HTTPException(status_code=502, detail=str(e))

    except RuntimeError as e:
        # ML model not loaded
        raise HTTPException(status_code=503, detail=str(e))

    except Exception as e:
        logger.exception("[%s] ANALYZE unexpected error", request_id)
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# Run Server
# =============================================================================

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)