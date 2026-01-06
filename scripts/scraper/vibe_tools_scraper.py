"""
Vibe Tools Scraper - Discovers AI coding workflow and orchestration tools
Scrapes directories, GitHub, and curated lists for vibe coding tools
"""
import os
import json
import httpx
from bs4 import BeautifulSoup
from typing import Optional
import asyncio
import re
from datetime import datetime
from urllib.parse import urljoin, urlparse


VIBE_TOOL_DIRECTORIES = [
    {
        "name": "Vibe Kanban Docs",
        "url": "https://www.vibekanban.com/docs",
        "type": "docs",
    },
    {
        "name": "Awesome AI Agents",
        "url": "https://github.com/e2b-dev/awesome-ai-agents",
        "type": "awesome_list",
    },
    {
        "name": "Awesome Claude Code",
        "url": "https://github.com/anthropics/claude-code-awesome",
        "type": "awesome_list",
    },
]

VIBE_TOOL_KEYWORDS = [
    "ai coding agent",
    "code agent",
    "coding assistant",
    "ai pair programming",
    "autonomous coding",
    "vibe coding",
    "code generation",
    "ai developer tool",
    "llm coding",
    "agentic coding",
    "code orchestration",
    "multi-agent coding",
    "parallel agents",
    "git worktree",
    "code review ai",
]

KNOWN_VIBE_TOOLS = [
    {"name": "Vibe Kanban", "url": "https://www.vibekanban.com", "category": "orchestration"},
    {"name": "Claude Code", "url": "https://www.anthropic.com/claude-code", "category": "cli_agent"},
    {"name": "Aider", "url": "https://aider.chat", "category": "cli_agent"},
    {"name": "Cursor", "url": "https://cursor.com", "category": "ide"},
    {"name": "Windsurf", "url": "https://codeium.com/windsurf", "category": "ide"},
    {"name": "Cline", "url": "https://cline.bot", "category": "extension"},
    {"name": "Continue", "url": "https://continue.dev", "category": "extension"},
    {"name": "GitHub Copilot", "url": "https://github.com/features/copilot", "category": "extension"},
    {"name": "Gemini CLI", "url": "https://github.com/google-gemini/gemini-cli", "category": "cli_agent"},
    {"name": "OpenHands", "url": "https://www.all-hands.dev", "category": "autonomous"},
    {"name": "Devin", "url": "https://devin.ai", "category": "autonomous"},
    {"name": "Goose", "url": "https://block.github.io/goose/", "category": "cli_agent"},
    {"name": "Roo Code", "url": "https://roocode.com", "category": "extension"},
    {"name": "Amp", "url": "https://amp.dev", "category": "cli_agent"},
    {"name": "Bolt.new", "url": "https://bolt.new", "category": "app_builder"},
    {"name": "Lovable", "url": "https://lovable.dev", "category": "app_builder"},
    {"name": "v0", "url": "https://v0.dev", "category": "app_builder"},
    {"name": "Replit Agent", "url": "https://replit.com", "category": "app_builder"},
    {"name": "Kiro", "url": "https://kiro.dev", "category": "ide"},
    {"name": "Codium AI", "url": "https://www.codium.ai", "category": "extension"},
    {"name": "Supermaven", "url": "https://supermaven.com", "category": "extension"},
    {"name": "Tabnine", "url": "https://www.tabnine.com", "category": "extension"},
    {"name": "Amazon Q Developer", "url": "https://aws.amazon.com/q/developer/", "category": "extension"},
    {"name": "Sourcegraph Cody", "url": "https://sourcegraph.com/cody", "category": "extension"},
]

VIBE_TOOL_CATEGORIES = {
    "orchestration": "AI Agent Orchestration",
    "cli_agent": "CLI Coding Agents",
    "ide": "AI-Powered IDEs",
    "extension": "IDE Extensions",
    "autonomous": "Autonomous Agents",
    "app_builder": "AI App Builders",
    "framework": "Agent Frameworks",
    "mcp": "MCP Servers & Tools",
}


