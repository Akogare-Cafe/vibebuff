# VibeBuff AI Discoverability & Growth Guide

This document outlines the AI-first SEO and discoverability features implemented to help VibeBuff get discovered by AI agents, LLMs, and search engines.

## Implemented Features

### 1. llms.txt - AI Crawler Discoverability

**Files Created:**
- `/public/llms.txt`
- `/public/.well-known/llms.txt`

The `llms.txt` file is a standard for AI crawlers (similar to robots.txt for search engines). It provides structured information about VibeBuff that AI agents can use to understand and recommend the site.

**What it contains:**
- Site description and key features
- Tool categories
- API endpoint documentation
- Popular comparisons
- Stack recommendations by use case

**How AI agents use it:**
- ChatGPT, Claude, Perplexity, and other LLMs may crawl this file
- Helps AI understand what VibeBuff offers
- Increases chances of being recommended in AI responses

---

### 2. Public AI API Endpoints

**New API Routes (no auth required):**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/tools` | GET | List all tools with metadata |
| `/api/ai/tools/[slug]` | GET | Get detailed tool information |
| `/api/ai/compare?tools=a,b,c` | GET | Compare multiple tools |
| `/api/ai/categories` | GET | List all categories with tool counts |
| `/api/ai/recommend?type=saas` | GET | Get stack recommendations |

**Example Usage:**
```bash
# Get all tools
curl https://vibebuff.dev/api/ai/tools

# Get tool details
curl https://vibebuff.dev/api/ai/tools/nextjs

# Compare tools
curl "https://vibebuff.dev/api/ai/compare?tools=nextjs,remix,sveltekit"

# Get stack recommendation
curl "https://vibebuff.dev/api/ai/recommend?type=saas&budget=low"
```

**Response Format:**
All responses include a `_meta` field with source attribution:
```json
{
  "data": [...],
  "_meta": {
    "source": "VibeBuff",
    "description": "AI-powered tech stack recommendations",
    "documentation": "https://vibebuff.dev/llms.txt"
  }
}
```

---

### 3. JSON-LD Structured Data

**Component:** `src/components/tool-json-ld.tsx`

Enhanced structured data for tool pages:
- `SoftwareApplication` schema for each tool
- `FAQPage` schema with common questions
- `AggregateRating` when reviews exist

**Benefits:**
- Rich snippets in Google search results
- Better understanding by AI agents
- Featured snippet eligibility

---

### 4. Shareable OG Image Generation

**API Routes:**

| Endpoint | Purpose |
|----------|---------|
| `/api/og/tier-list` | Generate tier list share images |
| `/api/og/deck` | Generate deck/stack share images |
| `/api/og/stack` | Generate stack recommendation images |

**Usage Examples:**
```
/api/og/tier-list?title=My%20Framework%20Tier%20List&author=DevUser&s=3&a=5&b=4&c=2&d=1

/api/og/deck?name=SaaS%20Stack&author=DevUser&tools=Next.js,Supabase,Clerk&score=95

/api/og/stack?type=saas&framework=Next.js&database=Supabase&auth=Clerk&hosting=Vercel
```

**Benefits:**
- Shareable on Twitter, LinkedIn, Discord
- Viral potential for tier lists and stacks
- Branded with VibeBuff aesthetic

---

### 5. MCP Server for AI Assistants

**Location:** `/mcp-server/`

The MCP (Model Context Protocol) server allows AI coding assistants like Claude, Cursor, and Windsurf to directly query VibeBuff.

**Available Tools:**
- `recommend_stack` - Get AI-powered stack recommendations
- `search_tools` - Search the tool database
- `get_tool_details` - Get detailed tool information
- `compare_tools` - Compare 2-4 tools
- `get_stack_template` - Get pre-built stack templates
- `get_categories` - List all categories

**Installation:**
```bash
cd mcp-server
npm install
npm run build
```

**Configuration (for Cursor/Claude):**
```json
{
  "mcpServers": {
    "vibebuff": {
      "command": "node",
      "args": ["/path/to/vibebuff/mcp-server/dist/index.js"],
      "env": {
        "VIBEBUFF_API_URL": "https://vibebuff.dev/api"
      }
    }
  }
}
```

---

## Growth Strategy Implementation Checklist

### Immediate Actions (This Week)

- [x] Create llms.txt for AI discoverability
- [x] Create public AI API endpoints
- [x] Add JSON-LD component for tool pages
- [x] Create OG image generation APIs
- [x] Document MCP server setup

### Short-term Actions (This Month)

- [ ] Submit llms.txt to AI crawler directories
- [ ] Add ToolJsonLd component to tool detail pages
- [ ] Integrate OG images into share functionality
- [ ] Publish MCP server to npm
- [ ] Create VS Code extension wrapper

### Medium-term Actions (This Quarter)

- [ ] Create CLI tool (`npx vibebuff recommend`)
- [ ] Build GitHub Action for stack analysis
- [ ] Partner with tool vendors for backlinks
- [ ] Launch Discord community
- [ ] Submit to Product Hunt

---

## How to Add JSON-LD to Tool Pages

Import and use the component in tool detail pages:

```tsx
import { ToolJsonLd } from "@/components/tool-json-ld";

// In your component:
{tool && (
  <ToolJsonLd 
    tool={tool} 
    ratingSummary={ratingSummary} 
  />
)}
```

---

## How to Use OG Images for Sharing

When sharing tier lists or decks, construct the OG image URL:

```typescript
const ogImageUrl = new URL("/api/og/tier-list", "https://vibebuff.dev");
ogImageUrl.searchParams.set("title", tierList.name);
ogImageUrl.searchParams.set("author", tierList.authorName);
ogImageUrl.searchParams.set("s", tierList.sTier.length.toString());
ogImageUrl.searchParams.set("a", tierList.aTier.length.toString());
// ... etc

// Use in meta tags
<meta property="og:image" content={ogImageUrl.toString()} />
```

---

## Monitoring & Analytics

Track AI discoverability with:

1. **Server logs** - Monitor `/api/ai/*` endpoint usage
2. **Referrer analysis** - Track traffic from AI platforms
3. **Search Console** - Monitor rich snippet performance
4. **Social shares** - Track OG image usage

---

## Future Enhancements

1. **AI Chat Widget** - Embed VibeBuff recommendations in other sites
2. **Webhook Notifications** - Alert when tools are mentioned by AI
3. **AI-Generated Comparisons** - Auto-generate comparison content
4. **Tool Trend Predictions** - AI-powered trend forecasting

---

*Last Updated: January 2026*
