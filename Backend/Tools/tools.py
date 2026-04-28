"""
Tools/tools.py — Search and Scrape tools for the pipeline.

All functions are plain callables (no @tool decorator).

Changes in this version:
  - TavilyClient is initialised LAZILY (on first call, not at import time).
    This prevents a silent None assignment when the package is not installed
    while the settings show the key as "configured".
  - search_web() has a full graceful FALLBACK to wiki_search() when Tavily is
    not available or not installed.  The pipeline therefore NEVER crashes with
    a 502 just because of a missing Tavily configuration.
"""

import logging
import time
import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

from config import settings
from reliability import ExecutionTimeoutError, execute_with_timeout, retry_with_backoff


# =============================================================================
# Custom exceptions
# =============================================================================

class ToolError(Exception):
    """Base class for tool failures."""


class SearchToolError(ToolError):
    """Raised when web search fails."""


class ScrapeToolError(ToolError):
    """Raised when web scraping fails."""


# =============================================================================
# Lazy Tavily client
# =============================================================================
# FIXED: do NOT initialise at module load time.
# Importing tools.py before the env file is loaded (or when tavily-python is
# not installed) used to silently set _tavily = None, making every call fail
# with "Tavily not configured" even though the key was present in .env.
#
# We now initialise lazily: the client is built on the first call to
# search_web() and cached in _tavily_client.  If initialisation fails for any
# reason the error is logged and search_web falls back to wiki_search.

_tavily_client = None   # None = not yet initialised
_tavily_ok     = None   # None = unknown, True = working, False = unavailable


def _get_tavily():
    """
    Returns the TavilyClient singleton, or None if unavailable.
    Logs the reason for unavailability exactly once.
    """
    global _tavily_client, _tavily_ok

    if _tavily_ok is True:
        return _tavily_client

    if _tavily_ok is False:
        return None  # already determined unavailable — skip silently

    # First call: try to initialise
    try:
        from tavily import TavilyClient  # noqa: PLC0415

        if not settings.TAVILY_API_KEY:
            logger.warning(
                "TAVILY_API_KEY is not set in .env — "
                "search_web will fall back to Wikipedia."
            )
            _tavily_ok = False
            return None

        _tavily_client = TavilyClient(api_key=settings.TAVILY_API_KEY)
        _tavily_ok = True
        logger.info("TavilyClient initialised successfully.")
        return _tavily_client

    except ImportError:
        logger.warning(
            "tavily-python is not installed — search_web will fall back to Wikipedia. "
            "Install it with: pip install tavily-python"
        )
        _tavily_ok = False
        return None

    except Exception as exc:
        logger.error(
            "TavilyClient initialisation failed (%s) — "
            "search_web will fall back to Wikipedia.", exc
        )
        _tavily_ok = False
        return None


# =============================================================================
# Wikipedia client (optional)
# =============================================================================

try:
    import wikipediaapi
    _wiki = wikipediaapi.Wikipedia(
        user_agent="Medical_Assistant_AI/1.0",
        language="en",
        extract_format=wikipediaapi.ExtractFormat.WIKI,
    )
except ImportError:
    _wiki = None
    logger.warning("wikipedia-api not installed; wiki_search unavailable.")


# =============================================================================
# TOOL 1 — search_web (Tavily, with automatic Wikipedia fallback)
# =============================================================================

def _wiki_as_search_result(query: str, request_id: str = "-") -> dict:
    """
    Converts a wiki_search result into the same dict shape that search_web
    normally returns, so the pipeline can use it without any code changes.

    Returns:
        { "summary": str, "urls": [], "results": [{"title", "url", "content"}] }

    Note: urls is intentionally empty — there is nothing to scrape.
    The pipeline must check for an empty urls list and skip the scrape step.
    """
    logger.info(
        "request_id=%s search_web: using Wikipedia fallback for %r", request_id, query
    )
    content = wiki_search(query, request_id)
    summary = (
        "=== Wikipedia Results ===\n"
        f"Result 1:\n"
        f"  Title  : {query}\n"
        f"  Source : Wikipedia\n"
        f"  Snippet: {content[:400]}\n"
    )
    return {
        "summary": summary,
        "urls":    [],          # no URL to scrape
        "results": [{"title": query, "url": "", "content": content}],
    }


