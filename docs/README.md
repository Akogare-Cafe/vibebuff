# VibeBuff

> AI-powered tech stack recommendation platform with a retro gaming/RPG aesthetic.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC)](https://tailwindcss.com/)
[![Convex](https://img.shields.io/badge/Convex-Backend-orange)](https://convex.dev/)

## Overview

**VibeBuff** is a gamified tech stack discovery platform that transforms choosing development tools into an engaging RPG experience. It combines AI-powered recommendations with collection mechanics, competitive gameplay, and social features.

**Key Features:**
- **AI-Powered Quest Mode** - Answer questions, get personalized stack recommendations
- **Tool Collection & Deck Building** - Build and share tool "loadouts"
- **Boss Battle Mode** - Tool vs tool battles with RPG stats
- **Visual Stack Builder** - Drag-and-drop architecture diagrams
- **30+ Gamified Systems** - Achievements, guilds, trading, speedruns, and more

## Features

### Core Features
- **Quest Mode** - AI-powered questionnaire for stack recommendations
- **Tool Browser** - RPG-style inventory view with rarity tiers
- **Compare Tools** - Side-by-side tool comparisons
- **Visual Stack Builder** - Drag-and-drop flow diagrams with @xyflow/react
- **Deck Building** - Create and share tool loadouts with synergy scoring

### Gamification
- **XP & Leveling** - Earn XP for interactions, level up your profile
- **Achievements & Badges** - Unlock rewards for exploration and mastery
- **Tool Mastery** - Per-tool progression from novice to grandmaster
- **Daily Challenges** - Bounty board with XP rewards
- **Battle Pass** - Seasonal progression with rewards

### Competitive & Social
- **Boss Battles** - Tool vs tool battles with RPG stats
- **Guilds** - Team stacks and guild challenges
- **Trading Post** - Card trading marketplace
- **Speedrun Mode** - Timed stack building with leaderboards
- **Debate Arena** - Structured tool debates

### Content & Discovery
- **Tool Lore** - Origin stories and version history
- **Tool Graveyard** - Deprecated tools with obituaries
- **Startup Stories** - Real company tech stack case studies
- **Time Machine** - Build stacks with historical tool availability

## Quick Start

### Prerequisites
- Node.js 20+
- npm or pnpm
- Convex account
- Clerk account
- Anthropic API key (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vibebuff.git
cd vibebuff

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Start Convex development server (in separate terminal)
npx convex dev

# Start Next.js development server
npm run dev
```

### Environment Variables

```env
# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Convex
CONVEX_DEPLOYMENT=dev:...
NEXT_PUBLIC_CONVEX_URL=https://...

# AI (Anthropic) - for Quest mode recommendations
ANTHROPIC_API_KEY=sk-ant-...
```

## Project Structure

```
vibebuff/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Home
│   │   ├── tools/              # Tool browser & detail pages
│   │   ├── quest/              # AI recommendation quest
│   │   ├── compare/            # Tool comparisons
│   │   ├── profile/            # User profile (RPG character sheet)
│   │   ├── stack-builder/      # Visual stack builder
│   │   ├── deck/               # Shared deck viewing
│   │   └── blog/               # SEO blog content
│   ├── components/             # React components (63 files)
│   │   ├── ui/                 # shadcn/ui base components
│   │   ├── providers/          # Context providers
│   │   ├── pixel-*.tsx         # Custom retro-styled components
│   │   └── [feature].tsx       # Feature components
│   ├── lib/                    # Utilities
│   └── middleware.ts           # Auth middleware
├── convex/                     # Convex backend (77 files)
│   ├── schema.ts               # Database schema (60+ tables)
│   ├── _generated/             # Generated types
│   └── [feature].ts            # Backend functions
├── docs/                       # Documentation
└── public/                     # Static assets
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router) |
| **UI** | React 19 |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 + shadcn/ui |
| **Backend/DB** | Convex (realtime database) |
| **Auth** | Clerk |
| **Icons** | lucide-react (exclusively) |
| **Animations** | Framer Motion |
| **Flow Diagrams** | @xyflow/react |
| **Deployment** | Vercel |

## Documentation

- [App Features](./APP_FEATURES.md) - Complete feature list and component reference
- [Product Plan](./PRODUCT_PLAN.md) - Vision, features, personas
- [Architecture](./ARCHITECTURE.md) - Technical design
- [Tech Stack Database](./TECH_STACK_DATABASE.md) - Tool catalog
- [UI Wireframes](./UI_WIREFRAMES.md) - Design specifications
- [SEO Strategy](./SEO_STRATEGY.md) - SEO implementation
- [Implementation Roadmap](./IMPLEMENTATION_ROADMAP.md) - Sprint plan

## Development

```bash
# Run Next.js development server
npm run dev

# Run Convex development server (separate terminal)
npx convex dev

# Lint code
npm run lint

# Build for production
npm run build

# Seed database (via Convex dashboard or mutation)
# Use the seedDatabase mutation in convex/seed.ts
```

## Code Guidelines

- **Icons**: Use only `lucide-react` - no emojis or unicode symbols
- **Components**: Use custom `Pixel*` components for retro aesthetic
- **Styling**: Follow existing pixel/retro gaming theme
- **TypeScript**: Strict mode enabled

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for base components
- [Convex](https://convex.dev/) for realtime backend
- [Clerk](https://clerk.com/) for authentication
- [Anthropic](https://anthropic.com/) for Claude AI
- [Vercel](https://vercel.com/) for hosting
