# Vibe Anything - System Architecture

> Technical architecture for the AI-powered tech stack recommendation platform.

---

## 🏛️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Landing   │  │ Questionnaire│  │  Results    │  │   Tools     │        │
│  │    Page     │  │    Flow     │  │  Dashboard  │  │   Browser   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                              │
│  Next.js 15 (App Router) + React 19 + TypeScript + Tailwind + shadcn/ui    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        Next.js API Routes                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │   │
│  │  │  /api/   │  │  /api/   │  │  /api/   │  │  /api/   │            │   │
│  │  │recommend │  │  tools   │  │ projects │  │   ai     │            │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                           tRPC Router                                │   │
│  │  Type-safe API calls with automatic TypeScript inference             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SERVICE LAYER                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Recommendation│  │    Tool      │  │   Project    │  │    User      │    │
│  │   Service    │  │   Service    │  │   Service    │  │   Service    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
│  │     AI       │  │   Search     │  │    Cost      │                      │
│  │   Service    │  │   Service    │  │  Calculator  │                      │
│  └──────────────┘  └──────────────┘  └──────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌──────────────────────┐                        │
│  │      Supabase        │  │       Upstash        │                        │
│  │    (PostgreSQL)      │  │       (Redis)        │                        │
│  │  ┌────────────────┐  │  │  ┌────────────────┐  │                        │
│  │  │ Tools          │  │  │  │ Cache          │  │                        │
│  │  │ Categories     │  │  │  │ Rate Limits    │  │                        │
│  │  │ Users          │  │  │  │ Sessions       │  │                        │
│  │  │ Projects       │  │  │  └────────────────┘  │                        │
│  │  │ Recommendations│  │  │                      │                        │
│  │  └────────────────┘  │  │                      │                        │
│  └──────────────────────┘  └──────────────────────┘                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Anthropic  │  │    OpenAI    │  │    Clerk     │  │   PostHog    │    │
│  │   (Claude)   │  │  (Embeddings)│  │    (Auth)    │  │  (Analytics) │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
│  │   Sentry     │  │  Perplexity  │  │   GitHub     │                      │
│  │   (Errors)   │  │  (Research)  │  │    (API)     │                      │
│  └──────────────┘  └──────────────┘  └──────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
vibe-anything/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth-required routes
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   └── settings/
│   │   ├── (marketing)/              # Public routes
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── pricing/
│   │   │   └── about/
│   │   ├── api/                      # API routes
│   │   │   ├── trpc/[trpc]/
│   │   │   ├── webhooks/
│   │   │   └── ai/
│   │   ├── tools/                    # Tool browser
│   │   │   ├── [category]/
│   │   │   └── [slug]/
│   │   ├── recommend/                # Recommendation flow
│   │   │   ├── page.tsx              # Questionnaire
│   │   │   └── results/
│   │   ├── compare/                  # Comparison views
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── forms/                    # Form components
│   │   │   ├── questionnaire/
│   │   │   └── search/
│   │   ├── tools/                    # Tool-related components
│   │   │   ├── tool-card.tsx
│   │   │   ├── tool-grid.tsx
│   │   │   └── comparison-table.tsx
│   │   ├── recommendations/          # Recommendation components
│   │   │   ├── stack-view.tsx
│   │   │   ├── cost-calculator.tsx
│   │   │   └── reasoning-card.tsx
│   │   └── layout/                   # Layout components
│   │       ├── header.tsx
│   │       ├── footer.tsx
│   │       └── sidebar.tsx
│   │
│   ├── lib/
│   │   ├── ai/                       # AI integration
│   │   │   ├── anthropic.ts
│   │   │   ├── openai.ts
│   │   │   ├── embeddings.ts
│   │   │   └── prompts/
│   │   ├── db/                       # Database
│   │   │   ├── schema.ts             # Drizzle schema
│   │   │   ├── queries/
│   │   │   └── migrations/
│   │   ├── services/                 # Business logic
│   │   │   ├── recommendation.ts
│   │   │   ├── tool.ts
│   │   │   ├── project.ts
│   │   │   └── cost-calculator.ts
│   │   ├── trpc/                     # tRPC setup
│   │   │   ├── router.ts
│   │   │   ├── context.ts
│   │   │   └── procedures/
│   │   ├── utils/                    # Utilities
│   │   └── validations/              # Zod schemas
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── use-recommendations.ts
│   │   ├── use-tools.ts
│   │   └── use-comparison.ts
│   │
│   ├── stores/                       # Zustand stores
│   │   ├── questionnaire.ts
│   │   └── comparison.ts
│   │
│   └── types/                        # TypeScript types
│       ├── tool.ts
│       ├── recommendation.ts
│       └── project.ts
│
├── public/
│   ├── logos/                        # Tool logos
│   └── images/
│
├── prisma/                           # If using Prisma
│   └── schema.prisma
│
├── drizzle/                          # Drizzle migrations
│
├── scripts/
│   ├── seed-tools.ts                 # Database seeding
│   └── sync-github-stats.ts          # GitHub stats sync
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.example
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🗃️ Database Schema (Drizzle ORM)

