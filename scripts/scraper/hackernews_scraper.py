"""
Hacker News Scraper - Fetches Show HN, Launch HN, and tool-related posts
"""
import os
import json
import asyncio
import httpx
from datetime import datetime
from typing import Optional


HN_API_BASE = "https://hacker-news.firebaseio.com/v0"

ALGOLIA_API = "https://hn.algolia.com/api/v1"

SEARCH_QUERIES = [
    "Show HN",
    "Launch HN",
    "developer tools",
    "AI coding",
    "code assistant",
    "copilot alternative",
    "cursor ai",
    "vibe coding",
    "open source",
    "self hosted",
    "saas",
    "api",
    "database",
    "authentication",
    "hosting",
    "deployment",
    "monitoring",
    "testing framework",
]


async def fetch_story(client: httpx.AsyncClient, story_id: int) -> dict:
    """Fetch a single story from HN API."""
    url = f"{HN_API_BASE}/item/{story_id}.json"
    
    try:
        response = await client.get(url)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"id": story_id, "error": str(e)}


async def fetch_top_stories(client: httpx.AsyncClient, limit: int = 100) -> list:
    """Fetch top stories from HN."""
    url = f"{HN_API_BASE}/topstories.json"
    
    try:
        response = await client.get(url)
        response.raise_for_status()
        story_ids = response.json()[:limit]
        
        stories = []
        for story_id in story_ids:
            story = await fetch_story(client, story_id)
            if story and "error" not in story:
                stories.append({
                    "id": story.get("id"),
                    "title": story.get("title"),
                    "url": story.get("url"),
                    "score": story.get("score", 0),
                    "by": story.get("by"),
                    "time": story.get("time"),
                    "descendants": story.get("descendants", 0),
                    "type": story.get("type"),
                    "hn_url": f"https://news.ycombinator.com/item?id={story.get('id')}",
                })
            await asyncio.sleep(0.1)
        
        return stories
    except Exception as e:
        print(f"Error fetching top stories: {e}")
        return []


async def fetch_show_hn(client: httpx.AsyncClient, limit: int = 100) -> list:
    """Fetch Show HN stories."""
    url = f"{HN_API_BASE}/showstories.json"
    
    try:
        response = await client.get(url)
        response.raise_for_status()
        story_ids = response.json()[:limit]
        
        stories = []
        for story_id in story_ids:
            story = await fetch_story(client, story_id)
            if story and "error" not in story:
                stories.append({
                    "id": story.get("id"),
                    "title": story.get("title"),
                    "url": story.get("url"),
                    "score": story.get("score", 0),
                    "by": story.get("by"),
                    "time": story.get("time"),
                    "descendants": story.get("descendants", 0),
                    "hn_url": f"https://news.ycombinator.com/item?id={story.get('id')}",
                    "is_show_hn": True,
                })
            await asyncio.sleep(0.1)
        
        return stories
    except Exception as e:
        print(f"Error fetching Show HN: {e}")
        return []


async def search_algolia(client: httpx.AsyncClient, query: str, tags: str = "story", hits_per_page: int = 50) -> list:
    """Search HN using Algolia API."""
    url = f"{ALGOLIA_API}/search"
    params = {
        "query": query,
        "tags": tags,
        "hitsPerPage": hits_per_page,
    }
    
    try:
        response = await client.get(url, params=params)
        response.raise_for_status()
        
        data = response.json()
        hits = data.get("hits", [])
        
        stories = []
        for hit in hits:
            stories.append({
                "id": hit.get("objectID"),
                "title": hit.get("title"),
                "url": hit.get("url"),
                "score": hit.get("points", 0),
                "by": hit.get("author"),
                "created_at": hit.get("created_at"),
                "num_comments": hit.get("num_comments", 0),
                "hn_url": f"https://news.ycombinator.com/item?id={hit.get('objectID')}",
                "search_query": query,
            })
        
        return stories
    except Exception as e:
        print(f"Error searching Algolia for '{query}': {e}")
        return []


