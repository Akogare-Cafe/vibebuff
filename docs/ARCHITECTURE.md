# VibeBuff - System Architecture

> Technical architecture for the gamified tech stack recommendation platform.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │    Home     │  │   Quest     │  │   Tools     │  │  Profile    │        │
│  │    Page     │  │    Mode     │  │   Browser   │  │  (RPG)      │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Compare   │  │   Stack     │  │    Deck     │  │    Blog     │        │
│  │    Tools    │  │   Builder   │  │   Loadout   │  │    (SEO)    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                              │
│  Next.js 15 (App Router) + React 19 + TypeScript + Tailwind v4 + shadcn/ui │
│  Framer Motion (animations) + @xyflow/react (flow diagrams)                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONVEX BACKEND (Realtime)                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Convex Functions (77 files)                   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│  │  │  tools   │  │   ai     │  │  decks   │  │ battles  │            │   │
│  │  │ queries  │  │ actions  │  │mutations │  │  voting  │            │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│  │  │ guilds   │  │ trading  │  │achievements│ │ events   │            │   │
│  │  │ parties  │  │ mastery  │  │ challenges │ │ seasons  │            │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    Convex Database (60+ tables)                      │   │
│  │  Tools, Categories, UserProfiles, Decks, Achievements, Guilds,      │   │
│  │  Battles, Challenges, Seasons, Trading, Mastery, Events, etc.       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
│  │   Anthropic  │  │    Clerk     │  │   Vercel     │                      │
│  │   (Claude)   │  │    (Auth)    │  │  (Hosting)   │                      │
│  └──────────────┘  └──────────────┘  └──────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
vibebuff/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── page.tsx                  # Home page
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css               # Global styles
│   │   ├── tools/                    # Tool browser
│   │   │   ├── page.tsx              # Tools list
│   │   │   └── [slug]/               # Tool detail pages
│   │   ├── quest/                    # AI recommendation quest
│   │   │   └── page.tsx              # Multi-step questionnaire
│   │   ├── compare/                  # Tool comparisons
│   │   │   ├── page.tsx              # Compare page
│   │   │   └── [slug]/               # SEO comparison pages
│   │   ├── profile/                  # User profile (RPG character sheet)
│   │   │   └── page.tsx
│   │   ├── stack-builder/            # Visual stack builder
│   │   │   └── page.tsx
│   │   ├── deck/                     # Shared deck viewing
│   │   │   └── [token]/
│   │   ├── blog/                     # SEO blog content
│   │   ├── about/
│   │   ├── contact/
│   │   ├── privacy/
│   │   ├── terms/
│   │   ├── sign-in/
│   │   ├── sign-up/
│   │   └── get-started/
│   │
│   ├── components/                   # React components (63 files)
│   │   ├── ui/                       # shadcn/ui base components
│   │   ├── providers/                # Context providers
│   │   ├── pixel-button.tsx          # Retro-styled button
│   │   ├── pixel-card.tsx            # Retro-styled card
│   │   ├── pixel-badge.tsx           # Retro-styled badge
│   │   ├── pixel-input.tsx           # Retro-styled input
│   │   ├── header.tsx                # App header
│   │   ├── footer.tsx                # App footer
│   │   ├── visual-stack-builder.tsx  # ReactFlow stack designer
│   │   ├── deck-loadout.tsx          # Deck management
│   │   ├── tool-reviews.tsx          # Review system
│   │   ├── tool-mastery.tsx          # Mastery progression
│   │   ├── tier-list-builder.tsx     # Tier list creator
│   │   ├── trading-post.tsx          # Card trading
│   │   ├── trophy-room.tsx           # Achievement showcase
│   │   ├── skill-tree.tsx            # User skill progression
│   │   └── [60+ more feature components]
│   │
│   ├── lib/                          # Utilities
│   │   └── utils.ts
│   │
│   └── middleware.ts                 # Auth middleware (Clerk)
│
├── convex/                           # Convex backend (77 files)
│   ├── _generated/                   # Auto-generated types
│   ├── schema.ts                     # Database schema (60+ tables)
│   ├── tools.ts                      # Tool CRUD
│   ├── categories.ts                 # Category management
│   ├── ai.ts                         # AI recommendations
│   ├── decks.ts                      # Deck management
│   ├── achievements.ts               # Achievement system
│   ├── battles.ts                    # Boss battle mode
│   ├── guilds.ts                     # Guild system
│   ├── trading.ts                    # Trading post
│   ├── mastery.ts                    # Tool mastery
│   ├── challenges.ts                 # Daily challenges
│   ├── events.ts                     # Seasonal events
│   ├── seed.ts                       # Database seeding
│   └── [60+ more backend files]
│
├── docs/                             # Documentation
│   ├── APP_FEATURES.md               # Complete feature reference
│   ├── ARCHITECTURE.md               # This file
│   ├── PRODUCT_PLAN.md               # Product vision
│   ├── SEO_STRATEGY.md               # SEO implementation
│   └── [other docs]
│
├── public/                           # Static assets
│
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Database Schema (Convex)

