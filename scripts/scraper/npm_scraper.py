"""
NPM Scraper - Fetches metadata about packages from npm registry
"""
import os
import json
import httpx
from typing import Optional

NPM_REGISTRY_URL = "https://registry.npmjs.org"


async def fetch_npm_package(client: httpx.AsyncClient, package_name: str) -> dict:
    """Fetch package metadata from npm registry."""
    url = f"{NPM_REGISTRY_URL}/{package_name}"
    
    try:
        response = await client.get(url)
        if response.status_code == 200:
            data = response.json()
            latest_version = data.get("dist-tags", {}).get("latest")
            latest_info = data.get("versions", {}).get(latest_version, {}) if latest_version else {}
            
            return {
                "name": data.get("name"),
                "description": data.get("description"),
                "latest_version": latest_version,
                "homepage": latest_info.get("homepage") or data.get("homepage"),
                "repository": data.get("repository", {}).get("url") if isinstance(data.get("repository"), dict) else data.get("repository"),
                "license": latest_info.get("license") or data.get("license"),
                "keywords": latest_info.get("keywords", []) or data.get("keywords", []),
                "author": data.get("author"),
                "maintainers": [m.get("name") for m in data.get("maintainers", [])],
                "time": {
                    "created": data.get("time", {}).get("created"),
                    "modified": data.get("time", {}).get("modified"),
                    "latest_published": data.get("time", {}).get(latest_version) if latest_version else None,
                },
                "dependencies_count": len(latest_info.get("dependencies", {})),
                "dev_dependencies_count": len(latest_info.get("devDependencies", {})),
            }
        elif response.status_code == 404:
            return {"error": "Package not found"}
        else:
            return {"error": f"HTTP {response.status_code}"}
    except Exception as e:
        return {"error": str(e)}


async def fetch_npm_downloads(client: httpx.AsyncClient, package_name: str) -> dict:
    """Fetch download stats from npm API."""
    # Weekly downloads
    url = f"https://api.npmjs.org/downloads/point/last-week/{package_name}"
    
    try:
        response = await client.get(url)
        if response.status_code == 200:
            data = response.json()
            weekly = data.get("downloads", 0)
        else:
            weekly = None
    except Exception:
        weekly = None
    
    # Monthly downloads
    url = f"https://api.npmjs.org/downloads/point/last-month/{package_name}"
    
    try:
        response = await client.get(url)
        if response.status_code == 200:
            data = response.json()
            monthly = data.get("downloads", 0)
        else:
            monthly = None
    except Exception:
        monthly = None
    
    return {
        "weekly_downloads": weekly,
        "monthly_downloads": monthly,
    }


async def scrape_npm_packages(package_names: list[str]) -> dict:
    """Scrape metadata for multiple npm packages."""
    results = {}
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for package_name in package_names:
            print(f"Fetching npm: {package_name}")
            
            metadata = await fetch_npm_package(client, package_name)
            if "error" not in metadata:
                downloads = await fetch_npm_downloads(client, package_name)
                metadata["downloads"] = downloads
            
            results[package_name] = metadata
    
    return results


# NPM packages for tools in our database
NPM_PACKAGES = [
    "react",
    "vue",
    "svelte",
    "@angular/core",
    "solid-js",
    "next",
    "nuxt",
    "@sveltejs/kit",
    "astro",
    "@remix-run/react",
    "tailwindcss",
    "@radix-ui/react-dialog",
    "@mui/material",
    "vitest",
    "@playwright/test",
    "cypress",
    "@sentry/browser",
    "posthog-js",
    "socket.io",
    "socket.io-client",
    "convex",
    "@supabase/supabase-js",
    "@clerk/nextjs",
    "next-auth",
    "@auth/core",
    "firebase",
    "typescript",
    "vite",
    "esbuild",
    "bun",
]


if __name__ == "__main__":
    import asyncio
    
    async def main():
        results = await scrape_npm_packages(NPM_PACKAGES)
        
        output_path = os.path.join(os.path.dirname(__file__), "data", "npm_metadata.json")
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        
        print(f"\nSaved {len(results)} packages to {output_path}")
        
        # Print summary
        successful = sum(1 for r in results.values() if "error" not in r)
        print(f"Successfully fetched: {successful}/{len(results)}")
    
    asyncio.run(main())
