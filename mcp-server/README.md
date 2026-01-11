# VibeBuff MCP Server

Connect your IDE (Cursor, Claude Code, VS Code, etc.) to VibeBuff's AI-powered tech stack knowledge base.

## What is MCP?

The Model Context Protocol (MCP) is an open standard that allows AI assistants to access external data sources and tools. With the VibeBuff MCP server, your AI coding assistant can:

- Get AI-powered tech stack recommendations
- Search 500+ developer tools
- Compare tools side-by-side
- Access pre-built stack templates
- Get detailed tool information

## Installation

### Option 1: NPX (Recommended)

```bash
npx vibebuff-mcp
```

### Option 2: Install Globally

```bash
npm install -g vibebuff-mcp
```

### Option 3: Build from Source

```bash
cd mcp-server
npm install
npm run build
```

## Configuration

### Cursor IDE

Add to your Cursor settings (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "vibebuff": {
      "command": "npx",
      "args": ["-y", "vibebuff-mcp"],
      "env": {
        "VIBEBUFF_API_URL": "https://vibebuff.dev/api",
        "VIBEBUFF_API_KEY": "your-api-key-optional"
      }
    }
  }
}
```

### Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "vibebuff": {
      "command": "npx",
      "args": ["-y", "vibebuff-mcp"],
      "env": {
        "VIBEBUFF_API_URL": "https://vibebuff.dev/api"
      }
    }
  }
}
```

### VS Code with Continue

Add to your Continue config:

```json
{
  "mcpServers": [
    {
      "name": "vibebuff",
      "command": "npx",
      "args": ["-y", "vibebuff-mcp"]
    }
  ]
}
```

### Windsurf

Add to your Windsurf MCP settings (`~/.codeium/windsurf/mcp_config.json`):

```json
{
  "mcpServers": {
    "vibebuff": {
      "command": "npx",
      "args": ["-y", "vibebuff-mcp"]
    }
  }
}
```

## Available Tools

### `recommend_stack`
Get AI-powered tech stack recommendations based on your project requirements.

**Parameters:**
- `projectDescription` (required): Description of the project you want to build
- `budget` (optional): "free" | "low" | "medium" | "high" | "enterprise"
- `scale` (optional): "hobby" | "startup" | "growth" | "enterprise"
- `teamSize` (optional): Number of developers

**Example:**
```
"I want to build a SaaS app with user authentication, real-time features, and payment processing"
```

### `search_tools`
Search the VibeBuff database of 500+ developer tools.

**Parameters:**
- `query` (required): Search query
- `category` (optional): Filter by category
- `limit` (optional): Max results

### `get_tool_details`
Get detailed information about a specific tool.

**Parameters:**
- `toolSlug` (required): Tool identifier (e.g., "nextjs", "supabase")

### `compare_tools`
Compare 2-4 tools side by side.

**Parameters:**
- `tools` (required): Array of tool slugs

### `get_stack_template`
Get pre-built stack templates.

**Parameters:**
- `templateType` (required): "saas" | "ecommerce" | "blog" | "portfolio" | "api" | "mobile" | "ai-app" | "realtime"
- `budget` (optional): Budget constraint

### `get_categories`
List all tool categories.

## Available Resources

Access these resources for context:

- `vibebuff://tools/all` - Complete tool database
- `vibebuff://categories/all` - All categories
- `vibebuff://templates/all` - Stack templates
- `vibebuff://synergies/all` - Tool integrations
- `vibebuff://trends/current` - Current tech trends

## Available Prompts

Pre-built prompts for common workflows:

### `architect_stack`
Help architect a complete tech stack for a new project.

### `migrate_stack`
Get guidance on migrating from one tech stack to another.

### `optimize_stack`
Analyze and optimize an existing tech stack.

### `evaluate_tool`
Deep evaluation of a specific tool for your use case.

## Example Usage in Cursor/Claude

Once configured, you can ask your AI assistant:

```
"Use VibeBuff to recommend a tech stack for building a real-time collaborative document editor"

"Search VibeBuff for the best authentication solutions"

"Compare Next.js, Remix, and SvelteKit using VibeBuff"

"Get the VibeBuff SaaS template for a free budget"
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VIBEBUFF_API_URL` | VibeBuff API endpoint | `https://vibebuff.dev/api` |
| `VIBEBUFF_API_KEY` | API key for authenticated requests | (optional) |

## API Key (Optional)

For enhanced features and higher rate limits, get an API key from your VibeBuff profile:

1. Sign up at [vibebuff.dev](https://vibebuff.dev)
2. Go to Profile > Settings > API Keys
3. Generate a new MCP API key
4. Add it to your MCP configuration

## Troubleshooting

### Server not connecting

1. Ensure Node.js 18+ is installed
2. Check that the MCP config path is correct for your IDE
3. Restart your IDE after config changes

### API errors

1. Check your internet connection
2. Verify the API URL is correct
3. If using an API key, ensure it's valid

### Mock data showing

If you see "Mock data" responses, the server is working but can't reach the VibeBuff API. This is normal for local development.

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run locally
npm start

# Watch mode
npm run dev
```

## License

MIT
