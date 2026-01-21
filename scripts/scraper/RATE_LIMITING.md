# Rate Limiting & 429 Error Handling

## Changes Made

### 1. Enhanced `bot_avoidance.py`

**Improved 429 handling in `retry_with_backoff()`:**
- 429 errors now get **4x longer delays** (extra +2 exponent)
- Example: 1st retry = 8s, 2nd = 16s, 3rd = 32s (vs normal 2s, 4s, 8s)
- Added `httpx.HTTPStatusError` exception handling

**New `safe_get()` function:**
- Wrapper for safe HTTP GET requests with automatic retries
- Returns `None` on failure instead of raising exceptions
- Logs specific error types (429, 404, etc.)
- Default: 3 retries with 2s base delay, up to 120s max

**New `get_rate_limiter()` function:**
- Returns domain-specific rate limiters
- Caches limiters per domain to maintain state

### 2. New `rate_limit_config.py`

**Domain-specific rate limits (requests/minute):**
- `github.com`: 10 req/min (6s between requests)
- `stackshare.io`: 5 req/min (12s between requests)
- `alternativeto.net`: 8 req/min (7.5s between requests)
- `betalist.com`: 10 req/min
- `indiehackers.com`: 10 req/min
- `devhunt.org`: 10 req/min
- AI directories: 8 req/min
- **Default**: 15 req/min (4s between requests)

**Retry configurations:**
- `DEFAULT_RETRY_CONFIG`: 3 retries, 2s base, 120s max
- `AGGRESSIVE_RETRY_CONFIG`: 5 retries, 5s base, 180s max

## Usage in Scrapers

### Before (causing 429s):
```python
async with httpx.AsyncClient() as client:
    response = await client.get(url)
    response.raise_for_status()
```

### After (handles 429s):
```python
from bot_avoidance import safe_get, get_rate_limiter, create_client_with_limits
from urllib.parse import urlparse

async with create_client_with_limits() as client:
    domain = urlparse(url).netloc
    rate_limiter = get_rate_limiter(domain)
    
    await rate_limiter.wait()
    response = await safe_get(client, url, max_retries=3)
    
    if response:
        data = response.json()
```

## Key Features

1. **Exponential backoff** with jitter for retries
2. **Domain-specific rate limiting** to respect each site's limits
3. **Graceful degradation** - returns None instead of crashing
4. **Automatic retry** on 429, 500, 502, 503, 504 errors
5. **Longer delays for 429** specifically to avoid repeated rate limiting

## Next Steps

Scrapers that need updating:
- `github_trending.py` - Already has many 429 errors
- `stackshare_scraper.py` - All requests failed with 429
- `alternativeto_scraper.py` - Many 404s (need to fix URLs)
- `ai_directories_scraper.py` - Many 404s
- `betalist_scraper.py` - Many 404s

The infrastructure is ready. Each scraper should be updated to use `safe_get()` and domain-specific rate limiters.
