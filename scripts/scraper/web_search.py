"""
Web Search - General web search for tool information using DuckDuckGo
Enhanced with AI-powered tool extraction and comprehensive metadata
"""
import os
import json
import httpx
from bs4 import BeautifulSoup
from typing import Optional
import asyncio
import re
from datetime import datetime


PRICING_PATTERNS = [
    r'\$(\d+(?:\.\d{2})?)\s*(?:/\s*(?:mo|month|user|seat))?',
    r'(\d+)\s*(?:USD|dollars?)\s*(?:per\s*)?(?:month|mo|user)?',
    r'free\s*(?:tier|plan|forever)?',
    r'open\s*source',
    r'(?:starts?\s*(?:at|from)\s*)?\$(\d+)',
]

FEATURE_KEYWORDS = [
    "ai-powered", "real-time", "collaboration", "api", "sdk", "cli",
    "self-hosted", "cloud", "serverless", "edge", "typescript",
    "react", "vue", "svelte", "next.js", "authentication", "database",
    "analytics", "monitoring", "testing", "deployment", "ci/cd",
    "open source", "enterprise", "team", "solo", "free tier",
]

INTEGRATION_PATTERNS = [
    r'integrat(?:es?|ion)\s+with\s+([^.]+)',
    r'works\s+with\s+([^.]+)',
    r'connect(?:s)?\s+to\s+([^.]+)',
    r'support(?:s)?\s+([^.]+)',
]


def extract_pricing_info(text: str) -> dict:
    """Extract pricing information from text."""
    text_lower = text.lower()
    pricing = {
        "has_free_tier": False,
        "is_open_source": False,
        "prices_found": [],
    }
    
    if "free" in text_lower and any(x in text_lower for x in ["tier", "plan", "forever", "trial"]):
        pricing["has_free_tier"] = True
    
    if "open source" in text_lower or "open-source" in text_lower:
        pricing["is_open_source"] = True
    
    for pattern in PRICING_PATTERNS:
        matches = re.findall(pattern, text_lower)
        for match in matches:
            if match and match not in pricing["prices_found"]:
                pricing["prices_found"].append(match)
    
    return pricing


def extract_features(text: str) -> list[str]:
    """Extract feature keywords from text."""
    text_lower = text.lower()
    found_features = []
    
    for feature in FEATURE_KEYWORDS:
        if feature in text_lower:
            found_features.append(feature)
    
    return found_features


def extract_integrations(text: str) -> list[str]:
    """Extract integration mentions from text."""
    integrations = []
    
    for pattern in INTEGRATION_PATTERNS:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            items = re.split(r',\s*|\s+and\s+|\s+or\s+', match)
            integrations.extend([i.strip() for i in items if len(i.strip()) > 2])
    
    return list(set(integrations))[:20]


async def search_duckduckgo(client: httpx.AsyncClient, query: str, max_results: int = 5) -> list:
    """Search DuckDuckGo for information about a tool."""
    # Use DuckDuckGo HTML search (no API key needed)
    url = "https://html.duckduckgo.com/html/"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    }
    
    try:
        response = await client.post(url, data={"q": query}, headers=headers)
        if response.status_code != 200:
            return []
        
        soup = BeautifulSoup(response.text, "lxml")
        results = []
        
        for result in soup.select(".result")[:max_results]:
            title_elem = result.select_one(".result__title")
            snippet_elem = result.select_one(".result__snippet")
            link_elem = result.select_one(".result__url")
            
            if title_elem:
                # Extract actual URL from DuckDuckGo redirect
                link = ""
                a_tag = title_elem.select_one("a")
                if a_tag and a_tag.get("href"):
                    href = a_tag.get("href", "")
                    # DuckDuckGo uses redirect URLs, extract the actual URL
                    if "uddg=" in href:
                        import urllib.parse
                        parsed = urllib.parse.parse_qs(urllib.parse.urlparse(href).query)
                        link = parsed.get("uddg", [""])[0]
                    else:
                        link = href
                
                results.append({
                    "title": title_elem.get_text(strip=True),
                    "snippet": snippet_elem.get_text(strip=True) if snippet_elem else "",
                    "url": link,
                })
        
        return results
    except Exception as e:
        print(f"Search error for '{query}': {e}")
        return []