```typescript
// src/lib/db/schema.ts

import { pgTable, uuid, text, timestamp, jsonb, integer, boolean, decimal, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const pricingModelEnum = pgEnum('pricing_model', [
  'free',
  'freemium',
  'paid',
  'open_source',
  'enterprise'
]);

export const projectScaleEnum = pgEnum('project_scale', [
  'hobby',
  'startup',
  'growth',
  'enterprise'
]);

// Categories
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  parentId: uuid('parent_id').references(() => categories.id),
  icon: text('icon'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tools
export const tools = pgTable('tools', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  tagline: text('tagline'),
  description: text('description'),
  longDescription: text('long_description'),
  logoUrl: text('logo_url'),
  websiteUrl: text('website_url'),
  docsUrl: text('docs_url'),
  githubUrl: text('github_url'),
  categoryId: uuid('category_id').references(() => categories.id),
  pricingModel: pricingModelEnum('pricing_model'),
  
  // Metrics
  githubStars: integer('github_stars'),
  npmDownloadsWeekly: integer('npm_downloads_weekly'),
  
  // Flags
  isOpenSource: boolean('is_open_source').default(false),
  isActive: boolean('is_active').default(true),
  isFeatured: boolean('is_featured').default(false),
  
  // JSON fields
  pros: jsonb('pros').$type<string[]>(),
  cons: jsonb('cons').$type<string[]>(),
  bestFor: jsonb('best_for').$type<string[]>(),
  features: jsonb('features').$type<string[]>(),
  tags: jsonb('tags').$type<string[]>(),
  
  // SEO
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tool Pricing Tiers
export const pricingTiers = pgTable('pricing_tiers', {
  id: uuid('id').primaryKey().defaultRandom(),
  toolId: uuid('tool_id').references(() => tools.id).notNull(),
  name: text('name').notNull(), // e.g., "Free", "Pro", "Enterprise"
  priceMonthly: decimal('price_monthly', { precision: 10, scale: 2 }),
  priceYearly: decimal('price_yearly', { precision: 10, scale: 2 }),
  priceUnit: text('price_unit'), // e.g., "per seat", "per 1M tokens"
  features: jsonb('features').$type<string[]>(),
  limits: jsonb('limits').$type<Record<string, string | number>>(),
  isPopular: boolean('is_popular').default(false),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tool Integrations (many-to-many)
export const toolIntegrations = pgTable('tool_integrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  toolAId: uuid('tool_a_id').references(() => tools.id).notNull(),
  toolBId: uuid('tool_b_id').references(() => tools.id).notNull(),
  integrationType: text('integration_type'), // "native", "plugin", "api"
  qualityScore: integer('quality_score'), // 1-10
  documentationUrl: text('documentation_url'),
  notes: text('notes'),
});

// Tool Alternatives
export const toolAlternatives = pgTable('tool_alternatives', {
  id: uuid('id').primaryKey().defaultRandom(),
  toolId: uuid('tool_id').references(() => tools.id).notNull(),
  alternativeId: uuid('alternative_id').references(() => tools.id).notNull(),
  similarityScore: integer('similarity_score'), // 1-100
});

// Users (synced from Clerk)
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  plan: text('plan').default('free'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Projects
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => users.id),
  name: text('name').notNull(),
  description: text('description'),
  
  // Requirements (from questionnaire)
  requirements: jsonb('requirements').$type<{
    projectType: string;
    scale: string;
    budget: string;
    teamSize: string;
    timeline: string;
    features: string[];
    constraints: string[];
    existingStack: string[];
  }>(),
  
  // Natural language input
  prompt: text('prompt'),
  
  // Sharing
  isPublic: boolean('is_public').default(false),
  shareToken: text('share_token'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Recommendations
export const recommendations = pgTable('recommendations', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').references(() => projects.id).notNull(),
  toolId: uuid('tool_id').references(() => tools.id).notNull(),
  categoryId: uuid('category_id').references(() => categories.id),
  
  // AI-generated
  reasoning: text('reasoning'),
  confidenceScore: integer('confidence_score'), // 1-100
  priority: integer('priority'), // 1 = primary, 2 = alternative
  
  // Cost projection
  estimatedMonthlyCost: decimal('estimated_monthly_cost', { precision: 10, scale: 2 }),
  
  createdAt: timestamp('created_at').defaultNow(),
});

// Tool Reviews (user-submitted)
export const toolReviews = pgTable('tool_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  toolId: uuid('tool_id').references(() => tools.id).notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  rating: integer('rating').notNull(), // 1-5
  title: text('title'),
  content: text('content'),
  pros: jsonb('pros').$type<string[]>(),
  cons: jsonb('cons').$type<string[]>(),
  useCase: text('use_case'),
  isVerified: boolean('is_verified').default(false),
  helpfulCount: integer('helpful_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Embeddings for semantic search
export const toolEmbeddings = pgTable('tool_embeddings', {
  id: uuid('id').primaryKey().defaultRandom(),
  toolId: uuid('tool_id').references(() => tools.id).notNull(),
  embedding: jsonb('embedding').$type<number[]>(), // Vector stored as JSON
  embeddingModel: text('embedding_model').default('text-embedding-3-small'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

---

## 🤖 AI Recommendation Engine

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

### AI Service Implementation

```typescript
// src/lib/ai/recommendation-engine.ts

