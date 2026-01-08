"""
Vibe Tools Scraper - Discovers AI coding workflow and orchestration tools
Scrapes directories, GitHub, and curated lists for vibe coding tools
"""
import os
import json
import httpx
from bs4 import BeautifulSoup
from typing import Optional
import asyncio
import re
from datetime import datetime
from urllib.parse import urljoin, urlparse


VIBE_TOOL_DIRECTORIES = [
    {
        "name": "Vibe Kanban Docs",
        "url": "https://www.vibekanban.com/docs",
        "type": "docs",
    },
    {
        "name": "Awesome AI Agents",
        "url": "https://github.com/e2b-dev/awesome-ai-agents",
        "type": "awesome_list",
    },
    {
        "name": "Awesome Claude Code",
        "url": "https://github.com/anthropics/claude-code-awesome",
        "type": "awesome_list",
    },
    {
        "name": "Official MCP Servers",
        "url": "https://github.com/modelcontextprotocol/servers",
        "type": "awesome_list",
    },
    {
        "name": "Awesome MCP Servers",
        "url": "https://github.com/punkpeye/awesome-mcp-servers",
        "type": "awesome_list",
    },
    {
        "name": "MCP.so Directory",
        "url": "https://mcp.so",
        "type": "directory",
    },
    {
        "name": "Glama MCP Directory",
        "url": "https://glama.ai/mcp/servers",
        "type": "directory",
    },
    {
        "name": "Smithery MCP Registry",
        "url": "https://smithery.ai/explore",
        "type": "directory",
    },
    {
        "name": "MCP Hub",
        "url": "https://mcphub.io",
        "type": "directory",
    },
    {
        "name": "Cursor Directory MCP",
        "url": "https://cursor.directory/mcp",
        "type": "directory",
    },
    {
        "name": "MCP Clients List",
        "url": "https://github.com/punkpeye/awesome-mcp-servers#clients",
        "type": "awesome_list",
    },
    {
        "name": "OpenTools MCP",
        "url": "https://opentools.ai/categories/mcp-servers",
        "type": "directory",
    },
    {
        "name": "MCP Get Registry",
        "url": "https://mcp-get.com",
        "type": "directory",
    },
    {
        "name": "Awesome LLM Apps",
        "url": "https://github.com/Shubhamsaboo/awesome-llm-apps",
        "type": "awesome_list",
    },
    {
        "name": "Awesome LangChain",
        "url": "https://github.com/kyrolabs/awesome-langchain",
        "type": "awesome_list",
    },
    {
        "name": "Awesome GPT Agents",
        "url": "https://github.com/fr0gger/Awesome-GPT-Agents",
        "type": "awesome_list",
    },
    {
        "name": "Awesome AI Coding",
        "url": "https://github.com/sourcegraph/awesome-code-ai",
        "type": "awesome_list",
    },
    {
        "name": "Awesome Open Source LLMs",
        "url": "https://github.com/eugeneyan/open-llms",
        "type": "awesome_list",
    },
    {
        "name": "Awesome ChatGPT",
        "url": "https://github.com/humanloop/awesome-chatgpt",
        "type": "awesome_list",
    },
    {
        "name": "Awesome Generative AI",
        "url": "https://github.com/steven2358/awesome-generative-ai",
        "type": "awesome_list",
    },
    {
        "name": "Awesome AI Tools",
        "url": "https://github.com/mahseema/awesome-ai-tools",
        "type": "awesome_list",
    },
    {
        "name": "AI Tools Directory",
        "url": "https://aitoolsdirectory.com",
        "type": "directory",
    },
    {
        "name": "There's An AI For That",
        "url": "https://theresanaiforthat.com/ai-agents",
        "type": "directory",
    },
    {
        "name": "Future Tools",
        "url": "https://www.futuretools.io",
        "type": "directory",
    },
    {
        "name": "AI Tool Hunt",
        "url": "https://www.aitoolhunt.com",
        "type": "directory",
    },
    {
        "name": "TopAI.tools",
        "url": "https://topai.tools",
        "type": "directory",
    },
    {
        "name": "AI Scout",
        "url": "https://aiscout.net",
        "type": "directory",
    },
    {
        "name": "Toolify AI",
        "url": "https://www.toolify.ai",
        "type": "directory",
    },
]

VIBE_TOOL_KEYWORDS = [
    "ai coding agent",
    "code agent",
    "coding assistant",
    "ai pair programming",
    "autonomous coding",
    "vibe coding",
    "code generation",
    "ai developer tool",
    "llm coding",
    "agentic coding",
    "code orchestration",
    "multi-agent coding",
    "parallel agents",
    "git worktree",
    "code review ai",
]

