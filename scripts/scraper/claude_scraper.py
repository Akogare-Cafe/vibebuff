"""
Claude Ecosystem Scraper - Fetches Claude skills, MCP servers, plugins, and resources
Tracks Claude models, versions, and awesome-claude repositories
"""
import os
import json
import re
import httpx
from typing import Optional, Dict, List
from datetime import datetime
from bot_avoidance import (
    get_realistic_headers,
    random_delay,
    retry_with_backoff,
    RateLimiter,
    create_client_with_limits,
)
from cache_manager import CacheManager

rate_limiter = RateLimiter(requests_per_minute=20)
cache = CacheManager(cache_dir="cache", default_ttl_hours=24)

CLAUDE_RESOURCES = {
    "awesome_lists": [
        {
            "name": "awesome-claude-code",
            "url": "https://raw.githubusercontent.com/anthropics/awesome-claude-code/main/README.md",
            "description": "Official Anthropic curated list of Claude code resources"
        },
        {
            "name": "awesome-claude",
            "url": "https://raw.githubusercontent.com/iankelk/awesome-claude/main/README.md",
            "description": "Community awesome list for Claude AI"
        },
        {
            "name": "awesome-claude-prompts",
            "url": "https://raw.githubusercontent.com/langgptai/awesome-claude-prompts/main/README.md",
            "description": "Collection of Claude prompts and techniques"
        }
    ],
    "mcp_servers": [
        {
            "name": "modelcontextprotocol/servers",
            "url": "https://api.github.com/repos/modelcontextprotocol/servers/contents",
            "description": "Official MCP server implementations"
        }
    ],
    "claude_skills": [
        "https://api.github.com/search/repositories?q=claude+skill+in:name,description&sort=stars&per_page=100",
        "https://api.github.com/search/repositories?q=claude+extension+in:name,description&sort=stars&per_page=100",
        "https://api.github.com/search/repositories?q=claude+plugin+in:name,description&sort=stars&per_page=100"
    ],
    "anthropic_releases": "https://api.github.com/repos/anthropics/anthropic-sdk-python/releases",
    "claude_docs": "https://docs.anthropic.com/en/docs"
}

CLAUDE_MODELS = [
    {
        "id": "claude-3-5-sonnet-20241022",
        "name": "Claude 3.5 Sonnet",
        "family": "claude-3-5",
        "release_date": "2024-10-22",
        "context_window": 200000,
        "max_output": 8192,
        "capabilities": ["vision", "tool_use", "extended_thinking"]
    },
    {
        "id": "claude-3-5-haiku-20241022",
        "name": "Claude 3.5 Haiku",
        "family": "claude-3-5",
        "release_date": "2024-10-22",
        "context_window": 200000,
        "max_output": 8192,
        "capabilities": ["vision", "tool_use"]
    },
    {
        "id": "claude-3-opus-20240229",
        "name": "Claude 3 Opus",
        "family": "claude-3",
        "release_date": "2024-02-29",
        "context_window": 200000,
        "max_output": 4096,
        "capabilities": ["vision", "tool_use"]
    },
    {
        "id": "claude-3-sonnet-20240229",
        "name": "Claude 3 Sonnet",
        "family": "claude-3",
        "release_date": "2024-02-29",
        "context_window": 200000,
        "max_output": 4096,
        "capabilities": ["vision", "tool_use"]
    },
    {
        "id": "claude-3-haiku-20240307",
        "name": "Claude 3 Haiku",
        "family": "claude-3",
        "release_date": "2024-03-07",
        "context_window": 200000,
        "max_output": 4096,
        "capabilities": ["vision", "tool_use"]
    }
]


async def fetch_awesome_claude_lists(client: httpx.AsyncClient) -> Dict:
    """Fetch all awesome-claude lists and extract resources."""
    results = {}
    
    for list_info in CLAUDE_RESOURCES["awesome_lists"]:
        cache_key = f"claude_awesome:{list_info['name']}"
        cached = cache.get(cache_key, ttl_hours=24)
        
        if cached:
            print(f"  Using cached {list_info['name']}")
            results[list_info['name']] = cached
            continue
        
        await rate_limiter.wait()
        headers = get_realistic_headers()
        
        try:
            async def _fetch():
                return await client.get(list_info['url'], headers=headers)
            
            response = await retry_with_backoff(_fetch, max_retries=2)
            if response.status_code == 200:
                content = response.text
                links = extract_links_from_markdown(content)
                categorized = categorize_claude_resources(links, content)
                
                result = {
                    "url": list_info['url'],
                    "description": list_info['description'],
                    "total_links": len(links),
                    "resources": categorized,
                    "scraped_at": datetime.now().isoformat()
                }
                
                cache.set(cache_key, result)
                results[list_info['name']] = result
                await random_delay(0.5, 1.5)
                
        except Exception as e:
            print(f"Error fetching {list_info['name']}: {e}")
            results[list_info['name']] = {"error": str(e)}
    
    return results


