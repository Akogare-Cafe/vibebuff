"""
GitHub Trending Scraper - Fetches trending repositories from GitHub
"""
import os
import json
import asyncio
import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from typing import Optional


TRENDING_URLS = {
    "daily": "https://github.com/trending?since=daily",
    "weekly": "https://github.com/trending?since=weekly",
    "monthly": "https://github.com/trending?since=monthly",
}

LANGUAGE_FILTERS = [
    "",
    "typescript",
    "javascript", 
    "python",
    "rust",
    "go",
]

TOPIC_URLS = [
    "https://github.com/topics/ai",
    "https://github.com/topics/machine-learning",
    "https://github.com/topics/llm",
    "https://github.com/topics/developer-tools",
    "https://github.com/topics/devtools",
    "https://github.com/topics/cli",
    "https://github.com/topics/vscode",
    "https://github.com/topics/neovim",
    "https://github.com/topics/react",
    "https://github.com/topics/nextjs",
    "https://github.com/topics/typescript",
    "https://github.com/topics/api",
    "https://github.com/topics/database",
    "https://github.com/topics/authentication",
]


async def fetch_trending_page(client: httpx.AsyncClient, url: str) -> list:
    """Fetch and parse a GitHub trending page."""
    try:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        repos = []
        
        for article in soup.select("article.Box-row"):
            try:
                name_elem = article.select_one("h2 a")
                if not name_elem:
                    continue
                
                repo_path = name_elem.get("href", "").strip("/")
                if not repo_path:
                    continue
                
                description_elem = article.select_one("p")
                description = description_elem.get_text(strip=True) if description_elem else ""
                
                language_elem = article.select_one("[itemprop='programmingLanguage']")
                language = language_elem.get_text(strip=True) if language_elem else None
                
                stars_elem = article.select_one("a[href$='/stargazers']")
                stars_text = stars_elem.get_text(strip=True) if stars_elem else "0"
                stars = parse_number(stars_text)
                
                forks_elem = article.select_one("a[href$='/forks']")
                forks_text = forks_elem.get_text(strip=True) if forks_elem else "0"
                forks = parse_number(forks_text)
                
                stars_today_elem = article.select_one("span.d-inline-block.float-sm-right")
                stars_today_text = stars_today_elem.get_text(strip=True) if stars_today_elem else ""
                stars_today = parse_number(stars_today_text.replace("stars today", "").replace("stars this week", "").replace("stars this month", ""))
                
                repos.append({
                    "repo": repo_path,
                    "url": f"https://github.com/{repo_path}",
                    "description": description,
                    "language": language,
                    "stars": stars,
                    "forks": forks,
                    "stars_period": stars_today,
                })
            except Exception as e:
                continue
        
        return repos
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return []


def parse_number(text: str) -> int:
    """Parse number strings like '1.2k' or '15,234'."""
    text = text.strip().lower().replace(",", "")
    if not text:
        return 0
    try:
        if "k" in text:
            return int(float(text.replace("k", "")) * 1000)
        elif "m" in text:
            return int(float(text.replace("m", "")) * 1000000)
        return int(float(text))
    except:
        return 0


async def fetch_topic_page(client: httpx.AsyncClient, url: str) -> list:
    """Fetch and parse a GitHub topic page."""
    try:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        repos = []
        
        for article in soup.select("article.border"):
            try:
                name_elem = article.select_one("h3 a")
                if not name_elem:
                    continue
                
                repo_path = name_elem.get("href", "").strip("/")
                if not repo_path:
                    continue
                
                description_elem = article.select_one("p.color-fg-muted")
                description = description_elem.get_text(strip=True) if description_elem else ""
                
                stars_elem = article.select_one("a[href$='/stargazers']")
                stars_text = stars_elem.get_text(strip=True) if stars_elem else "0"
                stars = parse_number(stars_text)
                
                repos.append({
                    "repo": repo_path,
                    "url": f"https://github.com/{repo_path}",
                    "description": description,
                    "stars": stars,
                    "source": "topic",
                })
            except Exception:
                continue
        
        return repos
    except Exception as e:
        print(f"Error fetching topic {url}: {e}")
        return []


async def scrape_github_trending() -> dict:
    """Scrape all GitHub trending pages and topics."""
    results = {
        "scraped_at": datetime.now().isoformat(),
        "trending": {},
        "topics": {},
        "all_repos": [],
    }
    
    seen_repos = set()
    
    async with httpx.AsyncClient(
        timeout=30.0,
        headers={"User-Agent": "Mozilla/5.0 (compatible; VibeBuff/1.0)"}
    ) as client:
        for period, base_url in TRENDING_URLS.items():
            results["trending"][period] = {}
            
            for lang in LANGUAGE_FILTERS:
                url = base_url if not lang else f"{base_url}&spoken_language_code=en"
                if lang:
                    url = f"https://github.com/trending/{lang}?since={period}"
                
                print(f"  Fetching trending {period} - {lang or 'all'}...")
                repos = await fetch_trending_page(client, url)
                
                lang_key = lang or "all"
                results["trending"][period][lang_key] = repos
                
                for repo in repos:
                    if repo["repo"] not in seen_repos:
                        seen_repos.add(repo["repo"])
                        results["all_repos"].append(repo)
                
                await asyncio.sleep(1)
        
        for topic_url in TOPIC_URLS:
            topic_name = topic_url.split("/")[-1]
            print(f"  Fetching topic: {topic_name}...")
            
            repos = await fetch_topic_page(client, topic_url)
            results["topics"][topic_name] = repos
            
            for repo in repos:
                if repo["repo"] not in seen_repos:
                    seen_repos.add(repo["repo"])
                    results["all_repos"].append(repo)
            
            await asyncio.sleep(1)
    
    results["total_unique_repos"] = len(results["all_repos"])
    return results


if __name__ == "__main__":
    async def main():
        print("Scraping GitHub Trending...")
        results = await scrape_github_trending()
        
        output_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(output_dir, exist_ok=True)
        
        output_path = os.path.join(output_dir, "github_trending.json")
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        
        print(f"\nSaved {results['total_unique_repos']} unique repos to {output_path}")
    
    asyncio.run(main())