KNOWN_VIBE_TOOLS = [
    {"name": "Vibe Kanban", "url": "https://www.vibekanban.com", "category": "orchestration"},
    {"name": "Claude Code", "url": "https://www.anthropic.com/claude-code", "category": "cli_agent"},
    {"name": "Aider", "url": "https://aider.chat", "category": "cli_agent"},
    {"name": "Cursor", "url": "https://cursor.com", "category": "ide"},
    {"name": "Windsurf", "url": "https://codeium.com/windsurf", "category": "ide"},
    {"name": "Cline", "url": "https://cline.bot", "category": "extension"},
    {"name": "Continue", "url": "https://continue.dev", "category": "extension"},
    {"name": "GitHub Copilot", "url": "https://github.com/features/copilot", "category": "extension"},
    {"name": "Gemini CLI", "url": "https://github.com/google-gemini/gemini-cli", "category": "cli_agent"},
    {"name": "OpenHands", "url": "https://www.all-hands.dev", "category": "autonomous"},
    {"name": "Devin", "url": "https://devin.ai", "category": "autonomous"},
    {"name": "Goose", "url": "https://block.github.io/goose/", "category": "cli_agent"},
    {"name": "Roo Code", "url": "https://roocode.com", "category": "extension"},
    {"name": "Amp", "url": "https://amp.dev", "category": "cli_agent"},
    {"name": "Bolt.new", "url": "https://bolt.new", "category": "app_builder"},
    {"name": "Lovable", "url": "https://lovable.dev", "category": "app_builder"},
    {"name": "v0", "url": "https://v0.dev", "category": "app_builder"},
    {"name": "Replit Agent", "url": "https://replit.com", "category": "app_builder"},
    {"name": "Kiro", "url": "https://kiro.dev", "category": "ide"},
    {"name": "Codium AI", "url": "https://www.codium.ai", "category": "extension"},
    {"name": "Supermaven", "url": "https://supermaven.com", "category": "extension"},
    {"name": "Tabnine", "url": "https://www.tabnine.com", "category": "extension"},
    {"name": "Amazon Q Developer", "url": "https://aws.amazon.com/q/developer/", "category": "extension"},
    {"name": "Sourcegraph Cody", "url": "https://sourcegraph.com/cody", "category": "extension"},
    
    {"name": "ChatGPT", "url": "https://chat.openai.com", "category": "llm"},
    {"name": "Claude", "url": "https://claude.ai", "category": "llm"},
    {"name": "Gemini", "url": "https://gemini.google.com", "category": "llm"},
    {"name": "Perplexity", "url": "https://perplexity.ai", "category": "llm"},
    {"name": "Mistral AI", "url": "https://mistral.ai", "category": "llm"},
    {"name": "Cohere", "url": "https://cohere.com", "category": "llm"},
    {"name": "Groq", "url": "https://groq.com", "category": "llm"},
    {"name": "Together AI", "url": "https://together.ai", "category": "llm"},
    {"name": "Fireworks AI", "url": "https://fireworks.ai", "category": "llm"},
    {"name": "Replicate", "url": "https://replicate.com", "category": "llm"},
    {"name": "Hugging Face", "url": "https://huggingface.co", "category": "llm"},
    {"name": "OpenRouter", "url": "https://openrouter.ai", "category": "llm"},
    {"name": "Anyscale", "url": "https://anyscale.com", "category": "llm"},
    {"name": "DeepSeek", "url": "https://deepseek.com", "category": "llm"},
    {"name": "Qwen", "url": "https://qwenlm.github.io", "category": "llm"},
    {"name": "Yi", "url": "https://01.ai", "category": "llm"},
    {"name": "Llama", "url": "https://llama.meta.com", "category": "llm"},
    {"name": "Grok", "url": "https://x.ai", "category": "llm"},
    {"name": "Pi", "url": "https://pi.ai", "category": "llm"},
    {"name": "Poe", "url": "https://poe.com", "category": "llm"},
    {"name": "Character.AI", "url": "https://character.ai", "category": "llm"},
    {"name": "Phind", "url": "https://phind.com", "category": "llm"},
    {"name": "You.com", "url": "https://you.com", "category": "llm"},
    {"name": "Kagi", "url": "https://kagi.com", "category": "llm"},
    
    {"name": "LangChain", "url": "https://langchain.com", "category": "framework"},
    {"name": "LlamaIndex", "url": "https://llamaindex.ai", "category": "framework"},
    {"name": "Haystack", "url": "https://haystack.deepset.ai", "category": "framework"},
    {"name": "Semantic Kernel", "url": "https://github.com/microsoft/semantic-kernel", "category": "framework"},
    {"name": "AutoGen", "url": "https://microsoft.github.io/autogen/", "category": "framework"},
    {"name": "CrewAI", "url": "https://crewai.com", "category": "framework"},
    {"name": "Dify", "url": "https://dify.ai", "category": "framework"},
    {"name": "Flowise", "url": "https://flowiseai.com", "category": "framework"},
    {"name": "Langflow", "url": "https://langflow.org", "category": "framework"},
    {"name": "Vercel AI SDK", "url": "https://sdk.vercel.ai", "category": "framework"},
    {"name": "Instructor", "url": "https://python.useinstructor.com", "category": "framework"},
    {"name": "Outlines", "url": "https://github.com/outlines-dev/outlines", "category": "framework"},
    {"name": "Guidance", "url": "https://github.com/guidance-ai/guidance", "category": "framework"},
    {"name": "DSPy", "url": "https://dspy-docs.vercel.app", "category": "framework"},
    {"name": "Marvin", "url": "https://askmarvin.ai", "category": "framework"},
    {"name": "Mirascope", "url": "https://mirascope.io", "category": "framework"},
    {"name": "Pydantic AI", "url": "https://ai.pydantic.dev", "category": "framework"},
    {"name": "Magentic", "url": "https://github.com/jackmpcollins/magentic", "category": "framework"},
    {"name": "LMQL", "url": "https://lmql.ai", "category": "framework"},
    {"name": "Guardrails AI", "url": "https://guardrailsai.com", "category": "framework"},
    {"name": "NeMo Guardrails", "url": "https://github.com/NVIDIA/NeMo-Guardrails", "category": "framework"},
    
    {"name": "Ollama", "url": "https://ollama.ai", "category": "local_llm"},
    {"name": "LM Studio", "url": "https://lmstudio.ai", "category": "local_llm"},
    {"name": "GPT4All", "url": "https://gpt4all.io", "category": "local_llm"},
    {"name": "Jan", "url": "https://jan.ai", "category": "local_llm"},
    {"name": "Msty", "url": "https://msty.app", "category": "local_llm"},
    {"name": "LocalAI", "url": "https://localai.io", "category": "local_llm"},
    {"name": "Text Generation WebUI", "url": "https://github.com/oobabooga/text-generation-webui", "category": "local_llm"},
    {"name": "vLLM", "url": "https://vllm.ai", "category": "local_llm"},
    {"name": "llama.cpp", "url": "https://github.com/ggerganov/llama.cpp", "category": "local_llm"},
    {"name": "Kobold.cpp", "url": "https://github.com/LostRuins/koboldcpp", "category": "local_llm"},
    {"name": "ExLlamaV2", "url": "https://github.com/turboderp/exllamav2", "category": "local_llm"},
    {"name": "MLX", "url": "https://github.com/ml-explore/mlx", "category": "local_llm"},
    
    {"name": "OpenAI API", "url": "https://platform.openai.com", "category": "api"},
    {"name": "Anthropic API", "url": "https://console.anthropic.com", "category": "api"},
    {"name": "Google AI Studio", "url": "https://aistudio.google.com", "category": "api"},
    {"name": "Azure OpenAI", "url": "https://azure.microsoft.com/en-us/products/ai-services/openai-service", "category": "api"},
    {"name": "AWS Bedrock", "url": "https://aws.amazon.com/bedrock/", "category": "api"},
    {"name": "Vertex AI", "url": "https://cloud.google.com/vertex-ai", "category": "api"},
    
    {"name": "Weights & Biases", "url": "https://wandb.ai", "category": "mlops"},
    {"name": "LangSmith", "url": "https://smith.langchain.com", "category": "mlops"},
    {"name": "Helicone", "url": "https://helicone.ai", "category": "mlops"},
    {"name": "Braintrust", "url": "https://braintrustdata.com", "category": "mlops"},
    {"name": "Portkey", "url": "https://portkey.ai", "category": "mlops"},
    {"name": "Arize", "url": "https://arize.com", "category": "mlops"},
    {"name": "Langfuse", "url": "https://langfuse.com", "category": "mlops"},
    {"name": "Promptlayer", "url": "https://promptlayer.com", "category": "mlops"},
    {"name": "Humanloop", "url": "https://humanloop.com", "category": "mlops"},
    {"name": "Log10", "url": "https://log10.io", "category": "mlops"},
    
    {"name": "Pinecone", "url": "https://pinecone.io", "category": "vector_db"},
    {"name": "Weaviate", "url": "https://weaviate.io", "category": "vector_db"},
    {"name": "Qdrant", "url": "https://qdrant.tech", "category": "vector_db"},
    {"name": "Milvus", "url": "https://milvus.io", "category": "vector_db"},
    {"name": "Chroma", "url": "https://trychroma.com", "category": "vector_db"},
    {"name": "Zilliz", "url": "https://zilliz.com", "category": "vector_db"},
    {"name": "Supabase Vector", "url": "https://supabase.com/vector", "category": "vector_db"},
    {"name": "pgvector", "url": "https://github.com/pgvector/pgvector", "category": "vector_db"},
    {"name": "LanceDB", "url": "https://lancedb.com", "category": "vector_db"},
    {"name": "Vespa", "url": "https://vespa.ai", "category": "vector_db"},
    
    {"name": "Midjourney", "url": "https://midjourney.com", "category": "image_gen"},
    {"name": "DALL-E", "url": "https://openai.com/dall-e-3", "category": "image_gen"},
    {"name": "Stable Diffusion", "url": "https://stability.ai", "category": "image_gen"},
    {"name": "Leonardo AI", "url": "https://leonardo.ai", "category": "image_gen"},
    {"name": "Ideogram", "url": "https://ideogram.ai", "category": "image_gen"},
    {"name": "Flux", "url": "https://blackforestlabs.ai", "category": "image_gen"},
    {"name": "Recraft", "url": "https://recraft.ai", "category": "image_gen"},
    {"name": "Playground AI", "url": "https://playground.com", "category": "image_gen"},
    {"name": "Krea AI", "url": "https://krea.ai", "category": "image_gen"},
    {"name": "Magnific", "url": "https://magnific.ai", "category": "image_gen"},
    
    {"name": "ElevenLabs", "url": "https://elevenlabs.io", "category": "audio"},
    {"name": "Suno", "url": "https://suno.ai", "category": "audio"},
    {"name": "Udio", "url": "https://udio.com", "category": "audio"},
    {"name": "Whisper", "url": "https://openai.com/research/whisper", "category": "audio"},
    {"name": "AssemblyAI", "url": "https://assemblyai.com", "category": "audio"},
    {"name": "Deepgram", "url": "https://deepgram.com", "category": "audio"},
    {"name": "PlayHT", "url": "https://play.ht", "category": "audio"},
    {"name": "Resemble AI", "url": "https://resemble.ai", "category": "audio"},
    
    {"name": "Runway", "url": "https://runwayml.com", "category": "video"},
    {"name": "Pika", "url": "https://pika.art", "category": "video"},
    {"name": "Luma AI", "url": "https://lumalabs.ai", "category": "video"},
    {"name": "Kling AI", "url": "https://klingai.com", "category": "video"},
    {"name": "HeyGen", "url": "https://heygen.com", "category": "video"},
    {"name": "Synthesia", "url": "https://synthesia.io", "category": "video"},
    {"name": "D-ID", "url": "https://d-id.com", "category": "video"},
    {"name": "Sora", "url": "https://openai.com/sora", "category": "video"},
    
    {"name": "Jasper", "url": "https://jasper.ai", "category": "writing"},
    {"name": "Copy.ai", "url": "https://copy.ai", "category": "writing"},
    {"name": "Writesonic", "url": "https://writesonic.com", "category": "writing"},
    {"name": "Rytr", "url": "https://rytr.me", "category": "writing"},
    {"name": "Sudowrite", "url": "https://sudowrite.com", "category": "writing"},
    {"name": "Grammarly", "url": "https://grammarly.com", "category": "writing"},
    {"name": "Wordtune", "url": "https://wordtune.com", "category": "writing"},
    {"name": "QuillBot", "url": "https://quillbot.com", "category": "writing"},
    
    {"name": "Notion AI", "url": "https://notion.so/product/ai", "category": "productivity"},
    {"name": "Mem", "url": "https://mem.ai", "category": "productivity"},
    {"name": "Reflect", "url": "https://reflect.app", "category": "productivity"},
    {"name": "Otter.ai", "url": "https://otter.ai", "category": "productivity"},
    {"name": "Fireflies.ai", "url": "https://fireflies.ai", "category": "productivity"},
    {"name": "Krisp", "url": "https://krisp.ai", "category": "productivity"},
    {"name": "Reclaim AI", "url": "https://reclaim.ai", "category": "productivity"},
    {"name": "Motion", "url": "https://usemotion.com", "category": "productivity"},
    {"name": "Gamma", "url": "https://gamma.app", "category": "productivity"},
    {"name": "Beautiful.ai", "url": "https://beautiful.ai", "category": "productivity"},
    {"name": "Tome", "url": "https://tome.app", "category": "productivity"},
    
    {"name": "Zapier AI", "url": "https://zapier.com/ai", "category": "automation"},
    {"name": "Make", "url": "https://make.com", "category": "automation"},
    {"name": "n8n", "url": "https://n8n.io", "category": "automation"},
    {"name": "Bardeen", "url": "https://bardeen.ai", "category": "automation"},
    {"name": "Activepieces", "url": "https://activepieces.com", "category": "automation"},
    
    {"name": "Zed", "url": "https://zed.dev", "category": "ide"},
    {"name": "JetBrains AI", "url": "https://jetbrains.com/ai/", "category": "extension"},
    {"name": "Pieces", "url": "https://pieces.app", "category": "extension"},
    {"name": "Codeium", "url": "https://codeium.com", "category": "extension"},
    {"name": "Blackbox AI", "url": "https://blackbox.ai", "category": "extension"},
    {"name": "AskCodi", "url": "https://askcodi.com", "category": "extension"},
    {"name": "Bito", "url": "https://bito.ai", "category": "extension"},
    {"name": "Mintlify", "url": "https://mintlify.com", "category": "extension"},
    {"name": "Swimm", "url": "https://swimm.io", "category": "extension"},
    
    {"name": "SWE-agent", "url": "https://swe-agent.com", "category": "autonomous"},
    {"name": "Sweep", "url": "https://sweep.dev", "category": "autonomous"},
    {"name": "Codegen", "url": "https://codegen.com", "category": "autonomous"},
    {"name": "Factory", "url": "https://factory.ai", "category": "autonomous"},
    {"name": "Poolside", "url": "https://poolside.ai", "category": "autonomous"},
    {"name": "Magic", "url": "https://magic.dev", "category": "autonomous"},
    {"name": "Cognition", "url": "https://cognition.ai", "category": "autonomous"},
    
    {"name": "Glean", "url": "https://glean.com", "category": "enterprise"},
    {"name": "Moveworks", "url": "https://moveworks.com", "category": "enterprise"},
    {"name": "Uniphore", "url": "https://uniphore.com", "category": "enterprise"},
    {"name": "Forethought", "url": "https://forethought.ai", "category": "enterprise"},
    {"name": "Ada", "url": "https://ada.cx", "category": "enterprise"},
    {"name": "Intercom Fin", "url": "https://intercom.com/fin", "category": "enterprise"},
    {"name": "Zendesk AI", "url": "https://zendesk.com/ai", "category": "enterprise"},
    
    {"name": "Claude MCP", "url": "https://modelcontextprotocol.io", "category": "mcp"},
    {"name": "MCP Hub", "url": "https://github.com/modelcontextprotocol/servers", "category": "mcp"},
    {"name": "Smithery", "url": "https://smithery.ai", "category": "mcp"},
    {"name": "MCP Filesystem Server", "url": "https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem", "category": "mcp"},
    {"name": "MCP GitHub Server", "url": "https://github.com/modelcontextprotocol/servers/tree/main/src/github", "category": "mcp"},
    {"name": "MCP Postgres Server", "url": "https://github.com/modelcontextprotocol/servers/tree/main/src/postgres", "category": "mcp"},
    {"name": "MCP Puppeteer Server", "url": "https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer", "category": "mcp"},
    {"name": "MCP Brave Search", "url": "https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search", "category": "mcp"},
    {"name": "MCP Google Maps", "url": "https://github.com/modelcontextprotocol/servers/tree/main/src/google-maps", "category": "mcp"},
    {"name": "MCP Slack Server", "url": "https://github.com/modelcontextprotocol/servers/tree/main/src/slack", "category": "mcp"},
    {"name": "MCP Memory Server", "url": "https://github.com/modelcontextprotocol/servers/tree/main/src/memory", "category": "mcp"},
    {"name": "MCP Fetch Server", "url": "https://github.com/modelcontextprotocol/servers/tree/main/src/fetch", "category": "mcp"},
    {"name": "MCP SQLite Server", "url": "https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite", "category": "mcp"},
    {"name": "MCP Sentry Server", "url": "https://github.com/modelcontextprotocol/servers/tree/main/src/sentry", "category": "mcp"},
    {"name": "MCP Everart Server", "url": "https://github.com/modelcontextprotocol/servers/tree/main/src/everart", "category": "mcp"},
    {"name": "MCP Sequential Thinking", "url": "https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking", "category": "mcp"},
    {"name": "MCP AWS KB Retrieval", "url": "https://github.com/modelcontextprotocol/servers/tree/main/src/aws-kb-retrieval-server", "category": "mcp"},
    {"name": "Browserbase MCP", "url": "https://github.com/browserbase/mcp-server-browserbase", "category": "mcp"},
    {"name": "Firecrawl MCP", "url": "https://github.com/mendableai/firecrawl-mcp-server", "category": "mcp"},
    {"name": "Neon MCP Server", "url": "https://github.com/neondatabase/mcp-server-neon", "category": "mcp"},
    {"name": "Cloudflare MCP", "url": "https://github.com/cloudflare/mcp-server-cloudflare", "category": "mcp"},
    {"name": "Raycast MCP", "url": "https://github.com/raycast/mcp-server-raycast", "category": "mcp"},
    {"name": "Axiom MCP", "url": "https://github.com/axiomhq/mcp-server-axiom", "category": "mcp"},
    {"name": "E2B MCP Server", "url": "https://github.com/e2b-dev/mcp-server", "category": "mcp"},
    {"name": "Obsidian MCP", "url": "https://github.com/smithery-ai/mcp-obsidian", "category": "mcp"},
    {"name": "Linear MCP", "url": "https://github.com/jerhadf/linear-mcp-server", "category": "mcp"},
    {"name": "Notion MCP", "url": "https://github.com/makenotion/notion-mcp-server", "category": "mcp"},
    {"name": "Todoist MCP", "url": "https://github.com/abhiz123/todoist-mcp-server", "category": "mcp"},
    {"name": "Playwright MCP", "url": "https://github.com/executeautomation/mcp-playwright", "category": "mcp"},
    {"name": "Docker MCP", "url": "https://github.com/ckreiling/mcp-server-docker", "category": "mcp"},
    {"name": "Kubernetes MCP", "url": "https://github.com/strowk/mcp-k8s-go", "category": "mcp"},
    {"name": "Supabase MCP", "url": "https://github.com/supabase-community/supabase-mcp", "category": "mcp"},
    {"name": "Stripe MCP", "url": "https://github.com/stripe/agent-toolkit", "category": "mcp"},
    {"name": "Twilio MCP", "url": "https://github.com/twilio/mcp-server-twilio", "category": "mcp"},
    {"name": "GitLab MCP", "url": "https://github.com/theishangoswami/gitlab-mcp", "category": "mcp"},
    {"name": "Jira MCP", "url": "https://github.com/sooperset/mcp-atlassian", "category": "mcp"},
    {"name": "Airtable MCP", "url": "https://github.com/domdomegg/airtable-mcp-server", "category": "mcp"},
    {"name": "Perplexity MCP", "url": "https://github.com/ppl-ai/modelcontextprotocol", "category": "mcp"},
    {"name": "YouTube MCP", "url": "https://github.com/anaisbetts/mcp-youtube", "category": "mcp"},
    {"name": "Reddit MCP", "url": "https://github.com/Arindam200/reddit-mcp-server", "category": "mcp"},
    {"name": "X/Twitter MCP", "url": "https://github.com/vidhupv/x-mcp", "category": "mcp"},
    {"name": "Discord MCP", "url": "https://github.com/v-3/discordmcp", "category": "mcp"},
    {"name": "Telegram MCP", "url": "https://github.com/chigwell/telegram-mcp-server", "category": "mcp"},
    {"name": "WhatsApp MCP", "url": "https://github.com/lharries/whatsapp-mcp", "category": "mcp"},
    {"name": "Gmail MCP", "url": "https://github.com/nicholasrq/gmail-mcp", "category": "mcp"},
    {"name": "Google Calendar MCP", "url": "https://github.com/nspady/google-calendar-mcp", "category": "mcp"},
    {"name": "Google Drive MCP", "url": "https://github.com/felores/gdrive-mcp-server", "category": "mcp"},
    {"name": "Dropbox MCP", "url": "https://github.com/amidabuddha/dropbox-mcp-server", "category": "mcp"},
    {"name": "AWS MCP", "url": "https://github.com/rishikavikondala/mcp-server-aws", "category": "mcp"},
    {"name": "Azure MCP", "url": "https://github.com/mashriram/azure_mcp", "category": "mcp"},
    {"name": "Vercel MCP", "url": "https://github.com/vercel/mcp", "category": "mcp"},
    {"name": "Netlify MCP", "url": "https://github.com/netlify/mcp-server-netlify", "category": "mcp"},
    {"name": "Railway MCP", "url": "https://github.com/railway/mcp", "category": "mcp"},
    {"name": "Render MCP", "url": "https://github.com/render-oss/render-mcp-server", "category": "mcp"},
    {"name": "Fly.io MCP", "url": "https://github.com/anotherjesse/fly-mcp-server", "category": "mcp"},
    {"name": "PlanetScale MCP", "url": "https://github.com/planetscale/mcp-server-planetscale", "category": "mcp"},
    {"name": "MongoDB MCP", "url": "https://github.com/mongodb/mcp-server", "category": "mcp"},
    {"name": "Redis MCP", "url": "https://github.com/redis/mcp-redis", "category": "mcp"},
    {"name": "Elasticsearch MCP", "url": "https://github.com/elastic/mcp-server-elasticsearch", "category": "mcp"},
    {"name": "Pinecone MCP", "url": "https://github.com/pinecone-io/pinecone-mcp", "category": "mcp"},
    {"name": "Weaviate MCP", "url": "https://github.com/weaviate/mcp-server-weaviate", "category": "mcp"},
    {"name": "Qdrant MCP", "url": "https://github.com/qdrant/mcp-server-qdrant", "category": "mcp"},
    {"name": "Chroma MCP", "url": "https://github.com/chroma-core/chroma-mcp", "category": "mcp"},
    {"name": "LangChain MCP", "url": "https://github.com/langchain-ai/langchain-mcp", "category": "mcp"},
    {"name": "Tavily MCP", "url": "https://github.com/tavily-ai/tavily-mcp", "category": "mcp"},
    {"name": "Exa MCP", "url": "https://github.com/exa-labs/exa-mcp-server", "category": "mcp"},
    {"name": "Serper MCP", "url": "https://github.com/nicholasrq/serper-mcp", "category": "mcp"},
    {"name": "SerpAPI MCP", "url": "https://github.com/serpapi/serpapi-mcp-server", "category": "mcp"},
    {"name": "Apify MCP", "url": "https://github.com/apify/mcp-server-apify", "category": "mcp"},
    {"name": "Browserless MCP", "url": "https://github.com/nicholasrq/browserless-mcp", "category": "mcp"},
    {"name": "Figma MCP", "url": "https://github.com/nicholasrq/figma-mcp", "category": "mcp"},
    {"name": "Canva MCP", "url": "https://github.com/nicholasrq/canva-mcp", "category": "mcp"},
    {"name": "Replicate MCP", "url": "https://github.com/deepfates/mcp-replicate", "category": "mcp"},
    {"name": "HuggingFace MCP", "url": "https://github.com/nicholasrq/huggingface-mcp", "category": "mcp"},
    {"name": "OpenAI MCP", "url": "https://github.com/nicholasrq/openai-mcp", "category": "mcp"},
    {"name": "Anthropic MCP", "url": "https://github.com/nicholasrq/anthropic-mcp", "category": "mcp"},
    {"name": "Ollama MCP", "url": "https://github.com/nicholasrq/ollama-mcp", "category": "mcp"},
    {"name": "Time MCP", "url": "https://github.com/modelcontextprotocol/servers/tree/main/src/time", "category": "mcp"},
    {"name": "Everything MCP", "url": "https://github.com/modelcontextprotocol/servers/tree/main/src/everything", "category": "mcp"},
    {"name": "Git MCP", "url": "https://github.com/modelcontextprotocol/servers/tree/main/src/git", "category": "mcp"},
    {"name": "Evernote MCP", "url": "https://github.com/nicholasrq/evernote-mcp", "category": "mcp"},
    {"name": "Apple Notes MCP", "url": "https://github.com/nicholasrq/apple-notes-mcp", "category": "mcp"},
    {"name": "Bear MCP", "url": "https://github.com/nicholasrq/bear-mcp", "category": "mcp"},
    {"name": "Roam MCP", "url": "https://github.com/nicholasrq/roam-mcp", "category": "mcp"},
    {"name": "Logseq MCP", "url": "https://github.com/nicholasrq/logseq-mcp", "category": "mcp"},
    {"name": "Coda MCP", "url": "https://github.com/nicholasrq/coda-mcp", "category": "mcp"},
    {"name": "Asana MCP", "url": "https://github.com/nicholasrq/asana-mcp", "category": "mcp"},
    {"name": "Monday MCP", "url": "https://github.com/nicholasrq/monday-mcp", "category": "mcp"},
    {"name": "ClickUp MCP", "url": "https://github.com/nicholasrq/clickup-mcp", "category": "mcp"},
    {"name": "Basecamp MCP", "url": "https://github.com/nicholasrq/basecamp-mcp", "category": "mcp"},
    {"name": "Trello MCP", "url": "https://github.com/nicholasrq/trello-mcp", "category": "mcp"},
    {"name": "Zendesk MCP", "url": "https://github.com/nicholasrq/zendesk-mcp", "category": "mcp"},
    {"name": "Intercom MCP", "url": "https://github.com/nicholasrq/intercom-mcp", "category": "mcp"},
    {"name": "Freshdesk MCP", "url": "https://github.com/nicholasrq/freshdesk-mcp", "category": "mcp"},
    {"name": "HubSpot MCP", "url": "https://github.com/nicholasrq/hubspot-mcp", "category": "mcp"},
    {"name": "Salesforce MCP", "url": "https://github.com/nicholasrq/salesforce-mcp", "category": "mcp"},
    {"name": "Pipedrive MCP", "url": "https://github.com/nicholasrq/pipedrive-mcp", "category": "mcp"},
    {"name": "Mailchimp MCP", "url": "https://github.com/nicholasrq/mailchimp-mcp", "category": "mcp"},
    {"name": "SendGrid MCP", "url": "https://github.com/nicholasrq/sendgrid-mcp", "category": "mcp"},
    {"name": "Postmark MCP", "url": "https://github.com/nicholasrq/postmark-mcp", "category": "mcp"},
    {"name": "Resend MCP", "url": "https://github.com/nicholasrq/resend-mcp", "category": "mcp"},
    
    {"name": "Gemma", "url": "https://ai.google.dev/gemma", "category": "llm"},
    {"name": "Command R", "url": "https://cohere.com/command", "category": "llm"},
    {"name": "Falcon", "url": "https://falconllm.tii.ae", "category": "llm"},
    {"name": "Phi", "url": "https://azure.microsoft.com/en-us/products/phi", "category": "llm"},
    {"name": "Mixtral", "url": "https://mistral.ai/news/mixtral-of-experts", "category": "llm"},
    {"name": "Codestral", "url": "https://mistral.ai/news/codestral", "category": "llm"},
    {"name": "WizardLM", "url": "https://github.com/nlpxucan/WizardLM", "category": "llm"},
    {"name": "Vicuna", "url": "https://lmsys.org/blog/2023-03-30-vicuna", "category": "llm"},
    {"name": "Zephyr", "url": "https://huggingface.co/HuggingFaceH4/zephyr-7b-beta", "category": "llm"},
    {"name": "OpenChat", "url": "https://github.com/imoneoi/openchat", "category": "llm"},
    {"name": "Nous Hermes", "url": "https://nousresearch.com", "category": "llm"},
    {"name": "Solar", "url": "https://www.upstage.ai/solar-llm", "category": "llm"},
    {"name": "InternLM", "url": "https://github.com/InternLM/InternLM", "category": "llm"},
    {"name": "Baichuan", "url": "https://www.baichuan-ai.com", "category": "llm"},
    {"name": "GLM", "url": "https://github.com/THUDM/GLM", "category": "llm"},
    {"name": "ChatGLM", "url": "https://github.com/THUDM/ChatGLM-6B", "category": "llm"},
    {"name": "BLOOM", "url": "https://huggingface.co/bigscience/bloom", "category": "llm"},
    {"name": "StableLM", "url": "https://stability.ai/stable-lm", "category": "llm"},
    {"name": "Dolly", "url": "https://www.databricks.com/blog/dolly-first-open-commercially-viable-instruction-tuned-llm", "category": "llm"},
    {"name": "MPT", "url": "https://www.mosaicml.com/mpt", "category": "llm"},
    {"name": "RedPajama", "url": "https://www.together.ai/blog/redpajama", "category": "llm"},
    {"name": "OpenLLaMA", "url": "https://github.com/openlm-research/open_llama", "category": "llm"},
    {"name": "Orca", "url": "https://www.microsoft.com/en-us/research/publication/orca-progressive-learning-from-complex-explanation-traces-of-gpt-4", "category": "llm"},
    {"name": "Starling", "url": "https://starling.cs.berkeley.edu", "category": "llm"},
    {"name": "Nemotron", "url": "https://developer.nvidia.com/nemotron", "category": "llm"},
    {"name": "Arctic", "url": "https://www.snowflake.com/blog/arctic-open-efficient-foundation-language-models-snowflake", "category": "llm"},
    {"name": "DBRX", "url": "https://www.databricks.com/blog/introducing-dbrx-new-state-art-open-llm", "category": "llm"},
    {"name": "Jamba", "url": "https://www.ai21.com/jamba", "category": "llm"},
    {"name": "Reka", "url": "https://reka.ai", "category": "llm"},
    {"name": "Inflection Pi", "url": "https://inflection.ai", "category": "llm"},
    {"name": "Cohere Coral", "url": "https://coral.cohere.com", "category": "llm"},
    {"name": "AI21 Jurassic", "url": "https://www.ai21.com/studio", "category": "llm"},
    {"name": "Aleph Alpha", "url": "https://aleph-alpha.com", "category": "llm"},
    {"name": "GPT-4o", "url": "https://openai.com/gpt-4o", "category": "llm"},
    {"name": "GPT-4 Turbo", "url": "https://openai.com/gpt-4", "category": "llm"},
    {"name": "o1", "url": "https://openai.com/o1", "category": "llm"},
    {"name": "o3", "url": "https://openai.com/o3", "category": "llm"},
    {"name": "Gemini 2.0", "url": "https://deepmind.google/technologies/gemini", "category": "llm"},
    {"name": "Gemini Ultra", "url": "https://deepmind.google/technologies/gemini/ultra", "category": "llm"},
    {"name": "Gemini Flash", "url": "https://deepmind.google/technologies/gemini/flash", "category": "llm"},
    {"name": "DeepSeek V3", "url": "https://www.deepseek.com", "category": "llm"},
    {"name": "DeepSeek Coder", "url": "https://github.com/deepseek-ai/DeepSeek-Coder", "category": "llm"},
    {"name": "Qwen 2.5", "url": "https://qwenlm.github.io", "category": "llm"},
    {"name": "Qwen Coder", "url": "https://github.com/QwenLM/Qwen2.5-Coder", "category": "llm"},
    {"name": "CodeLlama", "url": "https://ai.meta.com/blog/code-llama-large-language-model-coding", "category": "llm"},
    {"name": "StarCoder", "url": "https://huggingface.co/bigcode/starcoder", "category": "llm"},
    {"name": "StarCoder2", "url": "https://huggingface.co/bigcode/starcoder2-15b", "category": "llm"},
    {"name": "CodeGeeX", "url": "https://codegeex.cn", "category": "llm"},
    {"name": "WizardCoder", "url": "https://github.com/nlpxucan/WizardLM/tree/main/WizardCoder", "category": "llm"},
    {"name": "Phind CodeLlama", "url": "https://www.phind.com/blog/code-llama-beats-gpt4", "category": "llm"},
    {"name": "Magicoder", "url": "https://github.com/ise-uiuc/magicoder", "category": "llm"},
    {"name": "OpenCodeInterpreter", "url": "https://github.com/OpenCodeInterpreter/OpenCodeInterpreter", "category": "llm"},
    {"name": "Granite Code", "url": "https://github.com/ibm-granite/granite-code-models", "category": "llm"},
    {"name": "CodeQwen", "url": "https://github.com/QwenLM/CodeQwen1.5", "category": "llm"},
    
    {"name": "AgentGPT", "url": "https://agentgpt.reworkd.ai", "category": "autonomous"},
    {"name": "AutoGPT", "url": "https://autogpt.net", "category": "autonomous"},
    {"name": "BabyAGI", "url": "https://github.com/yoheinakajima/babyagi", "category": "autonomous"},
    {"name": "SuperAGI", "url": "https://superagi.com", "category": "autonomous"},
    {"name": "MetaGPT", "url": "https://github.com/geekan/MetaGPT", "category": "autonomous"},
    {"name": "GPT Engineer", "url": "https://gptengineer.app", "category": "autonomous"},
    {"name": "Smol Developer", "url": "https://github.com/smol-ai/developer", "category": "autonomous"},
    {"name": "GPT Pilot", "url": "https://github.com/Pythagora-io/gpt-pilot", "category": "autonomous"},
    {"name": "Devika", "url": "https://github.com/stitionai/devika", "category": "autonomous"},
    {"name": "Open Interpreter", "url": "https://openinterpreter.com", "category": "autonomous"},
    {"name": "Mentat", "url": "https://mentat.ai", "category": "autonomous"},
    {"name": "Plandex", "url": "https://plandex.ai", "category": "autonomous"},
    {"name": "Devon", "url": "https://github.com/entropy-research/Devon", "category": "autonomous"},
    {"name": "Manus", "url": "https://manus.im", "category": "autonomous"},
    {"name": "Genspark", "url": "https://genspark.ai", "category": "autonomous"},
    {"name": "Operator", "url": "https://openai.com/operator", "category": "autonomous"},
    {"name": "Computer Use", "url": "https://www.anthropic.com/news/computer-use", "category": "autonomous"},
    {"name": "Adept", "url": "https://adept.ai", "category": "autonomous"},
    {"name": "Multion", "url": "https://multion.ai", "category": "autonomous"},
    {"name": "Lindy", "url": "https://lindy.ai", "category": "autonomous"},
    {"name": "Induced AI", "url": "https://induced.ai", "category": "autonomous"},
    {"name": "Relevance AI", "url": "https://relevanceai.com", "category": "autonomous"},
    {"name": "Beam AI", "url": "https://beam.ai", "category": "autonomous"},
    {"name": "Fixie", "url": "https://fixie.ai", "category": "autonomous"},
    {"name": "Dust", "url": "https://dust.tt", "category": "autonomous"},
    
    {"name": "Trae", "url": "https://trae.ai", "category": "ide"},
    {"name": "Void", "url": "https://voideditor.com", "category": "ide"},
    {"name": "PearAI", "url": "https://trypear.ai", "category": "ide"},
    {"name": "Melty", "url": "https://melty.sh", "category": "ide"},
    {"name": "Aide", "url": "https://aide.dev", "category": "ide"},
    
    {"name": "Codestory", "url": "https://codestory.ai", "category": "extension"},
    {"name": "Refact", "url": "https://refact.ai", "category": "extension"},
    {"name": "Tabby", "url": "https://tabby.tabbyml.com", "category": "extension"},
    {"name": "FauxPilot", "url": "https://github.com/fauxpilot/fauxpilot", "category": "extension"},
    {"name": "CodeGPT", "url": "https://codegpt.co", "category": "extension"},
    {"name": "AI Commits", "url": "https://github.com/Nutlope/aicommits", "category": "extension"},
    {"name": "Grit", "url": "https://grit.io", "category": "extension"},
    {"name": "What The Diff", "url": "https://whatthediff.ai", "category": "extension"},
    {"name": "CodeRabbit", "url": "https://coderabbit.ai", "category": "extension"},
    {"name": "Ellipsis", "url": "https://ellipsis.dev", "category": "extension"},
    {"name": "PR Agent", "url": "https://github.com/Codium-ai/pr-agent", "category": "extension"},
    {"name": "Graphite", "url": "https://graphite.dev", "category": "extension"},
    
    {"name": "Smolagents", "url": "https://github.com/huggingface/smolagents", "category": "framework"},
    {"name": "Agents.js", "url": "https://github.com/livekit/agents-js", "category": "framework"},
    {"name": "Phidata", "url": "https://phidata.com", "category": "framework"},
    {"name": "Agno", "url": "https://agno.com", "category": "framework"},
    {"name": "ControlFlow", "url": "https://controlflow.ai", "category": "framework"},
    {"name": "Composio", "url": "https://composio.dev", "category": "framework"},
    {"name": "Letta", "url": "https://letta.com", "category": "framework"},
    {"name": "MemGPT", "url": "https://memgpt.ai", "category": "framework"},
    {"name": "Julep", "url": "https://julep.ai", "category": "framework"},
    {"name": "Camel AI", "url": "https://camel-ai.org", "category": "framework"},
    {"name": "AgentOps", "url": "https://agentops.ai", "category": "framework"},
    {"name": "E2B", "url": "https://e2b.dev", "category": "framework"},
    {"name": "Modal", "url": "https://modal.com", "category": "framework"},
    {"name": "Browserbase", "url": "https://browserbase.com", "category": "framework"},
    {"name": "Stagehand", "url": "https://stagehand.dev", "category": "framework"},
    {"name": "Firecrawl", "url": "https://firecrawl.dev", "category": "framework"},
    {"name": "Jina AI", "url": "https://jina.ai", "category": "framework"},
    {"name": "Unstructured", "url": "https://unstructured.io", "category": "framework"},
    {"name": "LlamaParse", "url": "https://llamaindex.ai/llamaparse", "category": "framework"},
    
    {"name": "OpenWebUI", "url": "https://openwebui.com", "category": "local_llm"},
    {"name": "AnythingLLM", "url": "https://anythingllm.com", "category": "local_llm"},
    {"name": "Chatbox", "url": "https://chatboxai.app", "category": "local_llm"},
    {"name": "LibreChat", "url": "https://librechat.ai", "category": "local_llm"},
    {"name": "LobeChat", "url": "https://lobehub.com", "category": "local_llm"},
    {"name": "Big-AGI", "url": "https://big-agi.com", "category": "local_llm"},
    {"name": "SillyTavern", "url": "https://sillytavern.app", "category": "local_llm"},
    {"name": "TensorRT-LLM", "url": "https://github.com/NVIDIA/TensorRT-LLM", "category": "local_llm"},
    {"name": "SGLang", "url": "https://github.com/sgl-project/sglang", "category": "local_llm"},
    {"name": "MLC LLM", "url": "https://mlc.ai/mlc-llm", "category": "local_llm"},
    
    {"name": "Cerebras", "url": "https://cerebras.ai", "category": "api"},
    {"name": "SambaNova", "url": "https://sambanova.ai", "category": "api"},
    {"name": "Lepton AI", "url": "https://lepton.ai", "category": "api"},
    {"name": "Baseten", "url": "https://baseten.co", "category": "api"},
    {"name": "Runpod", "url": "https://runpod.io", "category": "api"},
    {"name": "Lambda Labs", "url": "https://lambdalabs.com", "category": "api"},
    {"name": "CoreWeave", "url": "https://coreweave.com", "category": "api"},
    {"name": "Vast.ai", "url": "https://vast.ai", "category": "api"},
    {"name": "OctoAI", "url": "https://octo.ai", "category": "api"},
    {"name": "Deepinfra", "url": "https://deepinfra.com", "category": "api"},
    {"name": "Novita AI", "url": "https://novita.ai", "category": "api"},
    
    {"name": "Phoenix", "url": "https://phoenix.arize.com", "category": "mlops"},
    {"name": "Opik", "url": "https://comet.com/opik", "category": "mlops"},
    {"name": "Literal AI", "url": "https://literalai.com", "category": "mlops"},
    {"name": "Parea", "url": "https://parea.ai", "category": "mlops"},
    {"name": "Athina", "url": "https://athina.ai", "category": "mlops"},
    {"name": "Confident AI", "url": "https://confident-ai.com", "category": "mlops"},
    {"name": "Ragas", "url": "https://ragas.io", "category": "mlops"},
    {"name": "TruLens", "url": "https://trulens.org", "category": "mlops"},
    {"name": "Giskard", "url": "https://giskard.ai", "category": "mlops"},
    {"name": "Evidently", "url": "https://evidentlyai.com", "category": "mlops"},
    
    {"name": "Turbopuffer", "url": "https://turbopuffer.com", "category": "vector_db"},
    {"name": "Marqo", "url": "https://marqo.ai", "category": "vector_db"},
    {"name": "Activeloop", "url": "https://activeloop.ai", "category": "vector_db"},
    {"name": "SingleStore", "url": "https://singlestore.com", "category": "vector_db"},
    {"name": "Timescale Vector", "url": "https://timescale.com/ai", "category": "vector_db"},
    {"name": "Neon", "url": "https://neon.tech", "category": "vector_db"},
    
    {"name": "Claude Desktop", "url": "https://claude.ai/download", "category": "cli_agent"},
    {"name": "OpenCode", "url": "https://github.com/opencode-ai/opencode", "category": "cli_agent"},
    {"name": "AI Shell", "url": "https://github.com/BuilderIO/ai-shell", "category": "cli_agent"},
    {"name": "Shell GPT", "url": "https://github.com/TheR1D/shell_gpt", "category": "cli_agent"},
    {"name": "Warp AI", "url": "https://warp.dev", "category": "cli_agent"},
    {"name": "Copilot CLI", "url": "https://githubnext.com/projects/copilot-cli", "category": "cli_agent"},
    {"name": "Mods", "url": "https://github.com/charmbracelet/mods", "category": "cli_agent"},
    {"name": "LLM CLI", "url": "https://llm.datasette.io", "category": "cli_agent"},
    
    {"name": "Elicit", "url": "https://elicit.com", "category": "research"},
    {"name": "Consensus", "url": "https://consensus.app", "category": "research"},
    {"name": "Semantic Scholar", "url": "https://semanticscholar.org", "category": "research"},
    {"name": "Connected Papers", "url": "https://connectedpapers.com", "category": "research"},
    {"name": "Scite", "url": "https://scite.ai", "category": "research"},
    {"name": "ResearchRabbit", "url": "https://researchrabbit.ai", "category": "research"},
    {"name": "ChatPDF", "url": "https://chatpdf.com", "category": "research"},
    {"name": "Humata", "url": "https://humata.ai", "category": "research"},
]