The database schema is defined in `convex/schema.ts` using Convex's `defineTable` and `defineSchema`.

### Core Tables

```typescript
// convex/schema.ts (excerpt)

// Categories
categories: defineTable({
  name: v.string(),
  slug: v.string(),
  description: v.optional(v.string()),
  icon: v.optional(v.string()),
  sortOrder: v.optional(v.number()),
}).index("by_slug", ["slug"]),

// Tools
tools: defineTable({
  name: v.string(),
  slug: v.string(),
  tagline: v.optional(v.string()),
  description: v.optional(v.string()),
  logoUrl: v.optional(v.string()),
  websiteUrl: v.optional(v.string()),
  githubUrl: v.optional(v.string()),
  categoryId: v.optional(v.id("categories")),
  pricingModel: v.optional(v.string()),
  rarity: v.optional(v.string()),  // common, uncommon, rare, epic, legendary
  stats: v.optional(v.object({
    power: v.number(),
    speed: v.number(),
    reliability: v.number(),
    community: v.number(),
  })),
  pros: v.optional(v.array(v.string())),
  cons: v.optional(v.array(v.string())),
  features: v.optional(v.array(v.string())),
  isFeatured: v.optional(v.boolean()),
})
  .index("by_slug", ["slug"])
  .index("by_category", ["categoryId"]),
```

### Gamification Tables

```typescript
// User Profiles with RPG stats
userProfiles: defineTable({
  oderId: v.string(),
  username: v.optional(v.string()),
  title: v.optional(v.string()),
  level: v.number(),
  xp: v.number(),
  stats: v.object({
    toolsDiscovered: v.number(),
    questsCompleted: v.number(),
    battlesWon: v.number(),
    // ... more stats
  }),
}),

// Achievements
achievements: defineTable({
  slug: v.string(),
  name: v.string(),
  description: v.string(),
  category: v.string(),  // exploration, collection, social, mastery
  xpReward: v.number(),
  rarity: v.string(),
}),

// Tool Mastery
toolMastery: defineTable({
  userId: v.string(),
  toolId: v.id("tools"),
  xp: v.number(),
  level: v.string(),  // novice, apprentice, journeyman, expert, master, grandmaster
}),
```

### Social & Competitive Tables

```typescript
// Guilds
guilds: defineTable({
  name: v.string(),
  description: v.string(),
  leaderId: v.string(),
  memberCount: v.number(),
  level: v.number(),
}),

// Battles
battleHistory: defineTable({
  oderId: v.string(),
  opponentId: v.optional(v.string()),
  userDeckId: v.id("userDecks"),
  opponentDeckId: v.optional(v.id("userDecks")),
  result: v.string(),
  xpEarned: v.number(),
}),

// Trading
tradeListings: defineTable({
  oderId: v.string(),
  offeredCardId: v.id("tradableCards"),
  requestedToolId: v.optional(v.id("tools")),
  status: v.string(),
}),
```

### Full Schema Reference

The complete schema contains **60+ tables** covering:
- Core: tools, categories, pricingTiers
- Users: userProfiles, userDecks, userCollection, userAchievements
- Gamification: achievements, challenges, seasons, battlePassRewards
- Social: guilds, parties, mentorships, globalChatMessages
- Competitive: battles, debates, speedruns, draftLobbies
- Content: toolLore, toolGraveyard, startupStories, predictions

See `convex/schema.ts` for the complete schema definition.

