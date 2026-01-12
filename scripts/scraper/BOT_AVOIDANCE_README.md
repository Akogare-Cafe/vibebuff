# Bot Detection Avoidance Implementation

This document describes the bot detection avoidance methods implemented across the GitHub Action scrapers.

## Overview

The scrapers now include comprehensive bot detection avoidance to prevent being blocked or rate-limited by target websites. This is especially important for GitHub Actions which run from shared infrastructure that may be flagged as automated traffic.

## Key Features

### 1. Rotating User Agents
- **10 realistic user agents** from Chrome, Firefox, and Safari
- Randomly selected for each request
- Includes recent browser versions to appear legitimate

### 2. Realistic HTTP Headers
- Complete browser-like headers including:
  - Accept-Language with regional variations
  - Accept-Encoding (gzip, deflate, br)
  - DNT (Do Not Track)
  - Sec-Fetch-* headers for modern browsers
  - Connection keep-alive
  - Cache-Control

### 3. Rate Limiting
- Configurable requests per minute
- Built-in jitter to avoid predictable patterns
- Different limits for different scrapers:
  - GitHub API: 30 req/min
  - Web search: 20 req/min
  - Product Hunt: 15 req/min

### 4. Random Delays
- Variable delays between requests (0.3-4.0 seconds)
- Mimics human browsing patterns
- Prevents detection of automated scraping

### 5. Retry Logic with Exponential Backoff
- Automatic retry on failures (429, 500, 502, 503, 504)
- Exponential backoff with jitter
- Configurable max retries (default: 2-3)
- Handles timeouts and connection errors

### 6. Connection Limits
- Conservative connection pooling
- Max 10 concurrent connections
- Max 5 keepalive connections
- Prevents overwhelming target servers

## Implementation

### Core Module: `bot_avoidance.py`

```python
from bot_avoidance import (
    get_realistic_headers,      # For web scraping
    get_api_headers,            # For API requests
    random_delay,               # Add human-like delays
    retry_with_backoff,         # Retry failed requests
    RateLimiter,                # Control request frequency
    create_client_with_limits,  # Create configured httpx client
)
```

### Usage Example

```python
import httpx
from bot_avoidance import (
    get_realistic_headers,
    random_delay,
    retry_with_backoff,
    RateLimiter,
    create_client_with_limits,
)

# Initialize rate limiter
rate_limiter = RateLimiter(requests_per_minute=20)

async def scrape_website(url: str):
    async with create_client_with_limits(timeout=30.0) as client:
        # Wait for rate limit
        await rate_limiter.wait()
        
        # Get realistic headers
        headers = get_realistic_headers()
        
        # Define fetch function
        async def _fetch():
            return await client.get(url, headers=headers)
        
        # Retry with backoff
        response = await retry_with_backoff(_fetch, max_retries=3)
        
        # Add random delay
        await random_delay(0.5, 2.0)
        
        return response
```

## Updated Scrapers

The following scrapers have been updated with bot avoidance:

1. **`github_scraper.py`**
   - API requests with rotating user agents
   - Rate limiting at 30 req/min
   - Retry logic for API failures
   - Random delays between requests

2. **`web_search.py`**
   - DuckDuckGo search with realistic headers
   - Rate limiting at 20 req/min
   - Retry logic for search failures
   - Random delays to mimic human browsing

3. **`producthunt_scraper.py`**
   - Product Hunt scraping with realistic headers
   - Rate limiting at 15 req/min
   - Retry logic for page loads
   - Random delays between topic/search requests

## Best Practices

### For GitHub Actions

1. **Use GitHub Token**: Always set `GITHUB_TOKEN` secret to avoid rate limits
2. **Schedule Wisely**: Run scrapers at off-peak hours (current: 6 AM and 6 PM UTC)
3. **Monitor Logs**: Check for rate limit errors and adjust delays if needed
4. **Respect Robots.txt**: Ensure scrapers comply with site policies

### For Local Development

1. **Test with Small Datasets**: Don't scrape entire lists during development
2. **Use Environment Variables**: Store API keys in `.env` file
3. **Monitor Rate Limits**: Watch for 429 responses and adjust accordingly
4. **Add Delays**: Use generous delays during testing

## Configuration

### Adjusting Rate Limits

```python
# Slower rate for sensitive sites
rate_limiter = RateLimiter(requests_per_minute=10)

# Faster rate for APIs with high limits
rate_limiter = RateLimiter(requests_per_minute=60)
```

### Adjusting Delays

```python
# Shorter delays for APIs
await random_delay(0.1, 0.3)

# Longer delays for web scraping
await random_delay(2.0, 5.0)
```

### Adjusting Retries

```python
# More retries for critical requests
response = await retry_with_backoff(_fetch, max_retries=5)

# Custom retry status codes
response = await retry_with_backoff(
    _fetch,
    max_retries=3,
    retry_on_status=[429, 503]
)
```

## Monitoring

### GitHub Actions Logs

Check the workflow logs for:
- Rate limit warnings
- Retry attempts
- Failed requests
- Scraping duration

### Success Metrics

- **Successful requests**: Should be >95%
- **Rate limit errors**: Should be <1%
- **Retry rate**: Should be <10%
- **Average delay**: Should match configured ranges

## Troubleshooting

### Getting Rate Limited

1. Increase delays between requests
2. Reduce requests per minute
3. Add more user agents to rotation
4. Check if API token is valid

### Requests Timing Out

1. Increase timeout value
2. Reduce concurrent connections
3. Add retry logic
4. Check network connectivity

### Getting Blocked

1. Verify headers are realistic
2. Add more variation to delays
3. Reduce scraping frequency
4. Check robots.txt compliance

## Future Improvements

- [ ] Add proxy rotation support
- [ ] Implement session management
- [ ] Add cookie handling
- [ ] Browser fingerprinting avoidance
- [ ] Cloudflare bypass techniques
- [ ] CAPTCHA detection and handling
