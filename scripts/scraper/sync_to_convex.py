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
    "llm": "llms",
    "local_llm": "llms",
    "api": "backend",
    "mlops": "observability",
    "vector_db": "databases",
    "image_gen": "ai-assistants",
    "audio": "ai-assistants",
    "video": "ai-assistants",
    "writing": "ai-assistants",
    "productivity": "ai-assistants",
    "automation": "ai-assistants",
    "enterprise": "ai-assistants",
}

DEFAULT_CATEGORY = "ai-assistants"

EXCLUDED_URL_PATTERNS = [
    "/blog/",
    "/article/",
    "/post/",
    "/posts/",
    "/news/",
    "/guide/",
    "/guides/",
    "/tutorial/",
    "/tutorials/",
    "/learn/",
    "/docs/",
    "/documentation/",
    "/wiki/",
    "/help/",
    "/faq/",
    "/about/",
    "/pricing/",
    "/contact/",
    "/terms/",
    "/privacy/",
    "/legal/",
    "/careers/",
    "/jobs/",
    "/press/",
    "/media/",
    "/events/",
    "/webinar/",
    "/podcast/",
    "/video/",
    "/changelog/",
    "/release-notes/",
    "/updates/",
    "/announcements/",
    "/case-study/",
    "/case-studies/",
    "/customer-stories/",
    "/testimonials/",
    "/reviews/",
    "/comparison/",
    "/vs/",
    "/alternatives/",
    "medium.com/",
    "dev.to/",
    "hashnode.com/",
    "substack.com/",
    "wordpress.com/",
    "blogger.com/",
    "tumblr.com/",
]

EXCLUDED_NAME_PATTERNS = [
    "how to",
    "how-to",
    "guide to",
    "tutorial",
    "introduction to",
    "getting started",
    "best practices",
    "tips and tricks",
    "top 10",
    "top 5",
    "i tested",
    "we tested",
    "review:",
    "comparison:",
    "vs.",
    "versus",
    "alternatives",
    "alternative to",
    "build a",
    "create a",
    "make a",
    "develop a",
    "implement a",
    "design a",
]

def is_excluded_url(url: str) -> bool:
    url_lower = url.lower()
    for pattern in EXCLUDED_URL_PATTERNS:
        if pattern in url_lower:
            return True
    return False

def is_excluded_name(name: str) -> bool:
    name_lower = name.lower()
    for pattern in EXCLUDED_NAME_PATTERNS:
        if pattern in name_lower:
            return True
    if len(name) > 80:
        return True
    return False

MCP_CATEGORY_MAPPING = {
    "database": "database",
    "api": "api",
    "devtools": "devtools",
    "productivity": "productivity",
    "ai": "ai",
    "cloud": "cloud",
    "analytics": "analytics",
    "security": "security",
    "communication": "communication",
    "file_system": "file_system",
    "version_control": "version_control",
    "documentation": "documentation",
    "testing": "testing",
    "deployment": "deployment",
    "other": "other",
}

