# 🎯 Vibe Anything

> AI-powered tech stack recommendation platform for every part of your fullstack development journey.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## 🌟 Overview

**Vibe Anything** helps developers, teams, and organizations choose the right tools for their projects. Using AI and an extensive database of 500+ development tools, it provides personalized recommendations based on:

- 💰 **Budget constraints** - From free tiers to enterprise
- 📈 **Project scale** - Hobby to millions of users
- 👥 **Team size** - Solo to large organizations
- ⚡ **Technical requirements** - Performance, realtime, compliance
- 🤖 **AI/LLM needs** - Right model for your use case

## ✨ Features

### Core Features
- **Smart Questionnaire** - Guided flow to understand your needs
- **Natural Language Input** - "I want to build a SaaS like Notion"
- **AI Recommendations** - Powered by Claude 3.5 Sonnet
- **Tool Database** - 500+ tools across 15+ categories
- **Cost Calculator** - Estimate monthly costs at scale
- **Comparison View** - Side-by-side tool comparisons

### Categories Covered
- 💻 IDEs & Code Editors
- 🤖 AI Coding Assistants
- ⚛️ Frontend Frameworks
- 🏗️ Meta-Frameworks (Next.js, Nuxt, etc.)
- 🔧 Backend Runtimes
- 🗄️ Databases & BaaS
- 🔐 Authentication
- ☁️ Hosting & Deployment
- ⚡ Realtime Services
- 🎨 Styling & Components
- 🧪 Testing Tools
- 📊 Observability
- 🧠 LLMs & AI APIs

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm (recommended) or npm
- Supabase account
- Clerk account
- Anthropic API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vibe-anything.git
cd vibe-anything

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run database migrations
pnpm db:migrate

# Seed the database
pnpm db:seed

# Start development server
pnpm dev
```

### Environment Variables

```env
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database (Supabase)
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# AI (Anthropic)
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Research (Perplexity)
PERPLEXITY_API_KEY=pplx-...

# Optional: Caching (Upstash)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Protected routes
│   ├── (marketing)/       # Public pages
│   ├── api/               # API routes
│   ├── tools/             # Tool browser
│   ├── recommend/         # Recommendation flow
│   └── compare/           # Comparison views
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── forms/             # Form components
│   ├── tools/             # Tool-related components
│   └── recommendations/   # Recommendation components
├── lib/
│   ├── ai/                # AI integration
│   ├── db/                # Database (Drizzle)
│   ├── services/          # Business logic
│   └── utils/             # Utilities
├── hooks/                 # Custom React hooks
├── stores/                # Zustand stores
└── types/                 # TypeScript types
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Drizzle |
| **Auth** | Clerk |
| **AI** | Claude 3.5 Sonnet (Anthropic) |
| **State** | Zustand + React Query |
| **Deployment** | Vercel |

## 📖 Documentation

- [Product Plan](./PRODUCT_PLAN.md) - Vision, features, personas
- [Architecture](./ARCHITECTURE.md) - Technical design
- [Tech Stack Database](./TECH_STACK_DATABASE.md) - Tool catalog
- [UI Wireframes](./UI_WIREFRAMES.md) - Design specifications
- [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md) - Sprint plan

## 🧪 Development

```bash
# Run development server
pnpm dev

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Lint code
pnpm lint

# Type check
pnpm typecheck

# Database commands
pnpm db:generate    # Generate migrations
pnpm db:migrate     # Run migrations
pnpm db:seed        # Seed database
pnpm db:studio      # Open Drizzle Studio
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful components
- [Anthropic](https://anthropic.com/) for Claude AI
- [Vercel](https://vercel.com/) for hosting
- [Supabase](https://supabase.com/) for the database

---

<p align="center">
  Built with ❤️ for developers who want to ship faster
</p>
