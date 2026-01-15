"""
Company Tech Stack Scraper - Fetches companies and their publicly visible tech stacks
Sources: StackShare companies, Wappalyzer, BuiltWith-style detection, and public tech blogs
"""
import os
import json
import asyncio
import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from typing import List, Dict, Optional
import re


COMPANY_SOURCES = {
    "stackshare_featured": [
        "airbnb",
        "uber",
        "netflix",
        "spotify",
        "slack",
        "stripe",
        "github",
        "gitlab",
        "vercel",
        "shopify",
        "discord",
        "notion",
        "figma",
        "linear",
        "supabase",
        "planetscale",
        "railway",
        "render",
        "fly-io",
        "cloudflare",
    ],
    "tech_categories": [
        "saas",
        "fintech",
        "developer-tools",
        "ai-ml",
        "ecommerce",
        "social-media",
        "productivity",
        "collaboration",
    ]
}


TECH_STACK_PATTERNS = {
    "frontend": [
        r"react", r"vue\.?js", r"angular", r"svelte", r"next\.?js", r"nuxt",
        r"typescript", r"javascript", r"tailwind", r"bootstrap", r"material-ui"
    ],
    "backend": [
        r"node\.?js", r"python", r"django", r"flask", r"fastapi", r"ruby on rails",
        r"go", r"rust", r"java", r"spring", r"\.net", r"php", r"laravel"
    ],
    "database": [
        r"postgresql", r"mysql", r"mongodb", r"redis", r"elasticsearch",
        r"dynamodb", r"cassandra", r"sqlite", r"supabase", r"firebase"
    ],
    "infrastructure": [
        r"aws", r"gcp", r"azure", r"docker", r"kubernetes", r"terraform",
        r"vercel", r"netlify", r"cloudflare", r"heroku", r"railway"
    ],
    "monitoring": [
        r"datadog", r"sentry", r"new relic", r"grafana", r"prometheus",
        r"logflare", r"papertrail", r"logtail"
    ]
}


async def fetch_stackshare_company(client: httpx.AsyncClient, company_slug: str) -> Dict:
    """Fetch company tech stack from StackShare."""
    url = f"https://stackshare.io/{company_slug}"
    
    try:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        name_elem = soup.select_one("h1, .company-name")
        name = name_elem.get_text(strip=True) if name_elem else company_slug
        
        desc_elem = soup.select_one(".company-description, [data-description]")
        description = desc_elem.get_text(strip=True) if desc_elem else ""
        
        website_elem = soup.select_one("a[href*='http']:not([href*='stackshare'])")
        website = website_elem.get("href") if website_elem else None
        
        tech_stack = {
            "frontend": [],
            "backend": [],
            "database": [],
            "infrastructure": [],
            "devops": [],
            "monitoring": [],
            "other": []
        }
        
        for tool_elem in soup.select(".tool-card, [data-tool], .stack-item"):
            tool_name = tool_elem.get_text(strip=True)
            category_elem = tool_elem.select_one(".category, [data-category]")
            category = category_elem.get_text(strip=True).lower() if category_elem else "other"
            
            if "front" in category or "client" in category:
                tech_stack["frontend"].append(tool_name)
            elif "back" in category or "server" in category:
                tech_stack["backend"].append(tool_name)
            elif "data" in category or "database" in category:
                tech_stack["database"].append(tool_name)
            elif "infra" in category or "host" in category:
                tech_stack["infrastructure"].append(tool_name)
            elif "devops" in category or "deploy" in category:
                tech_stack["devops"].append(tool_name)
            elif "monitor" in category or "observ" in category:
                tech_stack["monitoring"].append(tool_name)
            else:
                tech_stack["other"].append(tool_name)
        
        tech_stack = {k: list(set(v)) for k, v in tech_stack.items() if v}
        
        team_size_elem = soup.select_one(".team-size, [data-team-size]")
        team_size = team_size_elem.get_text(strip=True) if team_size_elem else None
        
        industry_elem = soup.select_one(".industry, [data-industry]")
        industry = industry_elem.get_text(strip=True) if industry_elem else None
        
        return {
            "name": name,
            "slug": company_slug,
            "description": description,
            "website": website,
            "tech_stack": tech_stack,
            "team_size": team_size,
            "industry": industry,
            "source": "stackshare",
            "scraped_at": datetime.now().isoformat(),
        }
    except Exception as e:
        print(f"Error fetching company {company_slug}: {e}")
        return {
            "slug": company_slug,
            "error": str(e),
            "source": "stackshare"
        }


async def detect_tech_from_website(client: httpx.AsyncClient, url: str) -> Dict:
    """Detect technologies from a website's HTML and headers."""
    try:
        response = await client.get(url, follow_redirects=True, timeout=10.0)
        response.raise_for_status()
        
        html = response.text.lower()
        headers = {k.lower(): v.lower() for k, v in response.headers.items()}
        
        detected_tech = {
            "frontend": [],
            "backend": [],
            "database": [],
            "infrastructure": [],
            "monitoring": []
        }
        
        for category, patterns in TECH_STACK_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, html, re.IGNORECASE):
                    tech_name = pattern.replace(r"\.", ".").replace(r"\?", "")
                    detected_tech[category].append(tech_name)
        
        if "x-powered-by" in headers:
            detected_tech["backend"].append(headers["x-powered-by"])
        
        if "server" in headers:
            detected_tech["infrastructure"].append(headers["server"])
        
        detected_tech = {k: list(set(v)) for k, v in detected_tech.items() if v}
        
        return {
            "url": url,
            "detected_tech": detected_tech,
            "method": "html_analysis",
            "scraped_at": datetime.now().isoformat(),
        }
    except Exception as e:
        return {
            "url": url,
            "error": str(e),
            "method": "html_analysis"
        }


