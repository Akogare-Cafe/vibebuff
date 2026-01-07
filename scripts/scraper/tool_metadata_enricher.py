"""
Tool Metadata Enricher - Fetches comprehensive metadata for tools and updates Convex
"""
import os
import json
import asyncio
import httpx
from datetime import datetime
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
CONVEX_URL = os.getenv("CONVEX_URL", "https://impressive-tiger-694.convex.cloud")

GITHUB_HEADERS = {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}

if GITHUB_TOKEN:
    GITHUB_HEADERS["Authorization"] = f"Bearer {GITHUB_TOKEN}"


def parse_github_url(url: str) -> Optional[tuple[str, str]]:
    """Extract owner and repo from GitHub URL."""
    if not url or "github.com" not in url:
        return None
    
    parts = url.rstrip("/").split("/")
    try:
        idx = parts.index("github.com")
        if len(parts) > idx + 2:
            owner = parts[idx + 1]
            repo = parts[idx + 2].replace(".git", "")
            return (owner, repo)
    except (ValueError, IndexError):
        pass
    return None


async def fetch_github_metadata(client: httpx.AsyncClient, github_url: str) -> Optional[dict]:
    """Fetch comprehensive GitHub metadata."""
    parsed = parse_github_url(github_url)
    if not parsed:
        return None
    
    owner, repo = parsed
    base_url = f"https://api.github.com/repos/{owner}/{repo}"
    
    try:
        response = await client.get(base_url, headers=GITHUB_HEADERS)
        if response.status_code != 200:
            print(f"  GitHub API error for {owner}/{repo}: {response.status_code}")
            return None
        
        data = response.json()
        
        result = {
            "stars": data.get("stargazers_count", 0),
            "forks": data.get("forks_count", 0),
            "watchers": data.get("subscribers_count", 0),
            "openIssues": data.get("open_issues_count", 0),
            "license": data.get("license", {}).get("spdx_id") if data.get("license") else None,
            "language": data.get("language"),
            "topics": data.get("topics", []),
            "createdAt": data.get("created_at"),
            "updatedAt": data.get("updated_at"),
            "pushedAt": data.get("pushed_at"),
            "description": data.get("description"),
            "homepage": data.get("homepage"),
            "size": data.get("size"),
            "defaultBranch": data.get("default_branch"),
            "hasWiki": data.get("has_wiki"),
            "hasIssues": data.get("has_issues"),
            "archived": data.get("archived"),
        }
        
        contrib_response = await client.get(f"{base_url}/contributors", headers=GITHUB_HEADERS, params={"per_page": 1})
        if contrib_response.status_code == 200 and "Link" in contrib_response.headers:
            link_header = contrib_response.headers["Link"]
            if 'rel="last"' in link_header:
                import re
                match = re.search(r'page=(\d+)>; rel="last"', link_header)
                if match:
                    result["contributors"] = int(match.group(1))
        
        commits_response = await client.get(f"{base_url}/commits", headers=GITHUB_HEADERS, params={"per_page": 1})
        if commits_response.status_code == 200 and "Link" in commits_response.headers:
            link_header = commits_response.headers["Link"]
            if 'rel="last"' in link_header:
                import re
                match = re.search(r'page=(\d+)>; rel="last"', link_header)
                if match:
                    result["commits"] = int(match.group(1))
        
        releases_response = await client.get(f"{base_url}/releases", headers=GITHUB_HEADERS, params={"per_page": 1})
        if releases_response.status_code == 200:
            releases = releases_response.json()
            if releases:
                result["latestRelease"] = {
                    "tagName": releases[0].get("tag_name"),
                    "name": releases[0].get("name"),
                    "publishedAt": releases[0].get("published_at"),
                }
            if "Link" in releases_response.headers:
                link_header = releases_response.headers["Link"]
                if 'rel="last"' in link_header:
                    import re
                    match = re.search(r'page=(\d+)>; rel="last"', link_header)
                    if match:
                        result["releases"] = int(match.group(1))
        
        return result
    except Exception as e:
        print(f"  Error fetching GitHub data for {github_url}: {e}")
        return None