def search_web(query: str, request_id: str = "-") -> dict:
    """
    Searches the web using Tavily.

    If Tavily is unavailable (not installed / key missing / any error),
    automatically falls back to wiki_search and returns a compatible dict.

    Returns:
        {
          "summary": str,        — formatted text snippet of all results
          "urls":    list[str],  — source URLs (may be [] for wiki fallback)
          "results": list[dict], — raw {title, url, content} dicts
        }
    """
    tavily = _get_tavily()

    # ── FALLBACK path (no Tavily) ─────────────────────────────
    if tavily is None:
        logger.warning(
            "request_id=%s search_web: Tavily unavailable — "
            "using Wikipedia fallback.", request_id
        )
        return _wiki_as_search_result(query, request_id)

    # ── TAVILY path ───────────────────────────────────────────
    start = time.perf_counter()

    def _do_search() -> dict:
        return execute_with_timeout(
            tavily.search,
            query=query,
            max_results=settings.TAVILY_MAX_RESULTS,
            timeout_s=settings.TAVILY_TIMEOUT_SECONDS,
        )

    try:
        response    = retry_with_backoff(
            _do_search,
            attempts=settings.RETRY_ATTEMPTS,
            base_delay_s=settings.RETRY_BASE_DELAY_SECONDS,
            max_delay_s=settings.RETRY_MAX_DELAY_SECONDS,
            jitter_s=settings.RETRY_JITTER_SECONDS,
            step="search",
            request_id=request_id,
        )
        raw_results = response.get("results", [])[:settings.TAVILY_MAX_RESULTS]

        urls       = []
        text_parts = []

        for i, r in enumerate(raw_results, 1):
            title   = r.get("title",   "No title")
            url     = r.get("url",     "")
            content = r.get("content", "No content")[:400]

            if url:
                urls.append(url)

            text_parts.append(
                f"Result {i}:\n"
                f"  Title  : {title}\n"
                f"  URL    : {url}\n"
                f"  Snippet: {content}\n"
            )

        summary = "=== Web Search Results ===\n" + "\n".join(text_parts)
        duration_ms = int((time.perf_counter() - start) * 1000)
        logger.info(
            "request_id=%s step=search duration=%dms status=success results=%d",
            request_id, duration_ms, len(raw_results),
        )
        return {"summary": summary, "urls": urls, "results": raw_results}

    except (ExecutionTimeoutError, Exception) as exc:
        duration_ms = int((time.perf_counter() - start) * 1000)
        logger.warning(
            "request_id=%s step=search duration=%dms status=fail error=%s — "
            "falling back to Wikipedia",
            request_id, duration_ms, str(exc),
        )
        # FALLBACK: if Tavily call itself fails (rate limit, network, etc.)
        # use Wikipedia rather than raising SearchToolError and returning 502.
        return _wiki_as_search_result(query, request_id)


# =============================================================================
# TOOL 2 — scrape_web
# =============================================================================

def scrape_web(url: str, request_id: str = "-") -> str:
    """
    Scrapes clean text from a URL string.

    IMPORTANT: expects a URL (https://...), NOT raw text.
    The pipeline extracts the URL from search_result["urls"] before calling this.
    When search_web falls back to Wikipedia, urls=[] and the pipeline skips
    this step entirely (see pipeline.py Step 2).
    """
    if not url or not url.startswith("http"):
        logger.warning("scrape_web: invalid URL %r", url)
        raise ScrapeToolError(f"Invalid URL provided: {url!r}")

    start = time.perf_counter()

    def _fetch() -> requests.Response:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            )
        }
        resp = requests.get(url, headers=headers, timeout=settings.SCRAPE_TIMEOUT_SECONDS)
        resp.raise_for_status()
        return resp

    try:
        resp = retry_with_backoff(
            lambda: execute_with_timeout(_fetch, timeout_s=settings.SCRAPE_TIMEOUT_SECONDS + 1),
            attempts=settings.RETRY_ATTEMPTS,
            base_delay_s=settings.RETRY_BASE_DELAY_SECONDS,
            max_delay_s=settings.RETRY_MAX_DELAY_SECONDS,
            jitter_s=settings.RETRY_JITTER_SECONDS,
            step="scrape",
            request_id=request_id,
        )
        soup = BeautifulSoup(resp.text, "html.parser")
        for tag in soup(["script", "style", "header", "footer",
                          "nav", "aside", "form", "noscript"]):
            tag.decompose()

        text    = soup.get_text(separator=" ", strip=True)
        cleaned = " ".join(text.split())
        result  = cleaned[:settings.SCRAPE_MAX_CHARS]

        duration_ms = int((time.perf_counter() - start) * 1000)
        logger.info(
            "request_id=%s step=scrape duration=%dms status=success chars=%d",
            request_id, duration_ms, len(result),
        )
        return result

    except requests.exceptions.HTTPError as exc:
        duration_ms = int((time.perf_counter() - start) * 1000)
        logger.warning(
            "request_id=%s step=scrape duration=%dms status=fail error=%s",
            request_id, duration_ms, str(exc),
        )
        raise ScrapeToolError(f"HTTP error scraping {url}: {exc}") from exc
    except requests.exceptions.Timeout:
        duration_ms = int((time.perf_counter() - start) * 1000)
        logger.warning(
            "request_id=%s step=scrape duration=%dms status=timeout",
            request_id, duration_ms,
        )
        raise ScrapeToolError(f"Timeout scraping {url}")
    except Exception as exc:
        duration_ms = int((time.perf_counter() - start) * 1000)
        logger.error(
            "request_id=%s step=scrape duration=%dms status=fail error=%s",
            request_id, duration_ms, str(exc),
        )
        raise ScrapeToolError(f"Scrape error for {url}: {exc}") from exc


# =============================================================================
# TOOL 3 — wiki_search
# =============================================================================

def wiki_search(query: str, request_id: str = "-") -> str:
    """
    Returns the Wikipedia summary for a medical term / disease name.
    request_id included so this can be passed to execute_with_timeout without TypeError.
    """
    if _wiki is None:
        return "Wikipedia search unavailable (wikipedia-api not installed)."

    try:
        page = _wiki.page(query)
        if page.exists():
            summary = page.summary[:2000]
            logger.info(
                "request_id=%s wiki_search: found page for %r (%d chars)",
                request_id, query, len(summary),
            )
            return summary
        logger.warning(
            "request_id=%s wiki_search: no article found for %r", request_id, query
        )
        return f"No Wikipedia article found for: {query}"
    except Exception as exc:
        logger.error("request_id=%s wiki_search error: %s", request_id, exc)
        return f"Wikipedia error: {exc}"
