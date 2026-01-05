"""
Article Scraper - Extracts tool mentions and metadata from blog posts and articles
"""
import os
import json
import re
import httpx
from bs4 import BeautifulSoup
from typing import Optional
from datetime import datetime
import asyncio


TOOL_KEYWORDS = [
    "cursor", "windsurf", "codeium", "copilot", "tabnine", "aider", "cline",
    "bolt.new", "lovable", "v0", "replit", "devin", "kiro", "claude code",
    "openhands", "continue", "goose", "roo code", "kilocode", "tabby",
    "supabase", "convex", "firebase", "neon", "turso", "planetscale",
    "clerk", "auth0", "next-auth", "lucia", "kinde",
    "vercel", "netlify", "railway", "fly.io", "render", "cloudflare",
    "react", "vue", "svelte", "angular", "solid", "qwik",
    "next.js", "nuxt", "sveltekit", "astro", "remix",
    "tailwind", "shadcn", "radix", "chakra", "mui",
    "prisma", "drizzle", "kysely", "typeorm",
    "vitest", "playwright", "cypress", "jest",
    "langchain", "llamaindex", "openai", "anthropic", "ollama",
    "stripe", "resend", "twilio", "sendgrid",
    "sentry", "posthog", "mixpanel", "amplitude",
    "docker", "kubernetes", "terraform", "pulumi",
]

CATEGORY_PATTERNS = {
    "ai_coding": ["cursor", "windsurf", "copilot", "aider", "cline", "claude code", "devin", "bolt.new", "lovable", "v0", "kiro"],
    "database": ["supabase", "convex", "firebase", "neon", "turso", "planetscale", "prisma", "drizzle"],
    "auth": ["clerk", "auth0", "next-auth", "lucia", "kinde"],
    "hosting": ["vercel", "netlify", "railway", "fly.io", "render", "cloudflare"],
    "framework": ["react", "vue", "svelte", "angular", "solid", "next.js", "nuxt", "astro", "remix"],
    "ui": ["tailwind", "shadcn", "radix", "chakra", "mui"],
    "ai_infra": ["langchain", "llamaindex", "openai", "anthropic", "ollama"],
    "testing": ["vitest", "playwright", "cypress", "jest"],
}


def extract_tool_mentions(text: str) -> list[dict]:
    """Extract tool mentions from text with context."""
    mentions = []
    text_lower = text.lower()
    
    for tool in TOOL_KEYWORDS:
        pattern = rf'\b{re.escape(tool)}\b'
        matches = list(re.finditer(pattern, text_lower))
        
        if matches:
            category = None
            for cat, tools in CATEGORY_PATTERNS.items():
                if tool in tools:
                    category = cat
                    break
            
            contexts = []
            for match in matches[:3]:
                start = max(0, match.start() - 100)
                end = min(len(text), match.end() + 100)
                context = text[start:end].strip()
                context = re.sub(r'\s+', ' ', context)
                contexts.append(context)
            
            mentions.append({
                "tool": tool,
                "count": len(matches),
                "category": category,
                "contexts": contexts,
            })
    
    return mentions


def extract_article_metadata(soup: BeautifulSoup, url: str) -> dict:
    """Extract comprehensive metadata from an article page."""
    metadata = {
        "url": url,
        "scraped_at": datetime.now().isoformat(),
    }
    
    metadata["title"] = None
    for selector in ["h1", "article h1", ".post-title", ".article-title", "[itemprop='headline']"]:
        elem = soup.select_one(selector)
        if elem:
            metadata["title"] = elem.get_text(strip=True)
            break
    if not metadata["title"] and soup.title:
        metadata["title"] = soup.title.string
    
    meta_desc = soup.find("meta", attrs={"name": "description"})
    metadata["description"] = meta_desc.get("content") if meta_desc else None
    
    og_title = soup.find("meta", property="og:title")
    og_desc = soup.find("meta", property="og:description")
    og_image = soup.find("meta", property="og:image")
    og_type = soup.find("meta", property="og:type")
    og_site = soup.find("meta", property="og:site_name")
    
    metadata["og"] = {
        "title": og_title.get("content") if og_title else None,
        "description": og_desc.get("content") if og_desc else None,
        "image": og_image.get("content") if og_image else None,
        "type": og_type.get("content") if og_type else None,
        "site_name": og_site.get("content") if og_site else None,
    }
    
    author = None
    for selector in [
        "[rel='author']", ".author", ".byline", "[itemprop='author']",
        "meta[name='author']", ".post-author", ".article-author"
    ]:
        elem = soup.select_one(selector)
        if elem:
            author = elem.get("content") if elem.name == "meta" else elem.get_text(strip=True)
            break
    metadata["author"] = author
    
    published = None
    for selector in [
        "time[datetime]", "[itemprop='datePublished']", ".published", ".post-date",
        "meta[property='article:published_time']"
    ]:
        elem = soup.select_one(selector)
        if elem:
            published = elem.get("datetime") or elem.get("content") or elem.get_text(strip=True)
            break
    metadata["published_date"] = published
    
    meta_keywords = soup.find("meta", attrs={"name": "keywords"})
    if meta_keywords and meta_keywords.get("content"):
        metadata["keywords"] = [k.strip() for k in meta_keywords.get("content").split(",")]
    else:
        metadata["keywords"] = []
    
    tags = []
    for selector in [".tag", ".tags a", "[rel='tag']", ".post-tags a", ".article-tags a"]:
        elems = soup.select(selector)
        tags.extend([e.get_text(strip=True) for e in elems])
    metadata["tags"] = list(set(tags))[:20]
    
    reading_time = None
    for selector in [".reading-time", ".read-time", "[data-reading-time]"]:
        elem = soup.select_one(selector)
        if elem:
            reading_time = elem.get_text(strip=True)
            break
    metadata["reading_time"] = reading_time
    
    return metadata


