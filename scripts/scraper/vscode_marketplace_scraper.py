"""
VS Code Marketplace Scraper - Fetches extension metadata from VS Code Marketplace
"""
import os
import json
import asyncio
import httpx
from datetime import datetime
from typing import Optional


EXTENSION_CATEGORIES = [
    "Programming Languages",
    "Snippets",
    "Linters",
    "Debuggers",
    "Formatters",
    "Keymaps",
    "SCM Providers",
    "Other",
    "Extension Packs",
    "Language Packs",
    "Data Science",
    "Machine Learning",
    "Visualization",
    "Notebooks",
    "Testing",
]

AI_EXTENSIONS = [
    "GitHub.copilot",
    "GitHub.copilot-chat",
    "Codeium.codeium",
    "TabNine.tabnine-vscode",
    "Continue.continue",
    "sourcegraph.cody-ai",
    "Supermaven.supermaven",
    "blackboxapp.blackbox",
    "AmazonWebServices.amazon-q-vscode",
    "Cursor.cursor",
    "phind.phind",
    "Codiumate.codiumate",
    "mutable-ai.mutable-ai",
]

POPULAR_EXTENSIONS = [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-python.python",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "eamodio.gitlens",
    "vscodevim.vim",
    "ms-azuretools.vscode-docker",
    "ms-vscode-remote.remote-containers",
    "ritwickdey.LiveServer",
    "PKief.material-icon-theme",
    "zhuangtongfa.material-theme",
    "dracula-theme.theme-dracula",
    "Prisma.prisma",
    "GraphQL.vscode-graphql",
    "ms-playwright.playwright",
    "vitest.explorer",
    "usernamehw.errorlens",
    "streetsidesoftware.code-spell-checker",
    "yzhang.markdown-all-in-one",
    "shd101wyy.markdown-preview-enhanced",
    "ms-toolsai.jupyter",
    "ms-python.vscode-pylance",
    "rust-lang.rust-analyzer",
    "golang.go",
    "svelte.svelte-vscode",
    "Vue.volar",
    "astro-build.astro-vscode",
]

MARKETPLACE_API = "https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery"


async def fetch_extension_details(client: httpx.AsyncClient, extension_id: str) -> dict:
    """Fetch details for a specific extension."""
    payload = {
        "filters": [
            {
                "criteria": [
                    {"filterType": 7, "value": extension_id}
                ]
            }
        ],
        "flags": 950
    }
    
    try:
        response = await client.post(
            MARKETPLACE_API,
            json=payload,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json;api-version=7.1-preview.1",
            }
        )
        response.raise_for_status()
        
        data = response.json()
        results = data.get("results", [])
        
        if not results or not results[0].get("extensions"):
            return {"id": extension_id, "error": "Not found"}
        
        ext = results[0]["extensions"][0]
        
        statistics = {}
        for stat in ext.get("statistics", []):
            statistics[stat["statisticName"]] = stat["value"]
        
        versions = ext.get("versions", [])
        latest_version = versions[0] if versions else {}
        
        properties = {}
        for prop in latest_version.get("properties", []):
            properties[prop["key"]] = prop["value"]
        
        return {
            "id": ext.get("extensionId"),
            "name": ext.get("extensionName"),
            "display_name": ext.get("displayName"),
            "publisher": ext.get("publisher", {}).get("publisherName"),
            "publisher_display_name": ext.get("publisher", {}).get("displayName"),
            "short_description": ext.get("shortDescription"),
            "version": latest_version.get("version"),
            "last_updated": latest_version.get("lastUpdated"),
            "published_date": ext.get("publishedDate"),
            "install_count": statistics.get("install", 0),
            "average_rating": statistics.get("averagerating", 0),
            "rating_count": statistics.get("ratingcount", 0),
            "trending_daily": statistics.get("trendingdaily", 0),
            "trending_weekly": statistics.get("trendingweekly", 0),
            "trending_monthly": statistics.get("trendingmonthly", 0),
            "categories": ext.get("categories", []),
            "tags": ext.get("tags", []),
            "repository": properties.get("Microsoft.VisualStudio.Services.Links.Source"),
            "homepage": properties.get("Microsoft.VisualStudio.Services.Links.Homepage"),
            "marketplace_url": f"https://marketplace.visualstudio.com/items?itemName={extension_id}",
        }
    except Exception as e:
        print(f"Error fetching extension {extension_id}: {e}")
        return {"id": extension_id, "error": str(e)}


