"""
Main Scraper - Aggregates data from all sources
Enhanced with article scraping, Product Hunt discovery, and comprehensive metadata extraction
"""
import os
import json
import asyncio
from datetime import datetime

from github_scraper import scrape_github_repos, TOOL_GITHUB_URLS
from npm_scraper import scrape_npm_packages, NPM_PACKAGES
from rss_feeds import scrape_all_feeds, get_latest_releases, get_latest_blog_posts, RSS_FEEDS
from web_search import search_multiple_tools, TOOLS_TO_SEARCH, DISCOVERY_SEARCH_QUERIES
from awesome_lists_scraper import scrape_awesome_lists, deduplicate_tools
from article_scraper import scrape_articles, aggregate_tool_mentions, filter_articles_with_tools
from producthunt_scraper import discover_developer_tools, enrich_products


async def run_all_scrapers(
    skip_github: bool = False,
    skip_npm: bool = False,
    skip_rss: bool = False,
    skip_web_search: bool = False,
    skip_awesome_lists: bool = False,
    skip_articles: bool = False,
    skip_producthunt: bool = False,
) -> dict:
    """Run all scrapers and aggregate results."""
    
    output_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(output_dir, exist_ok=True)
    
    results = {
        "scraped_at": datetime.now().isoformat(),
        "sources": {},
    }
    
    # GitHub metadata
    if not skip_github:
        print("\n=== Scraping GitHub Repositories ===")
        github_data = await scrape_github_repos(TOOL_GITHUB_URLS)
        results["sources"]["github"] = {
            "count": len(github_data),
            "successful": sum(1 for r in github_data.values() if "error" not in r),
        }
        with open(os.path.join(output_dir, "github_metadata.json"), "w") as f:
            json.dump(github_data, f, indent=2)
        print(f"GitHub: {results['sources']['github']['successful']}/{results['sources']['github']['count']} repos")
    
    # NPM packages
    if not skip_npm:
        print("\n=== Scraping NPM Packages ===")
        npm_data = await scrape_npm_packages(NPM_PACKAGES)
        results["sources"]["npm"] = {
            "count": len(npm_data),
            "successful": sum(1 for r in npm_data.values() if "error" not in r),
        }
        with open(os.path.join(output_dir, "npm_metadata.json"), "w") as f:
            json.dump(npm_data, f, indent=2)
        print(f"NPM: {results['sources']['npm']['successful']}/{results['sources']['npm']['count']} packages")
    
    # RSS feeds
    if not skip_rss:
        print("\n=== Scraping RSS Feeds ===")
        rss_data = scrape_all_feeds(RSS_FEEDS)
        results["sources"]["rss"] = {
            "count": len(rss_data),
            "successful": sum(1 for r in rss_data.values() if "error" not in r),
        }
        with open(os.path.join(output_dir, "rss_feeds.json"), "w") as f:
            json.dump(rss_data, f, indent=2)
        
        # Save processed data
        releases = get_latest_releases(rss_data)
        with open(os.path.join(output_dir, "latest_releases.json"), "w") as f:
            json.dump(releases, f, indent=2)
        
        posts = get_latest_blog_posts(rss_data)
        with open(os.path.join(output_dir, "latest_posts.json"), "w") as f:
            json.dump(posts, f, indent=2)
        
        results["sources"]["rss"]["releases"] = len(releases)
        results["sources"]["rss"]["posts"] = len(posts)
        print(f"RSS: {results['sources']['rss']['successful']}/{results['sources']['rss']['count']} feeds")
        print(f"  - {len(releases)} releases, {len(posts)} blog posts")
    
    # Web search
    if not skip_web_search:
        print("\n=== Running Web Search ===")
        web_data = await search_multiple_tools(TOOLS_TO_SEARCH)
        results["sources"]["web_search"] = {
            "count": len(web_data),
        }
        with open(os.path.join(output_dir, "web_search.json"), "w") as f:
            json.dump(web_data, f, indent=2)
        print(f"Web Search: {len(web_data)} tools searched")
    
    # Awesome lists
    if not skip_awesome_lists:
        print("\n=== Scraping Awesome Lists ===")
        awesome_data = await scrape_awesome_lists()
        unique_tools = deduplicate_tools(awesome_data)
        results["sources"]["awesome_lists"] = {
            "count": len(awesome_data),
            "unique_tools": len(unique_tools),
        }
        with open(os.path.join(output_dir, "awesome_lists.json"), "w") as f:
            json.dump(awesome_data, f, indent=2)
        with open(os.path.join(output_dir, "awesome_tools.json"), "w") as f:
            json.dump(unique_tools, f, indent=2)
        print(f"Awesome Lists: {len(unique_tools)} unique tools from {len(awesome_data)} lists")
    
    # Article scraping
    if not skip_articles:
        print("\n=== Scraping Articles for Tool Mentions ===")
        article_urls = []
        
        if "rss" in results.get("sources", {}):
            posts = get_latest_blog_posts(results.get("_rss_data", {}))
            article_urls = [p["link"] for p in posts[:50] if p.get("link")]
        
        if article_urls:
            article_data = await scrape_articles(article_urls[:30])
            tool_mentions = aggregate_tool_mentions(article_data)
            articles_with_tools = filter_articles_with_tools(article_data)
            
            results["sources"]["articles"] = {
                "count": len(article_data),
                "with_tool_mentions": len(articles_with_tools),
                "unique_tools_mentioned": len(tool_mentions),
            }
            
            with open(os.path.join(output_dir, "article_scrapes.json"), "w") as f:
                json.dump(article_data, f, indent=2)
            with open(os.path.join(output_dir, "tool_mentions.json"), "w") as f:
                json.dump(tool_mentions, f, indent=2)
            
            print(f"Articles: {len(articles_with_tools)} articles mention tools")
            print(f"  - {len(tool_mentions)} unique tools mentioned")
    
    # Product Hunt discovery
    if not skip_producthunt:
        print("\n=== Discovering Tools from Product Hunt ===")
        ph_data = await discover_developer_tools()
        
        results["sources"]["producthunt"] = {
            "topics_scraped": len(ph_data.get("topics", {})),
            "searches_performed": len(ph_data.get("searches", {})),
            "unique_products": ph_data.get("total_unique", 0),
        }
        
        with open(os.path.join(output_dir, "producthunt_tools.json"), "w") as f:
            json.dump(ph_data, f, indent=2)
        
        print(f"Product Hunt: {ph_data.get('total_unique', 0)} unique products discovered")
    
    # Save summary
    with open(os.path.join(output_dir, "scrape_summary.json"), "w") as f:
        json.dump(results, f, indent=2)
    
    return results