async def fetch_npm_metadata(client: httpx.AsyncClient, package_name: str) -> Optional[dict]:
    """Fetch comprehensive npm metadata."""
    if not package_name:
        return None
    
    try:
        response = await client.get(f"https://registry.npmjs.org/{package_name}")
        if response.status_code != 200:
            return None
        
        data = response.json()
        latest_version = data.get("dist-tags", {}).get("latest")
        latest_info = data.get("versions", {}).get(latest_version, {}) if latest_version else {}
        time_data = data.get("time", {})
        
        result = {
            "downloadsWeekly": 0,
            "version": latest_version,
            "license": latest_info.get("license") or data.get("license"),
            "dependencies": len(latest_info.get("dependencies", {})),
            "devDependencies": len(latest_info.get("devDependencies", {})),
            "maintainers": len(data.get("maintainers", [])),
            "lastPublished": time_data.get(latest_version) if latest_version else None,
            "firstPublished": time_data.get("created"),
            "types": "types" in latest_info or "@types" in package_name,
            "keywords": latest_info.get("keywords", []) or data.get("keywords", []),
        }
        
        weekly_response = await client.get(f"https://api.npmjs.org/downloads/point/last-week/{package_name}")
        if weekly_response.status_code == 200:
            result["downloadsWeekly"] = weekly_response.json().get("downloads", 0)
        
        monthly_response = await client.get(f"https://api.npmjs.org/downloads/point/last-month/{package_name}")
        if monthly_response.status_code == 200:
            result["downloadsMonthly"] = monthly_response.json().get("downloads", 0)
        
        yearly_response = await client.get(f"https://api.npmjs.org/downloads/point/last-year/{package_name}")
        if yearly_response.status_code == 200:
            result["downloadsYearly"] = yearly_response.json().get("downloads", 0)
        
        return result
    except Exception as e:
        print(f"  Error fetching npm data for {package_name}: {e}")
        return None


async def fetch_bundlephobia_metadata(client: httpx.AsyncClient, package_name: str) -> Optional[dict]:
    """Fetch bundle size data from bundlephobia."""
    if not package_name:
        return None
    
    try:
        response = await client.get(f"https://bundlephobia.com/api/size?package={package_name}")
        if response.status_code != 200:
            return None
        
        data = response.json()
        return {
            "size": data.get("size", 0),
            "gzip": data.get("gzip", 0),
            "dependencyCount": data.get("dependencyCount"),
            "hasJSModule": data.get("hasJSModule"),
            "hasJSNext": data.get("hasJSNext"),
            "hasSideEffects": data.get("hasSideEffects"),
        }
    except Exception as e:
        print(f"  Error fetching bundlephobia data for {package_name}: {e}")
        return None