import Anthropic from '@anthropic-ai/sdk';
import { generateEmbedding } from './embeddings';
import { searchSimilarTools } from '../db/queries/tools';
import { RECOMMENDATION_PROMPT } from './prompts/recommendation';

interface Requirements {
  projectType: string;
  scale: 'hobby' | 'startup' | 'growth' | 'enterprise';
  budget: string;
  teamSize: string;
  features: string[];
  constraints: string[];
  naturalLanguageInput?: string;
}

interface Recommendation {
  category: string;
  tool: Tool;
  reasoning: string;
  confidence: number;
  alternatives: Tool[];
  estimatedCost: number;
}

export async function generateRecommendations(
  requirements: Requirements
): Promise<Recommendation[]> {
  const anthropic = new Anthropic();
  
  // Step 1: Extract structured requirements from natural language
  let structuredReqs = requirements;
  if (requirements.naturalLanguageInput) {
    structuredReqs = await extractRequirements(
      anthropic,
      requirements.naturalLanguageInput
    );
  }
  
  // Step 2: Generate embedding for semantic search
  const queryText = buildQueryText(structuredReqs);
  const embedding = await generateEmbedding(queryText);
  
  // Step 3: Find candidate tools via semantic search
  const candidates = await searchSimilarTools(embedding, {
    limit: 50,
    filters: {
      pricingModel: getPricingFilter(structuredReqs.budget),
      scale: structuredReqs.scale,
    },
  });
  
  // Step 4: Generate recommendations with Claude
  const recommendations = await generateWithClaude(
    anthropic,
    structuredReqs,
    candidates
  );
  
  // Step 5: Calculate costs
  const withCosts = await calculateCosts(recommendations, structuredReqs);
  
  return withCosts;
}