TAG_RULES = {
    "use-case": {
        "web-development": ["web", "website", "frontend", "backend", "fullstack", "html", "css", "dom"],
        "mobile-development": ["mobile", "ios", "android", "react-native", "flutter", "swift", "kotlin"],
        "api-development": ["api", "rest", "graphql", "grpc", "endpoint", "swagger", "openapi"],
        "data-science": ["data", "analytics", "visualization", "pandas", "numpy", "jupyter", "notebook"],
        "machine-learning": ["ml", "machine learning", "deep learning", "neural", "tensorflow", "pytorch", "model"],
        "devops": ["devops", "ci/cd", "pipeline", "deployment", "infrastructure", "container", "kubernetes", "docker"],
        "testing": ["test", "testing", "unit test", "e2e", "integration", "qa", "quality"],
        "documentation": ["docs", "documentation", "readme", "wiki", "markdown", "jsdoc", "typedoc"],
        "automation": ["automate", "automation", "workflow", "script", "task", "cron", "schedule"],
        "monitoring": ["monitor", "observability", "logging", "metrics", "tracing", "apm", "alerting"],
        "security": ["security", "auth", "authentication", "authorization", "encrypt", "vulnerability", "scan"],
        "database": ["database", "db", "sql", "nosql", "query", "orm", "migration"],
        "realtime": ["realtime", "real-time", "websocket", "socket", "live", "streaming", "pubsub"],
        "ai-coding": ["ai coding", "code generation", "copilot", "autocomplete", "code assist", "pair programming"],
    },
    "tech-stack": {
        "typescript": ["typescript", "ts", ".ts", "tsc"],
        "javascript": ["javascript", "js", "node", "npm", "yarn", "pnpm"],
        "python": ["python", "py", "pip", "conda", "django", "flask", "fastapi"],
        "go": ["golang", "go ", " go", "go-"],
        "rust": ["rust", "cargo", "rustc"],
        "java": ["java", "jvm", "maven", "gradle", "spring"],
        "ruby": ["ruby", "rails", "gem", "bundler"],
        "php": ["php", "laravel", "symfony", "composer"],
        "swift": ["swift", "swiftui", "xcode", "ios"],
        "kotlin": ["kotlin", "android", "jetpack"],
        "react": ["react", "jsx", "next.js", "nextjs", "gatsby", "remix"],
        "vue": ["vue", "vuejs", "nuxt", "vite"],
        "svelte": ["svelte", "sveltekit"],
        "angular": ["angular", "ng-", "rxjs"],
    },
    "platform": {
        "vscode": ["vscode", "vs code", "visual studio code"],
        "jetbrains": ["jetbrains", "intellij", "webstorm", "pycharm", "phpstorm"],
        "neovim": ["neovim", "nvim", "vim"],
        "cursor": ["cursor"],
        "windsurf": ["windsurf", "codeium"],
        "browser": ["browser", "chrome", "firefox", "safari", "extension"],
        "cli": ["cli", "terminal", "command line", "shell", "bash", "zsh"],
        "cloud": ["aws", "azure", "gcp", "google cloud", "cloudflare", "vercel", "netlify"],
        "self-hosted": ["self-hosted", "self hosted", "on-premise", "docker", "kubernetes"],
    },
    "integration": {
        "github": ["github"],
        "gitlab": ["gitlab"],
        "bitbucket": ["bitbucket"],
        "slack": ["slack"],
        "discord": ["discord"],
        "notion": ["notion"],
        "linear": ["linear"],
        "jira": ["jira", "atlassian"],
        "figma": ["figma"],
        "vercel": ["vercel"],
        "supabase": ["supabase"],
        "firebase": ["firebase"],
        "stripe": ["stripe", "payment"],
        "openai": ["openai", "gpt", "chatgpt"],
        "anthropic": ["anthropic", "claude"],
    },
    "feature": {
        "open-source": ["open source", "open-source", "oss", "mit license", "apache license", "gpl"],
        "free-tier": ["free tier", "free plan", "freemium", "free to use"],
        "enterprise": ["enterprise", "team", "organization", "sso", "saml"],
        "offline": ["offline", "local", "no internet"],
        "multi-language": ["multi-language", "multilingual", "i18n", "internationalization"],
        "collaborative": ["collaborative", "collaboration", "multiplayer", "team", "shared"],
        "ai-powered": ["ai", "artificial intelligence", "llm", "gpt", "claude", "gemini", "copilot"],
        "mcp": ["mcp", "model context protocol"],
        "agent": ["agent", "agentic", "autonomous"],
    },
}


