"""
Product Hunt Scraper - Discovers new developer tools from Product Hunt
"""
import os
import json
import re
import httpx
from bs4 import BeautifulSoup
from typing import Optional
from datetime import datetime
import asyncio
from bot_avoidance import (
    get_realistic_headers,
    random_delay,
    retry_with_backoff,
    RateLimiter,
    create_client_with_limits,
)

rate_limiter = RateLimiter(requests_per_minute=15)


DEVELOPER_TOPICS = [
    "developer-tools",
    "artificial-intelligence",
    "productivity",
    "open-source",
    "web-app",
    "api",
    "saas",
    "no-code",
    "design-tools",
    "chrome-extensions",
    "github",
    "vscode",
    "coding",
    "ai-coding",
]

TOOL_CATEGORIES = {
    "ai_coding": ["ai coding", "code assistant", "copilot", "code generation", "ai developer", "coding ai"],
    "database": ["database", "backend", "baas", "serverless database", "postgres", "sql"],
    "auth": ["authentication", "auth", "login", "identity", "sso"],
    "hosting": ["hosting", "deployment", "cloud", "serverless", "edge"],
    "framework": ["framework", "react", "vue", "svelte", "frontend"],
    "ui": ["ui kit", "component", "design system", "css", "tailwind"],
    "devops": ["devops", "ci/cd", "monitoring", "logging", "infrastructure"],
    "api": ["api", "rest", "graphql", "sdk"],
}


async def fetch_producthunt_topic(client: httpx.AsyncClient, topic: str) -> list[dict]:
    """Fetch products from a Product Hunt topic page."""
    url = f"https://www.producthunt.com/topics/{topic}"
    
    await rate_limiter.wait()
    
    headers = get_realistic_headers()
    
    async def _fetch():
        return await client.get(url, headers=headers, follow_redirects=True)
    
    try:
        response = await retry_with_backoff(_fetch, max_retries=2)
        if response.status_code != 200:
            return []
        
        soup = BeautifulSoup(response.text, "lxml")
        products = []
        
        for item in soup.select("[data-test='post-item']"):
            name_elem = item.select_one("h3, [data-test='post-name']")
            tagline_elem = item.select_one("p, [data-test='post-tagline']")
            link_elem = item.select_one("a[href*='/posts/']")
            
            if name_elem:
                product = {
                    "name": name_elem.get_text(strip=True),
                    "tagline": tagline_elem.get_text(strip=True) if tagline_elem else None,
                    "url": f"https://www.producthunt.com{link_elem.get('href')}" if link_elem else None,
                    "topic": topic,
                    "source": "producthunt",
                }
                products.append(product)
        
        await random_delay(0.5, 1.5)
        return products
    except Exception as e:
        print(f"Error fetching topic {topic}: {e}")
        return []


async def fetch_producthunt_search(client: httpx.AsyncClient, query: str) -> list[dict]:
    """Search Product Hunt for products."""
    url = f"https://www.producthunt.com/search?q={query}"
    
    await rate_limiter.wait()
    
    headers = get_realistic_headers()
    
    async def _search():
        return await client.get(url, headers=headers, follow_redirects=True)
    
    try:
        response = await retry_with_backoff(_search, max_retries=2)
        if response.status_code != 200:
            return []
        
        soup = BeautifulSoup(response.text, "lxml")
        products = []
        
        for item in soup.select("[data-test='search-result']"):
            name_elem = item.select_one("h3")
            tagline_elem = item.select_one("p")
            link_elem = item.select_one("a")
            
            if name_elem:
                products.append({
                    "name": name_elem.get_text(strip=True),
                    "tagline": tagline_elem.get_text(strip=True) if tagline_elem else None,
                    "url": link_elem.get("href") if link_elem else None,
                    "search_query": query,
                    "source": "producthunt_search",
                })
        
        await random_delay(0.5, 1.5)
        return products
    except Exception as e:
        print(f"Error searching for {query}: {e}")
        return []