async def scrape_tool_website(client: httpx.AsyncClient, url: str) -> dict:
    """Scrape comprehensive metadata from a tool's website."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }
    
    try:
        response = await client.get(url, headers=headers, follow_redirects=True, timeout=15.0)
        if response.status_code != 200:
            return {"error": f"HTTP {response.status_code}"}
        
        soup = BeautifulSoup(response.text, "lxml")
        page_text = soup.get_text(separator=" ", strip=True)
        
        title = soup.title.string if soup.title else None
        
        meta_desc = soup.find("meta", attrs={"name": "description"})
        description = meta_desc.get("content") if meta_desc else None
        
        og_title = soup.find("meta", property="og:title")
        og_desc = soup.find("meta", property="og:description")
        og_image = soup.find("meta", property="og:image")
        og_type = soup.find("meta", property="og:type")
        og_site = soup.find("meta", property="og:site_name")
        
        twitter_title = soup.find("meta", attrs={"name": "twitter:title"})
        twitter_desc = soup.find("meta", attrs={"name": "twitter:description"})
        twitter_image = soup.find("meta", attrs={"name": "twitter:image"})
        twitter_creator = soup.find("meta", attrs={"name": "twitter:creator"})
        
        meta_keywords = soup.find("meta", attrs={"name": "keywords"})
        keywords = meta_keywords.get("content").split(",") if meta_keywords and meta_keywords.get("content") else []
        
        pricing_info = extract_pricing_info(page_text)
        features = extract_features(page_text)
        integrations = extract_integrations(page_text)
        
        github_links = []
        for a in soup.find_all("a", href=True):
            href = a.get("href", "")
            if "github.com" in href and href not in github_links:
                github_links.append(href)
        
        social_links = {}
        for a in soup.find_all("a", href=True):
            href = a.get("href", "")
            if "twitter.com" in href or "x.com" in href:
                social_links["twitter"] = href
            elif "discord" in href:
                social_links["discord"] = href
            elif "linkedin.com" in href:
                social_links["linkedin"] = href
            elif "youtube.com" in href:
                social_links["youtube"] = href
        
        docs_link = None
        for a in soup.find_all("a", href=True):
            text = a.get_text(strip=True).lower()
            href = a.get("href", "")
            if any(x in text for x in ["docs", "documentation", "api reference"]):
                docs_link = href if href.startswith("http") else f"{url.rstrip('/')}/{href.lstrip('/')}"
                break
        
        pricing_link = None
        for a in soup.find_all("a", href=True):
            text = a.get_text(strip=True).lower()
            href = a.get("href", "")
            if "pricing" in text or "pricing" in href:
                pricing_link = href if href.startswith("http") else f"{url.rstrip('/')}/{href.lstrip('/')}"
                break
        
        changelog_link = None
        for a in soup.find_all("a", href=True):
            text = a.get_text(strip=True).lower()
            href = a.get("href", "")
            if any(x in text or x in href for x in ["changelog", "releases", "what's new"]):
                changelog_link = href if href.startswith("http") else f"{url.rstrip('/')}/{href.lstrip('/')}"
                break
        
        schema_org = None
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                schema_org = json.loads(script.string)
                break
            except:
                pass
        
        return {
            "url": str(response.url),
            "title": title,
            "description": description,
            "og": {
                "title": og_title.get("content") if og_title else None,
                "description": og_desc.get("content") if og_desc else None,
                "image": og_image.get("content") if og_image else None,
                "type": og_type.get("content") if og_type else None,
                "site_name": og_site.get("content") if og_site else None,
            },
            "twitter": {
                "title": twitter_title.get("content") if twitter_title else None,
                "description": twitter_desc.get("content") if twitter_desc else None,
                "image": twitter_image.get("content") if twitter_image else None,
                "creator": twitter_creator.get("content") if twitter_creator else None,
            },
            "keywords": [k.strip() for k in keywords[:20]],
            "pricing": pricing_info,
            "features_detected": features,
            "integrations_detected": integrations,
            "github_links": github_links[:5],
            "social_links": social_links,
            "docs_url": docs_link,
            "pricing_url": pricing_link,
            "changelog_url": changelog_link,
            "schema_org": schema_org,
            "scraped_at": datetime.now().isoformat(),
        }
    except Exception as e:
        return {"error": str(e)}


async def search_tool_info(tool_name: str, tool_url: Optional[str] = None) -> dict:
    """Search for comprehensive information about a tool."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        result = {
            "name": tool_name,
            "search_results": [],
            "website_metadata": None,
        }
        
        # Search for the tool
        queries = [
            f"{tool_name} developer tool",
            f"{tool_name} pricing features",
            f"{tool_name} vs alternatives comparison",
        ]
        
        for query in queries:
            search_results = await search_duckduckgo(client, query, max_results=3)
            result["search_results"].extend(search_results)
            await asyncio.sleep(1)  # Rate limiting
        
        # Scrape the tool's website if provided
        if tool_url:
            result["website_metadata"] = await scrape_tool_website(client, tool_url)
        
        return result