def extract_links_from_markdown(content: str) -> List[Dict]:
    """Extract all links from markdown content."""
    pattern = r'\[([^\]]+)\]\(([^)]+)\)'
    matches = re.findall(pattern, content)
    
    links = []
    for text, url in matches:
        if url.startswith("#") or "badge" in url.lower() or url.endswith((".png", ".jpg", ".svg", ".gif")):
            continue
        
        links.append({
            "text": text.strip(),
            "url": url.strip(),
        })
    
    return links


def categorize_claude_resources(links: List[Dict], content: str) -> Dict:
    """Categorize Claude resources into skills, plugins, MCP servers, etc."""
    categories = {
        "mcp_servers": [],
        "skills": [],
        "plugins": [],
        "extensions": [],
        "tools": [],
        "tutorials": [],
        "examples": [],
        "libraries": [],
        "other": []
    }
    
    for link in links:
        url_lower = link["url"].lower()
        text_lower = link["text"].lower()
        
        pattern = rf'\[{re.escape(link["text"])}\]\({re.escape(link["url"])}\)\s*[-–—]?\s*([^.\n\[]+)'
        match = re.search(pattern, content)
        description = match.group(1).strip() if match else None
        
        resource = {
            "name": link["text"],
            "url": link["url"],
            "description": description
        }
        
        if "mcp" in text_lower or "model-context-protocol" in url_lower:
            categories["mcp_servers"].append(resource)
        elif "skill" in text_lower:
            categories["skills"].append(resource)
        elif "plugin" in text_lower:
            categories["plugins"].append(resource)
        elif "extension" in text_lower or "vscode" in url_lower or "chrome" in url_lower:
            categories["extensions"].append(resource)
        elif any(x in text_lower for x in ["tutorial", "guide", "course", "learn"]):
            categories["tutorials"].append(resource)
        elif any(x in text_lower for x in ["example", "demo", "sample"]):
            categories["examples"].append(resource)
        elif any(x in text_lower for x in ["library", "sdk", "api", "package"]):
            categories["libraries"].append(resource)
        elif "github.com" in url_lower:
            categories["tools"].append(resource)
        else:
            categories["other"].append(resource)
    
    return categories


async def fetch_mcp_servers(client: httpx.AsyncClient) -> Dict:
    """Fetch official MCP server implementations."""
    cache_key = "claude_mcp_servers"
    cached = cache.get(cache_key, ttl_hours=12)
    
    if cached:
        print("  Using cached MCP servers")
        return cached
    
    await rate_limiter.wait()
    headers = get_realistic_headers()
    
    mcp_data = {
        "official_servers": [],
        "community_servers": []
    }
    
    try:
        async def _fetch():
            return await client.get(
                "https://api.github.com/repos/modelcontextprotocol/servers/contents",
                headers=headers
            )
        
        response = await retry_with_backoff(_fetch, max_retries=2)
        if response.status_code == 200:
            contents = response.json()
            
            for item in contents:
                if item["type"] == "dir" and not item["name"].startswith("."):
                    mcp_data["official_servers"].append({
                        "name": item["name"],
                        "url": item["html_url"],
                        "type": "official"
                    })
        
        async def _search():
            return await client.get(
                "https://api.github.com/search/repositories?q=mcp+server+claude&sort=stars&per_page=50",
                headers=headers
            )
        
        await random_delay(1, 2)
        search_response = await retry_with_backoff(_search, max_retries=2)
        if search_response.status_code == 200:
            search_data = search_response.json()
            
            for repo in search_data.get("items", []):
                mcp_data["community_servers"].append({
                    "name": repo["name"],
                    "full_name": repo["full_name"],
                    "url": repo["html_url"],
                    "description": repo.get("description"),
                    "stars": repo["stargazers_count"],
                    "language": repo.get("language"),
                    "type": "community"
                })
        
        cache.set(cache_key, mcp_data)
        
    except Exception as e:
        print(f"Error fetching MCP servers: {e}")
        mcp_data["error"] = str(e)
    
    return mcp_data


async def fetch_claude_skills(client: httpx.AsyncClient) -> Dict:
    """Search for Claude skills, plugins, and extensions on GitHub."""
    cache_key = "claude_skills"
    cached = cache.get(cache_key, ttl_hours=12)
    
    if cached:
        print("  Using cached Claude skills")
        return cached
    
    skills_data = {
        "skills": [],
        "plugins": [],
        "extensions": [],
        "total": 0
    }
    
    headers = get_realistic_headers()
    seen_repos = set()
    
    for search_url in CLAUDE_RESOURCES["claude_skills"]:
        await rate_limiter.wait()
        
        try:
            async def _fetch():
                return await client.get(search_url, headers=headers)
            
            response = await retry_with_backoff(_fetch, max_retries=2)
            if response.status_code == 200:
                data = response.json()
                
                for repo in data.get("items", []):
                    repo_id = repo["full_name"]
                    if repo_id in seen_repos:
                        continue
                    
                    seen_repos.add(repo_id)
                    
                    resource = {
                        "name": repo["name"],
                        "full_name": repo["full_name"],
                        "url": repo["html_url"],
                        "description": repo.get("description"),
                        "stars": repo["stargazers_count"],
                        "language": repo.get("language"),
                        "topics": repo.get("topics", [])
                    }
                    
                    name_lower = repo["name"].lower()
                    desc_lower = (repo.get("description") or "").lower()
                    
                    if "skill" in name_lower or "skill" in desc_lower:
                        skills_data["skills"].append(resource)
                    elif "plugin" in name_lower or "plugin" in desc_lower:
                        skills_data["plugins"].append(resource)
                    elif "extension" in name_lower or "extension" in desc_lower:
                        skills_data["extensions"].append(resource)
                    else:
                        skills_data["skills"].append(resource)
            
            await random_delay(1, 2)
            
        except Exception as e:
            print(f"Error fetching Claude skills from {search_url}: {e}")
    
    skills_data["total"] = len(seen_repos)
    cache.set(cache_key, skills_data)
    
    return skills_data


