"""
Global rate limiting configuration for all scrapers
"""

RATE_LIMITS = {
    "github.com": 10,
    "stackshare.io": 5,
    "alternativeto.net": 8,
    "betalist.com": 10,
    "indiehackers.com": 10,
    "devhunt.org": 10,
    "theresanaiforthat.com": 8,
    "futuretools.io": 8,
    "aitools.fyi": 8,
    "default": 15,
}

DEFAULT_RETRY_CONFIG = {
    "max_retries": 3,
    "base_delay": 2.0,
    "max_delay": 120.0,
}

AGGRESSIVE_RETRY_CONFIG = {
    "max_retries": 5,
    "base_delay": 5.0,
    "max_delay": 180.0,
}