async def scrape_website_for_tools(client: httpx.AsyncClient, url: str) -> dict:
    """Scrape a website and extract tool metadata."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }
    
    try:
        response = await client.get(url, headers=headers, follow_redirects=True, timeout=15.0)
        if response.status_code != 200:
            return {"error": f"HTTP {response.status_code}", "url": url}
        
        soup = BeautifulSoup(response.text, "lxml")
        
        title = soup.title.string.strip() if soup.title and soup.title.string else None
        
        meta_desc = soup.find("meta", attrs={"name": "description"})
        description = meta_desc.get("content") if meta_desc else None
        
        og_title = soup.find("meta", property="og:title")
        og_desc = soup.find("meta", property="og:description")
        og_image = soup.find("meta", property="og:image")
        
        github_url = None
        for a in soup.find_all("a", href=True):
            href = a.get("href", "")
            if "github.com" in href and "/issues" not in href and "/pull" not in href:
                github_url = href
                break
        
        features = []
        page_text = soup.get_text(separator=" ", strip=True).lower()
        
        feature_indicators = [
            ("parallel execution", "Parallel agent execution"),
            ("git worktree", "Git worktree isolation"),
            ("code review", "AI code review"),
            ("multi-agent", "Multi-agent support"),
            ("mcp", "MCP integration"),
            ("vs code", "VS Code extension"),
            ("vscode", "VS Code extension"),
            ("cli", "CLI interface"),
            ("terminal", "Terminal-based"),
            ("autonomous", "Autonomous operation"),
            ("self-healing", "Self-healing code"),
            ("context", "Context-aware"),
        ]
        
        for keyword, feature_name in feature_indicators:
            if keyword in page_text:
                features.append(feature_name)
        
        supported_agents = []
        agent_names = ["claude code", "gemini cli", "aider", "copilot", "cursor", "cline", "opencode", "amp"]
        for agent in agent_names:
            if agent in page_text:
                supported_agents.append(agent.title())
        
        return {
            "url": str(response.url),
            "title": title,
            "description": description or (og_desc.get("content") if og_desc else None),
            "og_title": og_title.get("content") if og_title else None,
            "og_image": og_image.get("content") if og_image else None,
            "github_url": github_url,
            "features_detected": list(set(features)),
            "supported_agents": list(set(supported_agents)),
            "scraped_at": datetime.now().isoformat(),
        }
    except Exception as e:
        return {"error": str(e), "url": url}


async def scrape_github_awesome_list(client: httpx.AsyncClient, repo_url: str) -> list[dict]:
    """Scrape tools from a GitHub awesome list."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }
    
    tools = []
    
    try:
        response = await client.get(repo_url, headers=headers, follow_redirects=True, timeout=15.0)
        if response.status_code != 200:
            return tools
        
        soup = BeautifulSoup(response.text, "lxml")
        readme = soup.find("article", class_="markdown-body")
        
        if not readme:
            return tools
        
        for li in readme.find_all("li"):
            a_tag = li.find("a")
            if not a_tag:
                continue
            
            href = a_tag.get("href", "")
            name = a_tag.get_text(strip=True)
            
            if not href or not name:
                continue
            
            if href.startswith("#"):
                continue
            
            description = ""
            text = li.get_text(strip=True)
            if " - " in text:
                description = text.split(" - ", 1)[1]
            elif ": " in text:
                description = text.split(": ", 1)[1]
            
            if len(name) > 2 and len(name) < 100:
                tools.append({
                    "name": name,
                    "url": href,
                    "description": description[:500] if description else "",
                    "source": repo_url,
                })
        
        return tools
    except Exception as e:
        print(f"Error scraping awesome list {repo_url}: {e}")
        return tools