VIBE_TOOL_CATEGORIES = {
    "orchestration": "AI Agent Orchestration",
    "cli_agent": "CLI Coding Agents",
    "ide": "AI-Powered IDEs",
    "extension": "IDE Extensions",
    "autonomous": "Autonomous Agents",
    "app_builder": "AI App Builders",
    "framework": "Agent Frameworks",
    "mcp": "MCP Servers & Tools",
    "llm": "LLM Providers",
    "local_llm": "Local LLM Tools",
    "api": "LLM APIs & Platforms",
    "mlops": "MLOps & Observability",
    "vector_db": "Vector Databases",
    "image_gen": "Image Generation",
    "audio": "Audio & Speech AI",
    "video": "Video Generation",
    "writing": "AI Writing Tools",
    "productivity": "AI Productivity",
    "automation": "AI Automation",
    "enterprise": "Enterprise AI",
    "research": "AI Research Tools",
}


async def scrape_website_for_tools(client: httpx.AsyncClient, url: str) -> dict:
    """Scrape a website and extract tool metadata."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }
    
    try:
        response = await client.get(url, headers=headers, follow_redirects=True, timeout=15.0)
        if response.status_code != 200:
            return {"error": f"HTTP {response.status_code}", "url": url}
        
        soup = BeautifulSoup(response.text, "lxml")
        
        title = soup.title.string.strip() if soup.title and soup.title.string else None
        
        meta_desc = soup.find("meta", attrs={"name": "description"})
        description = meta_desc.get("content") if meta_desc else None
        
        og_title = soup.find("meta", property="og:title")
        og_desc = soup.find("meta", property="og:description")
        og_image = soup.find("meta", property="og:image")
        
        github_url = None
        for a in soup.find_all("a", href=True):
            href = a.get("href", "")
            if "github.com" in href and "/issues" not in href and "/pull" not in href:
                github_url = href
                break
        
        features = []
        page_text = soup.get_text(separator=" ", strip=True).lower()
        
        feature_indicators = [
            ("parallel execution", "Parallel agent execution"),
            ("git worktree", "Git worktree isolation"),
            ("code review", "AI code review"),
            ("multi-agent", "Multi-agent support"),
            ("mcp", "MCP integration"),
            ("vs code", "VS Code extension"),
            ("vscode", "VS Code extension"),
            ("cli", "CLI interface"),
            ("terminal", "Terminal-based"),
            ("autonomous", "Autonomous operation"),
            ("self-healing", "Self-healing code"),
            ("context", "Context-aware"),
        ]
        
        for keyword, feature_name in feature_indicators:
            if keyword in page_text:
                features.append(feature_name)
        
        supported_agents = []
        agent_names = ["claude code", "gemini cli", "aider", "copilot", "cursor", "cline", "opencode", "amp"]
        for agent in agent_names:
            if agent in page_text:
                supported_agents.append(agent.title())
        
        return {
            "url": str(response.url),
            "title": title,
            "description": description or (og_desc.get("content") if og_desc else None),
            "og_title": og_title.get("content") if og_title else None,
            "og_image": og_image.get("content") if og_image else None,
            "github_url": github_url,
            "features_detected": list(set(features)),
            "supported_agents": list(set(supported_agents)),
            "scraped_at": datetime.now().isoformat(),
        }
    except Exception as e:
        return {"error": str(e), "url": url}


async def scrape_github_awesome_list(client: httpx.AsyncClient, repo_url: str) -> list[dict]:
    """Scrape tools from a GitHub awesome list."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }
    
    tools = []
    
    try:
        response = await client.get(repo_url, headers=headers, follow_redirects=True, timeout=15.0)
        if response.status_code != 200:
            return tools
        
        soup = BeautifulSoup(response.text, "lxml")
        readme = soup.find("article", class_="markdown-body")
        
        if not readme:
            return tools
        
        for li in readme.find_all("li"):
            a_tag = li.find("a")
            if not a_tag:
                continue
            
            href = a_tag.get("href", "")
            name = a_tag.get_text(strip=True)
            
            if not href or not name:
                continue
            
            if href.startswith("#"):
                continue
            
            description = ""
            text = li.get_text(strip=True)
            if " - " in text:
                description = text.split(" - ", 1)[1]
            elif ": " in text:
                description = text.split(": ", 1)[1]
            
            if len(name) > 2 and len(name) < 100:
                tools.append({
                    "name": name,
                    "url": href,
                    "description": description[:500] if description else "",
                    "source": repo_url,
                })
        
        return tools
    except Exception as e:
        print(f"Error scraping awesome list {repo_url}: {e}")
        return tools