async def search_show_hn(client: httpx.AsyncClient, query: str = "", hits_per_page: int = 50) -> list:
    """Search Show HN posts using Algolia."""
    url = f"{ALGOLIA_API}/search"
    params = {
        "query": f"Show HN {query}",
        "tags": "show_hn",
        "hitsPerPage": hits_per_page,
    }
    
    try:
        response = await client.get(url, params=params)
        response.raise_for_status()
        
        data = response.json()
        hits = data.get("hits", [])
        
        stories = []
        for hit in hits:
            stories.append({
                "id": hit.get("objectID"),
                "title": hit.get("title"),
                "url": hit.get("url"),
                "score": hit.get("points", 0),
                "by": hit.get("author"),
                "created_at": hit.get("created_at"),
                "num_comments": hit.get("num_comments", 0),
                "hn_url": f"https://news.ycombinator.com/item?id={hit.get('objectID')}",
                "is_show_hn": True,
            })
        
        return stories
    except Exception as e:
        print(f"Error searching Show HN: {e}")
        return []


def extract_tool_info(story: dict) -> dict:
    """Extract potential tool information from a story."""
    title = story.get("title", "")
    
    is_show_hn = title.startswith("Show HN:") or story.get("is_show_hn", False)
    is_launch_hn = title.startswith("Launch HN:")
    
    clean_title = title
    if is_show_hn:
        clean_title = title.replace("Show HN:", "").strip()
    elif is_launch_hn:
        clean_title = title.replace("Launch HN:", "").strip()
    
    tool_name = None
    if " - " in clean_title:
        tool_name = clean_title.split(" - ")[0].strip()
    elif ": " in clean_title:
        tool_name = clean_title.split(": ")[0].strip()
    elif " – " in clean_title:
        tool_name = clean_title.split(" – ")[0].strip()
    
    return {
        **story,
        "is_show_hn": is_show_hn,
        "is_launch_hn": is_launch_hn,
        "clean_title": clean_title,
        "extracted_tool_name": tool_name,
    }


async def scrape_hackernews() -> dict:
    """Scrape Hacker News for developer tools and Show HN posts."""
    results = {
        "scraped_at": datetime.now().isoformat(),
        "show_hn": [],
        "top_stories": [],
        "search_results": {},
        "all_stories": [],
    }
    
    seen_ids = set()
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        print("  Fetching Show HN stories...")
        show_hn = await fetch_show_hn(client, limit=50)
        results["show_hn"] = [extract_tool_info(s) for s in show_hn]
        
        for story in results["show_hn"]:
            if story["id"] not in seen_ids:
                seen_ids.add(story["id"])
                results["all_stories"].append(story)
        
        print("  Fetching top stories...")
        top_stories = await fetch_top_stories(client, limit=30)
        results["top_stories"] = [extract_tool_info(s) for s in top_stories]
        
        for story in results["top_stories"]:
            if story["id"] not in seen_ids:
                seen_ids.add(story["id"])
                results["all_stories"].append(story)
        
        for query in SEARCH_QUERIES:
            print(f"  Searching: {query}...")
            
            if query == "Show HN":
                search_results = await search_show_hn(client, "", hits_per_page=30)
            else:
                search_results = await search_algolia(client, query, hits_per_page=20)
            
            results["search_results"][query] = [extract_tool_info(s) for s in search_results]
            
            for story in results["search_results"][query]:
                story_id = story.get("id")
                if story_id and story_id not in seen_ids:
                    seen_ids.add(story_id)
                    results["all_stories"].append(story)
            
            await asyncio.sleep(0.5)
    
    results["total_unique_stories"] = len(results["all_stories"])
    
    results["tool_launches"] = [
        s for s in results["all_stories"]
        if s.get("is_show_hn") or s.get("is_launch_hn")
    ]
    results["total_tool_launches"] = len(results["tool_launches"])
    
    return results


if __name__ == "__main__":
    async def main():
        print("Scraping Hacker News...")
        results = await scrape_hackernews()
        
        output_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(output_dir, exist_ok=True)
        
        output_path = os.path.join(output_dir, "hackernews.json")
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        
        print(f"\nSaved {results['total_unique_stories']} unique stories to {output_path}")
        print(f"  - {results['total_tool_launches']} tool launches (Show HN / Launch HN)")
    
    asyncio.run(main())