def generate_tags_from_metadata(tool: dict) -> list[str]:
    """Generate comprehensive tags based on tool metadata analysis."""
    tags = set()
    
    name = tool.get("name", "").lower()
    description = tool.get("description", "").lower()
    url = tool.get("url", "").lower() if tool.get("url") else ""
    category = tool.get("category", "").lower()
    
    metadata = tool.get("metadata", {}) or {}
    github_topics = metadata.get("github", {}).get("topics", []) if isinstance(metadata.get("github"), dict) else []
    npm_keywords = metadata.get("npm", {}).get("keywords", []) if isinstance(metadata.get("npm"), dict) else []
    
    searchable_text = f"{name} {description} {url} {category} {' '.join(github_topics)} {' '.join(npm_keywords)}"
    
    for tag_category, tag_rules in TAG_RULES.items():
        for tag_name, keywords in tag_rules.items():
            for keyword in keywords:
                if keyword.lower() in searchable_text:
                    tags.add(tag_name)
                    break
    
    for topic in github_topics:
        topic_lower = topic.lower().replace("_", "-")
        if len(topic_lower) > 2 and len(topic_lower) < 30:
            tags.add(topic_lower)
    
    for keyword in npm_keywords:
        keyword_lower = keyword.lower().replace("_", "-")
        if len(keyword_lower) > 2 and len(keyword_lower) < 30:
            tags.add(keyword_lower)
    
    if tool.get("githubUrl") or "github.com" in url:
        tags.add("open-source")
    
    pricing = metadata.get("pricing", {})
    if pricing.get("is_open_source"):
        tags.add("open-source")
    if pricing.get("has_free_tier"):
        tags.add("free-tier")
    
    if category:
        tags.add(category.replace("_", "-"))
    
    tags.add("developer-tools")
    
    return sorted(list(tags))[:20]

def determine_mcp_category(tool: dict) -> str:
    """Determine MCP server category from tool metadata."""
    name = tool.get("name", "").lower()
    url = tool.get("url", "").lower()
    description = tool.get("description", "").lower() if tool.get("description") else ""
    
    if any(x in name or x in url for x in ["postgres", "mysql", "sqlite", "mongo", "redis", "supabase", "neon", "planetscale", "database", "db"]):
        return "database"
    if any(x in name or x in url for x in ["github", "gitlab", "git", "bitbucket"]):
        return "version_control"
    if any(x in name or x in url for x in ["slack", "discord", "telegram", "whatsapp", "email", "gmail", "teams"]):
        return "communication"
    if any(x in name or x in url for x in ["notion", "linear", "jira", "asana", "todoist", "trello", "clickup"]):
        return "productivity"
    if any(x in name or x in url for x in ["vercel", "netlify", "railway", "render", "fly", "aws", "azure", "gcp", "cloudflare"]):
        return "deployment"
    if any(x in name or x in url for x in ["stripe", "twilio", "sendgrid", "mailchimp"]):
        return "api"
    if any(x in name or x in url for x in ["sentry", "datadog", "axiom", "analytics"]):
        return "analytics"
    if any(x in name or x in url for x in ["filesystem", "file", "drive", "dropbox", "storage"]):
        return "file_system"
    if any(x in name or x in url for x in ["browser", "puppeteer", "playwright", "selenium"]):
        return "devtools"
    if any(x in name or x in url for x in ["openai", "anthropic", "llm", "ai", "langchain", "ollama"]):
        return "ai"
    if any(x in name or x in url for x in ["docs", "documentation", "context7"]):
        return "documentation"
    if any(x in name or x in url for x in ["test", "jest", "pytest"]):
        return "testing"
    if any(x in name or x in url for x in ["auth", "security", "vault"]):
        return "security"
    
    return "other"


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
    
    if is_excluded_url(url) or is_excluded_name(name):
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
    
    tool_with_desc = {**tool, "description": description, "githubUrl": github_url}
    generated_tags = generate_tags_from_metadata(tool_with_desc)
    
    base_tags = ["ai-powered", "ai-coding"]
    if category:
        base_tags.append(category.replace("_", "-"))
    
    all_tags = list(set(base_tags + generated_tags))[:20]
    
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
        "tags": all_tags,
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


