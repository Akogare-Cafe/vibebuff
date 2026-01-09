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
    seen_slugs = set()
    
    print(f"Processing {len(known_tools)} known tools...")
    for tool in known_tools:
        transformed = transform_known_tool(tool)
        if transformed:
            slug = transformed["slug"]
            if slug not in seen_slugs:
                seen_slugs.add(slug)
                all_tools.append(transformed)
    
    print(f"Processing {len(awesome_list_tools)} awesome list tools...")
    for tool in awesome_list_tools:
        transformed = transform_discovered_tool(tool)
        if transformed:
            slug = transformed["slug"]
            if slug not in seen_slugs:
                seen_slugs.add(slug)
                all_tools.append(transformed)
    
    print(f"Processing {len(mcp_directory_tools)} MCP directory tools...")
    for tool in mcp_directory_tools:
        tool["category"] = "mcp"
        transformed = transform_discovered_tool(tool)
        if transformed:
            slug = transformed["slug"]
            if slug not in seen_slugs:
                seen_slugs.add(slug)
                all_tools.append(transformed)
    
    print(f"Processing {len(discovered_tools)} discovered tools...")
    for tool in discovered_tools:
        transformed = transform_discovered_tool(tool)
        if transformed:
            slug = transformed["slug"]
            if slug not in seen_slugs:
                seen_slugs.add(slug)
                all_tools.append(transformed)
    
    print(f"\nTotal unique tools: {len(all_tools)}")
    
    batch_size = 50
    batches = []
    for i in range(0, len(all_tools), batch_size):
        batch = all_tools[i:i + batch_size]
        batches.append(batch)
    
    print(f"Created {len(batches)} batches of {batch_size} tools each")
    
    output_path = os.path.join(data_dir, "tools_batches.json")
    with open(output_path, "w") as f:
        json.dump(batches, f, indent=2)
    
    print(f"Saved batches to: {output_path}")
    
    return batches

if __name__ == "__main__":
    main()