async def scrape_product_details(client: httpx.AsyncClient, url: str) -> dict:
    """Scrape detailed information about a product."""
    await rate_limiter.wait()
    
    headers = get_realistic_headers()
    
    async def _fetch():
        return await client.get(url, headers=headers, follow_redirects=True)
    
    try:
        response = await retry_with_backoff(_fetch, max_retries=2)
        if response.status_code != 200:
            return {"url": url, "error": f"HTTP {response.status_code}"}
        
        soup = BeautifulSoup(response.text, "lxml")
        
        name = soup.select_one("h1")
        tagline = soup.select_one("[data-test='tagline']") or soup.select_one("h2")
        description = soup.select_one("[data-test='description']") or soup.select_one(".description")
        
        website_link = soup.select_one("a[data-test='product-link']") or soup.select_one("a[rel='nofollow'][target='_blank']")
        
        upvotes_elem = soup.select_one("[data-test='vote-button']") or soup.select_one(".upvote-count")
        upvotes = None
        if upvotes_elem:
            upvote_text = upvotes_elem.get_text(strip=True)
            upvote_match = re.search(r'(\d+)', upvote_text)
            if upvote_match:
                upvotes = int(upvote_match.group(1))
        
        topics = [t.get_text(strip=True) for t in soup.select("[data-test='topic-tag']")]
        
        makers = []
        for maker in soup.select("[data-test='maker']"):
            maker_name = maker.get_text(strip=True)
            if maker_name:
                makers.append(maker_name)
        
        og_image = soup.find("meta", property="og:image")
        
        return {
            "url": str(response.url),
            "name": name.get_text(strip=True) if name else None,
            "tagline": tagline.get_text(strip=True) if tagline else None,
            "description": description.get_text(strip=True) if description else None,
            "website": website_link.get("href") if website_link else None,
            "upvotes": upvotes,
            "topics": topics,
            "makers": makers,
            "image": og_image.get("content") if og_image else None,
            "scraped_at": datetime.now().isoformat(),
        }
        await random_delay(0.3, 0.8)
    except Exception as e:
        return {"url": url, "error": str(e)}


def categorize_product(product: dict) -> Optional[str]:
    """Categorize a product based on its description and topics."""
    text = " ".join([
        product.get("name", ""),
        product.get("tagline", ""),
        product.get("description", ""),
        " ".join(product.get("topics", [])),
    ]).lower()
    
    for category, keywords in TOOL_CATEGORIES.items():
        for keyword in keywords:
            if keyword in text:
                return category
    
    return None


async def discover_developer_tools(topics: list[str] = None, search_queries: list[str] = None) -> dict:
    """Discover developer tools from Product Hunt."""
    if topics is None:
        topics = DEVELOPER_TOPICS
    
    if search_queries is None:
        search_queries = [
            "ai coding assistant",
            "developer tools",
            "code editor",
            "database",
            "authentication",
            "deployment",
            "api",
            "open source",
        ]
    
    results = {
        "scraped_at": datetime.now().isoformat(),
        "topics": {},
        "searches": {},
        "all_products": [],
    }
    
    async with create_client_with_limits(timeout=30.0) as client:
        for topic in topics:
            print(f"Fetching topic: {topic}")
            products = await fetch_producthunt_topic(client, topic)
            results["topics"][topic] = products
            results["all_products"].extend(products)
            await random_delay(2.0, 4.0)
        
        for query in search_queries:
            print(f"Searching: {query}")
            products = await fetch_producthunt_search(client, query)
            results["searches"][query] = products
            results["all_products"].extend(products)
            await random_delay(2.0, 4.0)
    
    seen_names = set()
    unique_products = []
    for product in results["all_products"]:
        name = product.get("name", "").lower()
        if name and name not in seen_names:
            seen_names.add(name)
            unique_products.append(product)
    
    results["unique_products"] = unique_products
    results["total_unique"] = len(unique_products)
    
    return results


async def enrich_products(products: list[dict], limit: int = 20) -> list[dict]:
    """Enrich products with detailed information."""
    enriched = []
    
    async with create_client_with_limits(timeout=30.0) as client:
        for product in products[:limit]:
            if product.get("url"):
                print(f"Enriching: {product.get('name')}")
                details = await scrape_product_details(client, product["url"])
                enriched.append({**product, **details})
                await random_delay(2.0, 4.0)
    
    return enriched


if __name__ == "__main__":
    async def main():
        results = await discover_developer_tools()
        
        output_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(output_dir, exist_ok=True)
        
        with open(os.path.join(output_dir, "producthunt_tools.json"), "w") as f:
            json.dump(results, f, indent=2)
        
        print(f"\nDiscovered {results['total_unique']} unique products")
        print(f"From {len(results['topics'])} topics and {len(results['searches'])} searches")
    
    asyncio.run(main())
