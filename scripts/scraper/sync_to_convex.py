"""
Sync scraped tool data to Convex database.
Reads from scraped JSON files and upserts tools via Convex HTTP API.
"""
import os
import json
import httpx
import asyncio
from typing import Optional
from urllib.parse import urlparse
import re


CONVEX_URL = os.environ.get("CONVEX_URL", "")
CONVEX_DEPLOY_KEY = os.environ.get("CONVEX_DEPLOY_KEY", "")

CATEGORY_MAPPING = {
    "orchestration": "cli-agents",
    "cli_agent": "cli-agents",
    "ide": "ides",
    "extension": "ai-assistants",
    "autonomous": "vibe-coding",
    "app_builder": "vibe-coding",
    "framework": "backend",
    "mcp": "cli-agents",
}

DEFAULT_CATEGORY = "ai-assistants"


def slugify(name: str) -> str:
    """Convert a name to a URL-friendly slug."""
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    slug = slug.strip('-')
    return slug


def determine_pricing_model(metadata: dict) -> str:
    """Determine pricing model from scraped metadata."""
    if not metadata:
        return "freemium"
    
    pricing = metadata.get("pricing", {})
    
    if pricing.get("is_open_source"):
        return "open_source"
    if pricing.get("has_free_tier"):
        return "freemium"
    
    prices = pricing.get("prices_found", [])
    if prices:
        return "paid"
    
    return "freemium"


def extract_features_from_metadata(metadata: dict) -> list[str]:
    """Extract features from scraped metadata."""
    features = []
    
    if metadata.get("features_detected"):
        features.extend(metadata["features_detected"])
    
    if metadata.get("supported_agents"):
        for agent in metadata["supported_agents"]:
            features.append(f"Supports {agent}")
    
    return features[:10]


def transform_vibe_tool(tool: dict) -> Optional[dict]:
    """Transform a scraped vibe tool into Convex format."""
    name = tool.get("name", "")
    url = tool.get("url", "")
    
    if not name or not url:
        return None
    
    metadata = tool.get("metadata", {})
    category = tool.get("category", "")
    
    category_slug = CATEGORY_MAPPING.get(category, DEFAULT_CATEGORY)
    
    description = ""
    if metadata:
        description = metadata.get("description") or metadata.get("og_title") or ""
    if not description:
        description = tool.get("description", f"{name} - AI coding tool")
    
    tagline = description[:100] if description else f"{name} - AI coding tool"
    if len(description) > 100:
        tagline = description[:97] + "..."
    
    features = extract_features_from_metadata(metadata) if metadata else []
    
    github_url = None
    if metadata and metadata.get("github_url"):
        github_url = metadata["github_url"]
    
    return {
        "name": name,
        "slug": slugify(name),
        "tagline": tagline,
        "description": description[:1000] if description else f"{name} is an AI coding tool.",
        "websiteUrl": url,
        "githubUrl": github_url,
        "docsUrl": metadata.get("docs_url") if metadata else None,
        "categorySlug": category_slug,
        "pricingModel": determine_pricing_model(metadata),
        "githubStars": None,
        "pros": [],
        "cons": [],
        "bestFor": ["AI-assisted coding", "Vibe coding"],
        "features": features if features else ["AI coding assistance"],
        "tags": ["ai", "coding", "vibe-coding", category] if category else ["ai", "coding", "vibe-coding"],
        "isOpenSource": metadata.get("pricing", {}).get("is_open_source", False) if metadata else False,
    }


async def upsert_tool(client: httpx.AsyncClient, tool_data: dict) -> dict:
    """Upsert a single tool to Convex."""
    if not CONVEX_URL or not CONVEX_DEPLOY_KEY:
        return {"error": "Missing CONVEX_URL or CONVEX_DEPLOY_KEY"}
    
    url = f"{CONVEX_URL}/api/mutation"
    
    headers = {
        "Authorization": f"Convex {CONVEX_DEPLOY_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "path": "ingest:upsertTool",
        "args": tool_data,
    }
    
    try:
        response = await client.post(url, json=payload, headers=headers, timeout=30.0)
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": f"HTTP {response.status_code}: {response.text}"}
    except Exception as e:
        return {"error": str(e)}


async def sync_vibe_tools():
    """Sync vibe tools from scraped data to Convex."""
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    vibe_tools_path = os.path.join(data_dir, "vibe_tools.json")
    
    if not os.path.exists(vibe_tools_path):
        print(f"No vibe tools data found at {vibe_tools_path}")
        return {"error": "No data file found"}
    
    with open(vibe_tools_path, "r") as f:
        data = json.load(f)
    
    known_tools = data.get("known_tools", [])
    
    results = {
        "processed": 0,
        "success": 0,
        "errors": [],
    }
    
    async with httpx.AsyncClient() as client:
        for tool in known_tools:
            tool_data = transform_vibe_tool(tool)
            if not tool_data:
                continue
            
            results["processed"] += 1
            print(f"Syncing: {tool_data['name']}")
            
            result = await upsert_tool(client, tool_data)
            
            if "error" in result:
                results["errors"].append(f"{tool_data['name']}: {result['error']}")
            else:
                results["success"] += 1
                print(f"  -> {result.get('action', 'done')}")
            
            await asyncio.sleep(0.5)
    
    return results


async def sync_all_scraped_tools():
    """Sync all scraped tools from various sources to Convex."""
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    
    results = {
        "vibe_tools": None,
        "total_synced": 0,
        "total_errors": 0,
    }
    
    vibe_result = await sync_vibe_tools()
    results["vibe_tools"] = vibe_result
    results["total_synced"] += vibe_result.get("success", 0)
    results["total_errors"] += len(vibe_result.get("errors", []))
    
    return results


def main():
    """Main entry point."""
    if not CONVEX_URL:
        print("ERROR: CONVEX_URL environment variable not set")
        print("Set it to your Convex deployment URL (e.g., https://your-deployment.convex.cloud)")
        return
    
    if not CONVEX_DEPLOY_KEY:
        print("ERROR: CONVEX_DEPLOY_KEY environment variable not set")
        print("Get your deploy key from the Convex dashboard")
        return
    
    print("=" * 50)
    print("SYNCING SCRAPED TOOLS TO CONVEX")
    print("=" * 50)
    print(f"Convex URL: {CONVEX_URL}")
    print()
    
    results = asyncio.run(sync_all_scraped_tools())
    
    print()
    print("=" * 50)
    print("SYNC COMPLETE")
    print("=" * 50)
    print(f"Total synced: {results['total_synced']}")
    print(f"Total errors: {results['total_errors']}")
    
    if results.get("vibe_tools", {}).get("errors"):
        print("\nErrors:")
        for error in results["vibe_tools"]["errors"][:10]:
            print(f"  - {error}")


if __name__ == "__main__":
    main()