def transform_discovered_tool(tool: dict) -> Optional[dict]:
    """Transform a discovered tool (from awesome lists, directories, search) into Convex format."""
    name = tool.get("name", "")
    url = tool.get("url", "")
    
    if not name or not url:
        return None
    
    if len(name) < 2 or len(name) > 100:
        return None
    
    if not url.startswith("http"):
        return None
    
    if is_excluded_url(url) or is_excluded_name(name):
        return None
    
    description = tool.get("description", "") or f"{name} - Developer tool"
    
    tagline = description[:100] if description else f"{name} - Developer tool"
    if len(description) > 100:
        tagline = description[:97] + "..."
    
    category = tool.get("category", "")
    category_slug = CATEGORY_MAPPING.get(category, DEFAULT_CATEGORY)
    
    github_url = None
    if "github.com" in url:
        github_url = url
    
    is_mcp = "mcp" in name.lower() or "mcp" in url.lower() or category == "mcp"
    
    tool_with_desc = {**tool, "description": description, "githubUrl": github_url}
    generated_tags = generate_tags_from_metadata(tool_with_desc)
    
    base_tags = ["developer-tools"]
    if is_mcp:
        base_tags.append("mcp")
    if category:
        base_tags.append(category.replace("_", "-"))
    if github_url:
        base_tags.append("open-source")
    
    all_tags = list(set(base_tags + generated_tags))[:20]
    
    return {
        "name": name,
        "slug": slugify(name),
        "tagline": tagline,
        "description": description[:1000] if description else f"{name} is a developer tool.",
        "websiteUrl": url if "github.com" not in url else None,
        "githubUrl": github_url,
        "docsUrl": None,
        "categorySlug": category_slug,
        "pricingModel": "freemium",
        "githubStars": None,
        "pros": [],
        "cons": [],
        "bestFor": ["Developers"],
        "features": [],
        "tags": all_tags,
        "isOpenSource": github_url is not None,
    }


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
    awesome_list_tools = data.get("awesome_list_tools", [])
    mcp_directory_tools = data.get("mcp_directory_tools", [])
    discovered_tools = data.get("discovered_tools", [])
    
    results = {
        "processed": 0,
        "success": 0,
        "skipped": 0,
        "errors": [],
    }
    
    seen_slugs = set()
    
    async with httpx.AsyncClient() as client:
        print(f"\n--- Syncing {len(known_tools)} known tools ---")
        for tool in known_tools:
            tool_data = transform_vibe_tool(tool)
            if not tool_data:
                continue
            
            slug = tool_data.get("slug", "")
            if slug in seen_slugs:
                results["skipped"] += 1
                continue
            seen_slugs.add(slug)
            
            results["processed"] += 1
            print(f"Syncing: {tool_data['name']}")
            
            result = await upsert_tool(client, tool_data)
            
            if "error" in result:
                results["errors"].append(f"{tool_data['name']}: {result['error']}")
            else:
                results["success"] += 1
                print(f"  -> {result.get('action', 'done')}")
            
            await asyncio.sleep(0.3)
        
        print(f"\n--- Syncing {len(awesome_list_tools)} awesome list tools ---")
        for tool in awesome_list_tools:
            tool_data = transform_discovered_tool(tool)
            if not tool_data:
                continue
            
            slug = tool_data.get("slug", "")
            if slug in seen_slugs:
                results["skipped"] += 1
                continue
            seen_slugs.add(slug)
            
            results["processed"] += 1
            if results["processed"] % 50 == 0:
                print(f"Progress: {results['processed']} processed, {results['success']} synced")
            
            result = await upsert_tool(client, tool_data)
            
            if "error" in result:
                results["errors"].append(f"{tool_data['name']}: {result['error']}")
            else:
                results["success"] += 1
            
            await asyncio.sleep(0.1)
        
        print(f"\n--- Syncing {len(mcp_directory_tools)} MCP directory tools ---")
        for tool in mcp_directory_tools:
            tool["category"] = "mcp"
            tool_data = transform_discovered_tool(tool)
            if not tool_data:
                continue
            
            slug = tool_data.get("slug", "")
            if slug in seen_slugs:
                results["skipped"] += 1
                continue
            seen_slugs.add(slug)
            
            results["processed"] += 1
            
            result = await upsert_tool(client, tool_data)
            
            if "error" in result:
                results["errors"].append(f"{tool_data['name']}: {result['error']}")
            else:
                results["success"] += 1
            
            await asyncio.sleep(0.1)
        
        print(f"\n--- Syncing {len(discovered_tools)} discovered tools ---")
        for tool in discovered_tools:
            tool_data = transform_discovered_tool(tool)
            if not tool_data:
                continue
            
            slug = tool_data.get("slug", "")
            if slug in seen_slugs:
                results["skipped"] += 1
                continue
            seen_slugs.add(slug)
            
            results["processed"] += 1
            
            result = await upsert_tool(client, tool_data)
            
            if "error" in result:
                results["errors"].append(f"{tool_data['name']}: {result['error']}")
            else:
                results["success"] += 1
            
            await asyncio.sleep(0.1)
    
    print(f"\nTotal: {results['processed']} processed, {results['success']} synced, {results['skipped']} skipped (duplicates)")
    return results


