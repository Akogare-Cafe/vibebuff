# VibeBuff - Tool Metadata Scraper

A comprehensive Python web scraper that discovers and fetches metadata about development tools from various sources including RSS feeds, blogs, articles, Product Hunt, and more.

## Features

- **GitHub Scraper**: Fetches stars, forks, releases, contributors, and metadata from 100+ GitHub repos
- **NPM Scraper**: Fetches package info, download stats, and version history from npm
- **RSS Feed Scraper**: Monitors 150+ developer blogs, YouTube channels, newsletters, and GitHub releases
- **Web Search**: Searches DuckDuckGo for 100+ tools with comprehensive metadata extraction (pricing, features, integrations)
- **Awesome Lists Scraper**: Parses 20+ awesome lists for new tools
- **Article Scraper**: Extracts tool mentions from blog posts and articles with context
- **Product Hunt Scraper**: Discovers new developer tools from Product Hunt topics and searches

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
python main.py --only github        # Only GitHub repos
python main.py --only npm           # Only NPM packages
python main.py --only rss           # Only RSS feeds
python main.py --only web           # Only web search
python main.py --only awesome       # Only awesome lists
python main.py --only articles      # Only article scraping
python main.py --only producthunt   # Only Product Hunt
python main.py --only trending      # Only GitHub Trending
python main.py --only alternativeto # Only AlternativeTo
python main.py --only stackshare    # Only StackShare
python main.py --only devhunt       # Only DevHunt
python main.py --only ai-directories # Only AI tool directories
python main.py --only vscode        # Only VS Code Marketplace
python main.py --only packages      # Only package registries
python main.py --only indiehackers  # Only Indie Hackers
python main.py --only betalist      # Only BetaList
python main.py --only hackernews    # Only Hacker News
```

### Skip specific scrapers:
```bash
python main.py --skip-github --skip-web-search
python main.py --skip-articles --skip-producthunt
```

### Run individual scrapers:
```bash
python github_scraper.py
python npm_scraper.py
python rss_feeds.py
python web_search.py
python awesome_lists_scraper.py
python article_scraper.py
python producthunt_scraper.py
python github_trending.py
python alternativeto_scraper.py
python stackshare_scraper.py
python devhunt_scraper.py
python ai_directories_scraper.py
python vscode_marketplace_scraper.py
python package_registries_scraper.py
python indiehackers_scraper.py
python betalist_scraper.py
python hackernews_scraper.py
```

## Output

All data is saved to the `data/` directory:

- `github_metadata.json` - GitHub repository metadata (stars, forks, releases, contributors)
- `npm_metadata.json` - NPM package metadata (downloads, versions, dependencies)
- `rss_feeds.json` - Raw RSS feed data from 150+ sources
- `latest_releases.json` - Recent releases from GitHub
- `latest_posts.json` - Recent blog posts from developer blogs
- `web_search.json` - Web search results with comprehensive metadata (pricing, features, integrations)
- `awesome_lists.json` - Raw awesome list data
- `awesome_tools.json` - Deduplicated tools from awesome lists
- `article_scrapes.json` - Scraped articles with tool mentions
- `tool_mentions.json` - Aggregated tool mentions across all articles
- `producthunt_tools.json` - Developer tools discovered from Product Hunt
- `scrape_summary.json` - Summary of the scraping run

## RSS Feeds Monitored (150+ sources)

### Official Blogs - Infrastructure & Platforms
- Vercel, Next.js, Supabase, Convex, Clerk, Tailwind CSS
- Astro, Svelte, Remix, Deno, Bun, Cloudflare
- Railway, Fly.io, Render, Netlify, Neon, Turso
- PlanetScale, Auth0, Sentry, PostHog, Prisma, Drizzle
- Stripe, Resend, Upstash, Inngest, Trigger.dev

### AI/LLM Companies
- Anthropic, OpenAI, Google AI, Hugging Face
- LangChain, LlamaIndex, Replicate, Together AI
- Groq, Mistral, Cohere, Modal, Fireworks

### AI Coding Tools
- Cursor, Codeium, Tabnine, Sourcegraph, Replit
- GitHub Blog, GitLab Blog

### Developer News & Publications
- Hacker News (front page + AI/LLM/cursor/vibe coding queries)
- Lobsters, TechCrunch AI, The Verge AI, Ars Technica, Wired AI

### Dev.to & Hashnode Tags
- JavaScript, React, Next.js, TypeScript, AI, WebDev
- DevTools, Productivity, LLM, OpenAI, Cursor, Copilot

### Medium Publications
- Artificial Intelligence, Programming, Web Development, Developer Tools

### Reddit Communities
- r/webdev, r/reactjs, r/nextjs, r/vibecoding, r/ChatGPTCoding
- r/cursor, r/LocalLLaMA, r/MachineLearning, r/programming
- r/devops, r/selfhosted

### YouTube Channels
- Fireship, Theo, ThePrimeagen, Traversy Media
- Web Dev Simplified, devaslife

### GitHub Releases (30+ repos)
- Frameworks: React, Next.js, Svelte, Vue, Tailwind, Vite, Astro, Remix
- Runtimes: Bun, Deno
- Data: Prisma, Drizzle, tRPC, TanStack Query, Zustand, shadcn/ui
- AI Coding: Aider, Cline, OpenHands, Continue, Goose, Roo Code
- AI Infra: Ollama, llama.cpp, LangChain, LlamaIndex

### Newsletters
- TLDR, Bytes, JavaScript Weekly, React Newsletter, Node Weekly

## Awesome Lists Scraped (20+ lists)

### Vibe Coding
- filipecalegario/awesome-vibe-coding
- roboco-io/awesome-vibecoding
- no-fluff/awesome-vibe-coding

### AI Coding & Agents
- sourcegraph/awesome-code-ai
- e2b-dev/awesome-ai-agents
- steven2358/awesome-generative-ai

### Developer Tools
- ripienaar/free-for-dev
- trimstray/the-book-of-secret-knowledge

### Frontend
- enaqx/awesome-react
- brillout/awesome-react-components
- unicodeveloper/awesome-nextjs
- vuejs/awesome-vue
- TheComputerM/awesome-svelte

### Backend & Infrastructure
- dzharii/awesome-typescript
- sindresorhus/awesome-nodejs
- numetriclabz/awesome-db
- veggiemonk/awesome-docker
- awesome-selfhosted/awesome-selfhosted

### AI/ML
- josephmisiti/awesome-machine-learning
- Hannibal046/Awesome-LLM

## Web Search - Tools Tracked (100+)

### AI Coding Assistants
- IDE: Cursor, Windsurf, GitHub Copilot, Codeium, Tabnine, Amazon Q, Sourcegraph Cody, Continue, Supermaven
- CLI: Aider, Claude Code, Cline, OpenHands, Goose, Gemini CLI, Roo Code, Kilocode, Mentat

### AI App Builders
- Bolt.new, Lovable, v0, Replit, Devin AI, Kiro, Create, Softgen, Marblism

### Databases & BaaS
- Supabase, Convex, Firebase, Neon, Turso, PlanetScale, Xata, Upstash, MongoDB Atlas

### Authentication
- Clerk, Auth0, Kinde, Lucia, WorkOS, Stytch, Descope

### Hosting & Deployment
- Vercel, Netlify, Railway, Fly.io, Render, Cloudflare Pages, Deno Deploy, SST

### AI/LLM Infrastructure
- OpenAI, Anthropic, Groq, Together AI, Fireworks AI, Replicate, Modal, Ollama, LM Studio

### AI Frameworks
- LangChain, LlamaIndex, Vercel AI SDK, Instructor, Mastra, CrewAI, AutoGen

### UI & Design
- shadcn/ui, Tailwind CSS, Radix UI, Chakra UI, Framer Motion, Magic UI, Aceternity UI

### And many more...

## New Scrapers (v2)

### GitHub Trending (`github_trending.py`)
- Daily, weekly, monthly trending repos
- Language filters: TypeScript, JavaScript, Python, Rust, Go
- Topic pages: AI, ML, LLM, developer-tools, React, Next.js, etc.

### AlternativeTo (`alternativeto_scraper.py`)
- Software alternatives database
- Categories: developer-tools, IDE, code-editor, database, API, hosting
- Tool comparisons with likes, tags, free/open-source status

### StackShare (`stackshare_scraper.py`)
- Tech stack decisions from real companies
- Categories: languages, frameworks, data-stores, DevOps, hosting
- Tool details: pros, cons, alternatives, integrations, companies using

### DevHunt (`devhunt_scraper.py`)
- Product Hunt for developers
- Categories: AI, developer-tools, productivity, API, database, DevOps

### AI Tool Directories (`ai_directories_scraper.py`)
- theresanaiforthat.com - coding, developer-tools, code-assistant
- futuretools.io - coding, developer-tools, productivity
- aitools.fyi - coding, developer tools

### VS Code Marketplace (`vscode_marketplace_scraper.py`)
- AI coding extensions: Copilot, Codeium, TabNine, Continue, Cody
- Popular extensions: Prettier, ESLint, Tailwind, Prisma, GitLens
- Search queries: AI coding, copilot, code completion, productivity

### Package Registries (`package_registries_scraper.py`)
- **PyPI**: langchain, openai, anthropic, transformers, fastapi, etc.
- **crates.io**: tokio, serde, axum, sqlx, async-std, etc.
- **pkg.go.dev**: gin, fiber, gorm, cobra, zap, etc.

### Indie Hackers (`indiehackers_scraper.py`)
- Developer-built products with revenue data
- Search: developer tools, coding assistant, AI tools, API, database

### BetaList (`betalist_scraper.py`)
- Early-stage startups and tools
- Categories: developer-tools, AI, SaaS, API, automation

### Hacker News (`hackernews_scraper.py`)
- Show HN and Launch HN posts (tool launches)
- Search: developer tools, AI coding, code assistant, vibe coding
- Uses both HN API and Algolia search

## Output Files

All new scrapers output to `data/`:
- `github_trending.json`
- `alternativeto.json`
- `stackshare.json`
- `devhunt.json`
- `ai_directories.json`
- `vscode_marketplace.json`
- `package_registries.json`
- `indiehackers.json`
- `betalist.json`
- `hackernews.json`

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