async function extractRequirements(
  anthropic: Anthropic,
  input: string
): Promise<Requirements> {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Extract structured requirements from this project description:

"${input}"

Return JSON with:
- projectType: string (e.g., "saas", "ecommerce", "blog", "dashboard")
- scale: "hobby" | "startup" | "growth" | "enterprise"
- budget: string (e.g., "$0", "$50/mo", "$500/mo")
- teamSize: string (e.g., "solo", "2-5", "5-20", "20+")
- features: string[] (key features needed)
- constraints: string[] (any technical constraints mentioned)`
    }],
  });
  
  return JSON.parse(response.content[0].text);
}

async function generateWithClaude(
  anthropic: Anthropic,
  requirements: Requirements,
  candidates: Tool[]
): Promise<Recommendation[]> {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    system: RECOMMENDATION_PROMPT,
    messages: [{
      role: 'user',
      content: `Generate tech stack recommendations.

## Requirements
${JSON.stringify(requirements, null, 2)}

## Available Tools (by category)
${formatCandidates(candidates)}

For each category, recommend:
1. Primary choice with detailed reasoning
2. 1-2 alternatives
3. Confidence score (1-100)

Consider:
- Budget constraints
- Scale requirements
- Team size and expertise
- Integration compatibility between tools
- Long-term maintainability`
    }],
  });
  
  return parseRecommendations(response.content[0].text);
}
```

---

## 🔌 API Design (tRPC)

```typescript
// src/lib/trpc/routers/recommendation.ts

import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { generateRecommendations } from '@/lib/ai/recommendation-engine';

const requirementsSchema = z.object({
  projectType: z.string().optional(),
  scale: z.enum(['hobby', 'startup', 'growth', 'enterprise']),
  budget: z.string(),
  teamSize: z.string(),
  features: z.array(z.string()),
  constraints: z.array(z.string()),
  naturalLanguageInput: z.string().optional(),
});

export const recommendationRouter = router({
  // Generate recommendations (public, rate-limited)
  generate: publicProcedure
    .input(requirementsSchema)
    .mutation(async ({ input, ctx }) => {
      // Rate limit check
      await ctx.rateLimit.check('recommendations', 5, '1h');
      
      const recommendations = await generateRecommendations(input);
      
      return recommendations;
    }),
  
  // Save recommendations to project (protected)
  save: protectedProcedure
    .input(z.object({
      projectName: z.string(),
      requirements: requirementsSchema,
      recommendations: z.array(z.any()),
    }))
    .mutation(async ({ input, ctx }) => {
      const project = await ctx.db.insert(projects).values({
        userId: ctx.user.id,
        name: input.projectName,
        requirements: input.requirements,
      }).returning();
      
      // Save recommendations
      await ctx.db.insert(recommendations).values(
        input.recommendations.map(rec => ({
          projectId: project[0].id,
          toolId: rec.tool.id,
          categoryId: rec.category.id,
          reasoning: rec.reasoning,
          confidenceScore: rec.confidence,
        }))
      );
      
      return project[0];
    }),
  
  // Get user's projects
  getProjects: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.query.projects.findMany({
        where: eq(projects.userId, ctx.user.id),
        with: {
          recommendations: {
            with: {
              tool: true,
            },
          },
        },
        orderBy: desc(projects.createdAt),
      });
    }),
});
```

---

## 🎨 Key UI Components

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
