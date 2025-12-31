"""
GitHub Scraper - Fetches metadata about tools from GitHub repositories
"""
import os
import json
import httpx
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

HEADERS = {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}

if GITHUB_TOKEN:
    HEADERS["Authorization"] = f"Bearer {GITHUB_TOKEN}"


def parse_github_url(url: str) -> Optional[tuple[str, str]]:
    """Extract owner and repo from GitHub URL."""
    if not url or "github.com" not in url:
        return None
    
    parts = url.rstrip("/").split("/")
    try:
        idx = parts.index("github.com")
        if len(parts) > idx + 2:
            owner = parts[idx + 1]
            repo = parts[idx + 2]
            return (owner, repo)
    except (ValueError, IndexError):
        pass
    return None


async def fetch_repo_metadata(client: httpx.AsyncClient, owner: str, repo: str) -> dict:
    """Fetch repository metadata from GitHub API."""
    url = f"https://api.github.com/repos/{owner}/{repo}"
    
    try:
        response = await client.get(url, headers=HEADERS)
        if response.status_code == 200:
            data = response.json()
            return {
                "name": data.get("name"),
                "full_name": data.get("full_name"),
                "description": data.get("description"),
                "stars": data.get("stargazers_count"),
                "forks": data.get("forks_count"),
                "watchers": data.get("watchers_count"),
                "open_issues": data.get("open_issues_count"),
                "language": data.get("language"),
                "topics": data.get("topics", []),
                "license": data.get("license", {}).get("spdx_id") if data.get("license") else None,
                "created_at": data.get("created_at"),
                "updated_at": data.get("updated_at"),
                "pushed_at": data.get("pushed_at"),
                "homepage": data.get("homepage"),
                "default_branch": data.get("default_branch"),
                "archived": data.get("archived"),
                "is_fork": data.get("fork"),
            }
        elif response.status_code == 404:
            return {"error": "Repository not found"}
        elif response.status_code == 403:
            return {"error": "Rate limited - add GITHUB_TOKEN to .env"}
        else:
            return {"error": f"HTTP {response.status_code}"}
    except Exception as e:
        return {"error": str(e)}


async def fetch_repo_releases(client: httpx.AsyncClient, owner: str, repo: str, limit: int = 5) -> list:
    """Fetch recent releases from GitHub API."""
    url = f"https://api.github.com/repos/{owner}/{repo}/releases"
    
    try:
        response = await client.get(url, headers=HEADERS, params={"per_page": limit})
        if response.status_code == 200:
            releases = response.json()
            return [
                {
                    "tag_name": r.get("tag_name"),
                    "name": r.get("name"),
                    "published_at": r.get("published_at"),
                    "prerelease": r.get("prerelease"),
                }
                for r in releases
            ]
        return []
    except Exception:
        return []


async def fetch_repo_contributors(client: httpx.AsyncClient, owner: str, repo: str, limit: int = 10) -> list:
    """Fetch top contributors from GitHub API."""
    url = f"https://api.github.com/repos/{owner}/{repo}/contributors"
    
    try:
        response = await client.get(url, headers=HEADERS, params={"per_page": limit})
        if response.status_code == 200:
            contributors = response.json()
            return [
                {
                    "login": c.get("login"),
                    "contributions": c.get("contributions"),
                }
                for c in contributors
            ]
        return []
    except Exception:
        return []


async def scrape_github_repos(github_urls: list[str]) -> dict:
    """Scrape metadata for multiple GitHub repositories."""
    results = {}
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for url in github_urls:
            parsed = parse_github_url(url)
            if not parsed:
                results[url] = {"error": "Invalid GitHub URL"}
                continue
            
            owner, repo = parsed
            print(f"Fetching: {owner}/{repo}")
            
            metadata = await fetch_repo_metadata(client, owner, repo)
            if "error" not in metadata:
                metadata["releases"] = await fetch_repo_releases(client, owner, repo)
                metadata["top_contributors"] = await fetch_repo_contributors(client, owner, repo)
            
            results[url] = metadata
    
    return results


# Tool GitHub URLs from seed data
TOOL_GITHUB_URLS = [
    "https://github.com/microsoft/vscode",
    "https://github.com/zed-industries/zed",
    "https://github.com/neovim/neovim",
    "https://github.com/facebook/react",
    "https://github.com/vuejs/vue",
    "https://github.com/sveltejs/svelte",
    "https://github.com/angular/angular",
    "https://github.com/solidjs/solid",
    "https://github.com/vercel/next.js",
    "https://github.com/nuxt/nuxt",
    "https://github.com/sveltejs/kit",
    "https://github.com/withastro/astro",
    "https://github.com/remix-run/remix",
    "https://github.com/nodejs/node",
    "https://github.com/oven-sh/bun",
    "https://github.com/denoland/deno",
    "https://github.com/golang/go",
    "https://github.com/rust-lang/rust",
    "https://github.com/python/cpython",
    "https://github.com/elixir-lang/elixir",
    "https://github.com/supabase/supabase",
    "https://github.com/neondatabase/neon",
    "https://github.com/tursodatabase/libsql",
    "https://github.com/nextauthjs/next-auth",
    "https://github.com/tailwindlabs/tailwindcss",
    "https://github.com/shadcn-ui/ui",
    "https://github.com/radix-ui/primitives",
    "https://github.com/mui/material-ui",
    "https://github.com/vitest-dev/vitest",
    "https://github.com/microsoft/playwright",
    "https://github.com/cypress-io/cypress",
    "https://github.com/getsentry/sentry",
    "https://github.com/PostHog/posthog",
    "https://github.com/socketio/socket.io",
    "https://github.com/meta-llama/llama",
    # CLI Agents
    "https://github.com/anthropics/claude-code",
    "https://github.com/openai/codex",
    "https://github.com/paul-gauthier/aider",
    "https://github.com/block/goose",
    "https://github.com/google-gemini/gemini-cli",
    "https://github.com/cline/cline",
    "https://github.com/RooVetGit/Roo-Code",
    "https://github.com/All-Hands-AI/OpenHands",
    "https://github.com/continuedev/continue",
    "https://github.com/Kilo-Org/kilocode",
    # Awesome lists
    "https://github.com/filipecalegario/awesome-vibe-coding",
    "https://github.com/roboco-io/awesome-vibecoding",
    "https://github.com/no-fluff/awesome-vibe-coding",
]


if __name__ == "__main__":
    import asyncio
    
    async def main():
        results = await scrape_github_repos(TOOL_GITHUB_URLS)
        
        output_path = os.path.join(os.path.dirname(__file__), "data", "github_metadata.json")
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        
        print(f"\nSaved {len(results)} repos to {output_path}")
        
        # Print summary
        successful = sum(1 for r in results.values() if "error" not in r)
        print(f"Successfully fetched: {successful}/{len(results)}")
    
    asyncio.run(main())
