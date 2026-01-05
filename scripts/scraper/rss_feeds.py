"""
RSS Feed Scraper - Fetches latest updates from developer blogs and news sources
"""
import os
import json
import ssl
import certifi
import feedparser
from datetime import datetime
from typing import Optional
import httpx

# RSS Feeds for developer tools and vibe coding news
RSS_FEEDS = {
    # Official blogs - Infrastructure & Platforms
    "vercel_blog": "https://vercel.com/atom",
    "nextjs_blog": "https://nextjs.org/feed.xml",
    "supabase_blog": "https://supabase.com/rss.xml",
    "convex_blog": "https://blog.convex.dev/rss/",
    "clerk_blog": "https://clerk.com/blog/rss.xml",
    "tailwind_blog": "https://tailwindcss.com/feeds/feed.xml",
    "astro_blog": "https://astro.build/rss.xml",
    "svelte_blog": "https://svelte.dev/blog/rss.xml",
    "remix_blog": "https://remix.run/blog.rss",
    "deno_blog": "https://deno.com/feed",
    "bun_blog": "https://bun.sh/rss.xml",
    "cloudflare_blog": "https://blog.cloudflare.com/rss/",
    "railway_blog": "https://blog.railway.app/rss.xml",
    "fly_blog": "https://fly.io/blog/feed.xml",
    "neon_blog": "https://neon.tech/blog/rss.xml",
    "turso_blog": "https://blog.turso.tech/rss.xml",
    "planetscale_blog": "https://planetscale.com/blog/rss.xml",
    "auth0_blog": "https://auth0.com/blog/rss.xml",
    "sentry_blog": "https://blog.sentry.io/feed.xml",
    "posthog_blog": "https://posthog.com/blog/rss.xml",
    "render_blog": "https://render.com/blog/rss.xml",
    "netlify_blog": "https://www.netlify.com/blog/feed.xml",
    "prisma_blog": "https://www.prisma.io/blog/rss.xml",
    "drizzle_blog": "https://orm.drizzle.team/rss.xml",
    "stripe_blog": "https://stripe.com/blog/feed.rss",
    "twilio_blog": "https://www.twilio.com/blog/feed",
    "resend_blog": "https://resend.com/blog/rss.xml",
    "upstash_blog": "https://upstash.com/blog/rss.xml",
    "inngest_blog": "https://www.inngest.com/blog/feed.xml",
    "trigger_blog": "https://trigger.dev/blog/rss.xml",
    
    # AI/LLM blogs & Companies
    "anthropic_blog": "https://www.anthropic.com/rss.xml",
    "openai_blog": "https://openai.com/blog/rss.xml",
    "google_ai_blog": "https://blog.google/technology/ai/rss/",
    "huggingface_blog": "https://huggingface.co/blog/feed.xml",
    "langchain_blog": "https://blog.langchain.dev/rss/",
    "llamaindex_blog": "https://www.llamaindex.ai/blog/rss.xml",
    "replicate_blog": "https://replicate.com/blog/rss.xml",
    "together_blog": "https://www.together.ai/blog/rss.xml",
    "anyscale_blog": "https://www.anyscale.com/blog/rss.xml",
    "modal_blog": "https://modal.com/blog/rss.xml",
    "fireworks_blog": "https://fireworks.ai/blog/rss.xml",
    "groq_blog": "https://groq.com/blog/rss.xml",
    "mistral_blog": "https://mistral.ai/news/rss.xml",
    "cohere_blog": "https://cohere.com/blog/rss.xml",
    
    # AI Coding Tools blogs
    "cursor_blog": "https://cursor.com/blog/rss.xml",
    "codeium_blog": "https://codeium.com/blog/rss.xml",
    "tabnine_blog": "https://www.tabnine.com/blog/feed/",
    "sourcegraph_blog": "https://about.sourcegraph.com/blog/rss.xml",
    "replit_blog": "https://blog.replit.com/feed.xml",
    "github_blog": "https://github.blog/feed/",
    "gitlab_blog": "https://about.gitlab.com/atom.xml",
    
    # Developer news & Tech publications
    "hacker_news": "https://hnrss.org/frontpage",
    "hacker_news_ai": "https://hnrss.org/newest?q=AI+coding",
    "hacker_news_llm": "https://hnrss.org/newest?q=LLM",
    "hacker_news_cursor": "https://hnrss.org/newest?q=cursor+editor",
    "hacker_news_vibecoding": "https://hnrss.org/newest?q=vibe+coding",
    "lobsters": "https://lobste.rs/rss",
    "techcrunch_ai": "https://techcrunch.com/category/artificial-intelligence/feed/",
    "the_verge_ai": "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    "ars_technica": "https://feeds.arstechnica.com/arstechnica/technology-lab",
    "wired_ai": "https://www.wired.com/feed/tag/ai/latest/rss",
    
    # Dev.to tags
    "dev_to_javascript": "https://dev.to/feed/tag/javascript",
    "dev_to_react": "https://dev.to/feed/tag/react",
    "dev_to_nextjs": "https://dev.to/feed/tag/nextjs",
    "dev_to_ai": "https://dev.to/feed/tag/ai",
    "dev_to_webdev": "https://dev.to/feed/tag/webdev",
    "dev_to_typescript": "https://dev.to/feed/tag/typescript",
    "dev_to_devtools": "https://dev.to/feed/tag/devtools",
    "dev_to_productivity": "https://dev.to/feed/tag/productivity",
    "dev_to_llm": "https://dev.to/feed/tag/llm",
    "dev_to_openai": "https://dev.to/feed/tag/openai",
    "dev_to_cursor": "https://dev.to/feed/tag/cursor",
    "dev_to_copilot": "https://dev.to/feed/tag/copilot",
    
    # Hashnode tags
    "hashnode_ai": "https://hashnode.com/n/ai/rss",
    "hashnode_webdev": "https://hashnode.com/n/web-development/rss",
    "hashnode_devtools": "https://hashnode.com/n/developer-tools/rss",
    "hashnode_javascript": "https://hashnode.com/n/javascript/rss",
    
    # Medium publications
    "medium_ai": "https://medium.com/feed/tag/artificial-intelligence",
    "medium_programming": "https://medium.com/feed/tag/programming",
    "medium_webdev": "https://medium.com/feed/tag/web-development",
    "medium_devtools": "https://medium.com/feed/tag/developer-tools",
    
    # Reddit
    "reddit_webdev": "https://www.reddit.com/r/webdev/.rss",
    "reddit_reactjs": "https://www.reddit.com/r/reactjs/.rss",
    "reddit_nextjs": "https://www.reddit.com/r/nextjs/.rss",
    "reddit_vibecoding": "https://www.reddit.com/r/vibecoding/.rss",
    "reddit_chatgptcoding": "https://www.reddit.com/r/ChatGPTCoding/.rss",
    "reddit_cursor": "https://www.reddit.com/r/cursor/.rss",
    "reddit_localllama": "https://www.reddit.com/r/LocalLLaMA/.rss",
    "reddit_machinelearning": "https://www.reddit.com/r/MachineLearning/.rss",
    "reddit_programming": "https://www.reddit.com/r/programming/.rss",
    "reddit_devops": "https://www.reddit.com/r/devops/.rss",
    "reddit_selfhosted": "https://www.reddit.com/r/selfhosted/.rss",
    
    # YouTube channels (RSS feeds)
    "fireship_youtube": "https://www.youtube.com/feeds/videos.xml?channel_id=UCsBjURrPoezykLs9EqgamOA",
    "theo_youtube": "https://www.youtube.com/feeds/videos.xml?channel_id=UCbRP3c757lWg9M-U7TyEkXA",
    "primeagen_youtube": "https://www.youtube.com/feeds/videos.xml?channel_id=UC8ENHE5xdFSwx71u3fDH5Xw",
    "traversy_youtube": "https://www.youtube.com/feeds/videos.xml?channel_id=UC29ju8bIPH5as8OGnQzwJyA",
    "webdevsimplified_youtube": "https://www.youtube.com/feeds/videos.xml?channel_id=UCFbNIlppjAuEX4znoulh0Cw",
    "devaslife_youtube": "https://www.youtube.com/feeds/videos.xml?channel_id=UC7yZ6keOGsvERMp2HaEbbXQ",
    
    # GitHub releases (via RSS) - Frameworks
    "react_releases": "https://github.com/facebook/react/releases.atom",
    "nextjs_releases": "https://github.com/vercel/next.js/releases.atom",
    "svelte_releases": "https://github.com/sveltejs/svelte/releases.atom",
    "vue_releases": "https://github.com/vuejs/vue/releases.atom",
    "tailwind_releases": "https://github.com/tailwindlabs/tailwindcss/releases.atom",
    "vite_releases": "https://github.com/vitejs/vite/releases.atom",
    "bun_releases": "https://github.com/oven-sh/bun/releases.atom",
    "deno_releases": "https://github.com/denoland/deno/releases.atom",
    "supabase_releases": "https://github.com/supabase/supabase/releases.atom",
    "playwright_releases": "https://github.com/microsoft/playwright/releases.atom",
    "astro_releases": "https://github.com/withastro/astro/releases.atom",
    "remix_releases": "https://github.com/remix-run/remix/releases.atom",
    "prisma_releases": "https://github.com/prisma/prisma/releases.atom",
    "drizzle_releases": "https://github.com/drizzle-team/drizzle-orm/releases.atom",
    "trpc_releases": "https://github.com/trpc/trpc/releases.atom",
    "tanstack_query_releases": "https://github.com/TanStack/query/releases.atom",
    "zustand_releases": "https://github.com/pmndrs/zustand/releases.atom",
    "shadcn_releases": "https://github.com/shadcn-ui/ui/releases.atom",
    
    # GitHub releases - AI Coding Tools
    "aider_releases": "https://github.com/paul-gauthier/aider/releases.atom",
    "cline_releases": "https://github.com/cline/cline/releases.atom",
    "openhands_releases": "https://github.com/All-Hands-AI/OpenHands/releases.atom",
    "continue_releases": "https://github.com/continuedev/continue/releases.atom",
    "goose_releases": "https://github.com/block/goose/releases.atom",
    "roocode_releases": "https://github.com/RooVetGit/Roo-Code/releases.atom",
    "kilocode_releases": "https://github.com/Kilo-Org/kilocode/releases.atom",
    "tabby_releases": "https://github.com/TabbyML/tabby/releases.atom",
    "ollama_releases": "https://github.com/ollama/ollama/releases.atom",
    "llamacpp_releases": "https://github.com/ggerganov/llama.cpp/releases.atom",
    "langchain_releases": "https://github.com/langchain-ai/langchain/releases.atom",
    "llamaindex_releases": "https://github.com/run-llama/llama_index/releases.atom",
    
    # Newsletters & Aggregators
    "tldr_newsletter": "https://tldr.tech/tech/rss",
    "bytes_newsletter": "https://bytes.dev/rss",
    "javascriptweekly": "https://javascriptweekly.com/rss/",
    "reactnewsletter": "https://reactnewsletter.com/rss/",
    "nodeweekly": "https://nodeweekly.com/rss/",
}


