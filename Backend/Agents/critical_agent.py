"""
Agents/critical_agent.py — Critical Analysis Agent.

Reviews the writer agent's output for accuracy, clarity,
and medical safety, then returns an improved version.
"""

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
# Slightly higher temperature for nuanced critique.
# =============================================================================

_llm = ChatGroq(
    model=settings.LLM_MODEL,
    temperature=0.1,
    api_key=settings.GROQ_API_KEY,
)


# =============================================================================
# Prompt + Chain
# =============================================================================

_CRITICAL_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are a senior medical reviewer and patient-safety expert.

Your job is to critically review a medical summary and:
1. Identify any factual errors, vague claims, or unsafe statements.
2. Check that the content does NOT make a diagnosis or prescribe treatment.
3. Verify that the content recommends professional consultation where needed.
4. Return an improved, cleaner version of the answer.

Response format — use EXACTLY these three labeled sections:
ISSUES FOUND:
<bullet list of problems, or "None" if everything is acceptable>

IMPROVED ANSWER:
<the corrected, cleaner version of the medical summary>

SAFETY NOTE:
<one or two sentences reminding the reader this is educational, not medical advice>
""",
    ),
    (
        "human",
        """Question / Disease Focus:
{question}

Original Summary to Review:
{answer}

Provide your critical review now:""",
    ),
])

_chain = _CRITICAL_PROMPT | _llm | StrOutputParser()


# =============================================================================
# Critical Review Function
# =============================================================================

def run_critical(answer: str, question: str, request_id: str = "-") -> str:
    """
    Runs the critical review agent on the writer's output.

    Args:
        answer    : The writer agent's medical summary
        question  : The disease / query being addressed
        request_id: Request ID for log tracing

    Returns:
        Critically reviewed and improved medical text.
    """
    start = time.perf_counter()

    def _invoke() -> str:
        return execute_with_timeout(
            _chain.invoke,
            {"answer": answer, "question": question},
            timeout_s=settings.LLM_TIMEOUT_SECONDS,
        )

    result = retry_with_backoff(
        _invoke,
        attempts=settings.RETRY_ATTEMPTS,
        base_delay_s=settings.RETRY_BASE_DELAY_SECONDS,
        max_delay_s=settings.RETRY_MAX_DELAY_SECONDS,
        jitter_s=settings.RETRY_JITTER_SECONDS,
        step="critical",
        request_id=request_id,
    )
    duration_ms = int((time.perf_counter() - start) * 1000)
    logger.info(
        "request_id=%s step=critical duration=%dms status=success chars=%d",
        request_id, duration_ms, len(result),
    )
    return result