async def search_multiple_tools(tools: list[dict]) -> dict:
    """Search for information about multiple tools."""
    results = {}
    
    for tool in tools:
        name = tool.get("name")
        url = tool.get("url")
        
        print(f"Searching for: {name}")
        results[name] = await search_tool_info(name, url)
        await asyncio.sleep(2)  # Rate limiting between tools
    
    return results


# Tools to search for - Comprehensive list
TOOLS_TO_SEARCH = [
    # AI Coding Assistants - IDE Extensions
    {"name": "Cursor", "url": "https://cursor.com"},
    {"name": "Windsurf", "url": "https://codeium.com/windsurf"},
    {"name": "GitHub Copilot", "url": "https://github.com/features/copilot"},
    {"name": "Codeium", "url": "https://codeium.com"},
    {"name": "Tabnine", "url": "https://www.tabnine.com"},
    {"name": "Amazon Q Developer", "url": "https://aws.amazon.com/q/developer/"},
    {"name": "Sourcegraph Cody", "url": "https://sourcegraph.com/cody"},
    {"name": "Continue", "url": "https://continue.dev"},
    {"name": "Supermaven", "url": "https://supermaven.com"},
    {"name": "Codium AI", "url": "https://www.codium.ai"},
    
    # AI Coding Assistants - CLI/Terminal
    {"name": "Aider", "url": "https://aider.chat"},
    {"name": "Claude Code", "url": "https://www.anthropic.com/claude-code"},
    {"name": "Cline", "url": "https://cline.bot"},
    {"name": "OpenHands", "url": "https://www.all-hands.dev"},
    {"name": "Goose", "url": "https://block.github.io/goose/"},
    {"name": "Gemini CLI", "url": "https://github.com/google-gemini/gemini-cli"},
    {"name": "Roo Code", "url": "https://roocode.com"},
    {"name": "Kilocode", "url": "https://kilocode.ai"},
    {"name": "Mentat", "url": "https://mentat.ai"},
    {"name": "GPT Engineer", "url": "https://gptengineer.app"},
    
    # AI App Builders
    {"name": "Bolt.new", "url": "https://bolt.new"},
    {"name": "Lovable", "url": "https://lovable.dev"},
    {"name": "v0 by Vercel", "url": "https://v0.dev"},
    {"name": "Replit", "url": "https://replit.com"},
    {"name": "Devin AI", "url": "https://devin.ai"},
    {"name": "Kiro", "url": "https://kiro.dev"},
    {"name": "Create", "url": "https://www.create.xyz"},
    {"name": "Softgen", "url": "https://softgen.ai"},
    {"name": "Marblism", "url": "https://marblism.com"},
    {"name": "Lazy AI", "url": "https://www.getlazy.ai"},
    
    # Databases & BaaS
    {"name": "Supabase", "url": "https://supabase.com"},
    {"name": "Convex", "url": "https://convex.dev"},
    {"name": "Firebase", "url": "https://firebase.google.com"},
    {"name": "Neon", "url": "https://neon.tech"},
    {"name": "Turso", "url": "https://turso.tech"},
    {"name": "PlanetScale", "url": "https://planetscale.com"},
    {"name": "Xata", "url": "https://xata.io"},
    {"name": "Upstash", "url": "https://upstash.com"},
    {"name": "MongoDB Atlas", "url": "https://www.mongodb.com/atlas"},
    {"name": "CockroachDB", "url": "https://www.cockroachlabs.com"},
    
    # Authentication
    {"name": "Clerk", "url": "https://clerk.com"},
    {"name": "Auth0", "url": "https://auth0.com"},
    {"name": "Kinde", "url": "https://kinde.com"},
    {"name": "Lucia", "url": "https://lucia-auth.com"},
    {"name": "WorkOS", "url": "https://workos.com"},
    {"name": "Stytch", "url": "https://stytch.com"},
    {"name": "Descope", "url": "https://www.descope.com"},
    
    # Hosting & Deployment
    {"name": "Vercel", "url": "https://vercel.com"},
    {"name": "Netlify", "url": "https://www.netlify.com"},
    {"name": "Railway", "url": "https://railway.app"},
    {"name": "Fly.io", "url": "https://fly.io"},
    {"name": "Render", "url": "https://render.com"},
    {"name": "Cloudflare Pages", "url": "https://pages.cloudflare.com"},
    {"name": "Deno Deploy", "url": "https://deno.com/deploy"},
    {"name": "SST", "url": "https://sst.dev"},
    
    # AI/LLM Infrastructure
    {"name": "OpenAI", "url": "https://openai.com"},
    {"name": "Anthropic", "url": "https://anthropic.com"},
    {"name": "Groq", "url": "https://groq.com"},
    {"name": "Together AI", "url": "https://together.ai"},
    {"name": "Fireworks AI", "url": "https://fireworks.ai"},
    {"name": "Replicate", "url": "https://replicate.com"},
    {"name": "Modal", "url": "https://modal.com"},
    {"name": "Ollama", "url": "https://ollama.ai"},
    {"name": "LM Studio", "url": "https://lmstudio.ai"},
    
    # AI Frameworks
    {"name": "LangChain", "url": "https://langchain.com"},
    {"name": "LlamaIndex", "url": "https://llamaindex.ai"},
    {"name": "Vercel AI SDK", "url": "https://sdk.vercel.ai"},
    {"name": "Instructor", "url": "https://python.useinstructor.com"},
    {"name": "Mastra", "url": "https://mastra.ai"},
    {"name": "CrewAI", "url": "https://crewai.com"},
    {"name": "AutoGen", "url": "https://microsoft.github.io/autogen/"},
    
    # UI & Design
    {"name": "shadcn/ui", "url": "https://ui.shadcn.com"},
    {"name": "Tailwind CSS", "url": "https://tailwindcss.com"},
    {"name": "Radix UI", "url": "https://radix-ui.com"},
    {"name": "Chakra UI", "url": "https://chakra-ui.com"},
    {"name": "Framer Motion", "url": "https://framer.com/motion"},
    {"name": "Magic UI", "url": "https://magicui.design"},
    {"name": "Aceternity UI", "url": "https://ui.aceternity.com"},
    
    # ORMs & Data
    {"name": "Prisma", "url": "https://prisma.io"},
    {"name": "Drizzle ORM", "url": "https://orm.drizzle.team"},
    {"name": "Kysely", "url": "https://kysely.dev"},
    {"name": "tRPC", "url": "https://trpc.io"},
    {"name": "TanStack Query", "url": "https://tanstack.com/query"},
    
    # Testing
    {"name": "Vitest", "url": "https://vitest.dev"},
    {"name": "Playwright", "url": "https://playwright.dev"},
    {"name": "Cypress", "url": "https://cypress.io"},
    {"name": "Testing Library", "url": "https://testing-library.com"},
    
    # Monitoring & Analytics
    {"name": "Sentry", "url": "https://sentry.io"},
    {"name": "PostHog", "url": "https://posthog.com"},
    {"name": "Axiom", "url": "https://axiom.co"},
    {"name": "LogSnag", "url": "https://logsnag.com"},
    {"name": "BetterStack", "url": "https://betterstack.com"},
    
    # Background Jobs & Workflows
    {"name": "Inngest", "url": "https://inngest.com"},
    {"name": "Trigger.dev", "url": "https://trigger.dev"},
    {"name": "Temporal", "url": "https://temporal.io"},
    {"name": "QStash", "url": "https://upstash.com/qstash"},
    
    # Email & Communications
    {"name": "Resend", "url": "https://resend.com"},
    {"name": "React Email", "url": "https://react.email"},
    {"name": "Loops", "url": "https://loops.so"},
    {"name": "Novu", "url": "https://novu.co"},
    
    # Payments
    {"name": "Stripe", "url": "https://stripe.com"},
    {"name": "Lemon Squeezy", "url": "https://lemonsqueezy.com"},
    {"name": "Paddle", "url": "https://paddle.com"},
]


DISCOVERY_SEARCH_QUERIES = [
    "best AI coding assistants 2025",
    "new developer tools 2025",
    "AI code generation tools",
    "vibe coding tools",
    "best alternatives to cursor",
    "best alternatives to copilot",
    "open source AI coding tools",
    "serverless database comparison",
    "best authentication providers",
    "AI app builders no code",
    "best backend as a service",
    "developer productivity tools",
    "AI pair programming tools",
    "code completion AI tools",
    "LLM development frameworks",
]


if __name__ == "__main__":
    async def main():
        results = await search_multiple_tools(TOOLS_TO_SEARCH)
        
        output_path = os.path.join(os.path.dirname(__file__), "data", "web_search.json")
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        
        print(f"\nSaved search results for {len(results)} tools to {output_path}")
    
    asyncio.run(main())