---

## AI Recommendation Engine

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INPUT                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Natural Language: "I want to build a SaaS like Notion" │   │
│  │  OR                                                      │   │
│  │  Structured: { scale: "startup", budget: "$100/mo" }    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 REQUIREMENT EXTRACTION                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Claude 3.5 Sonnet extracts:                            │   │
│  │  - Project type (SaaS, e-commerce, blog, etc.)          │   │
│  │  - Scale requirements                                    │   │
│  │  - Key features needed                                   │   │
│  │  - Technical constraints                                 │   │
│  │  - Budget range                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SEMANTIC SEARCH                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  1. Generate embedding from requirements                 │   │
│  │  2. Vector similarity search against tool embeddings     │   │
│  │  3. Filter by category, pricing, constraints             │   │
│  │  4. Return top candidates per category                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 RECOMMENDATION GENERATION                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Claude 3.5 Sonnet with RAG:                            │   │
│  │  - Receives candidate tools with full context           │   │
│  │  - Evaluates fit against requirements                   │   │
│  │  - Generates reasoning for each recommendation          │   │
│  │  - Suggests alternatives                                 │   │
│  │  - Calculates confidence scores                         │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COST CALCULATION                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  For each recommended tool:                              │   │
│  │  - Match to appropriate pricing tier                     │   │
│  │  - Calculate based on scale/usage estimates              │   │
│  │  - Sum total stack cost                                  │   │
│  │  - Project scaling costs                                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      OUTPUT                                      │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  {                                                       │   │
│  │    stack: [                                              │   │
│  │      { category: "Frontend", tool: "Next.js", ... },    │   │
│  │      { category: "Database", tool: "Supabase", ... },   │   │
│  │    ],                                                    │   │
│  │    totalMonthlyCost: "$45",                             │   │
│  │    reasoning: "...",                                     │   │
│  │    alternatives: [...]                                   │   │
│  │  }                                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### AI Service Implementation (Convex Action)

The AI recommendation engine is implemented as a Convex action in `convex/ai.ts`:

```typescript
// convex/ai.ts (simplified)

export const generateRecommendations = action({
  args: {
    projectType: v.string(),
    scale: v.string(),
    budget: v.string(),
    features: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Fetch all tools from database
    const tools = await ctx.runQuery(api.tools.list, {});
    
    // Call Claude API with tool context
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: buildPrompt(args, tools),
      }],
    });
    
    // Parse and return recommendations
    return parseRecommendations(response.content[0].text);
  },
});
```

---

## API Design (Convex Functions)

Convex provides type-safe queries, mutations, and actions. All backend logic lives in the `convex/` folder.

### Queries (Read Data)

```typescript
// convex/tools.ts
export const list = query({
  args: { categoryId: v.optional(v.id("categories")) },
  handler: async (ctx, args) => {
    if (args.categoryId) {
      return await ctx.db
        .query("tools")
        .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
        .collect();
    }
    return await ctx.db.query("tools").collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tools")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});
```

### Mutations (Write Data)

```typescript
// convex/decks.ts
export const createDeck = mutation({
  args: {
    name: v.string(),
    toolIds: v.array(v.id("tools")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    return await ctx.db.insert("userDecks", {
      oderId: identity.subject,
      name: args.name,
      toolIds: args.toolIds,
      createdAt: Date.now(),
    });
  },
});
```

### Actions (External APIs)

```typescript
// convex/ai.ts
export const generateRecommendations = action({
  args: { projectType: v.string(), scale: v.string() },
  handler: async (ctx, args) => {
    // Call external AI API
    const response = await fetch("https://api.anthropic.com/...");
    return response.json();
  },
});
```

### Client Usage

```typescript
// In React components
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

function ToolsList() {
  const tools = useQuery(api.tools.list, {});
  const createDeck = useMutation(api.decks.createDeck);
  
  // tools updates in realtime automatically
}
```

---

## Key UI Components

### Questionnaire Flow

