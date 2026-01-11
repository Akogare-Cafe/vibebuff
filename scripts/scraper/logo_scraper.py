"""
Logo Scraper for VibeBuff Tools

Fetches logos for tools using multiple sources:
1. Clearbit Logo API (free, high quality)
2. Google Favicon Service
3. DuckDuckGo Favicon Service
4. Direct favicon.ico from website

Syncs logos to Convex database.
"""
import os
import json
import httpx
import asyncio
from typing import Optional
from urllib.parse import urlparse
from dotenv import load_dotenv

load_dotenv()

CONVEX_URL = os.environ.get("CONVEX_URL", "")
CONVEX_DEPLOY_KEY = os.environ.get("CONVEX_DEPLOY_KEY", "")

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


async def get_domain_from_url(url: str) -> Optional[str]:
    """Extract domain from URL."""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc
        if domain.startswith("www."):
            domain = domain[4:]
        return domain
    except Exception:
        return None


async def check_url_exists(client: httpx.AsyncClient, url: str) -> bool:
    """Check if a URL returns a valid image."""
    try:
        response = await client.head(url, follow_redirects=True, timeout=5.0)
        if response.status_code == 200:
            content_type = response.headers.get("content-type", "")
            return "image" in content_type or "icon" in content_type
        return False
    except Exception:
        return False


async def get_clearbit_logo(client: httpx.AsyncClient, domain: str) -> Optional[str]:
    """Get logo from Clearbit Logo API (free, no auth required)."""
    url = f"https://logo.clearbit.com/{domain}"
    if await check_url_exists(client, url):
        return url
    return None


async def get_google_favicon(client: httpx.AsyncClient, domain: str) -> Optional[str]:
    """Get favicon from Google's favicon service."""
    url = f"https://www.google.com/s2/favicons?domain={domain}&sz=128"
    if await check_url_exists(client, url):
        return url
    return None


async def get_duckduckgo_favicon(client: httpx.AsyncClient, domain: str) -> Optional[str]:
    """Get favicon from DuckDuckGo's favicon service."""
    url = f"https://icons.duckduckgo.com/ip3/{domain}.ico"
    if await check_url_exists(client, url):
        return url
    return None


async def get_direct_favicon(client: httpx.AsyncClient, website_url: str) -> Optional[str]:
    """Try to get favicon directly from website."""
    try:
        parsed = urlparse(website_url)
        base_url = f"{parsed.scheme}://{parsed.netloc}"
        favicon_url = f"{base_url}/favicon.ico"
        if await check_url_exists(client, favicon_url):
            return favicon_url
    except Exception:
        pass
    return None


async def get_github_avatar(client: httpx.AsyncClient, github_url: Optional[str]) -> Optional[str]:
    """Get avatar from GitHub org/user."""
    if not github_url:
        return None
    try:
        parsed = urlparse(github_url)
        path_parts = parsed.path.strip("/").split("/")
        if len(path_parts) >= 1:
            owner = path_parts[0]
            avatar_url = f"https://github.com/{owner}.png?size=128"
            if await check_url_exists(client, avatar_url):
                return avatar_url
    except Exception:
        pass
    return None


async def fetch_logo_for_tool(
    client: httpx.AsyncClient,
    tool: dict
) -> Optional[str]:
    """
    Fetch logo for a tool using multiple sources.
    Returns the first successful logo URL found.
    """
    website_url = tool.get("websiteUrl", "")
    github_url = tool.get("githubUrl")
    
    if not website_url:
        return None
    
    domain = await get_domain_from_url(website_url)
    if not domain:
        return None
    
    clearbit_logo = await get_clearbit_logo(client, domain)
    if clearbit_logo:
        return clearbit_logo
    
    github_avatar = await get_github_avatar(client, github_url)
    if github_avatar:
        return github_avatar
    
    google_favicon = await get_google_favicon(client, domain)
    if google_favicon:
        return google_favicon
    
    duckduckgo_favicon = await get_duckduckgo_favicon(client, domain)
    if duckduckgo_favicon:
        return duckduckgo_favicon
    
    direct_favicon = await get_direct_favicon(client, website_url)
    if direct_favicon:
        return direct_favicon
    
    return None


async def fetch_tools_from_convex(client: httpx.AsyncClient) -> list:
    """Fetch all tools from Convex that need logos."""
    if not CONVEX_URL or not CONVEX_DEPLOY_KEY:
        print("Error: CONVEX_URL and CONVEX_DEPLOY_KEY must be set")
        return []
    
    url = f"{CONVEX_URL}/api/query"
    headers = {
        "Authorization": f"Convex {CONVEX_DEPLOY_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "path": "tools:getAllForLogos",
        "args": {},
        "format": "json",
    }
    
    try:
        response = await client.post(url, json=payload, headers=headers, timeout=30.0)
        if response.status_code == 200:
            data = response.json()
            return data.get("value", [])
        else:
            print(f"Error fetching tools: {response.status_code} - {response.text}")
            return []
    except Exception as e:
        print(f"Error fetching tools: {e}")
        return []


