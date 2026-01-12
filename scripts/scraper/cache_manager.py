"""
Cache Manager - Intelligent caching to reduce redundant scraping
"""
import os
import json
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Any
from pathlib import Path


class CacheManager:
    """Manages caching of scraped data to avoid redundant requests."""
    
    def __init__(self, cache_dir: str = "cache", default_ttl_hours: int = 72):
        """
        Initialize cache manager.
        
        Args:
            cache_dir: Directory to store cache files
            default_ttl_hours: Default time-to-live for cache entries in hours
        """
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(exist_ok=True)
        self.default_ttl = timedelta(hours=default_ttl_hours)
        self.metadata_file = self.cache_dir / "cache_metadata.json"
        self.metadata = self._load_metadata()
    
    def _load_metadata(self) -> dict:
        """Load cache metadata from disk."""
        if self.metadata_file.exists():
            try:
                with open(self.metadata_file, 'r') as f:
                    return json.load(f)
            except Exception:
                return {}
        return {}
    
    def _save_metadata(self):
        """Save cache metadata to disk."""
        with open(self.metadata_file, 'w') as f:
            json.dump(self.metadata, f, indent=2)
    
    def _get_cache_key(self, key: str) -> str:
        """Generate a cache key hash."""
        return hashlib.md5(key.encode()).hexdigest()
    
    def _get_cache_path(self, cache_key: str) -> Path:
        """Get the file path for a cache key."""
        return self.cache_dir / f"{cache_key}.json"
    
    def get(self, key: str, ttl_hours: Optional[int] = None) -> Optional[Any]:
        """
        Get cached data if it exists and is not expired.
        
        Args:
            key: Cache key
            ttl_hours: Custom TTL in hours (overrides default)
        
        Returns:
            Cached data or None if not found/expired
        """
        cache_key = self._get_cache_key(key)
        cache_path = self._get_cache_path(cache_key)
        
        if not cache_path.exists():
            return None
        
        metadata = self.metadata.get(cache_key)
        if not metadata:
            return None
        
        cached_at = datetime.fromisoformat(metadata['cached_at'])
        ttl = timedelta(hours=ttl_hours) if ttl_hours else self.default_ttl
        
        if datetime.now() - cached_at > ttl:
            self.invalidate(key)
            return None
        
        try:
            with open(cache_path, 'r') as f:
                return json.load(f)
        except Exception:
            return None
    
    def set(self, key: str, data: Any, metadata: Optional[dict] = None):
        """
        Cache data with optional metadata.
        
        Args:
            key: Cache key
            data: Data to cache
            metadata: Optional metadata about the cached data
        """
        cache_key = self._get_cache_key(key)
        cache_path = self._get_cache_path(cache_key)
        
        with open(cache_path, 'w') as f:
            json.dump(data, f, indent=2)
        
        self.metadata[cache_key] = {
            'key': key,
            'cached_at': datetime.now().isoformat(),
            'metadata': metadata or {}
        }
        self._save_metadata()
    
    def invalidate(self, key: str):
        """Remove cached data for a key."""
        cache_key = self._get_cache_key(key)
        cache_path = self._get_cache_path(cache_key)
        
        if cache_path.exists():
            cache_path.unlink()
        
        if cache_key in self.metadata:
            del self.metadata[cache_key]
            self._save_metadata()
    
    def clear_expired(self):
        """Clear all expired cache entries."""
        expired_keys = []
        
        for cache_key, meta in self.metadata.items():
            cached_at = datetime.fromisoformat(meta['cached_at'])
            if datetime.now() - cached_at > self.default_ttl:
                expired_keys.append(meta['key'])
        
        for key in expired_keys:
            self.invalidate(key)
        
        return len(expired_keys)
    
    def get_stats(self) -> dict:
        """Get cache statistics."""
        total_entries = len(self.metadata)
        total_size = sum(
            self._get_cache_path(key).stat().st_size 
            for key in self.metadata.keys()
            if self._get_cache_path(key).exists()
        )
        
        return {
            'total_entries': total_entries,
            'total_size_bytes': total_size,
            'total_size_mb': round(total_size / 1024 / 1024, 2),
            'cache_dir': str(self.cache_dir),
        }


class ConditionalFetcher:
    """Handles conditional HTTP requests using ETag and Last-Modified headers."""
    
    def __init__(self, cache_manager: CacheManager):
        self.cache = cache_manager
    
    def should_fetch(self, url: str, etag: Optional[str] = None, last_modified: Optional[str] = None) -> bool:
        """
        Check if a URL should be fetched based on cache and conditional headers.
        
        Args:
            url: URL to check
            etag: ETag from response
            last_modified: Last-Modified from response
        
        Returns:
            True if should fetch, False if cached version is still valid
        """
        cache_key = f"conditional:{url}"
        cached = self.cache.get(cache_key, ttl_hours=72)
        
        if not cached:
            return True
        
        if etag and cached.get('etag') == etag:
            return False
        
        if last_modified and cached.get('last_modified') == last_modified:
            return False
        
        return True
    
    def update_headers(self, url: str, etag: Optional[str] = None, last_modified: Optional[str] = None):
        """Update cached headers for a URL."""
        cache_key = f"conditional:{url}"
        self.cache.set(cache_key, {
            'etag': etag,
            'last_modified': last_modified,
            'url': url,
        })
    
    def get_conditional_headers(self, url: str) -> dict:
        """Get conditional headers for a request."""
        cache_key = f"conditional:{url}"
        cached = self.cache.get(cache_key, ttl_hours=72)
        
        headers = {}
        if cached:
            if cached.get('etag'):
                headers['If-None-Match'] = cached['etag']
            if cached.get('last_modified'):
                headers['If-Modified-Since'] = cached['last_modified']
        
        return headers
