"""
Awesome Lists Scraper - Fetches and parses awesome-vibe-coding lists from GitHub
"""
import os
import json
import re
import httpx
from typing import Optional

AWESOME_LISTS = [
    {
        "name": "filipecalegario/awesome-vibe-coding",
        "url": "https://raw.githubusercontent.com/filipecalegario/awesome-vibe-coding/main/README.md",
    },
    {
        "name": "roboco-io/awesome-vibecoding",
        "url": "https://raw.githubusercontent.com/roboco-io/awesome-vibecoding/main/README.md",
    },
    {
        "name": "no-fluff/awesome-vibe-coding",
        "url": "https://raw.githubusercontent.com/no-fluff/awesome-vibe-coding/main/README.md",
    },
]


def extract_links_from_markdown(content: str) -> list:
    """Extract all links from markdown content."""
    # Match markdown links: [text](url)
    pattern = r'\[([^\]]+)\]\(([^)]+)\)'
    matches = re.findall(pattern, content)
    
    links = []
    for text, url in matches:
        # Skip badges, images, and anchors
        if url.startswith("#") or "badge" in url.lower() or url.endswith((".png", ".jpg", ".svg", ".gif")):
            continue
        
        links.append({
            "text": text.strip(),
            "url": url.strip(),
        })
    
    return links


def categorize_link(url: str, text: str) -> str:
    """Categorize a link based on URL and text."""
    url_lower = url.lower()
    text_lower = text.lower()
    
    if "github.com" in url_lower:
        return "github"
    elif any(x in url_lower for x in ["reddit.com", "discord", "slack"]):
        return "community"
    elif any(x in text_lower for x in ["blog", "article", "post", "news"]):
        return "article"
    elif any(x in text_lower for x in ["video", "youtube", "tutorial"]):
        return "video"
    elif any(x in text_lower for x in ["docs", "documentation", "guide"]):
        return "documentation"
    else:
        return "tool"


def extract_tools_from_content(content: str) -> list:
    """Extract tool entries from markdown content."""
    tools = []
    links = extract_links_from_markdown(content)
    
    for link in links:
        category = categorize_link(link["url"], link["text"])
        
        # Focus on tools and GitHub repos
        if category in ["tool", "github"]:
            # Try to extract description from surrounding context
            # Look for the link in content and get text after it
            pattern = rf'\[{re.escape(link["text"])}\]\({re.escape(link["url"])}\)\s*[-–—]?\s*([^.\n\[]+)'
            match = re.search(pattern, content)
            description = match.group(1).strip() if match else None
            
            tools.append({
                "name": link["text"],
                "url": link["url"],
                "category": category,
                "description": description,
            })
    
    return tools


async def fetch_awesome_list(client: httpx.AsyncClient, url: str) -> Optional[str]:
    """Fetch raw markdown content from GitHub."""
    try:
        response = await client.get(url)
        if response.status_code == 200:
            return response.text
        return None
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None


async def scrape_awesome_lists() -> dict:
    """Scrape all awesome-vibe-coding lists."""
    results = {}
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for list_info in AWESOME_LISTS:
            name = list_info["name"]
            url = list_info["url"]
            
            print(f"Fetching: {name}")
            content = await fetch_awesome_list(client, url)
            
            if content:
                tools = extract_tools_from_content(content)
                links = extract_links_from_markdown(content)
                
                results[name] = {
                    "url": url,
                    "tools_count": len(tools),
                    "total_links": len(links),
                    "tools": tools,
                    "all_links": links,
                }
            else:
                results[name] = {"error": "Failed to fetch content"}
    
    return results


def deduplicate_tools(results: dict) -> list:
    """Deduplicate tools across all awesome lists."""
    seen_urls = set()
    unique_tools = []
    
    for list_name, data in results.items():
        if "error" in data:
            continue
        
        for tool in data.get("tools", []):
            url = tool["url"].lower().rstrip("/")
            if url not in seen_urls:
                seen_urls.add(url)
                tool["source"] = list_name
                unique_tools.append(tool)
    
    return unique_tools


if __name__ == "__main__":
    import asyncio
    
    async def main():
        results = await scrape_awesome_lists()
        
        output_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(output_dir, exist_ok=True)
        
        # Save raw results
        with open(os.path.join(output_dir, "awesome_lists.json"), "w") as f:
            json.dump(results, f, indent=2)
        
        # Save deduplicated tools
        unique_tools = deduplicate_tools(results)
        with open(os.path.join(output_dir, "awesome_tools.json"), "w") as f:
            json.dump(unique_tools, f, indent=2)
        
        print(f"\nScraped {len(results)} awesome lists")
        print(f"Found {len(unique_tools)} unique tools")
        
        # Print summary
        for name, data in results.items():
            if "error" not in data:
                print(f"  {name}: {data['tools_count']} tools")
    
    asyncio.run(main())