TOOL_METADATA_MAP = {
    "vscode": {"github": "https://github.com/microsoft/vscode"},
    "cursor": {"website": "https://cursor.sh"},
    "windsurf": {"website": "https://codeium.com/windsurf"},
    "zed": {"github": "https://github.com/zed-industries/zed"},
    "jetbrains": {"website": "https://www.jetbrains.com"},
    "neovim": {"github": "https://github.com/neovim/neovim"},
    "github-copilot": {"npm": "copilot"},
    "claude": {"website": "https://claude.ai"},
    "chatgpt": {"website": "https://chat.openai.com"},
    "gemini": {"website": "https://gemini.google.com"},
    "cody": {"github": "https://github.com/sourcegraph/cody"},
    "supermaven": {"website": "https://supermaven.com"},
    "react": {"github": "https://github.com/facebook/react", "npm": "react"},
    "vuejs": {"github": "https://github.com/vuejs/vue", "npm": "vue"},
    "svelte": {"github": "https://github.com/sveltejs/svelte", "npm": "svelte"},
    "angular": {"github": "https://github.com/angular/angular", "npm": "@angular/core"},
    "solid": {"github": "https://github.com/solidjs/solid", "npm": "solid-js"},
    "preact": {"github": "https://github.com/preactjs/preact", "npm": "preact"},
    "qwik": {"github": "https://github.com/BuilderIO/qwik", "npm": "@builder.io/qwik"},
    "htmx": {"github": "https://github.com/bigskysoftware/htmx", "npm": "htmx.org"},
    "alpine": {"github": "https://github.com/alpinejs/alpine", "npm": "alpinejs"},
    "nextjs": {"github": "https://github.com/vercel/next.js", "npm": "next"},
    "nuxt": {"github": "https://github.com/nuxt/nuxt", "npm": "nuxt"},
    "sveltekit": {"github": "https://github.com/sveltejs/kit", "npm": "@sveltejs/kit"},
    "astro": {"github": "https://github.com/withastro/astro", "npm": "astro"},
    "remix": {"github": "https://github.com/remix-run/remix", "npm": "@remix-run/react"},
    "redwood": {"github": "https://github.com/redwoodjs/redwood", "npm": "@redwoodjs/core"},
    "nodejs": {"github": "https://github.com/nodejs/node"},
    "bun": {"github": "https://github.com/oven-sh/bun"},
    "deno": {"github": "https://github.com/denoland/deno"},
    "supabase": {"github": "https://github.com/supabase/supabase", "npm": "@supabase/supabase-js"},
    "firebase": {"npm": "firebase"},
    "convex": {"github": "https://github.com/get-convex/convex-js", "npm": "convex"},
    "neon": {"github": "https://github.com/neondatabase/neon"},
    "turso": {"github": "https://github.com/tursodatabase/libsql"},
    "planetscale": {"website": "https://planetscale.com"},
    "pocketbase": {"github": "https://github.com/pocketbase/pocketbase"},
    "appwrite": {"github": "https://github.com/appwrite/appwrite"},
    "prisma": {"github": "https://github.com/prisma/prisma", "npm": "prisma"},
    "drizzle": {"github": "https://github.com/drizzle-team/drizzle-orm", "npm": "drizzle-orm"},
    "clerk": {"npm": "@clerk/nextjs"},
    "auth0": {"npm": "@auth0/auth0-react"},
    "nextauth": {"github": "https://github.com/nextauthjs/next-auth", "npm": "next-auth"},
    "lucia": {"github": "https://github.com/lucia-auth/lucia"},
    "vercel": {"website": "https://vercel.com"},
    "netlify": {"website": "https://netlify.com"},
    "railway": {"website": "https://railway.app"},
    "fly": {"website": "https://fly.io"},
    "render": {"website": "https://render.com"},
    "cloudflare-workers": {"website": "https://workers.cloudflare.com"},
    "tailwindcss": {"github": "https://github.com/tailwindlabs/tailwindcss", "npm": "tailwindcss"},
    "shadcn": {"github": "https://github.com/shadcn-ui/ui"},
    "radix": {"github": "https://github.com/radix-ui/primitives", "npm": "@radix-ui/react-dialog"},
    "chakra": {"github": "https://github.com/chakra-ui/chakra-ui", "npm": "@chakra-ui/react"},
    "mantine": {"github": "https://github.com/mantinedev/mantine", "npm": "@mantine/core"},
    "mui": {"github": "https://github.com/mui/material-ui", "npm": "@mui/material"},
    "vitest": {"github": "https://github.com/vitest-dev/vitest", "npm": "vitest"},
    "playwright": {"github": "https://github.com/microsoft/playwright", "npm": "@playwright/test"},
    "cypress": {"github": "https://github.com/cypress-io/cypress", "npm": "cypress"},
    "jest": {"github": "https://github.com/jestjs/jest", "npm": "jest"},
    "sentry": {"github": "https://github.com/getsentry/sentry", "npm": "@sentry/browser"},
    "posthog": {"github": "https://github.com/PostHog/posthog", "npm": "posthog-js"},
    "plausible": {"github": "https://github.com/plausible/analytics"},
    "umami": {"github": "https://github.com/umami-software/umami"},
    "vite": {"github": "https://github.com/vitejs/vite", "npm": "vite"},
    "esbuild": {"github": "https://github.com/evanw/esbuild", "npm": "esbuild"},
    "turbo": {"github": "https://github.com/vercel/turbo", "npm": "turbo"},
    "biome": {"github": "https://github.com/biomejs/biome", "npm": "@biomejs/biome"},
    "trpc": {"github": "https://github.com/trpc/trpc", "npm": "@trpc/server"},
    "tanstack-query": {"github": "https://github.com/TanStack/query", "npm": "@tanstack/react-query"},
    "socketio": {"github": "https://github.com/socketio/socket.io", "npm": "socket.io"},
    "pusher": {"npm": "pusher-js"},
    "ably": {"npm": "ably"},
    "framer-motion": {"github": "https://github.com/framer/motion", "npm": "framer-motion"},
    "zustand": {"github": "https://github.com/pmndrs/zustand", "npm": "zustand"},
    "jotai": {"github": "https://github.com/pmndrs/jotai", "npm": "jotai"},
    "xstate": {"github": "https://github.com/statelyai/xstate", "npm": "xstate"},
    "react-hook-form": {"github": "https://github.com/react-hook-form/react-hook-form", "npm": "react-hook-form"},
    "zod": {"github": "https://github.com/colinhacks/zod", "npm": "zod"},
    "openai-api": {"npm": "openai"},
    "anthropic-api": {"npm": "@anthropic-ai/sdk"},
    "langchain": {"github": "https://github.com/langchain-ai/langchain", "npm": "langchain"},
    "vercel-ai": {"github": "https://github.com/vercel/ai", "npm": "ai"},
    "ollama": {"github": "https://github.com/ollama/ollama"},
    "llama": {"github": "https://github.com/meta-llama/llama"},
    "mistral": {"website": "https://mistral.ai"},
    "claude-code": {"website": "https://claude.ai/code"},
    "aider": {"github": "https://github.com/paul-gauthier/aider"},
    "cline": {"github": "https://github.com/cline/cline"},
    "continue": {"github": "https://github.com/continuedev/continue"},
    "bolt": {"github": "https://github.com/stackblitz/bolt.new"},
    "v0": {"website": "https://v0.dev"},
    "lovable": {"website": "https://lovable.dev"},
    "replit": {"website": "https://replit.com"},
    "inngest": {"github": "https://github.com/inngest/inngest", "npm": "inngest"},
    "trigger": {"github": "https://github.com/triggerdotdev/trigger.dev", "npm": "@trigger.dev/sdk"},
    "resend": {"npm": "resend"},
    "react-email": {"github": "https://github.com/resend/react-email", "npm": "@react-email/components"},
    "stripe": {"npm": "stripe"},
    "lemon-squeezy": {"npm": "@lemonsqueezy/lemonsqueezy.js"},
    "typescript": {"github": "https://github.com/microsoft/TypeScript", "npm": "typescript"},
    "eslint": {"github": "https://github.com/eslint/eslint", "npm": "eslint"},
    "prettier": {"github": "https://github.com/prettier/prettier", "npm": "prettier"},
}


