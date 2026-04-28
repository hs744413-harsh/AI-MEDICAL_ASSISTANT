"""
Pipeline/pipeline.py — Multi-agent research pipeline.

Steps:
  1. Search  — Tavily web search (falls back to Wikipedia automatically)
  2. Scrape  — Extract full content from the top URL
               SKIPPED when search_web uses the Wikipedia fallback (urls=[])
  3. Writer  — LLM writes a structured medical summary
  4. Critical — LLM critically reviews + improves the summary

The pipeline never raises a 502 due to a missing Tavily key.
"""

import logging
import time

from Tools.tools import SearchToolError, ScrapeToolError, search_web, scrape_web, wiki_search
from Agents.writer_agent import run_writer
from Agents.critical_agent import run_critical
from config import settings
from reliability import ExecutionTimeoutError, RetryExhaustedError, execute_with_timeout

logger = logging.getLogger(__name__)


class PipelineError(Exception):
    """Raised when a critical pipeline step fails."""

    def __init__(
        self,
        message: str,
        *,
        state: dict,
        error_type: str,
        step_failed: str,
        retryable: bool,
    ):
        super().__init__(message)
        self.state = state
        self.error_type = error_type
        self.step_failed = step_failed
        self.retryable = retryable


# =============================================================================
# Pipeline Result Schema
# =============================================================================

def _empty_result() -> dict:
    return {
        "search_summary":  "",
        "scraped_content": "",
        "report":          "",
        "analysis":        "",
        "sources_used":    0,
        "steps_completed": [],
        "step_statuses":   [],
        "errors":          [],
    }


def _record_step(state: dict, step: str, status: str, duration_ms: int, error: str = "") -> None:
    entry = {"step": step, "status": status, "duration_ms": duration_ms}
    if error:
        entry["error"] = error
    state["step_statuses"].append(entry)
    if status == "success":
        state["steps_completed"].append(step)


# =============================================================================
# Main Pipeline
# =============================================================================

