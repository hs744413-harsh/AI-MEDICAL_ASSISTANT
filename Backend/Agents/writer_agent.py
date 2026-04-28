"""
Agents/writer_agent.py — Writer Agent chain.

Takes combined research data (search + scrape) and a question,
then writes a structured, safe, 200-300 word medical summary.
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
# =============================================================================

_llm = ChatGroq(
    model=settings.LLM_MODEL,
    temperature=settings.LLM_TEMPERATURE,
    api_key=settings.GROQ_API_KEY,
)


# =============================================================================
# Prompt + Chain
# =============================================================================

_WRITER_PROMPT = ChatPromptTemplate.from_messages([
    (
        "system",
        """You are a medical information assistant providing educational content.

STRICT RULES:
- Use ONLY the provided information — never invent facts.
- DO NOT diagnose or prescribe medication.
- Keep the language clear and accessible (not overly technical).
- Always recommend consulting a qualified doctor for personal medical advice.
- Format your response in clearly labeled sections.
""",
    ),
    (
        "human",
        """Research Information:
{information}

Question / Disease Focus:
{question}

Write a structured medical summary using these sections:
1. **Overview** — What is this condition?
2. **Key Symptoms** — What are the main symptoms?
3. **Common Causes** — Why does this happen?
4. **Treatment & Management** — What are the typical approaches?
5. **When to See a Doctor** — What warning signs require urgent care?

Keep the total response between 200–350 words. End with a safety note.
""",
    ),
])

_chain = _WRITER_PROMPT | _llm | StrOutputParser()


# =============================================================================
# Writer Function
# =============================================================================

def run_writer(information: str, question: str, request_id: str = "-") -> str:
    """
    Runs the writer agent to produce a structured medical summary.

    Args:
        information : Combined search + scrape results as plain text
        question    : The disease or query being addressed
        request_id  : Request ID for log tracing

    Returns:
        Formatted medical summary string.
    """
    start = time.perf_counter()

    def _invoke() -> str:
        return execute_with_timeout(
            _chain.invoke,
            {"information": information, "question": question},
            timeout_s=settings.LLM_TIMEOUT_SECONDS,
        )

    result = retry_with_backoff(
        _invoke,
        attempts=settings.RETRY_ATTEMPTS,
        base_delay_s=settings.RETRY_BASE_DELAY_SECONDS,
        max_delay_s=settings.RETRY_MAX_DELAY_SECONDS,
        jitter_s=settings.RETRY_JITTER_SECONDS,
        step="writer",
        request_id=request_id,
    )
    duration_ms = int((time.perf_counter() - start) * 1000)
    logger.info(
        "request_id=%s step=writer duration=%dms status=success chars=%d",
        request_id, duration_ms, len(result),
    )
    return result