def parse_feed(url: str, max_entries: int = 10) -> dict:
    """Parse an RSS/Atom feed and return structured data."""
    try:
        # Use httpx for better SSL handling
        headers = {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
        try:
            with httpx.Client(timeout=15.0, follow_redirects=True) as client:
                response = client.get(url, headers=headers)
                content = response.text
            feed = feedparser.parse(content)
        except Exception as fetch_error:
            # Fallback to direct parsing
            feed = feedparser.parse(url)
        
        if feed.bozo and not feed.entries:
            return {"error": f"Failed to parse feed: {feed.bozo_exception}"}
        
        entries = []
        for entry in feed.entries[:max_entries]:
            published = None
            if hasattr(entry, 'published_parsed') and entry.published_parsed:
                try:
                    published = datetime(*entry.published_parsed[:6]).isoformat()
                except Exception:
                    pass
            elif hasattr(entry, 'updated_parsed') and entry.updated_parsed:
                try:
                    published = datetime(*entry.updated_parsed[:6]).isoformat()
                except Exception:
                    pass
            
            entries.append({
                "title": entry.get("title", ""),
                "link": entry.get("link", ""),
                "published": published,
                "summary": entry.get("summary", "")[:500] if entry.get("summary") else None,
                "author": entry.get("author", ""),
            })
        
        return {
            "title": feed.feed.get("title", ""),
            "link": feed.feed.get("link", ""),
            "description": feed.feed.get("description", ""),
            "last_updated": datetime.now().isoformat(),
            "entries_count": len(entries),
            "entries": entries,
        }
    except Exception as e:
        return {"error": str(e)}


def scrape_all_feeds(feeds: dict = RSS_FEEDS, max_entries: int = 10) -> dict:
    """Scrape all configured RSS feeds."""
    results = {}
    
    for name, url in feeds.items():
        print(f"Fetching feed: {name}")
        results[name] = parse_feed(url, max_entries)
    
    return results


def get_latest_releases(results: dict) -> list:
    """Extract latest releases from GitHub release feeds."""
    releases = []
    
    for name, data in results.items():
        if name.endswith("_releases") and "error" not in data:
            for entry in data.get("entries", []):
                releases.append({
                    "source": name.replace("_releases", ""),
                    "title": entry.get("title"),
                    "link": entry.get("link"),
                    "published": entry.get("published"),
                })
    
    # Sort by published date
    releases.sort(key=lambda x: x.get("published") or "", reverse=True)
    return releases


def get_latest_blog_posts(results: dict, limit: int = 50) -> list:
    """Extract latest blog posts from all feeds."""
    posts = []
    
    for name, data in results.items():
        if "_releases" not in name and "error" not in data:
            for entry in data.get("entries", []):
                posts.append({
                    "source": name,
                    "title": entry.get("title"),
                    "link": entry.get("link"),
                    "published": entry.get("published"),
                    "author": entry.get("author"),
                })
    
    # Sort by published date
    posts.sort(key=lambda x: x.get("published") or "", reverse=True)
    return posts[:limit]


if __name__ == "__main__":
    results = scrape_all_feeds()
    
    output_dir = os.path.join(os.path.dirname(__file__), "data")
    os.makedirs(output_dir, exist_ok=True)
    
    # Save all feed data
    with open(os.path.join(output_dir, "rss_feeds.json"), "w") as f:
        json.dump(results, f, indent=2)
    
    # Save latest releases
    releases = get_latest_releases(results)
    with open(os.path.join(output_dir, "latest_releases.json"), "w") as f:
        json.dump(releases, f, indent=2)
    
    # Save latest blog posts
    posts = get_latest_blog_posts(results)
    with open(os.path.join(output_dir, "latest_posts.json"), "w") as f:
        json.dump(posts, f, indent=2)
    
    print(f"\nSaved {len(results)} feeds")
    print(f"Found {len(releases)} releases")
    print(f"Found {len(posts)} blog posts")
    
    # Print summary
    successful = sum(1 for r in results.values() if "error" not in r)
    print(f"Successfully fetched: {successful}/{len(results)}")
