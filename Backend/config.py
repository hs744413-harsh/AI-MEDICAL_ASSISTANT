"""
config.py — Central application settings
All values are loaded from the .env file.
"""
import os
from dotenv import load_dotenv
from pathlib import Path

# ── Load .env from the Backend folder ────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


class Settings:
    # ── API Keys ──────────────────────────────────────────────────────────────
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")

    # ── LLM ───────────────────────────────────────────────────────────────────
    LLM_MODEL: str = os.getenv("LLM_MODEL", "llama-3.1-8b-instant")
    LLM_TEMPERATURE: float = float(os.getenv("LLM_TEMPERATURE", "0.0"))
    LLM_TIMEOUT_SECONDS: float = float(os.getenv("LLM_TIMEOUT_SECONDS", "20"))

    # ── ML Model ──────────────────────────────────────────────────────────────
    ML_MODEL_PATH: Path = BASE_DIR / "ML model" / "disease_classifier.pkl"
    SYMPTOMS_LIST_PATH: Path = BASE_DIR / "ML model" / "symptoms_list.pkl"
    # Predictions with confidence below this threshold trigger pipeline fallback
    ML_CONFIDENCE_THRESHOLD: float = float(os.getenv("ML_CONFIDENCE_THRESHOLD", "20.0"))

    # ── MLflow ────────────────────────────────────────────────────────────────
    MLFLOW_TRACKING_URI: str = str(BASE_DIR.parent / "mlruns")

    # ── CORS ──────────────────────────────────────────────────────────────────
    CORS_ORIGINS: list = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://localhost:5173"
    ).split(",")

    # ── Logging ───────────────────────────────────────────────────────────────
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")

    # ── Search / Scrape ───────────────────────────────────────────────────────
    TAVILY_MAX_RESULTS: int = int(os.getenv("TAVILY_MAX_RESULTS", "3"))
    SCRAPE_MAX_CHARS: int = int(os.getenv("SCRAPE_MAX_CHARS", "3000"))
    TAVILY_TIMEOUT_SECONDS: float = float(os.getenv("TAVILY_TIMEOUT_SECONDS", "8"))
    SCRAPE_TIMEOUT_SECONDS: float = float(os.getenv("SCRAPE_TIMEOUT_SECONDS", "10"))

    # ── Reliability / Retry ───────────────────────────────────────────────────
    RETRY_ATTEMPTS: int = int(os.getenv("RETRY_ATTEMPTS", "3"))
    RETRY_BASE_DELAY_SECONDS: float = float(os.getenv("RETRY_BASE_DELAY_SECONDS", "0.4"))
    RETRY_MAX_DELAY_SECONDS: float = float(os.getenv("RETRY_MAX_DELAY_SECONDS", "2.0"))
    RETRY_JITTER_SECONDS: float = float(os.getenv("RETRY_JITTER_SECONDS", "0.25"))

    PIPELINE_STEP_TIMEOUT_SEARCH_SECONDS: float = float(os.getenv("PIPELINE_STEP_TIMEOUT_SEARCH_SECONDS", "12"))
    PIPELINE_STEP_TIMEOUT_SCRAPE_SECONDS: float = float(os.getenv("PIPELINE_STEP_TIMEOUT_SCRAPE_SECONDS", "14"))
    PIPELINE_STEP_TIMEOUT_WRITER_SECONDS: float = float(os.getenv("PIPELINE_STEP_TIMEOUT_WRITER_SECONDS", "25"))
    PIPELINE_STEP_TIMEOUT_CRITICAL_SECONDS: float = float(os.getenv("PIPELINE_STEP_TIMEOUT_CRITICAL_SECONDS", "25"))


settings = Settings()