```typescript
// src/components/forms/questionnaire/questionnaire-wizard.tsx

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuestionnaireStore } from '@/stores/questionnaire';
import { ProjectTypeStep } from './steps/project-type';
import { ScaleStep } from './steps/scale';
import { BudgetStep } from './steps/budget';
import { FeaturesStep } from './steps/features';
import { ReviewStep } from './steps/review';

const STEPS = [
  { id: 'project-type', component: ProjectTypeStep },
  { id: 'scale', component: ScaleStep },
  { id: 'budget', component: BudgetStep },
  { id: 'features', component: FeaturesStep },
  { id: 'review', component: ReviewStep },
];

export function QuestionnaireWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const { answers, setAnswer } = useQuestionnaireStore();
  
  const CurrentStepComponent = STEPS[currentStep].component;
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="flex gap-2 mb-8">
        {STEPS.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              'h-2 flex-1 rounded-full transition-colors',
              index <= currentStep ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>
      
      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <CurrentStepComponent
            value={answers[STEPS[currentStep].id]}
            onChange={(value) => setAnswer(STEPS[currentStep].id, value)}
            onNext={() => setCurrentStep(s => s + 1)}
            onBack={() => setCurrentStep(s => s - 1)}
            isFirst={currentStep === 0}
            isLast={currentStep === STEPS.length - 1}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

### Stack Visualization

```typescript
// src/components/recommendations/stack-view.tsx

'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ToolCard } from '@/components/tools/tool-card';

interface StackViewProps {
  recommendations: Recommendation[];
  totalCost: number;
}

export function StackView({ recommendations, totalCost }: StackViewProps) {
  const grouped = groupByCategory(recommendations);
  
  return (
    <div className="space-y-8">
      {/* Cost summary */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Estimated Monthly Cost</h3>
            <p className="text-muted-foreground">Based on your scale requirements</p>
          </div>
          <div className="text-4xl font-bold">${totalCost}/mo</div>
        </div>
      </Card>
      
      {/* Stack by category */}
      <div className="grid gap-6">
        {Object.entries(grouped).map(([category, tools]) => (
          <div key={category}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CategoryIcon category={category} />
              {category}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {tools.map((rec, index) => (
                <ToolCard
                  key={rec.tool.id}
                  tool={rec.tool}
                  reasoning={rec.reasoning}
                  confidence={rec.confidence}
                  isPrimary={index === 0}
                  estimatedCost={rec.estimatedCost}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Edge Network                          │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │  SFO    │  │  IAD    │  │  LHR    │  │  NRT    │    │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Serverless Functions                        │   │
│  │  - API Routes                                            │   │
│  │  - tRPC endpoints                                        │   │
│  │  - AI inference                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    Supabase     │ │     Upstash     │ │      Clerk      │
│   (Database)    │ │     (Redis)     │ │     (Auth)      │
│                 │ │                 │ │                 │
│ - PostgreSQL    │ │ - Caching       │ │ - User mgmt     │
│ - Realtime      │ │ - Rate limiting │ │ - Sessions      │
│ - Storage       │ │ - Queues        │ │ - Webhooks      │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## 📊 Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| **LCP** | < 2.5s | Static generation, image optimization |
| **FID** | < 100ms | Code splitting, lazy loading |
| **CLS** | < 0.1 | Reserved space, font loading |
| **TTFB** | < 200ms | Edge caching, CDN |
| **API Response** | < 500ms | Redis caching, query optimization |
| **AI Response** | < 5s | Streaming, background processing |

---

## 🔒 Security Considerations

1. **Authentication**: Clerk handles all auth, JWT validation on API routes
2. **Authorization**: Row-level security in Supabase, middleware checks
3. **Rate Limiting**: Upstash Redis for API rate limiting
4. **Input Validation**: Zod schemas on all inputs
5. **API Keys**: Environment variables, never exposed to client
6. **CORS**: Strict origin policies
7. **CSP**: Content Security Policy headers

---

## 📈 Scaling Strategy

### Phase 1: MVP (0-1K users)
- Single Supabase instance
- Vercel hobby/pro plan
- Basic caching

### Phase 2: Growth (1K-10K users)
- Supabase Pro with read replicas
- Vercel Pro with increased limits
- Redis caching for hot paths
- Background job processing

### Phase 3: Scale (10K+ users)
- Supabase Enterprise
- Vercel Enterprise
- Dedicated AI inference
- Multi-region deployment

---

*Architecture Version: 1.0*
*Last Updated: December 2024*
