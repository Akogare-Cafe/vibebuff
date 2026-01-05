# VibeBuff Tool Map & Timeline

> A high-level overview of the tools, their origins, categories, and evolution within the VibeBuff ecosystem.

---

## Project Overview

**VibeBuff** is an AI-powered tech stack knowledge base that helps developers discover, compare, and build with 500+ development tools. The platform gamifies tool discovery with a pixel/retro gaming aesthetic.

---

## Tool Origin Mind Map

```
                                    ┌─────────────────────────────────────────────────────────────┐
                                    │                      VIBEBUFF ECOSYSTEM                      │
                                    └─────────────────────────────────────────────────────────────┘
                                                              │
                    ┌─────────────────────────────────────────┼─────────────────────────────────────────┐
                    │                                         │                                         │
                    ▼                                         ▼                                         ▼
        ┌───────────────────┐                     ┌───────────────────┐                     ┌───────────────────┐
        │   DATA SOURCES    │                     │   CORE PLATFORM   │                     │   INTEGRATIONS    │
        └───────────────────┘                     └───────────────────┘                     └───────────────────┘
                    │                                         │                                         │
    ┌───────────────┼───────────────┐         ┌───────────────┼───────────────┐         ┌───────────────┼───────────────┐
    │               │               │         │               │               │         │               │               │
    ▼               ▼               ▼         ▼               ▼               ▼         ▼               ▼               ▼
┌───────┐     ┌───────┐     ┌───────┐   ┌───────┐     ┌───────┐     ┌───────┐   ┌───────┐     ┌───────┐     ┌───────┐
│GitHub │     │  NPM  │     │Product│   │Convex │     │Next.js│     │ Clerk │   │  MCP  │     │Vercel │     │ APIs  │
│Scraper│     │Scraper│     │ Hunt  │   │Backend│     │  App  │     │ Auth  │   │Server │     │Deploy │     │       │
└───────┘     └───────┘     └───────┘   └───────┘     └───────┘     └───────┘   └───────┘     └───────┘     └───────┘
    │               │               │         │               │               │         │
    │               │               │         │               │               │         │
    ▼               ▼               ▼         ▼               ▼               ▼         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                              TOOL DATABASE (500+ Tools)                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Tool Categories Hierarchy

```
DEVELOPMENT TOOLS
├── Development Environment
│   ├── IDEs & Code Editors ────────── VS Code, Cursor, Windsurf, Zed, JetBrains, Neovim
│   ├── AI Coding Assistants ───────── GitHub Copilot, Claude, ChatGPT, Gemini, Cody, Supermaven
│   └── CLI Agents ─────────────────── Terminal-based AI coding agents
│
├── Frontend
│   ├── UI Frameworks ──────────────── React, Vue.js, Svelte, Angular, Solid.js
│   ├── Meta-Frameworks ────────────── Next.js, Nuxt, SvelteKit, Astro, Remix
│   ├── Styling Solutions ──────────── TailwindCSS, CSS-in-JS, Component Libraries
│   └── Build Tools ────────────────── Vite, Webpack, esbuild, Turbopack
│
├── Backend
│   ├── Runtimes ───────────────────── Node.js, Bun, Deno
│   ├── Web Frameworks ─────────────── Express, Fastify, Hono, NestJS
│   └── Serverless Platforms ───────── AWS Lambda, Vercel Functions, Cloudflare Workers
│
├── Data Layer
│   ├── Databases ──────────────────── PostgreSQL, MongoDB, Redis, SQLite
│   ├── Database Platforms (BaaS) ──── Supabase, Firebase, PlanetScale, Neon
│   ├── ORMs ───────────────────────── Prisma, Drizzle, TypeORM
│   └── Realtime Databases ─────────── Convex, Supabase Realtime
│
├── AI & Machine Learning
│   ├── LLMs ───────────────────────── GPT-4, Claude, Gemini, Llama, Mistral
│   ├── AI APIs ────────────────────── OpenAI API, Anthropic API, Replicate
│   └── Vector Databases ───────────── Pinecone, Weaviate, Qdrant
│
├── Authentication
│   └── Auth Providers ─────────────── Clerk, Auth0, NextAuth, Supabase Auth
│
├── Infrastructure
│   ├── Hosting ────────────────────── Vercel, Netlify, Railway, Fly.io
│   ├── Edge & CDN ─────────────────── Cloudflare, Fastly
│   └── CI/CD ──────────────────────── GitHub Actions, CircleCI
│
├── Observability
│   ├── Error Tracking ─────────────── Sentry, LogRocket
│   ├── Analytics ──────────────────── PostHog, Mixpanel, Plausible
│   └── Monitoring ─────────────────── Datadog, New Relic
│
├── Testing
│   ├── Unit Testing ───────────────── Jest, Vitest
│   ├── E2E Testing ────────────────── Playwright, Cypress
│   └── API Testing ────────────────── Postman, Insomnia
│
└── Vibe Coding
    └── AI App Builders ────────────── v0, Bolt, Lovable, Replit Agent