async def search_extensions(client: httpx.AsyncClient, query: str, page_size: int = 50) -> list:
    """Search for extensions by query."""
    payload = {
        "filters": [
            {
                "criteria": [
                    {"filterType": 10, "value": query},
                    {"filterType": 8, "value": "Microsoft.VisualStudio.Code"},
                ],
                "pageNumber": 1,
                "pageSize": page_size,
                "sortBy": 4,
                "sortOrder": 0,
            }
        ],
        "flags": 950
    }
    
    try:
        response = await client.post(
            MARKETPLACE_API,
            json=payload,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json;api-version=7.1-preview.1",
            }
        )
        response.raise_for_status()
        
        data = response.json()
        results = data.get("results", [])
        
        if not results:
            return []
        
        extensions = []
        for ext in results[0].get("extensions", []):
            statistics = {}
            for stat in ext.get("statistics", []):
                statistics[stat["statisticName"]] = stat["value"]
            
            extensions.append({
                "id": f"{ext.get('publisher', {}).get('publisherName')}.{ext.get('extensionName')}",
                "name": ext.get("extensionName"),
                "display_name": ext.get("displayName"),
                "publisher": ext.get("publisher", {}).get("publisherName"),
                "short_description": ext.get("shortDescription"),
                "install_count": statistics.get("install", 0),
                "average_rating": statistics.get("averagerating", 0),
                "categories": ext.get("categories", []),
            })
        
        return extensions
    except Exception as e:
        print(f"Error searching extensions for '{query}': {e}")
        return []


async def scrape_vscode_marketplace() -> dict:
    """Scrape VS Code Marketplace for extensions."""
    results = {
        "scraped_at": datetime.now().isoformat(),
        "ai_extensions": {},
        "popular_extensions": {},
        "search_results": {},
        "all_extensions": [],
    }
    
    seen_extensions = set()
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for ext_id in AI_EXTENSIONS:
            print(f"  Fetching AI extension: {ext_id}...")
            ext_data = await fetch_extension_details(client, ext_id)
            results["ai_extensions"][ext_id] = ext_data
            
            if "error" not in ext_data and ext_id not in seen_extensions:
                seen_extensions.add(ext_id)
                results["all_extensions"].append(ext_data)
            
            await asyncio.sleep(0.5)
        
        for ext_id in POPULAR_EXTENSIONS:
            print(f"  Fetching popular extension: {ext_id}...")
            ext_data = await fetch_extension_details(client, ext_id)
            results["popular_extensions"][ext_id] = ext_data
            
            if "error" not in ext_data and ext_id not in seen_extensions:
                seen_extensions.add(ext_id)
                results["all_extensions"].append(ext_data)
            
            await asyncio.sleep(0.5)
        
        search_queries = [
            "ai coding",
            "copilot",
            "code completion",
            "ai assistant",
            "developer tools",
            "productivity",
            "react",
            "typescript",
            "tailwind",
            "prisma",
        ]
        
        for query in search_queries:
            print(f"  Searching: {query}...")
            search_results = await search_extensions(client, query, page_size=20)
            results["search_results"][query] = search_results
            
            for ext in search_results:
                if ext["id"] not in seen_extensions:
                    seen_extensions.add(ext["id"])
                    results["all_extensions"].append(ext)
            
            await asyncio.sleep(1)
    
    results["total_unique_extensions"] = len(results["all_extensions"])
    return results


if __name__ == "__main__":
    async def main():
        print("Scraping VS Code Marketplace...")
        results = await scrape_vscode_marketplace()
        
        output_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(output_dir, exist_ok=True)
        
        output_path = os.path.join(output_dir, "vscode_marketplace.json")
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        
        print(f"\nSaved {results['total_unique_extensions']} unique extensions to {output_path}")
    
    asyncio.run(main())