async def scrape_stackshare_companies_list(client: httpx.AsyncClient, category: str = None) -> List[str]:
    """Scrape list of companies from StackShare."""
    if category:
        url = f"https://stackshare.io/companies/{category}"
    else:
        url = "https://stackshare.io/companies"
    
    try:
        response = await client.get(url, follow_redirects=True)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        company_slugs = []
        
        for link in soup.select("a[href*='/companies/']"):
            href = link.get("href", "")
            match = re.search(r"/companies/([^/]+)/?$", href)
            if match:
                company_slugs.append(match.group(1))
        
        return list(set(company_slugs))[:50]
    except Exception as e:
        print(f"Error scraping companies list: {e}")
        return []


async def scrape_tech_blog_stack_info(client: httpx.AsyncClient, blog_url: str) -> Dict:
    """Scrape tech stack info from engineering blogs."""
    try:
        response = await client.get(blog_url, follow_redirects=True, timeout=10.0)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, "html.parser")
        
        tech_mentions = {
            "frontend": [],
            "backend": [],
            "database": [],
            "infrastructure": [],
            "monitoring": []
        }
        
        text_content = soup.get_text().lower()
        
        for category, patterns in TECH_STACK_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, text_content, re.IGNORECASE):
                    tech_name = pattern.replace(r"\.", ".").replace(r"\?", "")
                    tech_mentions[category].append(tech_name)
        
        tech_mentions = {k: list(set(v)) for k, v in tech_mentions.items() if v}
        
        return {
            "blog_url": blog_url,
            "tech_mentions": tech_mentions,
            "method": "blog_analysis",
            "scraped_at": datetime.now().isoformat(),
        }
    except Exception as e:
        return {
            "blog_url": blog_url,
            "error": str(e),
            "method": "blog_analysis"
        }


async def scrape_company_tech_stacks() -> Dict:
    """Main function to scrape company tech stacks from multiple sources."""
    results = {
        "scraped_at": datetime.now().isoformat(),
        "companies": [],
        "total_companies": 0,
        "sources": {
            "stackshare": 0,
            "website_detection": 0,
            "blog_analysis": 0,
        }
    }
    
    async with httpx.AsyncClient(
        timeout=30.0,
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
            "Accept": "text/html,application/xhtml+xml",
        }
    ) as client:
        print("Fetching featured companies from StackShare...")
        for company_slug in COMPANY_SOURCES["stackshare_featured"]:
            print(f"  Scraping: {company_slug}...")
            company_data = await fetch_stackshare_company(client, company_slug)
            if "error" not in company_data:
                results["companies"].append(company_data)
                results["sources"]["stackshare"] += 1
            await asyncio.sleep(2)
        
        print("\nDiscovering additional companies by category...")
        for category in COMPANY_SOURCES["tech_categories"]:
            print(f"  Fetching companies in: {category}...")
            company_slugs = await scrape_stackshare_companies_list(client, category)
            
            for slug in company_slugs[:10]:
                if not any(c.get("slug") == slug for c in results["companies"]):
                    print(f"    Scraping: {slug}...")
                    company_data = await fetch_stackshare_company(client, slug)
                    if "error" not in company_data:
                        results["companies"].append(company_data)
                        results["sources"]["stackshare"] += 1
                    await asyncio.sleep(2)
        
        print("\nEnhancing with website detection...")
        for company in results["companies"][:20]:
            if company.get("website"):
                print(f"  Analyzing website: {company['website']}")
                website_tech = await detect_tech_from_website(client, company["website"])
                if "detected_tech" in website_tech:
                    company["website_detected_tech"] = website_tech["detected_tech"]
                    results["sources"]["website_detection"] += 1
                await asyncio.sleep(1)
    
    results["total_companies"] = len(results["companies"])
    
    seen_companies = {}
    unique_companies = []
    for company in results["companies"]:
        name = company.get("name", "").lower()
        if name and name not in seen_companies:
            seen_companies[name] = True
            unique_companies.append(company)
    
    results["companies"] = unique_companies
    results["total_unique_companies"] = len(unique_companies)
    
    return results


if __name__ == "__main__":
    async def main():
        print("=" * 60)
        print("Company Tech Stack Scraper")
        print("=" * 60)
        
        results = await scrape_company_tech_stacks()
        
        output_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(output_dir, exist_ok=True)
        
        output_path = os.path.join(output_dir, "company_tech_stacks.json")
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        
        print("\n" + "=" * 60)
        print("SCRAPING COMPLETE")
        print("=" * 60)
        print(f"Total companies scraped: {results['total_unique_companies']}")
        print(f"StackShare companies: {results['sources']['stackshare']}")
        print(f"Website detections: {results['sources']['website_detection']}")
        print(f"\nSaved to: {output_path}")
    
    asyncio.run(main())
