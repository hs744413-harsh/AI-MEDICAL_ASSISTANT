"""
Agents/symptom_extractor.py — LLM-based symptom extraction agent.

Takes a free-text description from the user (e.g. "I have a high fever,
dry cough, and loss of smell for 3 days") and returns a list of
standardized symptom keys that match the ML model's ALL_SYMPTOMS vocabulary.
"""

import json
import logging
import time

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from config import settings
from reliability import execute_with_timeout, retry_with_backoff

logger = logging.getLogger(__name__)


# =============================================================================
# LLM Singleton — instantiated once at module load, not per-request.
# =============================================================================

_llm = ChatGroq(
    model=settings.LLM_MODEL,
    temperature=settings.LLM_TEMPERATURE,
    api_key=settings.GROQ_API_KEY,
)


# =============================================================================
# Prompt
# =============================================================================

_EXTRACTOR_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are a medical NLP assistant.
Your job: read the user's symptom description and output ONLY a JSON array
of symptom keys that match the provided vocabulary list.

Rules:
- Output ONLY a valid JSON array of strings.
- Each string must be an exact match from the VOCABULARY LIST below.
- Do NOT invent new symptom keys.
- Do NOT add explanations, markdown, or extra text.
- If no symptom matches, return an empty array: []

VOCABULARY LIST (use only these exact keys):
{vocabulary}
""",
    ),
    (
        "human",
        "User description: {user_text}\n\nReturn the matching symptom keys as JSON:",
    ),
])

_chain = _EXTRACTOR_PROMPT | _llm | StrOutputParser()


# =============================================================================
# Symptom Extractor
# =============================================================================

def extract_symptoms(user_text: str, all_symptoms: list[str], request_id: str = "-") -> list[str]:
    """
    Uses Groq LLM to extract standardized symptom keys from free-form text.

    Args:
        user_text   : Raw input from user, e.g. "I have fever and dry cough"
        all_symptoms: The full vocabulary list from ALL_SYMPTOMS

    Returns:
        List of matched symptom keys (subset of all_symptoms).
    """
    vocabulary = "\n".join(f"  - {s}" for s in sorted(all_symptoms))
    start = time.perf_counter()
    raw = "[]"

    try:
        def _invoke() -> str:
            return execute_with_timeout(
                _chain.invoke,
                {"user_text": user_text, "vocabulary": vocabulary},
                timeout_s=settings.LLM_TIMEOUT_SECONDS,
            )

        raw = retry_with_backoff(
            _invoke,
            attempts=settings.RETRY_ATTEMPTS,
            base_delay_s=settings.RETRY_BASE_DELAY_SECONDS,
            max_delay_s=settings.RETRY_MAX_DELAY_SECONDS,
            jitter_s=settings.RETRY_JITTER_SECONDS,
            step="extract",
            request_id=request_id,
        )

        # ── Clean up markdown fences if LLM wraps output ─────────────────────
        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        extracted = json.loads(raw)

        # ── Validate: keep only keys that exist in ALL_SYMPTOMS ───────────────
        symptom_set = set(all_symptoms)
        valid = [s for s in extracted if s in symptom_set]

        logger.info(
            "request_id=%s step=extract duration=%dms status=success extracted=%d",
            request_id,
            int((time.perf_counter() - start) * 1000),
            len(valid),
        )
        return valid

    except json.JSONDecodeError as exc:
        logger.warning(
            "request_id=%s step=extract duration=%dms status=fail error=%s",
            request_id,
            int((time.perf_counter() - start) * 1000),
            str(exc),
        )
        # Fallback: simple keyword matching against the vocabulary
        return _keyword_fallback(user_text, all_symptoms)

    except Exception as exc:
        logger.error(
            "request_id=%s step=extract duration=%dms status=fail error=%s",
            request_id,
            int((time.perf_counter() - start) * 1000),
            str(exc),
        )
        return _keyword_fallback(user_text, all_symptoms)


def _keyword_fallback(user_text: str, all_symptoms: list[str]) -> list[str]:
    """
    Simple substring fallback: checks if each symptom key (or its
    space-separated version) appears in the user's text.
    """
    normalized = user_text.lower().replace("-", "_").replace(" ", "_")

    matched = []
    for symptom in all_symptoms:
        human_form = symptom.replace("_", " ")
        if symptom in normalized or human_form in user_text.lower():
            matched.append(symptom)

    logger.info("symptom_extractor (fallback): matched %d symptoms", len(matched))
    return matched