async def search_for_vibe_tools(client: httpx.AsyncClient) -> list[dict]:
    """Search DuckDuckGo for vibe coding tools."""
    discovered = []
    
    search_queries = [
        "AI coding agent tools 2025",
        "vibe coding workflow tools",
        "claude code alternatives",
        "aider alternatives AI coding",
        "parallel AI coding agents",
        "autonomous coding agent tools",
        "AI code orchestration tools",
        "multi-agent coding workflow",
    ]
    
    for query in search_queries:
        try:
            url = "https://html.duckduckgo.com/html/"
            headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            }
            
            response = await client.post(url, data={"q": query}, headers=headers, timeout=15.0)
            if response.status_code != 200:
                continue
            
            soup = BeautifulSoup(response.text, "lxml")
            
            for result in soup.select(".result")[:5]:
                title_elem = result.select_one(".result__title")
                snippet_elem = result.select_one(".result__snippet")
                
                if title_elem:
                    a_tag = title_elem.select_one("a")
                    if a_tag and a_tag.get("href"):
                        href = a_tag.get("href", "")
                        link = ""
                        if "uddg=" in href:
                            import urllib.parse
                            parsed = urllib.parse.parse_qs(urllib.parse.urlparse(href).query)
                            link = parsed.get("uddg", [""])[0]
                        else:
                            link = href
                        
                        if link and not any(x in link for x in ["google.com", "bing.com", "duckduckgo.com"]):
                            discovered.append({
                                "name": title_elem.get_text(strip=True),
                                "url": link,
                                "description": snippet_elem.get_text(strip=True) if snippet_elem else "",
                                "source": f"search:{query}",
                            })
            
            await asyncio.sleep(2)
        except Exception as e:
            print(f"Search error for '{query}': {e}")
    
    return discovered


def deduplicate_tools(tools: list[dict]) -> list[dict]:
    """Deduplicate tools by URL domain."""
    seen_domains = set()
    unique_tools = []
    
    for tool in tools:
        url = tool.get("url", "")
        if not url:
            continue
        
        try:
            domain = urlparse(url).netloc.lower()
            domain = domain.replace("www.", "")
            
            if domain and domain not in seen_domains:
                seen_domains.add(domain)
                unique_tools.append(tool)
        except:
            continue
    
    return unique_tools


async def scrape_vibe_tools() -> dict:
    """Main function to scrape and discover vibe coding tools."""
    results = {
        "scraped_at": datetime.now().isoformat(),
        "known_tools": [],
        "discovered_tools": [],
        "awesome_list_tools": [],
        "total_unique_tools": 0,
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        print("Scraping known vibe tools...")
        for tool in KNOWN_VIBE_TOOLS:
            print(f"  - {tool['name']}")
            metadata = await scrape_website_for_tools(client, tool["url"])
            results["known_tools"].append({
                **tool,
                "metadata": metadata,
            })
            await asyncio.sleep(1)
        
        print("\nScraping awesome lists...")
        for directory in VIBE_TOOL_DIRECTORIES:
            if directory["type"] == "awesome_list":
                print(f"  - {directory['name']}")
                tools = await scrape_github_awesome_list(client, directory["url"])
                results["awesome_list_tools"].extend(tools)
                await asyncio.sleep(2)
        
        print("\nSearching for new vibe tools...")
        discovered = await search_for_vibe_tools(client)
        results["discovered_tools"] = discovered
        
        all_tools = (
            [{"name": t["name"], "url": t["url"]} for t in results["known_tools"]] +
            results["awesome_list_tools"] +
            results["discovered_tools"]
        )
        unique_tools = deduplicate_tools(all_tools)
        results["total_unique_tools"] = len(unique_tools)
        results["all_unique_tools"] = unique_tools
    
    return results


if __name__ == "__main__":
    async def main():
        results = await scrape_vibe_tools()
        
        output_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(output_dir, exist_ok=True)
        
        output_path = os.path.join(output_dir, "vibe_tools.json")
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        
        print(f"\n{'='*50}")
        print("VIBE TOOLS SCRAPING COMPLETE")
        print(f"{'='*50}")
        print(f"Known tools scraped: {len(results['known_tools'])}")
        print(f"Awesome list tools: {len(results['awesome_list_tools'])}")
        print(f"Discovered tools: {len(results['discovered_tools'])}")
        print(f"Total unique tools: {results['total_unique_tools']}")
        print(f"\nSaved to: {output_path}")
    
    asyncio.run(main())
