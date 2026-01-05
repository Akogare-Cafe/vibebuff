"""
Indie Hackers Scraper - Fetches products and tools from Indie Hackers
"""
import os
import json
import asyncio
import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from typing import Optional


PRODUCT_CATEGORIES = [
    "developer-tools",
    "productivity",
    "saas",
    "api",
    "automation",
    "ai",
    "no-code",
    "analytics",
    "marketing",
    "design",
]

SEARCH_QUERIES = [
    "developer tools",
    "coding assistant",
    "ai tools",
    "api",
    "database",
    "hosting",
    "authentication",
    "payments",
    "analytics",
    "monitoring",
]


async def fetch_products_page(client: httpx.AsyncClient, page: int = 1) -> list:
    """Fetch products from Indie Hackers products page."""
    url = f"https://www.indiehackers.com/products?page={page}"
    
    try:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        products = []
        
        for item in soup.select(".product-card, [data-product], article"):
            try:
                name_elem = item.select_one("h2, h3, .product-name, a")
                if not name_elem:
                    continue
                
                name = name_elem.get_text(strip=True)
                if not name or len(name) > 100:
                    continue
                
                link_elem = item.select_one("a[href*='/product/']")
                href = link_elem.get("href", "") if link_elem else ""
                
                desc_elem = item.select_one("p, .description, .tagline")
                description = desc_elem.get_text(strip=True) if desc_elem else ""
                
                revenue_elem = item.select_one(".revenue, [data-revenue], .mrr")
                revenue = revenue_elem.get_text(strip=True) if revenue_elem else None
                
                followers_elem = item.select_one(".followers, [data-followers]")
                followers = 0
                if followers_elem:
                    try:
                        followers = int(followers_elem.get_text(strip=True).replace(",", ""))
                    except:
                        pass
                
                tags = []
                for tag in item.select(".tag, .category, .badge"):
                    tag_text = tag.get_text(strip=True)
                    if tag_text and len(tag_text) < 30:
                        tags.append(tag_text)
                
                products.append({
                    "name": name,
                    "url": f"https://www.indiehackers.com{href}" if href.startswith("/") else href,
                    "description": description[:500] if description else "",
                    "revenue": revenue,
                    "followers": followers,
                    "tags": tags,
                    "source": "indiehackers",
                })
            except Exception:
                continue
        
        return products
    except Exception as e:
        print(f"Error fetching Indie Hackers page {page}: {e}")
        return []


async def fetch_product_details(client: httpx.AsyncClient, product_url: str) -> dict:
    """Fetch detailed info for a specific product."""
    try:
        response = await client.get(product_url, follow_redirects=True)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        name_elem = soup.select_one("h1")
        name = name_elem.get_text(strip=True) if name_elem else ""
        
        tagline_elem = soup.select_one(".tagline, .subtitle")
        tagline = tagline_elem.get_text(strip=True) if tagline_elem else ""
        
        desc_elem = soup.select_one(".description, .about")
        description = desc_elem.get_text(strip=True) if desc_elem else ""
        
        website_elem = soup.select_one("a[href*='http']:not([href*='indiehackers'])")
        website = website_elem.get("href") if website_elem else None
        
        revenue_elem = soup.select_one(".revenue, .mrr")
        revenue = revenue_elem.get_text(strip=True) if revenue_elem else None
        
        founder_elem = soup.select_one(".founder, .maker")
        founder = founder_elem.get_text(strip=True) if founder_elem else None
        
        return {
            "name": name,
            "tagline": tagline,
            "description": description[:500] if description else "",
            "website": website,
            "revenue": revenue,
            "founder": founder,
            "product_url": product_url,
        }
    except Exception as e:
        return {"url": product_url, "error": str(e)}


async def search_products(client: httpx.AsyncClient, query: str) -> list:
    """Search for products on Indie Hackers."""
    url = f"https://www.indiehackers.com/search?q={query}"
    
    try:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        products = []
        
        for item in soup.select(".search-result, .product-item, article"):
            try:
                name_elem = item.select_one("h2, h3, a")
                if not name_elem:
                    continue
                
                name = name_elem.get_text(strip=True)
                
                link_elem = item.select_one("a[href]")
                href = link_elem.get("href", "") if link_elem else ""
                
                desc_elem = item.select_one("p, .description")
                description = desc_elem.get_text(strip=True) if desc_elem else ""
                
                products.append({
                    "name": name,
                    "url": href if href.startswith("http") else f"https://www.indiehackers.com{href}",
                    "description": description[:300] if description else "",
                    "search_query": query,
                    "source": "indiehackers",
                })
            except Exception:
                continue
        
        return products
    except Exception as e:
        print(f"Error searching Indie Hackers for '{query}': {e}")
        return []


async def scrape_indiehackers() -> dict:
    """Scrape Indie Hackers for developer products."""
    results = {
        "scraped_at": datetime.now().isoformat(),
        "products_pages": {},
        "search_results": {},
        "all_products": [],
    }
    
    seen_products = set()
    
    async with httpx.AsyncClient(
        timeout=30.0,
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml",
        }
    ) as client:
        for page in range(1, 6):
            print(f"  Fetching products page {page}...")
            products = await fetch_products_page(client, page)
            results["products_pages"][f"page_{page}"] = products
            
            for product in products:
                if product["name"].lower() not in seen_products:
                    seen_products.add(product["name"].lower())
                    results["all_products"].append(product)
            
            await asyncio.sleep(2)
        
        for query in SEARCH_QUERIES:
            print(f"  Searching: {query}...")
            products = await search_products(client, query)
            results["search_results"][query] = products
            
            for product in products:
                if product["name"].lower() not in seen_products:
                    seen_products.add(product["name"].lower())
                    results["all_products"].append(product)
            
            await asyncio.sleep(2)
    
    results["total_unique_products"] = len(results["all_products"])
    return results


if __name__ == "__main__":
    async def main():
        print("Scraping Indie Hackers...")
        results = await scrape_indiehackers()
        
        output_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(output_dir, exist_ok=True)
        
        output_path = os.path.join(output_dir, "indiehackers.json")
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        
        print(f"\nSaved {results['total_unique_products']} unique products to {output_path}")
    
    asyncio.run(main())