def transform_mcp_tool(tool: dict) -> Optional[dict]:
    """Transform a scraped MCP tool into Convex mcpServers format."""
    name = tool.get("name", "")
    url = tool.get("url", "")
    
    if not name or not url:
        return None
    
    if not name.lower().endswith("mcp") and "mcp" not in name.lower():
        name = f"{name}"
    
    metadata = tool.get("metadata", {})
    
    description = ""
    if metadata:
        description = metadata.get("description") or metadata.get("og_title") or ""
    if not description:
        description = tool.get("description", f"{name} - MCP server for AI assistants")
    
    short_description = description[:100] if description else f"{name} MCP server"
    if len(description) > 100:
        short_description = description[:97] + "..."
    
    github_url = None
    if "github.com" in url:
        github_url = url
    elif metadata and metadata.get("github_url"):
        github_url = metadata["github_url"]
    
    category = determine_mcp_category(tool)
    
    tool_with_desc = {**tool, "description": description, "githubUrl": github_url}
    generated_tags = generate_tags_from_metadata(tool_with_desc)
    
    base_tags = ["mcp", "ai-powered", "automation"]
    if category != "other":
        base_tags.append(category.replace("_", "-"))
    if github_url:
        base_tags.append("open-source")
    
    all_tags = list(set(base_tags + generated_tags))[:20]
    
    return {
        "name": name,
        "slug": slugify(name),
        "description": description[:1000] if description else f"{name} is an MCP server for AI assistants.",
        "shortDescription": short_description,
        "websiteUrl": url if "github.com" not in url else None,
        "githubUrl": github_url,
        "docsUrl": metadata.get("docs_url") if metadata else None,
        "author": None,
        "category": category,
        "transportTypes": ["stdio"],
        "tags": all_tags,
        "isOfficial": "modelcontextprotocol" in url.lower() if url else False,
        "isVerified": False,
        "isFeatured": False,
    }


async def upsert_mcp_server(client: httpx.AsyncClient, server_data: dict) -> dict:
    """Upsert a single MCP server to Convex."""
    if not CONVEX_URL or not CONVEX_DEPLOY_KEY:
        return {"error": "Missing CONVEX_URL or CONVEX_DEPLOY_KEY"}
    
    url = f"{CONVEX_URL}/api/mutation"
    
    headers = {
        "Authorization": f"Convex {CONVEX_DEPLOY_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "path": "mcpServers:upsertMcpServer",
        "args": server_data,
    }
    
    try:
        response = await client.post(url, json=payload, headers=headers, timeout=30.0)
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": f"HTTP {response.status_code}: {response.text}"}
    except Exception as e:
        return {"error": str(e)}


