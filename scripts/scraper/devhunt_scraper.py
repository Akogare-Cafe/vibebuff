"""
DevHunt Scraper - Fetches developer tools from DevHunt.org
"""
import os
import json
import asyncio
import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from typing import Optional


DEVHUNT_URLS = [
    "https://devhunt.org",
    "https://devhunt.org/tools",
    "https://devhunt.org/tools?sort=votes",
    "https://devhunt.org/tools?sort=newest",
]

CATEGORIES = [
    "ai",
    "developer-tools",
    "productivity",
    "open-source",
    "api",
    "database",
    "devops",
    "testing",
    "monitoring",
    "security",
    "frontend",
    "backend",
    "mobile",
    "cli",
    "vscode",
]


async def fetch_devhunt_page(client: httpx.AsyncClient, url: str) -> list:
    """Fetch and parse a DevHunt page."""
    try:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        tools = []
        
        for item in soup.select("article, .tool-card, [data-tool]"):
            try:
                name_elem = item.select_one("h2, h3, .tool-name")
                if not name_elem:
                    continue
                
                name = name_elem.get_text(strip=True)
                
                link_elem = item.select_one("a[href*='/tool/'], a[href*='devhunt.org']")
                href = link_elem.get("href", "") if link_elem else ""
                
                desc_elem = item.select_one("p, .description")
                description = desc_elem.get_text(strip=True) if desc_elem else ""
                
                votes_elem = item.select_one(".votes, [data-votes], .upvote-count")
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
                
                tools.append({
                    "name": name,
                    "url": href if href.startswith("http") else f"https://devhunt.org{href}",
                    "description": description,
                    "votes": votes,
                    "tags": tags,
                    "logo": logo,
                    "source": "devhunt",
                })
            except Exception:
                continue
        
        return tools
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return []


async def fetch_category_page(client: httpx.AsyncClient, category: str) -> list:
    """Fetch tools from a specific category."""
    url = f"https://devhunt.org/tools?category={category}"
    return await fetch_devhunt_page(client, url)


async def scrape_devhunt() -> dict:
    """Scrape DevHunt for developer tools."""
    results = {
        "scraped_at": datetime.now().isoformat(),
        "pages": {},
        "categories": {},
        "all_tools": [],
    }
    
    seen_tools = set()
    
    async with httpx.AsyncClient(
        timeout=30.0,
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml",
        }
    ) as client:
        for url in DEVHUNT_URLS:
            page_name = url.split("?")[-1] if "?" in url else "main"
            print(f"  Fetching DevHunt page: {page_name}...")
            
            tools = await fetch_devhunt_page(client, url)
            results["pages"][page_name] = tools
            
            for tool in tools:
                if tool["name"] not in seen_tools:
                    seen_tools.add(tool["name"])
                    results["all_tools"].append(tool)
            
            await asyncio.sleep(1.5)
        
        for category in CATEGORIES:
            print(f"  Fetching category: {category}...")
            tools = await fetch_category_page(client, category)
            results["categories"][category] = tools
            
            for tool in tools:
                if tool["name"] not in seen_tools:
                    seen_tools.add(tool["name"])
                    results["all_tools"].append(tool)
            
            await asyncio.sleep(1.5)
    
    results["total_unique_tools"] = len(results["all_tools"])
    return results


if __name__ == "__main__":
    async def main():
        print("Scraping DevHunt...")
        results = await scrape_devhunt()
        
        output_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(output_dir, exist_ok=True)
        
        output_path = os.path.join(output_dir, "devhunt.json")
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        
        print(f"\nSaved {results['total_unique_tools']} unique tools to {output_path}")
    
    asyncio.run(main())
