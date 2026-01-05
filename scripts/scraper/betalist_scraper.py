"""
BetaList Scraper - Fetches early-stage startups and tools from BetaList
"""
import os
import json
import asyncio
import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from typing import Optional


BETALIST_URLS = [
    "https://betalist.com/startups",
    "https://betalist.com/startups?sort=popular",
    "https://betalist.com/startups?sort=newest",
]

CATEGORIES = [
    "developer-tools",
    "productivity",
    "artificial-intelligence",
    "saas",
    "api",
    "automation",
    "analytics",
    "design",
    "marketing",
    "fintech",
]


async def fetch_startups_page(client: httpx.AsyncClient, url: str) -> list:
    """Fetch startups from a BetaList page."""
    try:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        startups = []
        
        for item in soup.select(".startup-card, article, [data-startup]"):
            try:
                name_elem = item.select_one("h2, h3, .startup-name, a")
                if not name_elem:
                    continue
                
                name = name_elem.get_text(strip=True)
                if not name or len(name) > 100:
                    continue
                
                link_elem = item.select_one("a[href*='/startups/']")
                href = link_elem.get("href", "") if link_elem else ""
                
                tagline_elem = item.select_one(".tagline, .description, p")
                tagline = tagline_elem.get_text(strip=True) if tagline_elem else ""
                
                votes_elem = item.select_one(".votes, .upvotes, [data-votes]")
                votes = 0
                if votes_elem:
                    try:
                        votes = int(votes_elem.get_text(strip=True).replace(",", ""))
                    except:
                        pass
                
                tags = []
                for tag in item.select(".tag, .category, .badge"):
                    tag_text = tag.get_text(strip=True)
                    if tag_text and len(tag_text) < 30:
                        tags.append(tag_text)
                
                img_elem = item.select_one("img")
                logo = img_elem.get("src") if img_elem else None
                
                startups.append({
                    "name": name,
                    "url": f"https://betalist.com{href}" if href.startswith("/") else href,
                    "tagline": tagline[:300] if tagline else "",
                    "votes": votes,
                    "tags": tags,
                    "logo": logo,
                    "source": "betalist",
                })
            except Exception:
                continue
        
        return startups
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return []


async def fetch_category_page(client: httpx.AsyncClient, category: str) -> list:
    """Fetch startups from a specific category."""
    url = f"https://betalist.com/markets/{category}"
    return await fetch_startups_page(client, url)


async def fetch_startup_details(client: httpx.AsyncClient, startup_url: str) -> dict:
    """Fetch detailed info for a specific startup."""
    try:
        response = await client.get(startup_url, follow_redirects=True)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        name_elem = soup.select_one("h1")
        name = name_elem.get_text(strip=True) if name_elem else ""
        
        tagline_elem = soup.select_one(".tagline, .subtitle")
        tagline = tagline_elem.get_text(strip=True) if tagline_elem else ""
        
        desc_elem = soup.select_one(".description, .about, .pitch")
        description = desc_elem.get_text(strip=True) if desc_elem else ""
        
        website_elem = soup.select_one("a[href*='http']:not([href*='betalist'])")
        website = website_elem.get("href") if website_elem else None
        
        makers = []
        for maker in soup.select(".maker, .founder"):
            maker_name = maker.get_text(strip=True)
            if maker_name:
                makers.append(maker_name)
        
        return {
            "name": name,
            "tagline": tagline,
            "description": description[:500] if description else "",
            "website": website,
            "makers": makers,
            "startup_url": startup_url,
        }
    except Exception as e:
        return {"url": startup_url, "error": str(e)}


async def scrape_betalist() -> dict:
    """Scrape BetaList for early-stage startups."""
    results = {
        "scraped_at": datetime.now().isoformat(),
        "pages": {},
        "categories": {},
        "all_startups": [],
    }
    
    seen_startups = set()
    
    async with httpx.AsyncClient(
        timeout=30.0,
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml",
        }
    ) as client:
        for url in BETALIST_URLS:
            page_name = url.split("=")[-1] if "=" in url else "default"
            print(f"  Fetching BetaList page: {page_name}...")
            
            startups = await fetch_startups_page(client, url)
            results["pages"][page_name] = startups
            
            for startup in startups:
                if startup["name"].lower() not in seen_startups:
                    seen_startups.add(startup["name"].lower())
                    results["all_startups"].append(startup)
            
            await asyncio.sleep(2)
        
        for category in CATEGORIES:
            print(f"  Fetching category: {category}...")
            startups = await fetch_category_page(client, category)
            results["categories"][category] = startups
            
            for startup in startups:
                if startup["name"].lower() not in seen_startups:
                    seen_startups.add(startup["name"].lower())
                    results["all_startups"].append(startup)
            
            await asyncio.sleep(2)
    
    results["total_unique_startups"] = len(results["all_startups"])
    return results


if __name__ == "__main__":
    async def main():
        print("Scraping BetaList...")
        results = await scrape_betalist()
        
        output_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(output_dir, exist_ok=True)
        
        output_path = os.path.join(output_dir, "betalist.json")
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        
        print(f"\nSaved {results['total_unique_startups']} unique startups to {output_path}")
    
    asyncio.run(main())
