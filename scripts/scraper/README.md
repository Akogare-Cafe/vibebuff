# Vibe Anything - Tool Metadata Scraper

A Python web scraper that fetches up-to-date metadata about development tools from various sources.

## Features

- **GitHub Scraper**: Fetches stars, forks, releases, contributors, and metadata from GitHub repos
- **NPM Scraper**: Fetches package info, download stats, and version history from npm
- **RSS Feed Scraper**: Monitors 50+ developer blogs and GitHub releases for updates
- **Web Search**: Searches DuckDuckGo for tool information and scrapes website metadata
- **Awesome Lists Scraper**: Parses awesome-vibe-coding lists for new tools

## Setup

1. Create a virtual environment:
```bash
cd scripts/scraper
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. (Optional) Add GitHub token for higher rate limits:
```bash
cp env.example .env
# Edit .env and add your GitHub token
```

## Usage

### Run all scrapers:
```bash
python main.py
```

### Run specific scrapers:
```bash
python main.py --only github    # Only GitHub
python main.py --only npm       # Only NPM
python main.py --only rss       # Only RSS feeds
python main.py --only web       # Only web search
python main.py --only awesome   # Only awesome lists
```

### Skip specific scrapers:
```bash
python main.py --skip-github --skip-web-search
```

### Run individual scrapers:
```bash
python github_scraper.py
python npm_scraper.py
python rss_feeds.py
python web_search.py
python awesome_lists_scraper.py
```

## Output

All data is saved to the `data/` directory:

- `github_metadata.json` - GitHub repository metadata
- `npm_metadata.json` - NPM package metadata
- `rss_feeds.json` - Raw RSS feed data
- `latest_releases.json` - Recent releases from GitHub
- `latest_posts.json` - Recent blog posts
- `web_search.json` - Web search results and website metadata
- `awesome_lists.json` - Raw awesome list data
- `awesome_tools.json` - Deduplicated tools from awesome lists
- `scrape_summary.json` - Summary of the scraping run

## RSS Feeds Monitored

### Official Blogs
- Vercel, Next.js, Supabase, Convex, Clerk
- Tailwind CSS, Astro, Svelte, Remix
- Deno, Bun, Cloudflare, Railway, Fly.io
- Neon, Turso, PlanetScale, Auth0
- Sentry, PostHog, Anthropic, OpenAI

### Developer News
- Hacker News (front page)
- Dev.to (JavaScript, React, Next.js, AI, WebDev)
- Reddit (r/webdev, r/reactjs, r/nextjs, r/vibecoding, r/ChatGPTCoding)

### GitHub Releases
- React, Next.js, Svelte, Vue, Tailwind
- Vite, Bun, Deno, Supabase, Playwright
- Aider, Cline, OpenHands

## Awesome Lists Scraped

- [filipecalegario/awesome-vibe-coding](https://github.com/filipecalegario/awesome-vibe-coding)
- [roboco-io/awesome-vibecoding](https://github.com/roboco-io/awesome-vibecoding)
- [no-fluff/awesome-vibe-coding](https://github.com/no-fluff/awesome-vibe-coding)

## Scheduling

To keep data up-to-date, run the scraper on a schedule:

### Using cron (Linux/macOS):
```bash
# Run daily at 6 AM
0 6 * * * cd /path/to/vibe-anything/scripts/scraper && python main.py
```

### Using GitHub Actions:
See `.github/workflows/scrape-tools.yml` for automated scraping.

## Rate Limits

- **GitHub**: 60 requests/hour without token, 5000/hour with token
- **NPM**: No strict limits, but be respectful
- **DuckDuckGo**: Rate limited, scraper includes delays
- **RSS**: No limits, but feeds are cached

## License

MIT