def extract_article_content(soup: BeautifulSoup) -> str:
    """Extract main article content."""
    for selector in ["article", ".post-content", ".article-content", ".entry-content", "main", ".content"]:
        elem = soup.select_one(selector)
        if elem:
            for tag in elem.select("script, style, nav, header, footer, aside, .comments"):
                tag.decompose()
            return elem.get_text(separator=" ", strip=True)
    
    return soup.get_text(separator=" ", strip=True)


async def scrape_article(client: httpx.AsyncClient, url: str) -> dict:
    """Scrape a single article for tool mentions and metadata."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }
    
    try:
        response = await client.get(url, headers=headers, follow_redirects=True, timeout=20.0)
        if response.status_code != 200:
            return {"url": url, "error": f"HTTP {response.status_code}"}
        
        soup = BeautifulSoup(response.text, "lxml")
        
        metadata = extract_article_metadata(soup, str(response.url))
        content = extract_article_content(soup)
        tool_mentions = extract_tool_mentions(content)
        
        if metadata.get("title"):
            title_mentions = extract_tool_mentions(metadata["title"])
            for tm in title_mentions:
                tm["in_title"] = True
                existing = next((m for m in tool_mentions if m["tool"] == tm["tool"]), None)
                if existing:
                    existing["in_title"] = True
                else:
                    tool_mentions.append(tm)
        
        return {
            **metadata,
            "content_length": len(content),
            "tool_mentions": tool_mentions,
            "tools_found": [m["tool"] for m in tool_mentions],
            "tools_count": len(tool_mentions),
        }
    except Exception as e:
        return {"url": url, "error": str(e)}


async def scrape_articles(urls: list[str], concurrency: int = 5) -> list[dict]:
    """Scrape multiple articles with rate limiting."""
    results = []
    semaphore = asyncio.Semaphore(concurrency)
    
    async def scrape_with_semaphore(url: str) -> dict:
        async with semaphore:
            result = await scrape_article(httpx.AsyncClient(timeout=30.0), url)
            await asyncio.sleep(1)
            return result
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        for url in urls:
            print(f"Scraping: {url}")
            result = await scrape_article(client, url)
            results.append(result)
            await asyncio.sleep(1)
    
    return results


def filter_articles_with_tools(articles: list[dict], min_tools: int = 1) -> list[dict]:
    """Filter articles that mention at least min_tools tools."""
    return [a for a in articles if a.get("tools_count", 0) >= min_tools]


def aggregate_tool_mentions(articles: list[dict]) -> dict:
    """Aggregate tool mentions across all articles."""
    tool_stats = {}
    
    for article in articles:
        if "error" in article:
            continue
        
        for mention in article.get("tool_mentions", []):
            tool = mention["tool"]
            if tool not in tool_stats:
                tool_stats[tool] = {
                    "tool": tool,
                    "category": mention.get("category"),
                    "total_mentions": 0,
                    "article_count": 0,
                    "in_title_count": 0,
                    "articles": [],
                }
            
            tool_stats[tool]["total_mentions"] += mention["count"]
            tool_stats[tool]["article_count"] += 1
            if mention.get("in_title"):
                tool_stats[tool]["in_title_count"] += 1
            tool_stats[tool]["articles"].append({
                "url": article["url"],
                "title": article.get("title"),
                "published": article.get("published_date"),
            })
    
    return dict(sorted(tool_stats.items(), key=lambda x: x[1]["total_mentions"], reverse=True))


SAMPLE_ARTICLE_URLS = [
    "https://dev.to/t/cursor",
    "https://dev.to/t/ai-coding",
    "https://dev.to/t/copilot",
]


if __name__ == "__main__":
    async def main():
        urls = [
            "https://www.builder.io/blog/cursor-tips",
            "https://blog.pragmaticengineer.com/ai-coding-tools/",
        ]
        
        results = await scrape_articles(urls)
        
        output_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(output_dir, exist_ok=True)
        
        with open(os.path.join(output_dir, "article_scrapes.json"), "w") as f:
            json.dump(results, f, indent=2)
        
        tool_stats = aggregate_tool_mentions(results)
        with open(os.path.join(output_dir, "tool_mentions.json"), "w") as f:
            json.dump(tool_stats, f, indent=2)
        
        print(f"\nScraped {len(results)} articles")
        print(f"Found mentions of {len(tool_stats)} tools")
        
        for tool, stats in list(tool_stats.items())[:10]:
            print(f"  {tool}: {stats['total_mentions']} mentions in {stats['article_count']} articles")
    
    asyncio.run(main())
