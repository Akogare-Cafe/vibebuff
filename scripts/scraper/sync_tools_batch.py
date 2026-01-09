"""
Batch sync tools to Convex using transformed data.
Outputs JSON batches that can be used with the Convex MCP.
"""
import json
import re
import os

CATEGORY_MAPPING = {
    "orchestration": "cli-agents",
    "cli_agent": "cli-agents",
    "ide": "ides",
    "extension": "ai-assistants",
    "autonomous": "vibe-coding",
    "app_builder": "vibe-coding",
    "framework": "backend",
    "mcp": "mcp-servers",
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
    "research": "ai-assistants",
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

def is_article(url: str, name: str) -> bool:
    return is_excluded_url(url) or is_excluded_name(name)

def determine_article_type(url: str, name: str) -> str:
    url_lower = url.lower()
    name_lower = name.lower()
    
    if "/tutorial" in url_lower or "tutorial" in name_lower:
        return "tutorial"
    if "/guide" in url_lower or "guide" in name_lower or "how to" in name_lower or "how-to" in name_lower:
        return "guide"
    if "/comparison" in url_lower or "/vs/" in url_lower or "vs." in name_lower or "alternatives" in name_lower or "comparison" in name_lower:
        return "comparison"
    if "/review" in url_lower or "review" in name_lower or "tested" in name_lower:
        return "review"
    if "/news/" in url_lower or "/announcements/" in url_lower:
        return "news"
    if "/blog/" in url_lower or "medium.com" in url_lower or "dev.to" in url_lower:
        return "blog"
    if "/docs/" in url_lower or "/documentation/" in url_lower:
        return "documentation"
    return "other"

def extract_source_from_url(url: str) -> str:
    try:
        from urllib.parse import urlparse
        parsed = urlparse(url)
        domain = parsed.netloc.replace("www.", "")
        return domain
    except:
        return ""

def extract_related_tool_slugs(name: str, description: str = "") -> list:
    text = f"{name} {description}".lower()
    tool_keywords = [
        "cursor", "windsurf", "claude", "gpt", "copilot", "codeium", "tabnine",
        "replit", "v0", "bolt", "lovable", "vercel", "netlify", "supabase",
        "convex", "firebase", "prisma", "drizzle", "nextjs", "react", "vue",
        "angular", "svelte", "tailwind", "shadcn", "radix", "langchain",
        "openai", "anthropic", "gemini", "ollama", "llama", "mistral"
    ]
    found = []
    for keyword in tool_keywords:
        if keyword in text:
            found.append(keyword)
    return found

def slugify(name: str) -> str:
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    slug = re.sub(r'[\s_]+', '-', slug)
    slug = re.sub(r'-+', '-', slug)
    slug = slug.strip('-')
    return slug

def transform_known_tool(tool: dict) -> dict | None:
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
        description = f"{name} - Developer tool"
    
    tagline = description[:100] if description else f"{name} - Developer tool"
    if len(description) > 100:
        tagline = description[:97] + "..."
    
    features = []
    if metadata and metadata.get("features_detected"):
        features = metadata["features_detected"][:5]
    
    github_url = None
    if metadata and metadata.get("github_url"):
        github_url = metadata["github_url"]
    elif "github.com" in url:
        github_url = url
    
    website_url = url
    if "github.com" in url and github_url:
        website_url = url
    
    result = {
        "name": name,
        "slug": slugify(name),
        "tagline": tagline,
        "description": description[:1000] if description else f"{name} is a developer tool.",
        "websiteUrl": website_url,
        "categorySlug": category_slug,
        "pricingModel": "freemium",
        "pros": [],
        "cons": [],
        "bestFor": ["Developers"],
        "features": features if features else [],
        "tags": ["ai", "developer-tools", category] if category else ["ai", "developer-tools"],
        "isOpenSource": github_url is not None,
    }
    if github_url:
        result["githubUrl"] = github_url
    return result

def transform_discovered_tool(tool: dict) -> dict | None:
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
    if is_mcp:
        category_slug = "mcp-servers"
    
    tags = ["ai", "developer-tools"]
    if is_mcp:
        tags.append("mcp")
    if category:
        tags.append(category.replace("_", "-"))
    
    result = {
        "name": name,
        "slug": slugify(name),
        "tagline": tagline,
        "description": description[:1000] if description else f"{name} is a developer tool.",
        "websiteUrl": url,
        "categorySlug": category_slug,
        "pricingModel": "freemium",
        "pros": [],
        "cons": [],
        "bestFor": ["Developers"],
        "features": [],
        "tags": tags,
        "isOpenSource": github_url is not None,
    }
    if github_url:
        result["githubUrl"] = github_url
    return result

def transform_article(tool: dict) -> dict | None:
    name = tool.get("name", "")
    url = tool.get("url", "")
    description = tool.get("description", "")
    
    if not name or not url:
        return None
    
    if not url.startswith("http"):
        return None
    
    article_type = determine_article_type(url, name)
    source = extract_source_from_url(url)
    related_tool_slugs = extract_related_tool_slugs(name, description)
    
    tags = ["article"]
    if article_type != "other":
        tags.append(article_type)
    
    result = {
        "title": name[:200] if len(name) > 200 else name,
        "slug": slugify(name)[:100],
        "url": url,
        "articleType": article_type,
        "tags": tags,
        "relatedToolSlugs": related_tool_slugs,
    }
    if description:
        result["description"] = description[:500]
    if source:
        result["source"] = source
    return result

def main():
    data_dir = os.path.join(os.path.dirname(__file__), "data")
    vibe_tools_path = os.path.join(data_dir, "vibe_tools.json")
    
    with open(vibe_tools_path, "r") as f:
        data = json.load(f)
    
    known_tools = data.get("known_tools", [])
    awesome_list_tools = data.get("awesome_list_tools", [])
    mcp_directory_tools = data.get("mcp_directory_tools", [])
    discovered_tools = data.get("discovered_tools", [])
    
    all_tools = []
    all_articles = []
    seen_tool_slugs = set()
    seen_article_urls = set()
    
    def process_item(tool: dict, transform_func):
        name = tool.get("name", "")
        url = tool.get("url", "")
        
        if is_article(url, name):
            if url not in seen_article_urls:
                article = transform_article(tool)
                if article:
                    seen_article_urls.add(url)
                    all_articles.append(article)
            return None
        else:
            transformed = transform_func(tool)
            if transformed:
                slug = transformed["slug"]
                if slug not in seen_tool_slugs:
                    seen_tool_slugs.add(slug)
                    return transformed
        return None
    
    print(f"Processing {len(known_tools)} known tools...")
    for tool in known_tools:
        result = process_item(tool, transform_known_tool)
        if result:
            all_tools.append(result)
    
    print(f"Processing {len(awesome_list_tools)} awesome list tools...")
    for tool in awesome_list_tools:
        result = process_item(tool, transform_discovered_tool)
        if result:
            all_tools.append(result)
    
    print(f"Processing {len(mcp_directory_tools)} MCP directory tools...")
    for tool in mcp_directory_tools:
        tool["category"] = "mcp"
        result = process_item(tool, transform_discovered_tool)
        if result:
            all_tools.append(result)
    
    print(f"Processing {len(discovered_tools)} discovered tools...")
    for tool in discovered_tools:
        result = process_item(tool, transform_discovered_tool)
        if result:
            all_tools.append(result)
    
    print(f"\nTotal unique tools: {len(all_tools)}")
    print(f"Total unique articles: {len(all_articles)}")
    
    batch_size = 50
    tool_batches = []
    for i in range(0, len(all_tools), batch_size):
        batch = all_tools[i:i + batch_size]
        tool_batches.append(batch)
    
    print(f"Created {len(tool_batches)} tool batches of {batch_size} each")
    
    article_batches = []
    for i in range(0, len(all_articles), batch_size):
        batch = all_articles[i:i + batch_size]
        article_batches.append(batch)
    
    print(f"Created {len(article_batches)} article batches of {batch_size} each")
    
    tools_output_path = os.path.join(data_dir, "tools_batches.json")
    with open(tools_output_path, "w") as f:
        json.dump(tool_batches, f, indent=2)
    print(f"Saved tool batches to: {tools_output_path}")
    
    articles_output_path = os.path.join(data_dir, "articles_batches.json")
    with open(articles_output_path, "w") as f:
        json.dump(article_batches, f, indent=2)
    print(f"Saved article batches to: {articles_output_path}")
    
    return tool_batches, article_batches

if __name__ == "__main__":
    main()
