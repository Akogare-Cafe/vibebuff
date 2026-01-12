"""
GitHub Scraper - Fetches metadata about tools from GitHub repositories
"""
import os
import json
import httpx
from typing import Optional
from dotenv import load_dotenv
from bot_avoidance import (
    get_api_headers,
    random_delay,
    retry_with_backoff,
    RateLimiter,
    create_client_with_limits,
)

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

rate_limiter = RateLimiter(requests_per_minute=30)


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
    
    await rate_limiter.wait()
    
    headers = get_api_headers(
        api_key=GITHUB_TOKEN,
        extra_headers={
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
    )
    
    async def _fetch():
        return await client.get(url, headers=headers)
    
    try:
        response = await retry_with_backoff(_fetch, max_retries=3)
        
        if response.status_code == 200:
            data = response.json()
            await random_delay(0.3, 0.8)
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
    
    await rate_limiter.wait()
    
    headers = get_api_headers(
        api_key=GITHUB_TOKEN,
        extra_headers={
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
    )
    
    try:
        response = await client.get(url, headers=headers, params={"per_page": limit})
        if response.status_code == 200:
            releases = response.json()
            await random_delay(0.2, 0.5)
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
    
    await rate_limiter.wait()
    
    headers = get_api_headers(
        api_key=GITHUB_TOKEN,
        extra_headers={
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
    )
    
    try:
        response = await client.get(url, headers=headers, params={"per_page": limit})
        if response.status_code == 200:
            contributors = response.json()
            await random_delay(0.2, 0.5)
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
    
    async with create_client_with_limits(timeout=30.0) as client:
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


# Tool GitHub URLs - Comprehensive list
TOOL_GITHUB_URLS = [
    # IDEs & Editors
    "https://github.com/microsoft/vscode",
    "https://github.com/zed-industries/zed",
    "https://github.com/neovim/neovim",
    "https://github.com/helix-editor/helix",
    "https://github.com/lapce/lapce",
    
    # Frontend Frameworks
    "https://github.com/facebook/react",
    "https://github.com/vuejs/vue",
    "https://github.com/sveltejs/svelte",
    "https://github.com/angular/angular",
    "https://github.com/solidjs/solid",
    "https://github.com/preactjs/preact",
    "https://github.com/BuilderIO/qwik",
    "https://github.com/honojs/hono",
    
    # Meta-Frameworks
    "https://github.com/vercel/next.js",
    "https://github.com/nuxt/nuxt",
    "https://github.com/sveltejs/kit",
    "https://github.com/withastro/astro",
    "https://github.com/remix-run/remix",
    "https://github.com/redwoodjs/redwood",
    "https://github.com/blitz-js/blitz",
    
    # Runtimes
    "https://github.com/nodejs/node",
    "https://github.com/oven-sh/bun",
    "https://github.com/denoland/deno",
    
    # Languages
    "https://github.com/golang/go",
    "https://github.com/rust-lang/rust",
    "https://github.com/python/cpython",
    "https://github.com/elixir-lang/elixir",
    "https://github.com/ziglang/zig",
    
    # Databases & BaaS
    "https://github.com/supabase/supabase",
    "https://github.com/neondatabase/neon",
    "https://github.com/tursodatabase/libsql",
    "https://github.com/pocketbase/pocketbase",
    "https://github.com/appwrite/appwrite",
    "https://github.com/parse-community/parse-server",
    "https://github.com/directus/directus",
    
    # ORMs & Query Builders
    "https://github.com/prisma/prisma",
    "https://github.com/drizzle-team/drizzle-orm",
    "https://github.com/kysely-org/kysely",
    "https://github.com/typeorm/typeorm",
    
    # Authentication
    "https://github.com/nextauthjs/next-auth",
    "https://github.com/lucia-auth/lucia",
    "https://github.com/supertokens/supertokens-core",
    "https://github.com/ory/kratos",
    
    # UI Libraries
    "https://github.com/tailwindlabs/tailwindcss",
    "https://github.com/shadcn-ui/ui",
    "https://github.com/radix-ui/primitives",
    "https://github.com/mui/material-ui",
    "https://github.com/chakra-ui/chakra-ui",
    "https://github.com/mantinedev/mantine",
    "https://github.com/nextui-org/nextui",
    "https://github.com/ariakit/ariakit",
    
    # Animation
    "https://github.com/framer/motion",
    "https://github.com/pmndrs/react-spring",
    "https://github.com/formkit/auto-animate",
    
    # Testing
    "https://github.com/vitest-dev/vitest",
    "https://github.com/microsoft/playwright",
    "https://github.com/cypress-io/cypress",
    "https://github.com/testing-library/react-testing-library",
    
    # Monitoring & Analytics
    "https://github.com/getsentry/sentry",
    "https://github.com/PostHog/posthog",
    "https://github.com/plausible/analytics",
    "https://github.com/umami-software/umami",
    
    # API & Data Fetching
    "https://github.com/trpc/trpc",
    "https://github.com/TanStack/query",
    "https://github.com/socketio/socket.io",
    "https://github.com/apollographql/apollo-client",
    
    # Build Tools
    "https://github.com/vitejs/vite",
    "https://github.com/evanw/esbuild",
    "https://github.com/vercel/turbo",
    "https://github.com/biomejs/biome",
    "https://github.com/oxc-project/oxc",
    
    # AI/LLM
    "https://github.com/meta-llama/llama",
    "https://github.com/ollama/ollama",
    "https://github.com/ggerganov/llama.cpp",
    "https://github.com/langchain-ai/langchain",
    "https://github.com/run-llama/llama_index",
    "https://github.com/huggingface/transformers",
    "https://github.com/vllm-project/vllm",
    "https://github.com/lm-sys/FastChat",
    
    # AI Coding Assistants - CLI
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
    "https://github.com/TabbyML/tabby",
    "https://github.com/sourcegraph/cody",
    "https://github.com/mentat-ai/mentat",
    "https://github.com/sweepai/sweep",
    "https://github.com/e2b-dev/e2b",
    
    # AI App Builders
    "https://github.com/stackblitz/bolt.new",
    "https://github.com/gpt-engineer-org/gpt-engineer",
    
    # Background Jobs & Workflows
    "https://github.com/inngest/inngest",
    "https://github.com/triggerdotdev/trigger.dev",
    "https://github.com/temporalio/temporal",
    
    # Email
    "https://github.com/resend/react-email",
    "https://github.com/novuhq/novu",
    
    # State Management
    "https://github.com/pmndrs/zustand",
    "https://github.com/pmndrs/jotai",
    "https://github.com/statelyai/xstate",
    "https://github.com/nanostores/nanostores",
    
    # Forms & Validation
    "https://github.com/react-hook-form/react-hook-form",
    "https://github.com/colinhacks/zod",
    "https://github.com/fabian-hiller/valibot",
    
    # Deployment & Infrastructure
    "https://github.com/sst/sst",
    "https://github.com/pulumi/pulumi",
    "https://github.com/hashicorp/terraform",
    
    # Awesome Lists
    "https://github.com/filipecalegario/awesome-vibe-coding",
    "https://github.com/roboco-io/awesome-vibecoding",
    "https://github.com/no-fluff/awesome-vibe-coding",
    "https://github.com/sindresorhus/awesome",
    "https://github.com/enaqx/awesome-react",
    "https://github.com/vuejs/awesome-vue",
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
