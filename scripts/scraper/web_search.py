"""
Web Search - General web search for tool information using DuckDuckGo
"""
import os
import json
import httpx
from bs4 import BeautifulSoup
from typing import Optional
import asyncio
import re


async def search_duckduckgo(client: httpx.AsyncClient, query: str, max_results: int = 5) -> list:
    """Search DuckDuckGo for information about a tool."""
    # Use DuckDuckGo HTML search (no API key needed)
    url = "https://html.duckduckgo.com/html/"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    }
    
    try:
        response = await client.post(url, data={"q": query}, headers=headers)
        if response.status_code != 200:
            return []
        
        soup = BeautifulSoup(response.text, "lxml")
        results = []
        
        for result in soup.select(".result")[:max_results]:
            title_elem = result.select_one(".result__title")
            snippet_elem = result.select_one(".result__snippet")
            link_elem = result.select_one(".result__url")
            
            if title_elem:
                # Extract actual URL from DuckDuckGo redirect
                link = ""
                a_tag = title_elem.select_one("a")
                if a_tag and a_tag.get("href"):
                    href = a_tag.get("href", "")
                    # DuckDuckGo uses redirect URLs, extract the actual URL
                    if "uddg=" in href:
                        import urllib.parse
                        parsed = urllib.parse.parse_qs(urllib.parse.urlparse(href).query)
                        link = parsed.get("uddg", [""])[0]
                    else:
                        link = href
                
                results.append({
                    "title": title_elem.get_text(strip=True),
                    "snippet": snippet_elem.get_text(strip=True) if snippet_elem else "",
                    "url": link,
                })
        
        return results
    except Exception as e:
        print(f"Search error for '{query}': {e}")
        return []


async def scrape_tool_website(client: httpx.AsyncClient, url: str) -> dict:
    """Scrape basic metadata from a tool's website."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    }
    
    try:
        response = await client.get(url, headers=headers, follow_redirects=True, timeout=15.0)
        if response.status_code != 200:
            return {"error": f"HTTP {response.status_code}"}
        
        soup = BeautifulSoup(response.text, "lxml")
        
        # Extract metadata
        title = soup.title.string if soup.title else None
        
        # Meta description
        meta_desc = soup.find("meta", attrs={"name": "description"})
        description = meta_desc.get("content") if meta_desc else None
        
        # Open Graph data
        og_title = soup.find("meta", property="og:title")
        og_desc = soup.find("meta", property="og:description")
        og_image = soup.find("meta", property="og:image")
        
        # Twitter card data
        twitter_title = soup.find("meta", attrs={"name": "twitter:title"})
        twitter_desc = soup.find("meta", attrs={"name": "twitter:description"})
        
        # Keywords
        meta_keywords = soup.find("meta", attrs={"name": "keywords"})
        keywords = meta_keywords.get("content").split(",") if meta_keywords and meta_keywords.get("content") else []
        
        return {
            "url": str(response.url),
            "title": title,
            "description": description,
            "og_title": og_title.get("content") if og_title else None,
            "og_description": og_desc.get("content") if og_desc else None,
            "og_image": og_image.get("content") if og_image else None,
            "twitter_title": twitter_title.get("content") if twitter_title else None,
            "twitter_description": twitter_desc.get("content") if twitter_desc else None,
            "keywords": [k.strip() for k in keywords[:20]],
        }
    except Exception as e:
        return {"error": str(e)}


async def search_tool_info(tool_name: str, tool_url: Optional[str] = None) -> dict:
    """Search for comprehensive information about a tool."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        result = {
            "name": tool_name,
            "search_results": [],
            "website_metadata": None,
        }
        
        # Search for the tool
        queries = [
            f"{tool_name} developer tool",
            f"{tool_name} pricing features",
            f"{tool_name} vs alternatives comparison",
        ]
        
        for query in queries:
            search_results = await search_duckduckgo(client, query, max_results=3)
            result["search_results"].extend(search_results)
            await asyncio.sleep(1)  # Rate limiting
        
        # Scrape the tool's website if provided
        if tool_url:
            result["website_metadata"] = await scrape_tool_website(client, tool_url)
        
        return result


async def search_multiple_tools(tools: list[dict]) -> dict:
    """Search for information about multiple tools."""
    results = {}
    
    for tool in tools:
        name = tool.get("name")
        url = tool.get("url")
        
        print(f"Searching for: {name}")
        results[name] = await search_tool_info(name, url)
        await asyncio.sleep(2)  # Rate limiting between tools
    
    return results


# Tools to search for
TOOLS_TO_SEARCH = [
    {"name": "Bolt.new", "url": "https://bolt.new"},
    {"name": "Lovable", "url": "https://lovable.dev"},
    {"name": "v0 by Vercel", "url": "https://v0.dev"},
    {"name": "Cursor", "url": "https://cursor.com"},
    {"name": "Windsurf", "url": "https://codeium.com/windsurf"},
    {"name": "Replit", "url": "https://replit.com"},
    {"name": "Devin AI", "url": "https://devin.ai"},
    {"name": "Kiro", "url": "https://kiro.dev"},
    {"name": "Claude Code", "url": "https://www.anthropic.com/claude-code"},
    {"name": "Aider", "url": "https://aider.chat"},
    {"name": "Cline", "url": "https://cline.bot"},
    {"name": "OpenHands", "url": "https://www.all-hands.dev"},
    {"name": "Supabase", "url": "https://supabase.com"},
    {"name": "Convex", "url": "https://convex.dev"},
    {"name": "Clerk", "url": "https://clerk.com"},
    {"name": "Vercel", "url": "https://vercel.com"},
    {"name": "Railway", "url": "https://railway.app"},
    {"name": "Neon", "url": "https://neon.tech"},
    {"name": "Turso", "url": "https://turso.tech"},
]


if __name__ == "__main__":
    async def main():
        results = await search_multiple_tools(TOOLS_TO_SEARCH)
        
        output_path = os.path.join(os.path.dirname(__file__), "data", "web_search.json")
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        
        print(f"\nSaved search results for {len(results)} tools to {output_path}")
    
    asyncio.run(main())