async def enrich_tool_metadata(tool: dict) -> dict:
    """Enrich a single tool with external metadata."""
    slug = tool.get("slug", "")
    github_url = tool.get("githubUrl")
    npm_package = tool.get("npmPackageName")
    
    metadata_config = TOOL_METADATA_MAP.get(slug, {})
    if not github_url and "github" in metadata_config:
        github_url = metadata_config["github"]
    if not npm_package and "npm" in metadata_config:
        npm_package = metadata_config["npm"]
    
    external_data = {}
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        if github_url:
            print(f"  Fetching GitHub data for {slug}...")
            github_data = await fetch_github_metadata(client, github_url)
            if github_data:
                external_data["github"] = github_data
            await asyncio.sleep(0.5)
        
        if npm_package:
            print(f"  Fetching npm data for {slug} ({npm_package})...")
            npm_data = await fetch_npm_metadata(client, npm_package)
            if npm_data:
                external_data["npm"] = npm_data
            await asyncio.sleep(0.3)
            
            print(f"  Fetching bundlephobia data for {slug}...")
            bundle_data = await fetch_bundlephobia_metadata(client, npm_package)
            if bundle_data:
                external_data["bundlephobia"] = bundle_data
            await asyncio.sleep(0.3)
    
    if external_data:
        external_data["lastFetched"] = int(datetime.now().timestamp() * 1000)
    
    return external_data


async def fetch_all_tools_from_convex() -> list:
    """Fetch all tools from Convex using the public API."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{CONVEX_URL}/api/query",
            json={
                "path": "tools:list",
                "args": {"limit": 500},
            }
        )
        if response.status_code == 200:
            data = response.json()
            return data.get("value", [])
        else:
            print(f"Error fetching tools: {response.status_code}")
            return []


async def main():
    """Main function to enrich all tools with metadata."""
    print("=" * 60)
    print("Tool Metadata Enricher")
    print("=" * 60)
    
    print("\nFetching tools from Convex...")
    tools = await fetch_all_tools_from_convex()
    print(f"Found {len(tools)} tools")
    
    enriched_data = {}
    
    for i, tool in enumerate(tools):
        slug = tool.get("slug", "unknown")
        print(f"\n[{i+1}/{len(tools)}] Processing: {tool.get('name', slug)}")
        
        external_data = await enrich_tool_metadata(tool)
        
        if external_data:
            enriched_data[slug] = {
                "toolId": tool.get("_id"),
                "name": tool.get("name"),
                "slug": slug,
                "externalData": external_data,
            }
            print(f"  Enriched with: {list(external_data.keys())}")
        else:
            print(f"  No external data found")
    
    output_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, "enriched_tools.json")
    with open(output_path, "w") as f:
        json.dump({
            "scraped_at": datetime.now().isoformat(),
            "total_tools": len(tools),
            "enriched_count": len(enriched_data),
            "tools": enriched_data,
        }, f, indent=2)
    
    print(f"\n{'=' * 60}")
    print(f"Enrichment complete!")
    print(f"Total tools: {len(tools)}")
    print(f"Enriched: {len(enriched_data)}")
    print(f"Output saved to: {output_path}")
    print(f"{'=' * 60}")
    
    return enriched_data


if __name__ == "__main__":
    asyncio.run(main())