def run_pipeline(question: str, request_id: str = "-") -> dict:
    """
    4-step research pipeline (Step 2 is skipped on Wikipedia fallback).

    Args:
        question   : Disease name or medical query to research.
        request_id : Unique request ID for log tracing.

    Returns:
        dict with keys:
          search_summary, scraped_content, report,
          analysis, sources_used, steps_completed, errors
    """
    state = _empty_result()

    # ── Step 1: Search ────────────────────────────────────────
    # search_web() automatically falls back to Wikipedia when Tavily is
    # unavailable, so this step should never raise SearchToolError.
    logger.info("request_id=%s step=search status=start", request_id)
    step_start = time.perf_counter()
    search_result = {}
    try:
        search_result = execute_with_timeout(
            search_web,
            question,
            request_id,
            timeout_s=settings.PIPELINE_STEP_TIMEOUT_SEARCH_SECONDS,
        )
        state["search_summary"] = search_result.get("summary", "")
        state["sources_used"]   = len(search_result.get("results", []))
        duration_ms = int((time.perf_counter() - step_start) * 1000)
        _record_step(state, "search", "success", duration_ms)
        logger.info(
            "request_id=%s step=search duration=%dms status=success sources=%d",
            request_id, duration_ms, state["sources_used"],
        )

    except ExecutionTimeoutError as exc:
        err = f"Search timed out: {exc}"
        duration_ms = int((time.perf_counter() - step_start) * 1000)
        _record_step(state, "search", "timeout", duration_ms, err)
        state["errors"].append(err)
        raise PipelineError(
            err,
            state=state, error_type="pipeline_timeout",
            step_failed="search", retryable=True,
        ) from exc
    except Exception as exc:
        err = f"Search failed: {exc}"
        duration_ms = int((time.perf_counter() - step_start) * 1000)
        _record_step(state, "search", "failed", duration_ms, err)
        state["errors"].append(err)
        raise PipelineError(
            err,
            state=state, error_type="pipeline_search_error",
            step_failed="search", retryable=True,
        ) from exc

    # ── Step 2: Scrape top URL ────────────────────────────────
    # IMPORTANT: when search_web uses the Wikipedia fallback it returns urls=[].
    # In that case we SKIP this step — the wiki content is already in
    # search_summary and will be passed directly to the writer agent.
    urls    = search_result.get("urls", [])
    has_url = bool(urls)

    if has_url:
        logger.info("request_id=%s step=scrape status=start url=%s", request_id, urls[0])
        step_start = time.perf_counter()
        try:
            scraped = execute_with_timeout(
                scrape_web,
                urls[0],
                request_id,
                timeout_s=settings.PIPELINE_STEP_TIMEOUT_SCRAPE_SECONDS,
            )
            state["scraped_content"] = scraped
            duration_ms = int((time.perf_counter() - step_start) * 1000)
            _record_step(state, "scrape", "success", duration_ms)
            logger.info(
                "request_id=%s step=scrape duration=%dms status=success chars=%d",
                request_id, duration_ms, len(scraped),
            )
        except ExecutionTimeoutError as exc:
            err = f"Scrape timed out: {exc}"
            duration_ms = int((time.perf_counter() - step_start) * 1000)
            _record_step(state, "scrape", "timeout", duration_ms, err)
            state["errors"].append(err)
            logger.warning(
                "request_id=%s step=scrape timeout — proceeding without scraped content",
                request_id,
            )
            # Non-fatal: continue with just the search summary
        except (ScrapeToolError, RetryExhaustedError, Exception) as exc:
            err = f"Scrape failed: {exc}"
            duration_ms = int((time.perf_counter() - step_start) * 1000)
            _record_step(state, "scrape", "failed", duration_ms, err)
            state["errors"].append(err)
            logger.warning(
                "request_id=%s step=scrape failed (%s) — proceeding without scraped content",
                request_id, exc,
            )
            # Non-fatal: continue with just the search summary
    else:
        # Wikipedia fallback — no URL to scrape, log and skip
        logger.info(
            "request_id=%s step=scrape status=skipped "
            "(no URL — Wikipedia fallback active)", request_id,
        )
        _record_step(state, "scrape", "skipped", 0, "No URL (Wikipedia fallback)")
        # The full Wikipedia article text is in search_result["results"][0]["content"]
        wiki_results = search_result.get("results", [])
        if wiki_results and wiki_results[0].get("content"):
            state["scraped_content"] = wiki_results[0]["content"]

    # ── Step 3: Writer Agent ──────────────────────────────────
    logger.info("request_id=%s step=writer status=start", request_id)
    step_start = time.perf_counter()
    try:
        combined_info = (
            f"=== Search / Wikipedia Summary ===\n{state['search_summary']}\n\n"
            f"=== Article Content ===\n{state['scraped_content']}"
        )
        report = execute_with_timeout(
            run_writer,
            combined_info,
            question,
            request_id,
            timeout_s=settings.PIPELINE_STEP_TIMEOUT_WRITER_SECONDS,
        )
        state["report"] = report
        duration_ms = int((time.perf_counter() - step_start) * 1000)
        _record_step(state, "writer", "success", duration_ms)
        logger.info(
            "request_id=%s step=writer duration=%dms status=success",
            request_id, duration_ms,
        )
    except ExecutionTimeoutError as exc:
        err = f"Writer timed out: {exc}"
        duration_ms = int((time.perf_counter() - step_start) * 1000)
        _record_step(state, "writer", "timeout", duration_ms, err)
        state["errors"].append(err)
        raise PipelineError(
            err,
            state=state, error_type="pipeline_timeout",
            step_failed="writer", retryable=True,
        ) from exc
    except Exception as exc:
        err = f"Writer failed: {exc}"
        duration_ms = int((time.perf_counter() - step_start) * 1000)
        _record_step(state, "writer", "failed", duration_ms, err)
        state["errors"].append(err)
        raise PipelineError(
            err,
            state=state, error_type="pipeline_writer_error",
            step_failed="writer", retryable=True,
        ) from exc

    # ── Step 4: Critical Review ───────────────────────────────
    logger.info("request_id=%s step=critical status=start", request_id)
    step_start = time.perf_counter()
    try:
        analysis = execute_with_timeout(
            run_critical,
            state["report"],
            question,
            request_id,
            timeout_s=settings.PIPELINE_STEP_TIMEOUT_CRITICAL_SECONDS,
        )
        state["analysis"] = analysis
        duration_ms = int((time.perf_counter() - step_start) * 1000)
        _record_step(state, "critical", "success", duration_ms)
        logger.info(
            "request_id=%s step=critical duration=%dms status=success",
            request_id, duration_ms,
        )
    except ExecutionTimeoutError as exc:
        err = f"Critical review timed out: {exc}"
        duration_ms = int((time.perf_counter() - step_start) * 1000)
        _record_step(state, "critical", "timeout", duration_ms, err)
        state["errors"].append(err)
        raise PipelineError(
            err,
            state=state, error_type="pipeline_timeout",
            step_failed="critical", retryable=True,
        ) from exc
    except Exception as exc:
        err = f"Critical review failed: {exc}"
        duration_ms = int((time.perf_counter() - step_start) * 1000)
        _record_step(state, "critical", "failed", duration_ms, err)
        state["errors"].append(err)
        raise PipelineError(
            err,
            state=state, error_type="pipeline_critical_error",
            step_failed="critical", retryable=True,
        ) from exc

    logger.info(
        "request_id=%s pipeline=complete steps=%s",
        request_id, state["steps_completed"],
    )
    return state


# =============================================================================
# CLI Test Entry Point
# =============================================================================

if __name__ == "__main__":
    import json
    result = run_pipeline("What are the symptoms and causes of diabetes?")
    print(json.dumps({k: v for k, v in result.items() if k != "analysis"}, indent=2))