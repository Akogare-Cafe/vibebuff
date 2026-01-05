"""
AlternativeTo Scraper - Fetches software alternatives and metadata
"""
import os
import json
import asyncio
import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from typing import Optional


CATEGORIES = [
    "developer-tools",
    "programming",
    "ide",
    "code-editor",
    "version-control",
    "database",
    "api-development",
    "web-development",
    "machine-learning",
    "ai-assistants",
    "terminal-emulator",
    "text-editor",
    "static-site-generator",
    "backend-as-a-service",
    "authentication",
    "hosting",
    "deployment",
    "monitoring",
    "testing",
]

TOOL_PAGES = [
    "cursor",
    "github-copilot",
    "vscode",
    "neovim",
    "supabase",
    "firebase",
    "vercel",
    "netlify",
    "tailwind-css",
    "react",
    "nextjs",
    "prisma",
    "docker",
    "postman",
    "figma",
    "notion",
    "linear",
    "slack",
    "discord",
    "chatgpt",
    "claude",
]


async def fetch_category_page(client: httpx.AsyncClient, category: str) -> list:
    """Fetch tools from a category page."""
    url = f"https://alternativeto.net/category/{category}/"
    
    try:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        tools = []
        
        for item in soup.select(".app-list-item, [data-app-slug]"):
            try:
                name_elem = item.select_one("h2 a, .app-name a, [data-testid='app-name']")
                if not name_elem:
                    continue
                
                name = name_elem.get_text(strip=True)
                href = name_elem.get("href", "")
                slug = href.strip("/").split("/")[-1] if href else ""
                
                desc_elem = item.select_one(".app-description, p")
                description = desc_elem.get_text(strip=True) if desc_elem else ""
                
                likes_elem = item.select_one(".likes-count, [data-likes]")
                likes = 0
                if likes_elem:
                    likes_text = likes_elem.get_text(strip=True)
                    try:
                        likes = int(likes_text.replace(",", ""))
                    except:
                        pass
                
                tags = []
                for tag in item.select(".tag, .platform-tag"):
                    tags.append(tag.get_text(strip=True))
                
                is_free = bool(item.select_one(".free-badge, [data-free]"))
                is_open_source = bool(item.select_one(".open-source-badge, [data-opensource]"))
                
                tools.append({
                    "name": name,
                    "slug": slug,
                    "url": f"https://alternativeto.net{href}" if href.startswith("/") else href,
                    "description": description,
                    "likes": likes,
                    "tags": tags,
                    "is_free": is_free,
                    "is_open_source": is_open_source,
                    "category": category,
                })
            except Exception:
                continue
        
        return tools
    except Exception as e:
        print(f"Error fetching category {category}: {e}")
        return []


async def fetch_tool_alternatives(client: httpx.AsyncClient, tool_slug: str) -> dict:
    """Fetch alternatives for a specific tool."""
    url = f"https://alternativeto.net/software/{tool_slug}/"
    
    try:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        name_elem = soup.select_one("h1")
        name = name_elem.get_text(strip=True) if name_elem else tool_slug
        
        desc_elem = soup.select_one(".app-description, [data-testid='description']")
        description = desc_elem.get_text(strip=True) if desc_elem else ""
        
        alternatives = []
        for alt in soup.select(".app-list-item, [data-app-slug]")[:20]:
            try:
                alt_name_elem = alt.select_one("h2 a, .app-name")
                if alt_name_elem:
                    alt_name = alt_name_elem.get_text(strip=True)
                    alt_href = alt_name_elem.get("href", "")
                    
                    alt_desc_elem = alt.select_one(".app-description, p")
                    alt_desc = alt_desc_elem.get_text(strip=True) if alt_desc_elem else ""
                    
                    alternatives.append({
                        "name": alt_name,
                        "url": f"https://alternativeto.net{alt_href}" if alt_href.startswith("/") else alt_href,
                        "description": alt_desc,
                    })
            except:
                continue
        
        return {
            "name": name,
            "slug": tool_slug,
            "description": description,
            "alternatives": alternatives,
            "alternatives_count": len(alternatives),
        }
    except Exception as e:
        print(f"Error fetching alternatives for {tool_slug}: {e}")
        return {"slug": tool_slug, "error": str(e)}


async def scrape_alternativeto() -> dict:
    """Scrape AlternativeTo for developer tools."""
    results = {
        "scraped_at": datetime.now().isoformat(),
        "categories": {},
        "tool_alternatives": {},
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
        for category in CATEGORIES:
            print(f"  Fetching category: {category}...")
            tools = await fetch_category_page(client, category)
            results["categories"][category] = tools
            
            for tool in tools:
                if tool["name"] not in seen_tools:
                    seen_tools.add(tool["name"])
                    results["all_tools"].append(tool)
            
            await asyncio.sleep(2)
        
        for tool_slug in TOOL_PAGES:
            print(f"  Fetching alternatives for: {tool_slug}...")
            alternatives = await fetch_tool_alternatives(client, tool_slug)
            results["tool_alternatives"][tool_slug] = alternatives
            await asyncio.sleep(2)
    
    results["total_unique_tools"] = len(results["all_tools"])
    return results


if __name__ == "__main__":
    async def main():
        print("Scraping AlternativeTo...")
        results = await scrape_alternativeto()
        
        output_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(output_dir, exist_ok=True)
        
        output_path = os.path.join(output_dir, "alternativeto.json")
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        
        print(f"\nSaved {results['total_unique_tools']} unique tools to {output_path}")
    
    asyncio.run(main())
