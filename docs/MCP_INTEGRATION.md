# VibeBuff MCP Integration Guide

> Connect your IDE to VibeBuff's AI-powered tech stack knowledge base using the Model Context Protocol (MCP).

---

## Overview

VibeBuff provides an MCP server that allows AI coding assistants in IDEs like Cursor, Claude Code, Windsurf, and VS Code to access:

- **AI Stack Recommendations**: Get personalized tech stack suggestions based on project requirements
- **Tool Database**: Search and explore 500+ developer tools
- **Tool Comparisons**: Compare tools side-by-side
- **Stack Templates**: Pre-built templates for common project types
- **Knowledge Base**: Access tool synergies, trends, and best practices

This enables your AI assistant to give you architecture-first guidance when starting new projects.

---

## Quick Start

### 1. Install the MCP Server

```bash
# Option 1: Use directly with npx (recommended)
npx @vibebuff/mcp-server

# Option 2: Install globally
npm install -g @vibebuff/mcp-server

# Option 3: Build from source
cd vibebuff/mcp-server
npm install
npm run build
```

### 2. Configure Your IDE

#### Cursor IDE

Edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "vibebuff": {
      "command": "npx",
      "args": ["@vibebuff/mcp-server"],
      "env": {
        "VIBEBUFF_API_URL": "https://vibebuff.dev/api"
      }
    }
  }
}
```

#### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "vibebuff": {
      "command": "npx",
      "args": ["@vibebuff/mcp-server"]
    }
  }
}
```

#### Windsurf

Add to your Windsurf MCP configuration:

```json
{
  "mcpServers": {
    "vibebuff": {
      "command": "npx",
      "args": ["@vibebuff/mcp-server"]
    }
  }
}
```

### 3. Restart Your IDE

After configuration, restart your IDE for the MCP server to connect.

---

## Available Tools

### `recommend_stack`

Get AI-powered tech stack recommendations.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `projectDescription` | string | Yes | What you want to build |
| `budget` | string | No | "free", "low", "medium", "high", "enterprise" |
| `scale` | string | No | "hobby", "startup", "growth", "enterprise" |
| `teamSize` | number | No | Number of developers |

**Example Prompts:**
```
"Use VibeBuff to recommend a stack for building a real-time collaborative whiteboard app"

"Get a VibeBuff recommendation for a SaaS with auth, payments, and a free budget"
```

### `search_tools`

Search the tool database.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | Yes | Search term |
| `category` | string | No | Filter by category |
| `limit` | number | No | Max results (default: 10) |

**Example Prompts:**
```
"Search VibeBuff for authentication solutions"

"Find database tools in VibeBuff"
```

### `get_tool_details`

Get detailed information about a specific tool.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `toolSlug` | string | Yes | Tool identifier (e.g., "nextjs") |

**Example Prompts:**
```
"Get VibeBuff details on Supabase"

"What does VibeBuff say about Convex?"
```

### `compare_tools`

Compare 2-4 tools side by side.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tools` | string[] | Yes | Array of tool slugs |

**Example Prompts:**
```
"Use VibeBuff to compare Next.js, Remix, and SvelteKit"

"Compare Supabase vs Firebase vs Convex with VibeBuff"
```

### `get_stack_template`

Get pre-built stack templates.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `templateType` | string | Yes | "saas", "ecommerce", "blog", "portfolio", "api", "mobile", "ai-app", "realtime" |
| `budget` | string | No | Budget constraint |

**Example Prompts:**
```
"Get the VibeBuff SaaS template"

"What's the VibeBuff e-commerce stack for a low budget?"
```

### `get_categories`

List all tool categories.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `includeTools` | boolean | No | Include tool count per category |

---

## Available Resources

Access these as context for your AI assistant:

| URI | Description |
|-----|-------------|
| `vibebuff://tools/all` | Complete tool database |
| `vibebuff://categories/all` | All tool categories |
| `vibebuff://templates/all` | Stack templates |
| `vibebuff://synergies/all` | Tool integrations and synergies |
| `vibebuff://trends/current` | Current tech trends |

---

## Available Prompts

Pre-built prompt templates for common workflows:

### `architect_stack`

Help architect a complete tech stack for a new project.

**Arguments:**
- `projectType` (required): Type of project
- `requirements` (optional): Specific requirements

### `migrate_stack`

