"""
Deduplication Tracker - Prevents re-scraping the same tools across all scrapers
"""
import os
import json
from typing import Set, Optional
from pathlib import Path
from urllib.parse import urlparse


class DeduplicationTracker:
    """Tracks scraped tools to prevent duplicates across all scrapers."""
    
    def __init__(self, tracker_file: str = "data/scraped_tools_tracker.json"):
        """
        Initialize deduplication tracker.
        
        Args:
            tracker_file: Path to the tracker file
        """
        self.tracker_file = Path(tracker_file)
        self.tracker_file.parent.mkdir(exist_ok=True)
        self.scraped_urls: Set[str] = self._load_tracker()
    
    def _normalize_url(self, url: str) -> str:
        """
        Normalize URL for comparison.
        
        Args:
            url: URL to normalize
        
        Returns:
            Normalized URL
        """
        url = url.lower().strip()
        url = url.rstrip('/')
        
        parsed = urlparse(url)
        
        if parsed.netloc == 'github.com':
            path_parts = parsed.path.strip('/').split('/')
            if len(path_parts) >= 2:
                return f"github.com/{path_parts[0]}/{path_parts[1]}"
        
        return f"{parsed.netloc}{parsed.path}"
    
    def _load_tracker(self) -> Set[str]:
        """Load scraped URLs from tracker file."""
        if self.tracker_file.exists():
            try:
                with open(self.tracker_file, 'r') as f:
                    data = json.load(f)
                    return set(data.get('scraped_urls', []))
            except Exception:
                return set()
        return set()
    
    def _save_tracker(self):
        """Save scraped URLs to tracker file."""
        data = {
            'scraped_urls': sorted(list(self.scraped_urls)),
            'total_count': len(self.scraped_urls),
        }
        with open(self.tracker_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def is_scraped(self, url: str) -> bool:
        """
        Check if a URL has already been scraped.
        
        Args:
            url: URL to check
        
        Returns:
            True if already scraped, False otherwise
        """
        normalized = self._normalize_url(url)
        return normalized in self.scraped_urls
    
    def mark_scraped(self, url: str):
        """
        Mark a URL as scraped.
        
        Args:
            url: URL to mark as scraped
        """
        normalized = self._normalize_url(url)
        if normalized not in self.scraped_urls:
            self.scraped_urls.add(normalized)
            self._save_tracker()
    
    def mark_multiple_scraped(self, urls: list[str]):
        """
        Mark multiple URLs as scraped.
        
        Args:
            urls: List of URLs to mark as scraped
        """
        added = 0
        for url in urls:
            normalized = self._normalize_url(url)
            if normalized not in self.scraped_urls:
                self.scraped_urls.add(normalized)
                added += 1
        
        if added > 0:
            self._save_tracker()
    
    def get_unscraped_urls(self, urls: list[str]) -> list[str]:
        """
        Filter out already-scraped URLs from a list.
        
        Args:
            urls: List of URLs to filter
        
        Returns:
            List of URLs that haven't been scraped yet
        """
        unscraped = []
        for url in urls:
            if not self.is_scraped(url):
                unscraped.append(url)
        return unscraped
    
    def get_stats(self) -> dict:
        """
        Get tracker statistics.
        
        Returns:
            Dictionary with tracker stats
        """
        return {
            'total_scraped': len(self.scraped_urls),
            'tracker_file': str(self.tracker_file),
        }
    
    def clear(self):
        """Clear all tracked URLs."""
        self.scraped_urls.clear()
        self._save_tracker()
    
    def export_urls(self, output_file: str):
        """
        Export all scraped URLs to a file.
        
        Args:
            output_file: Path to output file
        """
        with open(output_file, 'w') as f:
            for url in sorted(self.scraped_urls):
                f.write(f"{url}\n")


def create_global_tracker() -> DeduplicationTracker:
    """Create a global deduplication tracker instance."""
    return DeduplicationTracker()