async def update_tool_logo(
    client: httpx.AsyncClient,
    tool_id: str,
    logo_url: str
) -> bool:
    """Update a tool's logo in Convex."""
    if not CONVEX_URL or not CONVEX_DEPLOY_KEY:
        return False
    
    url = f"{CONVEX_URL}/api/mutation"
    headers = {
        "Authorization": f"Convex {CONVEX_DEPLOY_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "path": "tools:updateLogo",
        "args": {
            "toolId": tool_id,
            "logoUrl": logo_url,
        },
        "format": "json",
    }
    
    try:
        response = await client.post(url, json=payload, headers=headers, timeout=10.0)
        return response.status_code == 200
    except Exception as e:
        print(f"Error updating logo for {tool_id}: {e}")
        return False


async def scrape_logos(
    only_missing: bool = True,
    batch_size: int = 10,
    dry_run: bool = False
) -> dict:
    """
    Main function to scrape logos for all tools.
    
    Args:
        only_missing: Only fetch logos for tools without existing logos
        batch_size: Number of concurrent requests
        dry_run: If True, don't actually update Convex
    
    Returns:
        Summary of results
    """
    results = {
        "total": 0,
        "fetched": 0,
        "updated": 0,
        "skipped": 0,
        "failed": 0,
        "details": [],
    }
    
    async with httpx.AsyncClient() as client:
        print("Fetching tools from Convex...")
        tools = await fetch_tools_from_convex(client)
        results["total"] = len(tools)
        
        if not tools:
            print("No tools found or error fetching tools")
            return results
        
        print(f"Found {len(tools)} tools")
        
        if only_missing:
            tools = [t for t in tools if not t.get("logoUrl")]
            print(f"Filtering to {len(tools)} tools without logos")
        
        for i in range(0, len(tools), batch_size):
            batch = tools[i:i + batch_size]
            print(f"Processing batch {i // batch_size + 1}/{(len(tools) + batch_size - 1) // batch_size}")
            
            tasks = [fetch_logo_for_tool(client, tool) for tool in batch]
            logos = await asyncio.gather(*tasks)
            
            for tool, logo_url in zip(batch, logos):
                tool_name = tool.get("name", "Unknown")
                tool_id = tool.get("_id")
                
                if not logo_url:
                    results["failed"] += 1
                    results["details"].append({
                        "name": tool_name,
                        "status": "no_logo_found",
                    })
                    print(f"  No logo found for: {tool_name}")
                    continue
                
                results["fetched"] += 1
                
                if dry_run:
                    results["details"].append({
                        "name": tool_name,
                        "status": "dry_run",
                        "logo_url": logo_url,
                    })
                    print(f"  [DRY RUN] Would update: {tool_name} -> {logo_url}")
                else:
                    success = await update_tool_logo(client, tool_id, logo_url)
                    if success:
                        results["updated"] += 1
                        results["details"].append({
                            "name": tool_name,
                            "status": "updated",
                            "logo_url": logo_url,
                        })
                        print(f"  Updated: {tool_name} -> {logo_url}")
                    else:
                        results["failed"] += 1
                        results["details"].append({
                            "name": tool_name,
                            "status": "update_failed",
                            "logo_url": logo_url,
                        })
                        print(f"  Failed to update: {tool_name}")
            
            await asyncio.sleep(0.5)
    
    return results


async def main():
    """CLI entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Scrape logos for VibeBuff tools")
    parser.add_argument(
        "--all",
        action="store_true",
        help="Fetch logos for all tools, not just missing ones"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Don't actually update Convex, just show what would be done"
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=10,
        help="Number of concurrent requests (default: 10)"
    )
    parser.add_argument(
        "--output",
        type=str,
        help="Output results to JSON file"
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("VibeBuff Logo Scraper")
    print("=" * 60)
    
    results = await scrape_logos(
        only_missing=not args.all,
        batch_size=args.batch_size,
        dry_run=args.dry_run,
    )
    
    print("\n" + "=" * 60)
    print("Summary:")
    print(f"  Total tools: {results['total']}")
    print(f"  Logos fetched: {results['fetched']}")
    print(f"  Successfully updated: {results['updated']}")
    print(f"  Failed: {results['failed']}")
    print("=" * 60)
    
    if args.output:
        os.makedirs(DATA_DIR, exist_ok=True)
        output_path = os.path.join(DATA_DIR, args.output)
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        print(f"\nResults saved to: {output_path}")


if __name__ == "__main__":
    asyncio.run(main())