Get guidance on migrating tech stacks.

**Arguments:**
- `currentStack` (required): Current technologies
- `targetStack` (optional): Desired technologies

### `optimize_stack`

Analyze and optimize an existing stack.

**Arguments:**
- `currentStack` (required): Current technologies
- `painPoints` (optional): Current issues

### `evaluate_tool`

Deep evaluation of a tool for your use case.

**Arguments:**
- `toolName` (required): Tool to evaluate
- `useCase` (required): Your specific use case

---

## Example Workflows

### Starting a New Project

```
You: "I want to build a SaaS app for project management with real-time 
collaboration, user authentication, and subscription billing. Use VibeBuff 
to recommend the best tech stack."

AI: [Uses recommend_stack tool]
"Based on VibeBuff's analysis, here's your recommended stack:

Frontend: Next.js - Best React framework for production apps
Backend: Convex - Real-time database with serverless functions
Auth: Clerk - Complete auth solution with great DX
Payments: Stripe - Industry standard for subscriptions
Hosting: Vercel - Optimized for Next.js

Estimated cost: $50-200/month at startup scale..."
```

### Comparing Options

```
You: "I'm deciding between Supabase and Convex for my backend. 
Use VibeBuff to compare them."

AI: [Uses compare_tools tool]
"Here's VibeBuff's comparison:

| Feature | Supabase | Convex |
|---------|----------|--------|
| Real-time | PostgreSQL subscriptions | Built-in reactive queries |
| Auth | Built-in | Integrates with Clerk |
| Functions | Edge functions | Serverless TypeScript |
...

Recommendation: For real-time apps, Convex offers better DX..."
```

### Getting Architecture Guidance

```
You: "Use the VibeBuff architect_stack prompt to help me plan 
an e-commerce platform."

AI: [Uses architect_stack prompt]
"I'll help you architect your e-commerce platform. Let me gather 
information from VibeBuff...

[Searches for relevant tools]
[Gets e-commerce template]
[Compares top options]

Here's my recommended architecture:
..."
```

---

## API Endpoints

The MCP server communicates with these VibeBuff API endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/mcp/recommend` | POST | Stack recommendations |
| `/api/mcp/search` | POST | Tool search |
| `/api/mcp/tools/[slug]` | POST | Tool details |
| `/api/mcp/compare` | POST | Tool comparison |
| `/api/mcp/templates` | POST | Stack templates |
| `/api/mcp/categories` | POST | Category list |

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VIBEBUFF_API_URL` | API endpoint | `https://vibebuff.dev/api` |
| `VIBEBUFF_API_KEY` | API key for authenticated requests | (optional) |

---

## Getting an API Key

For enhanced features and higher rate limits:

1. Sign up at [vibebuff.dev](https://vibebuff.dev)
2. Go to Profile > Settings > API Keys
3. Generate a new MCP API key
4. Add to your MCP configuration

---

## Troubleshooting

### Server Not Connecting

1. Ensure Node.js 18+ is installed: `node --version`
2. Verify the config file path is correct for your IDE
3. Restart your IDE after configuration changes
4. Check IDE logs for MCP connection errors

### Slow Responses

1. The first request may be slower due to cold start
2. Check your internet connection
3. Consider using a local API for development

### Mock Data Appearing

If responses show "Mock data", the server can't reach the VibeBuff API. This is normal for:
- Local development without API access
- Network connectivity issues
- API rate limiting

---

## Development

### Building from Source

```bash
cd vibebuff/mcp-server
npm install
npm run build
npm start
```

### Testing Locally

```bash
# Run the server
npm start

# In another terminal, test with a simple client
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node build/index.js
```

---

## Monetization Opportunity

The MCP server is a key differentiator for VibeBuff's enterprise adoption:

- **Free Tier**: Basic tool search and templates
- **Pro Tier**: Unlimited AI recommendations, all prompts
- **Team Tier**: Shared context across team members
- **Enterprise**: Custom tool databases, private deployments

See `MONETIZATION_STRATEGY.md` for full pricing details.

---

## Related Documentation

- `APP_FEATURES.md` - Complete feature reference
- `ARCHITECTURE.md` - System architecture
- `MONETIZATION_STRATEGY.md` - Pricing and enterprise adoption
- `mcp-server/README.md` - MCP server technical docs

---

*Last Updated: January 2026*