async def fetch_anthropic_releases(client: httpx.AsyncClient) -> List[Dict]:
    """Fetch Anthropic SDK releases to track version updates."""
    cache_key = "anthropic_releases"
    cached = cache.get(cache_key, ttl_hours=6)
    
    if cached:
        print("  Using cached Anthropic releases")
        return cached
    
    await rate_limiter.wait()
    headers = get_realistic_headers()
    
    try:
        async def _fetch():
            return await client.get(
                CLAUDE_RESOURCES["anthropic_releases"],
                headers=headers
            )
        
        response = await retry_with_backoff(_fetch, max_retries=2)
        if response.status_code == 200:
            releases = response.json()
            
            parsed_releases = []
            for release in releases[:10]:
                parsed_releases.append({
                    "version": release["tag_name"],
                    "name": release["name"],
                    "published_at": release["published_at"],
                    "url": release["html_url"],
                    "body": release.get("body", "")[:500]
                })
            
            cache.set(cache_key, parsed_releases)
            return parsed_releases
            
    except Exception as e:
        print(f"Error fetching Anthropic releases: {e}")
        return []


def get_claude_models() -> Dict:
    """Return current Claude model information."""
    return {
        "models": CLAUDE_MODELS,
        "latest_family": "claude-3-5",
        "latest_flagship": "claude-3-5-sonnet-20241022",
        "total_models": len(CLAUDE_MODELS),
        "updated_at": datetime.now().isoformat()
    }


async def scrape_claude_ecosystem() -> Dict:
    """Main function to scrape all Claude ecosystem resources."""
    print("\n=== Scraping Claude Ecosystem ===")
    
    results = {
        "scraped_at": datetime.now().isoformat(),
        "models": get_claude_models(),
        "awesome_lists": {},
        "mcp_servers": {},
        "skills": {},
        "releases": [],
        "stats": {}
    }
    
    async with create_client_with_limits(timeout=30.0) as client:
        print("\nFetching awesome-claude lists...")
        results["awesome_lists"] = await fetch_awesome_claude_lists(client)
        
        print("\nFetching MCP servers...")
        results["mcp_servers"] = await fetch_mcp_servers(client)
        
        print("\nFetching Claude skills and plugins...")
        results["skills"] = await fetch_claude_skills(client)
        
        print("\nFetching Anthropic releases...")
        results["releases"] = await fetch_anthropic_releases(client)
    
    total_resources = 0
    for list_name, list_data in results["awesome_lists"].items():
        if "resources" in list_data:
            for category, items in list_data["resources"].items():
                total_resources += len(items)
    
    results["stats"] = {
        "total_awesome_lists": len(results["awesome_lists"]),
        "total_resources_from_awesome": total_resources,
        "official_mcp_servers": len(results["mcp_servers"].get("official_servers", [])),
        "community_mcp_servers": len(results["mcp_servers"].get("community_servers", [])),
        "total_skills": results["skills"].get("total", 0),
        "total_releases_tracked": len(results["releases"]),
        "total_models": len(CLAUDE_MODELS)
    }
    
    print(f"\nClaude Ecosystem Stats:")
    print(f"  - {results['stats']['total_models']} Claude models tracked")
    print(f"  - {results['stats']['total_awesome_lists']} awesome lists scraped")
    print(f"  - {results['stats']['total_resources_from_awesome']} resources from awesome lists")
    print(f"  - {results['stats']['official_mcp_servers']} official MCP servers")
    print(f"  - {results['stats']['community_mcp_servers']} community MCP servers")
    print(f"  - {results['stats']['total_skills']} skills/plugins/extensions")
    print(f"  - {results['stats']['total_releases_tracked']} recent releases")
    
    return results


if __name__ == "__main__":
    import asyncio
    
    async def main():
        results = await scrape_claude_ecosystem()
        
        output_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(output_dir, exist_ok=True)
        
        with open(os.path.join(output_dir, "claude_ecosystem.json"), "w") as f:
            json.dump(results, f, indent=2)
        
        print(f"\nResults saved to {output_dir}/claude_ecosystem.json")
    
    asyncio.run(main())