async def scrape_mcp_directory(client: httpx.AsyncClient, directory: dict) -> list[dict]:
    """Scrape MCP tools from a directory website."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }
    
    tools = []
    url = directory["url"]
    name = directory["name"]
    
    try:
        response = await client.get(url, headers=headers, follow_redirects=True, timeout=15.0)
        if response.status_code != 200:
            print(f"  Failed to fetch {name}: HTTP {response.status_code}")
            return tools
        
        soup = BeautifulSoup(response.text, "lxml")
        
        for a in soup.find_all("a", href=True):
            href = a.get("href", "")
            text = a.get_text(strip=True)
            
            if not text or len(text) < 3 or len(text) > 100:
                continue
            
            is_mcp_related = any(x in href.lower() or x in text.lower() for x in [
                "mcp", "server", "github.com", "npmjs.com"
            ])
            
            if not is_mcp_related:
                continue
            
            if href.startswith("/"):
                href = urljoin(url, href)
            
            if href.startswith("#") or "javascript:" in href:
                continue
            
            parent = a.find_parent(["li", "div", "article", "tr"])
            description = ""
            if parent:
                desc_text = parent.get_text(separator=" ", strip=True)
                if " - " in desc_text:
                    description = desc_text.split(" - ", 1)[1][:300]
                elif len(desc_text) > len(text):
                    description = desc_text[:300]
            
            tools.append({
                "name": text,
                "url": href,
                "description": description,
                "source": name,
                "category": "mcp",
            })
        
        return tools
    except Exception as e:
        print(f"  Error scraping {name}: {e}")
        return tools


async def search_for_vibe_tools(client: httpx.AsyncClient) -> list[dict]:
    """Search DuckDuckGo for vibe coding tools."""
    discovered = []
    
    search_queries = [
        "AI coding agent tools 2025",
        "vibe coding workflow tools",
        "claude code alternatives",
        "aider alternatives AI coding",
        "parallel AI coding agents",
        "autonomous coding agent tools",
        "AI code orchestration tools",
        "multi-agent coding workflow",
        "MCP server github 2025",
        "model context protocol servers",
        "awesome MCP servers list",
        "MCP tools for Claude",
        "MCP server integrations",
    ]
    
    for query in search_queries:
        try:
            url = "https://html.duckduckgo.com/html/"
            headers = {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
            }
            
            response = await client.post(url, data={"q": query}, headers=headers, timeout=15.0)
            if response.status_code != 200:
                continue
            
            soup = BeautifulSoup(response.text, "lxml")
            
            for result in soup.select(".result")[:5]:
                title_elem = result.select_one(".result__title")
                snippet_elem = result.select_one(".result__snippet")
                
                if title_elem:
                    a_tag = title_elem.select_one("a")
                    if a_tag and a_tag.get("href"):
                        href = a_tag.get("href", "")
                        link = ""
                        if "uddg=" in href:
                            import urllib.parse
                            parsed = urllib.parse.parse_qs(urllib.parse.urlparse(href).query)
                            link = parsed.get("uddg", [""])[0]
                        else:
                            link = href
                        
                        if link and not any(x in link for x in ["google.com", "bing.com", "duckduckgo.com"]):
                            discovered.append({
                                "name": title_elem.get_text(strip=True),
                                "url": link,
                                "description": snippet_elem.get_text(strip=True) if snippet_elem else "",
                                "source": f"search:{query}",
                            })
            
            await asyncio.sleep(2)
        except Exception as e:
            print(f"Search error for '{query}': {e}")
    
    return discovered


def deduplicate_tools(tools: list[dict]) -> list[dict]:
    """Deduplicate tools by URL domain."""
    seen_domains = set()
    unique_tools = []
    
    for tool in tools:
        url = tool.get("url", "")
        if not url:
            continue
        
        try:
            domain = urlparse(url).netloc.lower()
            domain = domain.replace("www.", "")
            
            if domain and domain not in seen_domains:
                seen_domains.add(domain)
                unique_tools.append(tool)
        except:
            continue
    
    return unique_tools


async def scrape_vibe_tools() -> dict:
    """Main function to scrape and discover vibe coding tools."""
    results = {
        "scraped_at": datetime.now().isoformat(),
        "known_tools": [],
        "discovered_tools": [],
        "awesome_list_tools": [],
        "mcp_directory_tools": [],
        "total_unique_tools": 0,
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        print("Scraping known vibe tools...")
        for tool in KNOWN_VIBE_TOOLS:
            print(f"  - {tool['name']}")
            metadata = await scrape_website_for_tools(client, tool["url"])
            results["known_tools"].append({
                **tool,
                "metadata": metadata,
            })
            await asyncio.sleep(1)
        
        print("\nScraping awesome lists...")
        for directory in VIBE_TOOL_DIRECTORIES:
            if directory["type"] == "awesome_list":
                print(f"  - {directory['name']}")
                tools = await scrape_github_awesome_list(client, directory["url"])
                results["awesome_list_tools"].extend(tools)
                await asyncio.sleep(2)
        
        print("\nScraping MCP directories...")
        for directory in VIBE_TOOL_DIRECTORIES:
            if directory["type"] == "directory":
                print(f"  - {directory['name']}")
                tools = await scrape_mcp_directory(client, directory)
                results["mcp_directory_tools"].extend(tools)
                await asyncio.sleep(2)
        
        print("\nSearching for new vibe tools...")
        discovered = await search_for_vibe_tools(client)
        results["discovered_tools"] = discovered
        
        all_tools = (
            [{"name": t["name"], "url": t["url"]} for t in results["known_tools"]] +
            results["awesome_list_tools"] +
            results["mcp_directory_tools"] +
            results["discovered_tools"]
        )
        unique_tools = deduplicate_tools(all_tools)
        results["total_unique_tools"] = len(unique_tools)
        results["all_unique_tools"] = unique_tools
    
    return results


if __name__ == "__main__":
    async def main():
        results = await scrape_vibe_tools()
        
        output_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(output_dir, exist_ok=True)
        
        output_path = os.path.join(output_dir, "vibe_tools.json")
        with open(output_path, "w") as f:
            json.dump(results, f, indent=2)
        
        mcp_tools = [t for t in results.get("known_tools", []) if t.get("category") == "mcp"]
        
        print(f"\n{'='*50}")
        print("VIBE TOOLS SCRAPING COMPLETE")
        print(f"{'='*50}")
        print(f"Known tools scraped: {len(results['known_tools'])}")
        print(f"  - MCP servers: {len(mcp_tools)}")
        print(f"Awesome list tools: {len(results['awesome_list_tools'])}")
        print(f"MCP directory tools: {len(results.get('mcp_directory_tools', []))}")
        print(f"Discovered tools: {len(results['discovered_tools'])}")
        print(f"Total unique tools: {results['total_unique_tools']}")
        print(f"\nSaved to: {output_path}")
    
    asyncio.run(main())
