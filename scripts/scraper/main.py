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
from github_trending import scrape_github_trending
from alternativeto_scraper import scrape_alternativeto
from stackshare_scraper import scrape_stackshare
from devhunt_scraper import scrape_devhunt
from ai_directories_scraper import scrape_ai_directories
from vscode_marketplace_scraper import scrape_vscode_marketplace
from package_registries_scraper import scrape_package_registries
from indiehackers_scraper import scrape_indiehackers
from betalist_scraper import scrape_betalist
from hackernews_scraper import scrape_hackernews


async def run_all_scrapers(
    skip_github: bool = False,
    skip_npm: bool = False,
    skip_rss: bool = False,
    skip_web_search: bool = False,
    skip_awesome_lists: bool = False,
    skip_articles: bool = False,
    skip_producthunt: bool = False,
    skip_github_trending: bool = False,
    skip_alternativeto: bool = False,
    skip_stackshare: bool = False,
    skip_devhunt: bool = False,
    skip_ai_directories: bool = False,
    skip_vscode: bool = False,
    skip_packages: bool = False,
    skip_indiehackers: bool = False,
    skip_betalist: bool = False,
    skip_hackernews: bool = False,
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
    
    # GitHub Trending
    if not skip_github_trending:
        print("\n=== Scraping GitHub Trending ===")
        trending_data = await scrape_github_trending()
        results["sources"]["github_trending"] = {
            "unique_repos": trending_data.get("total_unique_repos", 0),
        }
        with open(os.path.join(output_dir, "github_trending.json"), "w") as f:
            json.dump(trending_data, f, indent=2)
        print(f"GitHub Trending: {trending_data.get('total_unique_repos', 0)} unique repos")
    
    # AlternativeTo
    if not skip_alternativeto:
        print("\n=== Scraping AlternativeTo ===")
        alt_data = await scrape_alternativeto()
        results["sources"]["alternativeto"] = {
            "unique_tools": alt_data.get("total_unique_tools", 0),
        }
        with open(os.path.join(output_dir, "alternativeto.json"), "w") as f:
            json.dump(alt_data, f, indent=2)
        print(f"AlternativeTo: {alt_data.get('total_unique_tools', 0)} unique tools")
    
    # StackShare
    if not skip_stackshare:
        print("\n=== Scraping StackShare ===")
        stack_data = await scrape_stackshare()
        results["sources"]["stackshare"] = {
            "unique_tools": stack_data.get("total_unique_tools", 0),
        }
        with open(os.path.join(output_dir, "stackshare.json"), "w") as f:
            json.dump(stack_data, f, indent=2)
        print(f"StackShare: {stack_data.get('total_unique_tools', 0)} unique tools")
    
    # DevHunt
    if not skip_devhunt:
        print("\n=== Scraping DevHunt ===")
        devhunt_data = await scrape_devhunt()
        results["sources"]["devhunt"] = {
            "unique_tools": devhunt_data.get("total_unique_tools", 0),
        }
        with open(os.path.join(output_dir, "devhunt.json"), "w") as f:
            json.dump(devhunt_data, f, indent=2)
        print(f"DevHunt: {devhunt_data.get('total_unique_tools', 0)} unique tools")
    
    # AI Directories
    if not skip_ai_directories:
        print("\n=== Scraping AI Tool Directories ===")
        ai_dir_data = await scrape_ai_directories()
        results["sources"]["ai_directories"] = {
            "unique_tools": ai_dir_data.get("total_unique_tools", 0),
        }
        with open(os.path.join(output_dir, "ai_directories.json"), "w") as f:
            json.dump(ai_dir_data, f, indent=2)
        print(f"AI Directories: {ai_dir_data.get('total_unique_tools', 0)} unique tools")
    
    # VS Code Marketplace
    if not skip_vscode:
        print("\n=== Scraping VS Code Marketplace ===")
        vscode_data = await scrape_vscode_marketplace()
        results["sources"]["vscode_marketplace"] = {
            "unique_extensions": vscode_data.get("total_unique_extensions", 0),
        }
        with open(os.path.join(output_dir, "vscode_marketplace.json"), "w") as f:
            json.dump(vscode_data, f, indent=2)
        print(f"VS Code Marketplace: {vscode_data.get('total_unique_extensions', 0)} unique extensions")
    
    # Package Registries (PyPI, crates.io, pkg.go.dev)
    if not skip_packages:
        print("\n=== Scraping Package Registries ===")
        pkg_data = await scrape_package_registries()
        results["sources"]["package_registries"] = {
            "total_packages": pkg_data.get("total_packages", 0),
        }
        with open(os.path.join(output_dir, "package_registries.json"), "w") as f:
            json.dump(pkg_data, f, indent=2)
        print(f"Package Registries: {pkg_data.get('total_packages', 0)} packages")
    
    # Indie Hackers
    if not skip_indiehackers:
        print("\n=== Scraping Indie Hackers ===")
        ih_data = await scrape_indiehackers()
        results["sources"]["indiehackers"] = {
            "unique_products": ih_data.get("total_unique_products", 0),
        }
        with open(os.path.join(output_dir, "indiehackers.json"), "w") as f:
            json.dump(ih_data, f, indent=2)
        print(f"Indie Hackers: {ih_data.get('total_unique_products', 0)} unique products")
    
    # BetaList
    if not skip_betalist:
        print("\n=== Scraping BetaList ===")
        beta_data = await scrape_betalist()
        results["sources"]["betalist"] = {
            "unique_startups": beta_data.get("total_unique_startups", 0),
        }
        with open(os.path.join(output_dir, "betalist.json"), "w") as f:
            json.dump(beta_data, f, indent=2)
        print(f"BetaList: {beta_data.get('total_unique_startups', 0)} unique startups")
    
    # Hacker News
    if not skip_hackernews:
        print("\n=== Scraping Hacker News ===")
        hn_data = await scrape_hackernews()
        results["sources"]["hackernews"] = {
            "unique_stories": hn_data.get("total_unique_stories", 0),
            "tool_launches": hn_data.get("total_tool_launches", 0),
        }
        with open(os.path.join(output_dir, "hackernews.json"), "w") as f:
            json.dump(hn_data, f, indent=2)
        print(f"Hacker News: {hn_data.get('total_unique_stories', 0)} stories, {hn_data.get('total_tool_launches', 0)} tool launches")
    
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
    parser.add_argument("--skip-trending", action="store_true", help="Skip GitHub trending")
    parser.add_argument("--skip-alternativeto", action="store_true", help="Skip AlternativeTo")
    parser.add_argument("--skip-stackshare", action="store_true", help="Skip StackShare")
    parser.add_argument("--skip-devhunt", action="store_true", help="Skip DevHunt")
    parser.add_argument("--skip-ai-directories", action="store_true", help="Skip AI directories")
    parser.add_argument("--skip-vscode", action="store_true", help="Skip VS Code Marketplace")
    parser.add_argument("--skip-packages", action="store_true", help="Skip package registries")
    parser.add_argument("--skip-indiehackers", action="store_true", help="Skip Indie Hackers")
    parser.add_argument("--skip-betalist", action="store_true", help="Skip BetaList")
    parser.add_argument("--skip-hackernews", action="store_true", help="Skip Hacker News")
    parser.add_argument("--only", choices=[
        "github", "npm", "rss", "web", "awesome", "articles", "producthunt",
        "trending", "alternativeto", "stackshare", "devhunt", "ai-directories",
        "vscode", "packages", "indiehackers", "betalist", "hackernews"
    ], help="Only run specific scraper")
    
    args = parser.parse_args()
    
    all_scrapers = [
        "github", "npm", "rss", "web", "awesome", "articles", "producthunt",
        "trending", "alternativeto", "stackshare", "devhunt", "ai-directories",
        "vscode", "packages", "indiehackers", "betalist", "hackernews"
    ]
    
    if args.only:
        skip_github = args.only != "github"
        skip_npm = args.only != "npm"
        skip_rss = args.only != "rss"
        skip_web_search = args.only != "web"
        skip_awesome_lists = args.only != "awesome"
        skip_articles = args.only != "articles"
        skip_producthunt = args.only != "producthunt"
        skip_github_trending = args.only != "trending"
        skip_alternativeto = args.only != "alternativeto"
        skip_stackshare = args.only != "stackshare"
        skip_devhunt = args.only != "devhunt"
        skip_ai_directories = args.only != "ai-directories"
        skip_vscode = args.only != "vscode"
        skip_packages = args.only != "packages"
        skip_indiehackers = args.only != "indiehackers"
        skip_betalist = args.only != "betalist"
        skip_hackernews = args.only != "hackernews"
    else:
        skip_github = args.skip_github
        skip_npm = args.skip_npm
        skip_rss = args.skip_rss
        skip_web_search = args.skip_web_search
        skip_awesome_lists = args.skip_awesome
        skip_articles = args.skip_articles
        skip_producthunt = args.skip_producthunt
        skip_github_trending = args.skip_trending
        skip_alternativeto = args.skip_alternativeto
        skip_stackshare = args.skip_stackshare
        skip_devhunt = args.skip_devhunt
        skip_ai_directories = args.skip_ai_directories
        skip_vscode = args.skip_vscode
        skip_packages = args.skip_packages
        skip_indiehackers = args.skip_indiehackers
        skip_betalist = args.skip_betalist
        skip_hackernews = args.skip_hackernews
    
    async def main():
        results = await run_all_scrapers(
            skip_github=skip_github,
            skip_npm=skip_npm,
            skip_rss=skip_rss,
            skip_web_search=skip_web_search,
            skip_awesome_lists=skip_awesome_lists,
            skip_articles=skip_articles,
            skip_producthunt=skip_producthunt,
            skip_github_trending=skip_github_trending,
            skip_alternativeto=skip_alternativeto,
            skip_stackshare=skip_stackshare,
            skip_devhunt=skip_devhunt,
            skip_ai_directories=skip_ai_directories,
            skip_vscode=skip_vscode,
            skip_packages=skip_packages,
            skip_indiehackers=skip_indiehackers,
            skip_betalist=skip_betalist,
            skip_hackernews=skip_hackernews,
        )
        print_summary(results)
    
    asyncio.run(main())