async def sync_mcp_servers():
    """Sync MCP servers from scraped data to Convex."""
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    vibe_tools_path = os.path.join(data_dir, "vibe_tools.json")
    
    if not os.path.exists(vibe_tools_path):
        print(f"No vibe tools data found at {vibe_tools_path}")
        return {"error": "No data file found"}
    
    with open(vibe_tools_path, "r") as f:
        data = json.load(f)
    
    known_tools = data.get("known_tools", [])
    mcp_tools = [t for t in known_tools if t.get("category") == "mcp"]
    
    results = {
        "processed": 0,
        "success": 0,
        "errors": [],
    }
    
    async with httpx.AsyncClient() as client:
        for tool in mcp_tools:
            server_data = transform_mcp_tool(tool)
            if not server_data:
                continue
            
            results["processed"] += 1
            print(f"Syncing MCP: {server_data['name']}")
            
            result = await upsert_mcp_server(client, server_data)
            
            if "error" in result:
                results["errors"].append(f"{server_data['name']}: {result['error']}")
                print(f"  -> ERROR: {result['error'][:50]}")
            else:
                results["success"] += 1
                action = result.get("value", {}).get("action", "done")
                print(f"  -> {action}")
            
            await asyncio.sleep(0.3)
    
    return results


async def sync_all_scraped_tools():
    """Sync all scraped tools from various sources to Convex."""
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    
    results = {
        "vibe_tools": None,
        "mcp_servers": None,
        "total_synced": 0,
        "total_errors": 0,
    }
    
    vibe_result = await sync_vibe_tools()
    results["vibe_tools"] = vibe_result
    results["total_synced"] += vibe_result.get("success", 0)
    results["total_errors"] += len(vibe_result.get("errors", []))
    
    return results


async def sync_mcp_only():
    """Sync only MCP servers to Convex."""
    results = {
        "mcp_servers": None,
        "total_synced": 0,
        "total_errors": 0,
    }
    
    mcp_result = await sync_mcp_servers()
    results["mcp_servers"] = mcp_result
    results["total_synced"] += mcp_result.get("success", 0)
    results["total_errors"] += len(mcp_result.get("errors", []))
    
    return results


def main():
    """Main entry point."""
    import sys
    
    if not CONVEX_URL:
        print("ERROR: CONVEX_URL environment variable not set")
        print("Set it to your Convex deployment URL (e.g., https://your-deployment.convex.cloud)")
        return
    
    if not CONVEX_DEPLOY_KEY:
        print("ERROR: CONVEX_DEPLOY_KEY environment variable not set")
        print("Get your deploy key from the Convex dashboard")
        return
    
    mcp_only = "--mcp" in sys.argv or "--mcp-only" in sys.argv
    
    print("=" * 50)
    if mcp_only:
        print("SYNCING MCP SERVERS TO CONVEX")
    else:
        print("SYNCING SCRAPED TOOLS TO CONVEX")
    print("=" * 50)
    print(f"Convex URL: {CONVEX_URL}")
    print()
    
    if mcp_only:
        results = asyncio.run(sync_mcp_only())
    else:
        results = asyncio.run(sync_all_scraped_tools())
    
    print()
    print("=" * 50)
    print("SYNC COMPLETE")
    print("=" * 50)
    print(f"Total synced: {results['total_synced']}")
    print(f"Total errors: {results['total_errors']}")
    
    if results.get("mcp_servers", {}).get("errors"):
        print("\nMCP Server Errors:")
        for error in results["mcp_servers"]["errors"][:10]:
            print(f"  - {error}")
    
    if results.get("vibe_tools", {}).get("errors"):
        print("\nVibe Tool Errors:")
        for error in results["vibe_tools"]["errors"][:10]:
            print(f"  - {error}")


if __name__ == "__main__":
    main()
