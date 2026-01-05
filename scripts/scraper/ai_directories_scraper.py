"""
AI Tool Directories Scraper - Fetches tools from AI tool aggregator sites
"""
import os
import json
import asyncio
import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from typing import Optional


THERESANAIFORTHAT_CATEGORIES = [
    "coding",
    "developer-tools",
    "code-assistant",
    "code-generation",
    "debugging",
    "testing",
    "documentation",
    "api",
    "database",
    "devops",
    "productivity",
    "automation",
    "chatbots",
    "writing",
]

FUTURETOOLS_CATEGORIES = [
    "coding",
    "developer-tools",
    "productivity",
    "automation",
    "chatbots",
    "writing",
    "business",
]

AITOOLS_FYI_CATEGORIES = [
    "coding",
    "developer",
    "productivity",
    "automation",
]


async def fetch_theresanaiforthat(client: httpx.AsyncClient, category: str) -> list:
    """Fetch tools from theresanaiforthat.com."""
    url = f"https://theresanaiforthat.com/{category}/"
    
    try:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        tools = []
        
        for item in soup.select(".ai-tool, .tool-card, article"):
            try:
                name_elem = item.select_one("h2, h3, .tool-name, a")
                if not name_elem:
                    continue
                
                name = name_elem.get_text(strip=True)
                if not name or len(name) > 100:
                    continue
                
                link_elem = item.select_one("a[href]")
                href = link_elem.get("href", "") if link_elem else ""
                
                desc_elem = item.select_one("p, .description")
                description = desc_elem.get_text(strip=True) if desc_elem else ""
                
                pricing_elem = item.select_one(".pricing, .price, [data-pricing]")
                pricing = pricing_elem.get_text(strip=True) if pricing_elem else None
                
                saves_elem = item.select_one(".saves, .bookmarks, [data-saves]")
                saves = 0
                if saves_elem:
                    try:
                        saves = int(saves_elem.get_text(strip=True).replace(",", "").replace("K", "000"))
                    except:
                        pass
                
                tags = []
                for tag in item.select(".tag, .category"):
                    tag_text = tag.get_text(strip=True)
                    if tag_text and len(tag_text) < 30:
                        tags.append(tag_text)
                
                tools.append({
                    "name": name,
                    "url": href if href.startswith("http") else f"https://theresanaiforthat.com{href}",
                    "description": description[:500] if description else "",
                    "pricing": pricing,
                    "saves": saves,
                    "tags": tags,
                    "category": category,
                    "source": "theresanaiforthat",
                })
            except Exception:
                continue
        
        return tools
    except Exception as e:
        print(f"Error fetching theresanaiforthat {category}: {e}")
        return []


async def fetch_futuretools(client: httpx.AsyncClient, category: str) -> list:
    """Fetch tools from futuretools.io."""
    url = f"https://www.futuretools.io/tools?category={category}"
    
    try:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        tools = []
        
        for item in soup.select(".tool-card, article, [data-tool]"):
            try:
                name_elem = item.select_one("h2, h3, .tool-name")
                if not name_elem:
                    continue
                
                name = name_elem.get_text(strip=True)
                
                link_elem = item.select_one("a[href]")
                href = link_elem.get("href", "") if link_elem else ""
                
                desc_elem = item.select_one("p, .description")
                description = desc_elem.get_text(strip=True) if desc_elem else ""
                
                pricing_elem = item.select_one(".pricing, .price-tag")
                pricing = pricing_elem.get_text(strip=True) if pricing_elem else None
                
                is_free = bool(item.select_one(".free, [data-free]"))
                is_freemium = bool(item.select_one(".freemium, [data-freemium]"))
                
                tools.append({
                    "name": name,
                    "url": href,
                    "description": description[:500] if description else "",
                    "pricing": pricing,
                    "is_free": is_free,
                    "is_freemium": is_freemium,
                    "category": category,
                    "source": "futuretools",
                })
            except Exception:
                continue
        
        return tools
    except Exception as e:
        print(f"Error fetching futuretools {category}: {e}")
        return []


async def fetch_aitools_fyi(client: httpx.AsyncClient, category: str) -> list:
    """Fetch tools from aitools.fyi."""
    url = f"https://aitools.fyi/category/{category}"
    
    try:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        tools = []
        
        for item in soup.select(".tool-item, article, [data-tool]"):
            try:
                name_elem = item.select_one("h2, h3, .name")
                if not name_elem:
                    continue
                
                name = name_elem.get_text(strip=True)
                
                link_elem = item.select_one("a[href]")
                href = link_elem.get("href", "") if link_elem else ""
                
                desc_elem = item.select_one("p, .description")
                description = desc_elem.get_text(strip=True) if desc_elem else ""
                
                tools.append({
                    "name": name,
                    "url": href,
                    "description": description[:500] if description else "",
                    "category": category,
                    "source": "aitools_fyi",
                })
            except Exception:
                continue
        
        return tools
    except Exception as e:
        print(f"Error fetching aitools.fyi {category}: {e}")
        return []


async def scrape_ai_directories() -> dict:
    """Scrape all AI tool directories."""
    results = {
        "scraped_at": datetime.now().isoformat(),
        "theresanaiforthat": {},
        "futuretools": {},
        "aitools_fyi": {},
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
        for category in THERESANAIFORTHAT_CATEGORIES:
            print(f"  Fetching theresanaiforthat: {category}...")
            tools = await fetch_theresanaiforthat(client, category)
            results["theresanaiforthat"][category] = tools
            
            for tool in tools:
                if tool["name"].lower() not in seen_tools:
                    seen_tools.add(tool["name"].lower())
                    results["all_tools"].append(tool)
            
            await asyncio.sleep(2)
        
        for category in FUTURETOOLS_CATEGORIES:
            print(f"  Fetching futuretools: {category}...")
            tools = await fetch_futuretools(client, category)
            results["futuretools"][category] = tools
            
            for tool in tools:
                if tool["name"].lower() not in seen_tools:
                    seen_tools.add(tool["name"].lower())
                    results["all_tools"].append(tool)
            
            await asyncio.sleep(2)
        
        for category in AITOOLS_FYI_CATEGORIES:
            print(f"  Fetching aitools.fyi: {category}...")
            tools = await fetch_aitools_fyi(client, category)
            results["aitools_fyi"][category] = tools
            
            for tool in tools:
                if tool["name"].lower() not in seen_tools:
                    seen_tools.add(tool["name"].lower())
                    results["all_tools"].append(tool)
            
            await asyncio.sleep(2)
    
    results["total_unique_tools"] = len(results["all_tools"])
    return results


if __name__ == "__main__":
    async def main():
        print("Scraping AI Tool Directories...")
        results = await scrape_ai_directories()
        
        output_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(output_dir, exist_ok=True)
        
        output_path = os.path.join(output_dir, "ai_directories.json")
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        
        print(f"\nSaved {results['total_unique_tools']} unique tools to {output_path}")
    
    asyncio.run(main())
