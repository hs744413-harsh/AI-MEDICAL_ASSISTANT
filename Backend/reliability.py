import logging
import random
import time
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError
from typing import Any, Callable

logger = logging.getLogger(__name__)


class RetryExhaustedError(Exception):
    """Raised when all retry attempts are exhausted."""


class ExecutionTimeoutError(Exception):
    """Raised when a function exceeds its timeout."""


def execute_with_timeout(
    func: Callable[..., Any],
    *args: Any,
    timeout_s: float,
    **kwargs: Any,
) -> Any:
    """Run a blocking callable with a hard timeout."""
    with ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(func, *args, **kwargs)
        try:
            return future.result(timeout=timeout_s)
        except FuturesTimeoutError as exc:
            future.cancel()
            raise ExecutionTimeoutError(f"Execution timed out after {timeout_s:.2f}s") from exc


def retry_with_backoff(
    func: Callable[[], Any],
    *,
    attempts: int,
    base_delay_s: float,
    max_delay_s: float,
    jitter_s: float,
    step: str,
    request_id: str | None = None,
    retry_on: tuple[type[Exception], ...] = (Exception,),
) -> Any:
    """Retry function with exponential backoff and jitter."""
    last_exc: Exception | None = None
    for attempt in range(1, attempts + 1):
        try:
            return func()
        except retry_on as exc:
            last_exc = exc
            is_last = attempt == attempts
            if is_last:
                break
            delay = min(base_delay_s * (2 ** (attempt - 1)), max_delay_s) + random.uniform(0, jitter_s)
            logger.warning(
                "request_id=%s step=%s status=retry attempt=%d/%d delay_ms=%d error=%s",
                request_id or "-",
                step,
                attempt,
                attempts,
                int(delay * 1000),
                str(exc),
            )
            time.sleep(delay)
    raise RetryExhaustedError(f"{step} failed after {attempts} attempts: {last_exc}")
