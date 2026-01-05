"""
StackShare Scraper - Fetches tech stack data and tool comparisons
"""
import os
import json
import asyncio
import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from typing import Optional


STACK_CATEGORIES = [
    "application-and-data",
    "utilities",
    "devops",
    "business-tools",
    "languages",
    "frameworks",
    "data-stores",
    "back-end",
    "front-end",
    "mobile",
    "build-test-deploy",
    "collaboration",
    "monitoring",
    "hosting",
    "support-sales-and-marketing",
]

TOOL_SLUGS = [
    "react",
    "nodejs",
    "typescript",
    "python",
    "go",
    "rust",
    "postgresql",
    "mongodb",
    "redis",
    "elasticsearch",
    "docker",
    "kubernetes",
    "aws",
    "google-cloud",
    "vercel",
    "netlify",
    "github",
    "gitlab",
    "vscode",
    "neovim",
    "tailwind-css",
    "next-js",
    "vue-js",
    "svelte",
    "prisma",
    "supabase",
    "firebase",
    "auth0",
    "stripe",
    "twilio",
    "sentry",
    "datadog",
    "grafana",
    "prometheus",
    "nginx",
    "cloudflare",
]


async def fetch_category_tools(client: httpx.AsyncClient, category: str) -> list:
    """Fetch tools from a StackShare category."""
    url = f"https://stackshare.io/categories/{category}"
    
    try:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        tools = []
        
        for item in soup.select(".tool-card, [data-tool]"):
            try:
                name_elem = item.select_one(".tool-name, h3, a")
                if not name_elem:
                    continue
                
                name = name_elem.get_text(strip=True)
                href = name_elem.get("href", "")
                
                desc_elem = item.select_one(".tool-description, p")
                description = desc_elem.get_text(strip=True) if desc_elem else ""
                
                stacks_elem = item.select_one(".stacks-count, [data-stacks]")
                stacks_count = 0
                if stacks_elem:
                    try:
                        stacks_count = int(stacks_elem.get_text(strip=True).replace(",", "").replace("K", "000"))
                    except:
                        pass
                
                votes_elem = item.select_one(".votes-count, [data-votes]")
                votes = 0
                if votes_elem:
                    try:
                        votes = int(votes_elem.get_text(strip=True).replace(",", ""))
                    except:
                        pass
                
                tools.append({
                    "name": name,
                    "url": f"https://stackshare.io{href}" if href.startswith("/") else href,
                    "description": description,
                    "stacks_count": stacks_count,
                    "votes": votes,
                    "category": category,
                })
            except Exception:
                continue
        
        return tools
    except Exception as e:
        print(f"Error fetching category {category}: {e}")
        return []


async def fetch_tool_details(client: httpx.AsyncClient, tool_slug: str) -> dict:
    """Fetch detailed info for a specific tool."""
    url = f"https://stackshare.io/{tool_slug}"
    
    try:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        name_elem = soup.select_one("h1")
        name = name_elem.get_text(strip=True) if name_elem else tool_slug
        
        desc_elem = soup.select_one(".tool-description, [data-description]")
        description = desc_elem.get_text(strip=True) if desc_elem else ""
        
        website_elem = soup.select_one("a[href*='website'], .website-link")
        website = website_elem.get("href") if website_elem else None
        
        pros = []
        for pro in soup.select(".pros-list li, [data-pro]"):
            pros.append(pro.get_text(strip=True))
        
        cons = []
        for con in soup.select(".cons-list li, [data-con]"):
            cons.append(con.get_text(strip=True))
        
        alternatives = []
        for alt in soup.select(".alternatives-list a, [data-alternative]")[:10]:
            alt_name = alt.get_text(strip=True)
            if alt_name:
                alternatives.append(alt_name)
        
        integrations = []
        for integration in soup.select(".integrations-list a, [data-integration]")[:20]:
            int_name = integration.get_text(strip=True)
            if int_name:
                integrations.append(int_name)
        
        companies = []
        for company in soup.select(".companies-using a, [data-company]")[:10]:
            company_name = company.get_text(strip=True)
            if company_name:
                companies.append(company_name)
        
        return {
            "name": name,
            "slug": tool_slug,
            "description": description,
            "website": website,
            "pros": pros[:10],
            "cons": cons[:10],
            "alternatives": alternatives,
            "integrations": integrations,
            "companies_using": companies,
        }
    except Exception as e:
        print(f"Error fetching tool {tool_slug}: {e}")
        return {"slug": tool_slug, "error": str(e)}


async def scrape_stackshare() -> dict:
    """Scrape StackShare for developer tools and stacks."""
    results = {
        "scraped_at": datetime.now().isoformat(),
        "categories": {},
        "tools": {},
        "all_tools": [],
    }
    
    seen_tools = set()
    
    async with httpx.AsyncClient(
        timeout=30.0,
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml",
        }
    ) as client:
        for category in STACK_CATEGORIES:
            print(f"  Fetching category: {category}...")
            tools = await fetch_category_tools(client, category)
            results["categories"][category] = tools
            
            for tool in tools:
                if tool["name"] not in seen_tools:
                    seen_tools.add(tool["name"])
                    results["all_tools"].append(tool)
            
            await asyncio.sleep(2)
        
        for tool_slug in TOOL_SLUGS:
            print(f"  Fetching tool details: {tool_slug}...")
            tool_data = await fetch_tool_details(client, tool_slug)
            results["tools"][tool_slug] = tool_data
            await asyncio.sleep(2)
    
    results["total_unique_tools"] = len(results["all_tools"])
    return results


if __name__ == "__main__":
    async def main():
        print("Scraping StackShare...")
        results = await scrape_stackshare()
        
        output_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(output_dir, exist_ok=True)
        
        output_path = os.path.join(output_dir, "stackshare.json")
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        
        print(f"\nSaved {results['total_unique_tools']} unique tools to {output_path}")
    
    asyncio.run(main())