```

---

## VibeBuff Platform Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    VIBEBUFF PLATFORM                                     │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐                   │
│  │   FRONTEND       │    │   BACKEND        │    │   DATA PIPELINE  │                   │
│  │   (Next.js 16)   │    │   (Convex)       │    │   (Python)       │                   │
│  ├──────────────────┤    ├──────────────────┤    ├──────────────────┤                   │
│  │ - React 19       │    │ - 50+ Functions  │    │ - GitHub Scraper │                   │
│  │ - Tailwind v4    │    │ - Schema (2K+)   │    │ - NPM Scraper    │                   │
│  │ - Radix UI       │    │ - Seed Data      │    │ - ProductHunt    │                   │
│  │ - Framer Motion  │    │ - Real-time      │    │ - StackShare     │                   │
│  │ - @xyflow/react  │    │                  │    │ - RSS Feeds      │                   │
│  │ - lucide-react   │    │                  │    │ - Web Search     │                   │
│  └──────────────────┘    └──────────────────┘    └──────────────────┘                   │
│           │                       │                       │                              │
│           └───────────────────────┼───────────────────────┘                              │
│                                   │                                                      │
│                                   ▼                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐   │
│  │                              MCP SERVER                                           │   │
│  │                         (@vibebuff/mcp-server)                                    │   │
│  ├──────────────────────────────────────────────────────────────────────────────────┤   │
│  │  Tools:                                                                           │   │
│  │  - recommend_stack    - Get AI-powered stack recommendations                      │   │
│  │  - search_tools       - Search 500+ developer tools                               │   │
│  │  - get_tool_details   - Get detailed tool information                             │   │
│  │  - compare_tools      - Compare 2-4 tools side by side                            │   │
│  │  - get_stack_template - Get pre-built stack templates                             │   │
│  │  - get_categories     - List all tool categories                                  │   │
│  └──────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Convex Backend Functions Map

```
convex/
├── CORE DATA
│   ├── tools.ts ──────────────── Tool CRUD, search, filtering
│   ├── categories.ts ─────────── Category management
│   ├── schema.ts ─────────────── Database schema (2K+ lines)
│   └── seed.ts ───────────────── Initial data seeding
│
├── USER FEATURES
│   ├── userProfiles.ts ───────── User profile management
│   ├── userSettings.ts ───────── User preferences
│   ├── friends.ts ────────────── Social connections
│   ├── groups.ts ─────────────── Community groups
│   └── notifications.ts ──────── User notifications
│
├── GAMIFICATION
│   ├── achievements.ts ───────── Achievement system
│   ├── leaderboards.ts ───────── Ranking system
│   ├── leaderboardSeasons.ts ── Seasonal competitions
│   ├── mastery.ts ────────────── Tool mastery tracking
│   ├── xpActivity.ts ─────────── XP and activity tracking
│   ├── trophyRoom.ts ─────────── Trophy collection
│   └── spinWheel.ts ──────────── Gamified rewards
│
├── TOOL ANALYSIS
│   ├── compare.ts ────────────── Tool comparison
│   ├── compatibility.ts ──────── Stack compatibility
│   ├── synergies.ts ──────────── Tool synergies
│   ├── toolStats.ts ──────────── Tool statistics
│   ├── toolUsage.ts ──────────── Usage analytics
│   ├── toolAffinity.ts ───────── User-tool affinity
│   ├── toolWhispers.ts ───────── Tool recommendations
│   ├── popularity.ts ─────────── Popularity metrics
│   └── evolution.ts ──────────── Tool evolution tracking
│
├── CONTENT
│   ├── reviews.ts ────────────── User reviews
│   ├── lore.ts ───────────────── Tool lore/stories
│   ├── startupStories.ts ─────── Startup tech stories
│   ├── nominations.ts ────────── Tool nominations
│   └── seo.ts ────────────────── SEO optimization
│
├── STACK BUILDING
│   ├── stackBuilder.ts ───────── Stack composition
│   ├── stackMarketplace.ts ───── Stack sharing
│   ├── stackContracts.ts ─────── Stack agreements
│   ├── templates.ts ──────────── Pre-built templates
│   ├── decks.ts ──────────────── Tool decks
│   └── architect.ts ──────────── AI stack architect
│
├── SOCIAL & TRADING
│   ├── trading.ts ────────────── Tool trading system
│   ├── fusions.ts ────────────── Tool fusion mechanics
│   ├── relationships.ts ──────── Tool relationships
│   └── replays.ts ────────────── Activity replays
│
├── AI FEATURES
│   ├── ai.ts ─────────────────── AI recommendations
│   └── simulator.ts ──────────── Stack simulation
│
├── SPECIAL FEATURES
│   ├── timeMachine.ts ────────── Historical tool data
│   ├── graveyard.ts ──────────── Deprecated tools
│   ├── speedruns.ts ──────────── Speed challenges
│   ├── tierLists.ts ──────────── Community tier lists
│   ├── events.ts ─────────────── Platform events
│   ├── ads.ts ────────────────── Ad management
│   ├── onboarding.ts ─────────── User onboarding
│   └── questHistory.ts ───────── Quest tracking
│
└── COMPANIES
    └── companies.ts ──────────── Company profiles
