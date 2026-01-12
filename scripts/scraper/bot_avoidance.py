"""
Bot Detection Avoidance Utilities
Provides helpers for making scraper requests appear more human-like
"""
import random
import asyncio
from typing import Optional, Callable, Any
import httpx


USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
]


ACCEPT_LANGUAGES = [
    "en-US,en;q=0.9",
    "en-GB,en;q=0.9",
    "en-US,en;q=0.9,es;q=0.8",
    "en-US,en;q=0.9,fr;q=0.8",
    "en-US,en;q=0.9,de;q=0.8",
]


def get_random_user_agent() -> str:
    """Get a random user agent string."""
    return random.choice(USER_AGENTS)


def get_realistic_headers(
    referer: Optional[str] = None,
    accept_type: str = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
) -> dict:
    """
    Generate realistic browser headers to avoid bot detection.
    
    Args:
        referer: Optional referer URL
        accept_type: Accept header value (defaults to HTML)
    
    Returns:
        Dictionary of HTTP headers
    """
    headers = {
        "User-Agent": get_random_user_agent(),
        "Accept": accept_type,
        "Accept-Language": random.choice(ACCEPT_LANGUAGES),
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Cache-Control": "max-age=0",
    }
    
    if referer:
        headers["Referer"] = referer
        headers["Sec-Fetch-Site"] = "same-origin"
    
    return headers


def get_api_headers(
    api_key: Optional[str] = None,
    api_version: Optional[str] = None,
    extra_headers: Optional[dict] = None
) -> dict:
    """
    Generate headers for API requests with realistic user agent.
    
    Args:
        api_key: Optional API key/token
        api_version: Optional API version header
        extra_headers: Additional headers to include
    
    Returns:
        Dictionary of HTTP headers
    """
    headers = {
        "User-Agent": get_random_user_agent(),
        "Accept": "application/json",
        "Accept-Language": random.choice(ACCEPT_LANGUAGES),
        "Accept-Encoding": "gzip, deflate, br",
    }
    
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    
    if api_version:
        headers["X-API-Version"] = api_version
    
    if extra_headers:
        headers.update(extra_headers)
    
    return headers


async def random_delay(min_seconds: float = 0.5, max_seconds: float = 2.0):
    """
    Add a random delay to mimic human behavior.
    
    Args:
        min_seconds: Minimum delay in seconds
        max_seconds: Maximum delay in seconds
    """
    delay = random.uniform(min_seconds, max_seconds)
    await asyncio.sleep(delay)


async def exponential_backoff_delay(attempt: int, base_delay: float = 1.0, max_delay: float = 60.0):
    """
    Calculate and apply exponential backoff delay with jitter.
    
    Args:
        attempt: Current retry attempt number (0-indexed)
        base_delay: Base delay in seconds
        max_delay: Maximum delay in seconds
    """
    delay = min(base_delay * (2 ** attempt), max_delay)
    jitter = random.uniform(0, delay * 0.1)
    await asyncio.sleep(delay + jitter)


async def retry_with_backoff(
    func: Callable,
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    retry_on_status: Optional[list[int]] = None,
    *args,
    **kwargs
) -> Any:
    """
    Retry a function with exponential backoff.
    
    Args:
        func: Async function to retry
        max_retries: Maximum number of retry attempts
        base_delay: Base delay for exponential backoff
        max_delay: Maximum delay between retries
        retry_on_status: List of HTTP status codes to retry on
        *args: Arguments to pass to func
        **kwargs: Keyword arguments to pass to func
    
    Returns:
        Result from func
    
    Raises:
        Last exception if all retries fail
    """
    if retry_on_status is None:
        retry_on_status = [429, 500, 502, 503, 504]
    
    last_exception = None
    
    for attempt in range(max_retries + 1):
        try:
            result = await func(*args, **kwargs)
            
            if hasattr(result, 'status_code') and result.status_code in retry_on_status:
                if attempt < max_retries:
                    await exponential_backoff_delay(attempt, base_delay, max_delay)
                    continue
            
            return result
            
        except (httpx.TimeoutException, httpx.ConnectError, httpx.ReadTimeout) as e:
            last_exception = e
            if attempt < max_retries:
                await exponential_backoff_delay(attempt, base_delay, max_delay)
            else:
                raise
        except Exception as e:
            last_exception = e
            raise
    
    if last_exception:
        raise last_exception


class RateLimiter:
    """
    Rate limiter to control request frequency.
    """
    
    def __init__(self, requests_per_minute: int = 30):
        """
        Initialize rate limiter.
        
        Args:
            requests_per_minute: Maximum requests allowed per minute
        """
        self.requests_per_minute = requests_per_minute
        self.min_delay = 60.0 / requests_per_minute
        self.last_request_time = 0.0
    
    async def wait(self):
        """Wait if necessary to respect rate limit."""
        import time
        current_time = time.time()
        time_since_last = current_time - self.last_request_time
        
        if time_since_last < self.min_delay:
            wait_time = self.min_delay - time_since_last
            jitter = random.uniform(0, wait_time * 0.2)
            await asyncio.sleep(wait_time + jitter)
        
        self.last_request_time = time.time()


def create_client_with_limits(
    timeout: float = 30.0,
    max_connections: int = 10,
    max_keepalive_connections: int = 5,
    follow_redirects: bool = True
) -> httpx.AsyncClient:
    """
    Create an httpx client with conservative limits to avoid detection.
    
    Args:
        timeout: Request timeout in seconds
        max_connections: Maximum concurrent connections
        max_keepalive_connections: Maximum keepalive connections
        follow_redirects: Whether to follow redirects
    
    Returns:
        Configured httpx.AsyncClient
    """
    limits = httpx.Limits(
        max_connections=max_connections,
        max_keepalive_connections=max_keepalive_connections,
    )
    
    return httpx.AsyncClient(
        timeout=timeout,
        limits=limits,
        follow_redirects=follow_redirects,
        headers=get_realistic_headers(),
    )
