import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

interface Screenshot {
  url: string;
  alt?: string;
  caption?: string;
}

interface ToolForScreenshots {
  _id: Id<"tools">;
  name: string;
  slug: string;
  websiteUrl: string;
  screenshots?: Screenshot[];
}

const SCREENSHOT_SOURCES: Record<string, Screenshot[]> = {
  "vscode": [
    { url: "https://code.visualstudio.com/assets/home/home-screenshot-mac-2x-v2.png", alt: "VS Code editor interface", caption: "VS Code with IntelliSense" },
  ],
  "cursor": [
    { url: "https://cursor.sh/brand/cursor-screenshot.png", alt: "Cursor AI editor", caption: "AI-powered code editing" },
  ],
  "windsurf": [
    { url: "https://codeium.com/static/images/windsurf/windsurf-hero.png", alt: "Windsurf IDE", caption: "Agentic IDE interface" },
  ],
  "zed": [
    { url: "https://zed.dev/img/zed-screenshot.png", alt: "Zed editor", caption: "High-performance code editor" },
  ],
  "zed-editor": [
    { url: "https://zed.dev/img/zed-screenshot.png", alt: "Zed editor", caption: "High-performance code editor" },
  ],
  "neovim": [
    { url: "https://neovim.io/images/showcase/telescope_helptags.png", alt: "Neovim with Telescope", caption: "Neovim with fuzzy finder" },
  ],
  "nextjs": [
    { url: "https://nextjs.org/static/blog/next-15/cover.png", alt: "Next.js framework", caption: "Next.js React framework" },
  ],
  "react": [
    { url: "https://react.dev/images/home/conf2021/cover.svg", alt: "React library", caption: "React component library" },
  ],
  "tailwindcss": [
    { url: "https://tailwindcss.com/_next/static/media/social-card-large.a6e71726.jpg", alt: "Tailwind CSS", caption: "Utility-first CSS framework" },
  ],
  "shadcn-ui": [
    { url: "https://ui.shadcn.com/og.jpg", alt: "shadcn/ui components", caption: "Beautiful UI components" },
  ],
  "shadcn": [
    { url: "https://ui.shadcn.com/og.jpg", alt: "shadcn/ui components", caption: "Beautiful UI components" },
  ],
  "convex": [
    { url: "https://convex.dev/og.png", alt: "Convex backend", caption: "Reactive backend platform" },
  ],
  "supabase": [
    { url: "https://supabase.com/images/og/og-image-v2.jpg", alt: "Supabase dashboard", caption: "Open source Firebase alternative" },
  ],
  "firebase": [
    { url: "https://firebase.google.com/static/images/brand-guidelines/logo-built_white.png", alt: "Firebase", caption: "Google's app development platform" },
  ],
  "clerk": [
    { url: "https://clerk.com/og.png", alt: "Clerk authentication", caption: "User authentication platform" },
  ],
  "vercel": [
    { url: "https://vercel.com/api/www/avatar?u=vercel&s=180", alt: "Vercel", caption: "Frontend deployment platform" },
  ],
  "railway": [
    { url: "https://railway.app/brand/logotype-dark.png", alt: "Railway", caption: "Infrastructure deployment platform" },
  ],
  "github-copilot": [
    { url: "https://github.githubassets.com/images/modules/site/copilot/copilot.png", alt: "GitHub Copilot", caption: "AI pair programmer" },
  ],
  "claude": [
    { url: "https://www.anthropic.com/images/icons/apple-touch-icon.png", alt: "Claude AI", caption: "Anthropic's AI assistant" },
  ],
  "claude-sonnet": [
    { url: "https://www.anthropic.com/images/icons/apple-touch-icon.png", alt: "Claude 3.5 Sonnet", caption: "Anthropic's AI assistant" },
  ],
  "claude-code": [
    { url: "https://www.anthropic.com/images/icons/apple-touch-icon.png", alt: "Claude Code", caption: "AI coding assistant" },
  ],
  "openai": [
    { url: "https://openai.com/favicon.ico", alt: "OpenAI", caption: "GPT and AI models" },
  ],
  "gpt-4o": [
    { url: "https://openai.com/favicon.ico", alt: "GPT-4o", caption: "OpenAI's multimodal model" },
  ],
  "openai-codex-cli": [
    { url: "https://openai.com/favicon.ico", alt: "OpenAI Codex CLI", caption: "AI coding CLI" },
  ],
  "prisma": [
    { url: "https://www.prisma.io/images/og-image.png", alt: "Prisma ORM", caption: "Next-generation ORM" },
  ],
  "drizzle": [
    { url: "https://orm.drizzle.team/og.png", alt: "Drizzle ORM", caption: "TypeScript ORM" },
  ],
  "typescript": [
    { url: "https://www.typescriptlang.org/images/branding/two-color.png", alt: "TypeScript", caption: "Typed JavaScript" },
  ],
  "framer-motion": [
    { url: "https://www.framer.com/images/social/motion.png", alt: "Framer Motion", caption: "Animation library for React" },
  ],
  "stripe": [
    { url: "https://stripe.com/img/v3/home/social.png", alt: "Stripe", caption: "Payment processing platform" },
  ],
  "resend": [
    { url: "https://resend.com/static/og-image.png", alt: "Resend", caption: "Email API for developers" },
  ],
  "postmark": [
    { url: "https://postmarkapp.com/images/og-image.png", alt: "Postmark", caption: "Transactional email service" },
  ],
  "sentry": [
    { url: "https://sentry.io/_assets2/static/sentry-logo-dark-d7c9c3f7a8e7e3c9c9c9c9c9c9c9c9c9.svg", alt: "Sentry", caption: "Error monitoring platform" },
  ],
  "posthog": [
    { url: "https://posthog.com/brand/posthog-logo.png", alt: "PostHog", caption: "Product analytics platform" },
  ],
  "logrocket": [
    { url: "https://logrocket.com/static/og-image.png", alt: "LogRocket", caption: "Session replay and monitoring" },
  ],
  "langchain": [
    { url: "https://python.langchain.com/img/brand/wordmark.png", alt: "LangChain", caption: "LLM application framework" },
  ],
  "llamaindex": [
    { url: "https://www.llamaindex.ai/llamaindex.png", alt: "LlamaIndex", caption: "Data framework for LLMs" },
  ],
  "bolt": [
    { url: "https://bolt.new/social-preview.png", alt: "Bolt.new", caption: "AI-powered web development" },
  ],
  "bolt-new": [
    { url: "https://bolt.new/social-preview.png", alt: "Bolt.new", caption: "AI-powered web development" },
  ],
  "v0": [
    { url: "https://v0.dev/og-image.png", alt: "v0 by Vercel", caption: "AI UI generation" },
  ],
  "v0-vercel": [
    { url: "https://v0.dev/og-image.png", alt: "v0 by Vercel", caption: "AI UI generation" },
  ],
  "lovable": [
    { url: "https://lovable.dev/og-image.png", alt: "Lovable", caption: "AI app builder" },
  ],
  "replit": [
    { url: "https://replit.com/public/images/og-image.png", alt: "Replit", caption: "Browser-based IDE" },
  ],
  "replit-agent": [
    { url: "https://replit.com/public/images/og-image.png", alt: "Replit Agent", caption: "AI coding agent" },
  ],
  "docker": [
    { url: "https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png", alt: "Docker", caption: "Container platform" },
  ],
  "kubernetes": [
    { url: "https://kubernetes.io/images/kubernetes-horizontal-color.png", alt: "Kubernetes", caption: "Container orchestration" },
  ],
  "aws": [
    { url: "https://a0.awsstatic.com/libra-css/images/logos/aws_logo_smile_1200x630.png", alt: "AWS", caption: "Amazon Web Services" },
  ],
  "cloudflare": [
    { url: "https://www.cloudflare.com/img/logo-cloudflare-dark.svg", alt: "Cloudflare", caption: "Edge computing platform" },
  ],
  "cloudflare-workers": [
    { url: "https://www.cloudflare.com/img/logo-cloudflare-dark.svg", alt: "Cloudflare Workers", caption: "Edge computing" },
  ],
  "netlify": [
    { url: "https://www.netlify.com/v3/img/components/full-logo-dark.svg", alt: "Netlify", caption: "Web deployment platform" },
  ],
  "fly-io": [
    { url: "https://fly.io/static/images/brand/logo-portrait-light.svg", alt: "Fly.io", caption: "Global app deployment" },
  ],
  "flyio": [
    { url: "https://fly.io/static/images/brand/logo-portrait-light.svg", alt: "Fly.io", caption: "Global app deployment" },
  ],
  "render": [
    { url: "https://render.com/images/render-logo-dark.svg", alt: "Render", caption: "Cloud application platform" },
  ],
  "planetscale": [
    { url: "https://planetscale.com/favicon.svg", alt: "PlanetScale", caption: "Serverless MySQL platform" },
  ],
  "neon": [
    { url: "https://neon.tech/favicon.svg", alt: "Neon", caption: "Serverless Postgres" },
  ],
  "turso": [
    { url: "https://turso.tech/favicon.svg", alt: "Turso", caption: "Edge database" },
  ],
  "upstash": [
    { url: "https://upstash.com/logo/upstash-icon-dark-bg.svg", alt: "Upstash", caption: "Serverless Redis" },
  ],
  "redis": [
    { url: "https://redis.io/images/redis-logo.svg", alt: "Redis", caption: "In-memory data store" },
  ],
  "mongodb": [
    { url: "https://www.mongodb.com/assets/images/global/favicon.ico", alt: "MongoDB", caption: "Document database" },
  ],
  "postgresql": [
    { url: "https://www.postgresql.org/media/img/about/press/elephant.png", alt: "PostgreSQL", caption: "Relational database" },
  ],
  "expo": [
    { url: "https://expo.dev/static/brand/expo-icon.png", alt: "Expo", caption: "React Native framework" },
  ],
  "react-native": [
    { url: "https://reactnative.dev/img/header_logo.svg", alt: "React Native", caption: "Mobile app framework" },
  ],
  "flutter": [
    { url: "https://storage.googleapis.com/cms-storage-bucket/0dbfcc7a59cd1cf16282.png", alt: "Flutter", caption: "Cross-platform UI toolkit" },
  ],
  "swift": [
    { url: "https://developer.apple.com/swift/images/swift-og.png", alt: "Swift", caption: "Apple programming language" },
  ],
  "kotlin": [
    { url: "https://kotlinlang.org/assets/images/open-graph/kotlin_250x250.png", alt: "Kotlin", caption: "Modern JVM language" },
  ],
  "rust": [
    { url: "https://www.rust-lang.org/logos/rust-logo-512x512.png", alt: "Rust", caption: "Systems programming language" },
  ],
  "go": [
    { url: "https://go.dev/images/go-logo-blue.svg", alt: "Go", caption: "Google's programming language" },
  ],
  "python": [
    { url: "https://www.python.org/static/img/python-logo.png", alt: "Python", caption: "Programming language" },
  ],
  "bun": [
    { url: "https://bun.sh/logo.svg", alt: "Bun", caption: "JavaScript runtime" },
  ],
  "deno": [
    { url: "https://deno.land/logo.svg", alt: "Deno", caption: "Secure JavaScript runtime" },
  ],
  "nodejs": [
    { url: "https://nodejs.org/static/images/logo.svg", alt: "Node.js", caption: "JavaScript runtime" },
  ],
  "pnpm": [
    { url: "https://pnpm.io/img/pnpm-no-name-with-frame.svg", alt: "pnpm", caption: "Fast package manager" },
  ],
  "turborepo": [
    { url: "https://turbo.build/images/docs/repo/repo-hero-logo-dark.svg", alt: "Turborepo", caption: "Monorepo build system" },
  ],
  "nx": [
    { url: "https://nx.dev/images/nx-logo.svg", alt: "Nx", caption: "Smart monorepo tool" },
  ],
  "vite": [
    { url: "https://vitejs.dev/logo.svg", alt: "Vite", caption: "Next-gen frontend tooling" },
  ],
  "webpack": [
    { url: "https://webpack.js.org/icon-square-small.85ba630cf0c5f29ae3e3.svg", alt: "Webpack", caption: "Module bundler" },
  ],
  "esbuild": [
    { url: "https://esbuild.github.io/favicon.svg", alt: "esbuild", caption: "Fast JavaScript bundler" },
  ],
  "biome": [
    { url: "https://biomejs.dev/img/og.png", alt: "Biome", caption: "Fast formatter and linter" },
  ],
  "eslint": [
    { url: "https://eslint.org/icon.svg", alt: "ESLint", caption: "JavaScript linter" },
  ],
  "prettier": [
    { url: "https://prettier.io/icon.png", alt: "Prettier", caption: "Code formatter" },
  ],
  "jest": [
    { url: "https://jestjs.io/img/jest.png", alt: "Jest", caption: "JavaScript testing framework" },
  ],
  "vitest": [
    { url: "https://vitest.dev/logo.svg", alt: "Vitest", caption: "Vite-native testing framework" },
  ],
  "playwright": [
    { url: "https://playwright.dev/img/playwright-logo.svg", alt: "Playwright", caption: "Browser automation" },
  ],
  "cypress": [
    { url: "https://www.cypress.io/images/layouts/cypress-logo.svg", alt: "Cypress", caption: "E2E testing framework" },
  ],
  "storybook": [
    { url: "https://storybook.js.org/images/logos/icon-storybook.png", alt: "Storybook", caption: "UI component explorer" },
  ],
  "figma": [
    { url: "https://static.figma.com/app/icon/1/favicon.png", alt: "Figma", caption: "Design tool" },
  ],
  "linear": [
    { url: "https://linear.app/static/apple-touch-icon.png", alt: "Linear", caption: "Issue tracking" },
  ],
  "notion": [
    { url: "https://www.notion.so/images/favicon.ico", alt: "Notion", caption: "Workspace platform" },
  ],
  "notion-ai": [
    { url: "https://www.notion.so/images/favicon.ico", alt: "Notion AI", caption: "AI-powered workspace" },
  ],
  "slack": [
    { url: "https://a.slack-edge.com/80588/marketing/img/icons/icon_slack_hash_colored.png", alt: "Slack", caption: "Team communication" },
  ],
  "discord": [
    { url: "https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico", alt: "Discord", caption: "Community platform" },
  ],
  "github": [
    { url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png", alt: "GitHub", caption: "Code hosting platform" },
  ],
  "gitlab": [
    { url: "https://about.gitlab.com/images/press/logo/png/gitlab-icon-rgb.png", alt: "GitLab", caption: "DevOps platform" },
  ],
  "bitbucket": [
    { url: "https://wac-cdn.atlassian.com/assets/img/favicons/bitbucket/favicon-32x32.png", alt: "Bitbucket", caption: "Git repository hosting" },
  ],
  "ollama": [
    { url: "https://ollama.ai/public/ollama.png", alt: "Ollama", caption: "Run LLMs locally" },
  ],
  "lm-studio": [
    { url: "https://lmstudio.ai/favicon.ico", alt: "LM Studio", caption: "Local LLM desktop app" },
  ],
  "hugging-face": [
    { url: "https://huggingface.co/front/assets/huggingface_logo-noborder.svg", alt: "Hugging Face", caption: "AI model hub" },
  ],
  "openrouter": [
    { url: "https://openrouter.ai/favicon.ico", alt: "OpenRouter", caption: "LLM API aggregator" },
  ],
  "perplexity": [
    { url: "https://www.perplexity.ai/favicon.ico", alt: "Perplexity", caption: "AI search engine" },
  ],
  "mistral-ai": [
    { url: "https://mistral.ai/favicon.ico", alt: "Mistral AI", caption: "Open-weight LLMs" },
  ],
  "mistral": [
    { url: "https://mistral.ai/favicon.ico", alt: "Mistral", caption: "Open-weight LLMs" },
  ],
  "groq": [
    { url: "https://groq.com/favicon.ico", alt: "Groq", caption: "Fast LLM inference" },
  ],
  "deepseek": [
    { url: "https://www.deepseek.com/favicon.ico", alt: "DeepSeek", caption: "Open-source LLMs" },
  ],
  "deepseek-v3": [
    { url: "https://www.deepseek.com/favicon.ico", alt: "DeepSeek V3", caption: "Open-source LLM" },
  ],
  "gemini": [
    { url: "https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png", alt: "Google Gemini", caption: "Google's AI model" },
  ],
  "gemini-pro": [
    { url: "https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png", alt: "Gemini 1.5 Pro", caption: "Google's AI model" },
  ],
  "gemini-cli": [
    { url: "https://www.gstatic.com/lamda/images/gemini_favicon_f069958c85030456e93de685481c559f160ea06b.png", alt: "Gemini CLI", caption: "Google AI CLI" },
  ],
  "radix": [
    { url: "https://www.radix-ui.com/favicon.ico", alt: "Radix UI", caption: "Headless UI components" },
  ],
  "mui": [
    { url: "https://mui.com/static/logo.png", alt: "Material UI", caption: "React UI framework" },
  ],
  "liveblocks": [
    { url: "https://liveblocks.io/favicon.ico", alt: "Liveblocks", caption: "Real-time collaboration" },
  ],
  "pusher": [
    { url: "https://pusher.com/favicon.ico", alt: "Pusher", caption: "Real-time messaging" },
  ],
  "ably": [
    { url: "https://ably.com/favicon.ico", alt: "Ably", caption: "Real-time messaging" },
  ],
  "socketio": [
    { url: "https://socket.io/images/logo.svg", alt: "Socket.io", caption: "Real-time WebSocket library" },
  ],
  "llama": [
    { url: "https://ai.meta.com/favicon.ico", alt: "Llama", caption: "Meta's open LLM" },
  ],
  "aider": [
    { url: "https://aider.chat/assets/logo.svg", alt: "Aider", caption: "AI pair programming" },
  ],
  "cline": [
    { url: "https://cline.bot/favicon.ico", alt: "Cline", caption: "AI coding assistant" },
  ],
  "continue": [
    { url: "https://continue.dev/favicon.ico", alt: "Continue", caption: "Open-source AI code assistant" },
  ],
  "warp": [
    { url: "https://www.warp.dev/favicon.ico", alt: "Warp", caption: "AI-powered terminal" },
  ],
  "devin": [
    { url: "https://www.cognition-labs.com/favicon.ico", alt: "Devin", caption: "AI software engineer" },
  ],
  "tempo": [
    { url: "https://tempo.new/favicon.ico", alt: "Tempo", caption: "AI app builder" },
  ],
  "create-xyz": [
    { url: "https://create.xyz/favicon.ico", alt: "Create.xyz", caption: "AI app builder" },
  ],
  "kiro": [
    { url: "https://kiro.dev/favicon.ico", alt: "Kiro", caption: "AI coding assistant" },
  ],
  "amazon-kiro": [
    { url: "https://kiro.dev/favicon.ico", alt: "Amazon Kiro", caption: "AI coding assistant" },
  ],
  "firebase-studio": [
    { url: "https://firebase.google.com/static/images/brand-guidelines/logo-built_white.png", alt: "Firebase Studio", caption: "Firebase development" },
  ],
  "pinecone": [
    { url: "https://www.pinecone.io/favicon.ico", alt: "Pinecone", caption: "Vector database" },
  ],
  "weaviate": [
    { url: "https://weaviate.io/favicon.ico", alt: "Weaviate", caption: "Vector database" },
  ],
  "qdrant": [
    { url: "https://qdrant.tech/favicon.ico", alt: "Qdrant", caption: "Vector database" },
  ],
  "chroma": [
    { url: "https://www.trychroma.com/favicon.ico", alt: "Chroma", caption: "Vector database" },
  ],
  "vercel-ai-sdk": [
    { url: "https://sdk.vercel.ai/favicon.ico", alt: "Vercel AI SDK", caption: "AI SDK for JavaScript" },
  ],
  "crewai": [
    { url: "https://www.crewai.com/favicon.ico", alt: "CrewAI", caption: "Multi-agent framework" },
  ],
  "dify": [
    { url: "https://dify.ai/favicon.ico", alt: "Dify", caption: "LLM app development" },
  ],
  "langfuse": [
    { url: "https://langfuse.com/favicon.ico", alt: "Langfuse", caption: "LLM observability" },
  ],
  "elevenlabs": [
    { url: "https://elevenlabs.io/favicon.ico", alt: "ElevenLabs", caption: "AI voice synthesis" },
  ],
  "midjourney": [
    { url: "https://www.midjourney.com/favicon.ico", alt: "Midjourney", caption: "AI image generation" },
  ],
  "stable-diffusion": [
    { url: "https://stability.ai/favicon.ico", alt: "Stable Diffusion", caption: "AI image generation" },
  ],
  "runway": [
    { url: "https://runwayml.com/favicon.ico", alt: "Runway", caption: "AI video generation" },
  ],
  "suno": [
    { url: "https://suno.ai/favicon.ico", alt: "Suno", caption: "AI music generation" },
  ],
  "together-ai": [
    { url: "https://www.together.ai/favicon.ico", alt: "Together AI", caption: "AI inference platform" },
  ],
  "replicate": [
    { url: "https://replicate.com/favicon.ico", alt: "Replicate", caption: "ML model hosting" },
  ],
  "cohere": [
    { url: "https://cohere.com/favicon.ico", alt: "Cohere", caption: "Enterprise AI" },
  ],
  "n8n": [
    { url: "https://n8n.io/favicon.ico", alt: "n8n", caption: "Workflow automation" },
  ],
  "phind": [
    { url: "https://www.phind.com/favicon.ico", alt: "Phind", caption: "AI search for developers" },
  ],
  "weights-and-biases": [
    { url: "https://wandb.ai/favicon.ico", alt: "Weights & Biases", caption: "ML experiment tracking" },
  ],
  "autogen": [
    { url: "https://microsoft.github.io/autogen/favicon.ico", alt: "AutoGen", caption: "Multi-agent framework" },
  ],
  "fireworks-ai": [
    { url: "https://fireworks.ai/favicon.ico", alt: "Fireworks AI", caption: "Fast AI inference" },
  ],
  "gpt4all": [
    { url: "https://gpt4all.io/favicon.ico", alt: "GPT4All", caption: "Local AI assistant" },
  ],
  "jan": [
    { url: "https://jan.ai/favicon.ico", alt: "Jan", caption: "Local AI assistant" },
  ],
  "vllm": [
    { url: "https://vllm.ai/favicon.ico", alt: "vLLM", caption: "Fast LLM serving" },
  ],
  "llama-cpp": [
    { url: "https://github.com/ggerganov/llama.cpp/raw/master/media/llama-cpp.png", alt: "llama.cpp", caption: "Local LLM inference" },
  ],
  "flowise": [
    { url: "https://flowiseai.com/favicon.ico", alt: "Flowise", caption: "LLM flow builder" },
  ],
  "poe": [
    { url: "https://poe.com/favicon.ico", alt: "Poe", caption: "AI chatbot platform" },
  ],
  "grok": [
    { url: "https://grok.x.ai/favicon.ico", alt: "Grok", caption: "xAI's chatbot" },
  ],
  "langsmith": [
    { url: "https://smith.langchain.com/favicon.ico", alt: "LangSmith", caption: "LLM debugging platform" },
  ],
  "helicone": [
    { url: "https://helicone.ai/favicon.ico", alt: "Helicone", caption: "LLM observability" },
  ],
  "milvus": [
    { url: "https://milvus.io/favicon.ico", alt: "Milvus", caption: "Vector database" },
  ],
  "jasper": [
    { url: "https://www.jasper.ai/favicon.ico", alt: "Jasper", caption: "AI content platform" },
  ],
  "copy-ai": [
    { url: "https://www.copy.ai/favicon.ico", alt: "Copy.ai", caption: "AI copywriting" },
  ],
  "grammarly": [
    { url: "https://www.grammarly.com/favicon.ico", alt: "Grammarly", caption: "AI writing assistant" },
  ],
  "otter-ai": [
    { url: "https://otter.ai/favicon.ico", alt: "Otter.ai", caption: "AI transcription" },
  ],
  "gamma": [
    { url: "https://gamma.app/favicon.ico", alt: "Gamma", caption: "AI presentations" },
  ],
  "zapier": [
    { url: "https://zapier.com/favicon.ico", alt: "Zapier", caption: "Workflow automation" },
  ],
  "make": [
    { url: "https://www.make.com/favicon.ico", alt: "Make", caption: "Visual automation" },
  ],
  "assemblyai": [
    { url: "https://www.assemblyai.com/favicon.ico", alt: "AssemblyAI", caption: "Speech-to-text API" },
  ],
  "deepgram": [
    { url: "https://deepgram.com/favicon.ico", alt: "Deepgram", caption: "Voice AI platform" },
  ],
  "heygen": [
    { url: "https://www.heygen.com/favicon.ico", alt: "HeyGen", caption: "AI video generation" },
  ],
  "synthesia": [
    { url: "https://www.synthesia.io/favicon.ico", alt: "Synthesia", caption: "AI video creation" },
  ],
  "pika": [
    { url: "https://pika.art/favicon.ico", alt: "Pika", caption: "AI video generation" },
  ],
  "leonardo-ai": [
    { url: "https://leonardo.ai/favicon.ico", alt: "Leonardo AI", caption: "AI image generation" },
  ],
  "ideogram": [
    { url: "https://ideogram.ai/favicon.ico", alt: "Ideogram", caption: "AI image generation" },
  ],
  "dspy": [
    { url: "https://dspy-docs.vercel.app/favicon.ico", alt: "DSPy", caption: "LLM programming framework" },
  ],
  "instructor": [
    { url: "https://python.useinstructor.com/favicon.ico", alt: "Instructor", caption: "Structured LLM outputs" },
  ],
  "guardrails-ai": [
    { url: "https://www.guardrailsai.com/favicon.ico", alt: "Guardrails AI", caption: "LLM validation" },
  ],
  "luma-ai": [
    { url: "https://lumalabs.ai/favicon.ico", alt: "Luma AI", caption: "AI 3D generation" },
  ],
  "codium-ai": [
    { url: "https://www.codium.ai/favicon.ico", alt: "Codium AI", caption: "AI code testing" },
  ],
  "tabnine": [
    { url: "https://www.tabnine.com/favicon.ico", alt: "Tabnine", caption: "AI code completion" },
  ],
  "amazon-q-developer": [
    { url: "https://aws.amazon.com/favicon.ico", alt: "Amazon Q Developer", caption: "AWS AI assistant" },
  ],
  "sourcegraph-cody": [
    { url: "https://sourcegraph.com/favicon.ico", alt: "Sourcegraph Cody", caption: "AI code assistant" },
  ],
  "qwen": [
    { url: "https://qwenlm.github.io/favicon.ico", alt: "Qwen", caption: "Alibaba's LLM" },
  ],
  "yi": [
    { url: "https://01.ai/favicon.ico", alt: "Yi", caption: "01.AI's LLM" },
  ],
  "pi": [
    { url: "https://pi.ai/favicon.ico", alt: "Pi", caption: "Inflection AI's assistant" },
  ],
  "goose": [
    { url: "https://github.com/block/goose/raw/main/docs/goose-logo.png", alt: "Goose", caption: "AI coding agent" },
  ],
  "roo-code": [
    { url: "https://roo.dev/favicon.ico", alt: "Roo Code", caption: "AI coding assistant" },
  ],
  "openhands": [
    { url: "https://www.all-hands.dev/favicon.ico", alt: "OpenHands", caption: "AI software development" },
  ],
  "amp": [
    { url: "https://amp.dev/favicon.ico", alt: "Amp", caption: "AI coding assistant" },
  ],
  "kilo-code": [
    { url: "https://kilo.dev/favicon.ico", alt: "Kilo Code", caption: "AI coding assistant" },
  ],
  "dyad": [
    { url: "https://www.dyad.sh/favicon.ico", alt: "Dyad", caption: "Local AI app builder" },
  ],
  "rork": [
    { url: "https://rork.app/favicon.ico", alt: "Rork", caption: "AI app builder" },
  ],
  "vibe-kanban": [
    { url: "https://vibekanban.com/favicon.ico", alt: "Vibe Kanban", caption: "AI project management" },
  ],
};

async function main() {
  console.log("Fetching tools from Convex...");
  
  const tools: ToolForScreenshots[] = await client.query(api.tools.getAllForScreenshots);
  console.log(`Found ${tools.length} tools`);
  
  let updated = 0;
  let skipped = 0;
  
  for (const tool of tools) {
    if (tool.screenshots && tool.screenshots.length > 0) {
      console.log(`Skipping ${tool.name} - already has screenshots`);
      skipped++;
      continue;
    }
    
    const screenshots = SCREENSHOT_SOURCES[tool.slug];
    
    if (screenshots) {
      console.log(`Updating ${tool.name} with ${screenshots.length} screenshot(s)`);
      await client.mutation(api.tools.updateScreenshots, {
        toolId: tool._id,
        screenshots,
      });
      updated++;
    } else {
      console.log(`No screenshots found for ${tool.name} (${tool.slug})`);
    }
  }
  
  console.log(`\nDone! Updated ${updated} tools, skipped ${skipped} tools with existing screenshots`);
}

main().catch(console.error);