```

---

## Data Scraper Pipeline

```
scripts/scraper/
│
├── CORE SCRAPERS
│   ├── github_scraper.py ──────── GitHub repos, stars, activity
│   ├── github_trending.py ─────── Trending repositories
│   ├── npm_scraper.py ─────────── NPM package data
│   ├── producthunt_scraper.py ── ProductHunt launches
│   ├── stackshare_scraper.py ─── StackShare tool data
│   ├── devhunt_scraper.py ─────── DevHunt discoveries
│   ├── alternativeto_scraper.py  Alternative tool mapping
│   └── awesome_lists_scraper.py  Awesome list curation
│
├── CONTENT SOURCES
│   ├── article_scraper.py ─────── Tech articles
│   ├── rss_feeds.py ───────────── RSS feed aggregation
│   └── web_search.py ──────────── Web search integration
│
├── ORCHESTRATION
│   └── main.py ────────────────── Pipeline orchestration
│
└── OUTPUT
    └── data/ ──────────────────── Scraped data storage
```

---

## Tool Evolution Timeline

### Era 1: Foundation (Pre-2015)
```
2009 ─── Node.js ─────────── Server-side JavaScript revolution
2010 ─── Angular.js ──────── First major SPA framework
2011 ─── PostgreSQL 9.0 ─── Modern relational database
2013 ─── React ───────────── Component-based UI paradigm shift
2014 ─── Vue.js ──────────── Progressive framework emerges
```

### Era 2: Modern Web (2015-2019)
```
2015 ─── VS Code ─────────── Free, extensible code editor
2016 ─── Next.js ─────────── React meta-framework
2016 ─── Svelte ──────────── Compile-time framework
2017 ─── Tailwind CSS ────── Utility-first CSS
2018 ─── Prisma ──────────── Modern ORM
2019 ─── Vercel ──────────── Frontend cloud platform
```

### Era 3: AI Revolution (2020-2023)
```
2020 ─── Supabase ─────────── Open source Firebase alternative
2021 ─── GitHub Copilot ───── AI pair programming
2021 ─── Convex ───────────── Reactive backend platform
2022 ─── ChatGPT ──────────── AI assistant breakthrough
2023 ─── Claude ───────────── Advanced AI reasoning
2023 ─── Cursor ───────────── AI-native IDE
2023 ─── Bun ──────────────── Fast JS runtime
```

### Era 4: Agentic AI (2024+)
```
2024 ─── Windsurf ─────────── Agentic IDE
2024 ─── Claude 3.5 ───────── Best coding AI
2024 ─── v0 ───────────────── AI UI generation
2024 ─── Bolt ─────────────── Full-stack AI builder
2024 ─── MCP Protocol ─────── AI tool integration standard
2025 ─── VibeBuff ─────────── AI-powered tool discovery
```

---

## Technology Stack Origins

| Layer | Tool | Origin | Year | Creator |
|-------|------|--------|------|---------|
| **Frontend** | React | Meta (Facebook) | 2013 | Jordan Walke |
| **Frontend** | Next.js | Vercel | 2016 | Guillermo Rauch |
| **Styling** | Tailwind CSS | Tailwind Labs | 2017 | Adam Wathan |
| **Backend** | Convex | Convex Inc | 2021 | James Cowling |
| **Auth** | Clerk | Clerk Inc | 2020 | Colin Sidoti |
| **Icons** | Lucide | Community | 2020 | Fork of Feather |
| **Animation** | Framer Motion | Framer | 2019 | Framer Team |
| **Flow** | React Flow | webkid | 2019 | Moritz Klack |
| **AI** | Claude | Anthropic | 2023 | Dario Amodei |
| **IDE** | Cursor | Anysphere | 2023 | Michael Truell |

---

## MCP Server Tools

The VibeBuff MCP Server provides AI assistants with access to the tool database:

| Tool | Purpose | Parameters |
|------|---------|------------|
| `recommend_stack` | AI-powered stack recommendations | projectDescription, budget, scale, teamSize |
| `search_tools` | Search 500+ developer tools | query, category, limit |
| `get_tool_details` | Detailed tool information | toolSlug |
| `compare_tools` | Side-by-side comparison | tools (array of slugs) |
| `get_stack_template` | Pre-built stack templates | templateType, budget |
| `get_categories` | List all categories | - |

---

## Key Metrics

- **Total Tools**: 500+
- **Categories**: 15 main categories
- **Convex Functions**: 50+
- **Schema Size**: 2,000+ lines
- **Seed Data**: 1,700+ lines
- **Scrapers**: 10+ data sources

---

## Future Roadmap

```
Q1 2025
├── Enhanced AI recommendations
├── Tool comparison improvements
└── Community features expansion

Q2 2025
├── Mobile app (React Native)
├── API marketplace
└── Enterprise features

Q3 2025
├── Tool certification program
├── Integration marketplace
└── Advanced analytics

Q4 2025
├── Global expansion
├── Multi-language support
└── Partner ecosystem
```

---

*Last Updated: January 2025*