def print_summary(results: dict):
    """Print a summary of the scraping results."""
    print("\n" + "=" * 50)
    print("SCRAPING COMPLETE")
    print("=" * 50)
    print(f"Scraped at: {results['scraped_at']}")
    print("\nSources:")
    for source, data in results.get("sources", {}).items():
        print(f"  - {source}: {data}")


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Scrape tool metadata from various sources")
    parser.add_argument("--skip-github", action="store_true", help="Skip GitHub scraping")
    parser.add_argument("--skip-npm", action="store_true", help="Skip NPM scraping")
    parser.add_argument("--skip-rss", action="store_true", help="Skip RSS feed scraping")
    parser.add_argument("--skip-web-search", action="store_true", help="Skip web search")
    parser.add_argument("--skip-awesome", action="store_true", help="Skip awesome lists scraping")
    parser.add_argument("--skip-articles", action="store_true", help="Skip article scraping")
    parser.add_argument("--skip-producthunt", action="store_true", help="Skip Product Hunt discovery")
    parser.add_argument("--only", choices=["github", "npm", "rss", "web", "awesome", "articles", "producthunt"], help="Only run specific scraper")
    
    args = parser.parse_args()
    
    if args.only:
        skip_github = args.only != "github"
        skip_npm = args.only != "npm"
        skip_rss = args.only != "rss"
        skip_web_search = args.only != "web"
        skip_awesome_lists = args.only != "awesome"
        skip_articles = args.only != "articles"
        skip_producthunt = args.only != "producthunt"
    else:
        skip_github = args.skip_github
        skip_npm = args.skip_npm
        skip_rss = args.skip_rss
        skip_web_search = args.skip_web_search
        skip_awesome_lists = args.skip_awesome
        skip_articles = args.skip_articles
        skip_producthunt = args.skip_producthunt
    
    async def main():
        results = await run_all_scrapers(
            skip_github=skip_github,
            skip_npm=skip_npm,
            skip_rss=skip_rss,
            skip_web_search=skip_web_search,
            skip_awesome_lists=skip_awesome_lists,
            skip_articles=skip_articles,
            skip_producthunt=skip_producthunt,
        )
        print_summary(results)
    
    asyncio.run(main())
