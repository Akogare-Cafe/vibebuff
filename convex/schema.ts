import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tool categories
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    parentId: v.optional(v.id("categories")),
    sortOrder: v.number(),
  }).index("by_slug", ["slug"]),

  // Development tools
  tools: defineTable({
    name: v.string(),
    slug: v.string(),
    tagline: v.string(),
    description: v.string(),
    logoUrl: v.optional(v.string()),
    websiteUrl: v.string(),
    githubUrl: v.optional(v.string()),
    docsUrl: v.optional(v.string()),
    categoryId: v.id("categories"),
    pricingModel: v.union(
      v.literal("free"),
      v.literal("freemium"),
      v.literal("paid"),
      v.literal("open_source"),
      v.literal("enterprise")
    ),
    // Metrics
    githubStars: v.optional(v.number()),
    npmDownloadsWeekly: v.optional(v.number()),
    // Features
    pros: v.array(v.string()),
    cons: v.array(v.string()),
    bestFor: v.array(v.string()),
    features: v.array(v.string()),
    tags: v.array(v.string()),
    // Flags
    isOpenSource: v.boolean(),
    isActive: v.boolean(),
    isFeatured: v.boolean(),
    // RPG Stats for Boss Battle mode
    stats: v.optional(v.object({
      hp: v.number(),        // Community size (scaled 1-100)
      attack: v.number(),    // Performance benchmarks
      defense: v.number(),   // Stability/uptime
      speed: v.number(),     // Learning curve (inverted - easier = faster)
      mana: v.number(),      // Cost efficiency (inverted - cheaper = more mana)
    })),
    // Evolution tracking
    majorVersions: v.optional(v.array(v.object({
      version: v.string(),
      releasedAt: v.number(),
      highlights: v.array(v.string()),
    }))),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["categoryId"])
    .index("by_featured", ["isFeatured"]),

  // Pricing tiers for tools
  pricingTiers: defineTable({
    toolId: v.id("tools"),
    name: v.string(),
    priceMonthly: v.optional(v.number()),
    priceYearly: v.optional(v.number()),
    priceUnit: v.optional(v.string()),
    features: v.array(v.string()),
    isPopular: v.boolean(),
    sortOrder: v.number(),
  }).index("by_tool", ["toolId"]),

  // ============================================
  // FEATURE 1 & 2: Tool Synergies
  // ============================================
  toolSynergies: defineTable({
    toolAId: v.id("tools"),
    toolBId: v.id("tools"),
    synergyType: v.union(
      v.literal("combo"),      // Great together
      v.literal("integration"), // Native integration exists
      v.literal("alternative"), // Can replace each other
      v.literal("conflict")     // Don't use together
    ),
    synergyScore: v.number(),  // -100 to 100 (negative = anti-synergy)
    description: v.string(),
    bonusEffect: v.optional(v.string()), // e.g., "+20% Deploy Speed"
  })
    .index("by_tool_a", ["toolAId"])
    .index("by_tool_b", ["toolBId"]),

  // ============================================
  // FEATURE 3: Achievements & Badges
  // ============================================
  achievements: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    icon: v.string(),
    category: v.union(
      v.literal("exploration"),
      v.literal("collection"),
      v.literal("social"),
      v.literal("mastery")
    ),
    requirement: v.object({
      type: v.string(),  // e.g., "tools_viewed", "decks_created", "battles_won"
      count: v.number(),
    }),
    xpReward: v.number(),
    rarity: v.union(
      v.literal("common"),
      v.literal("uncommon"),
      v.literal("rare"),
      v.literal("legendary")
    ),
  }).index("by_slug", ["slug"]),

  userAchievements: defineTable({
    userId: v.string(),
    achievementId: v.id("achievements"),
    unlockedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_achievement", ["userId", "achievementId"]),

  // ============================================
  // FEATURE 4: User Profiles & XP
  // ============================================
  userProfiles: defineTable({
    clerkId: v.string(),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    xp: v.number(),
    level: v.number(),
    title: v.optional(v.string()),  // e.g., "Stack Master", "Tool Hunter"
    // Stats tracking
    toolsViewed: v.number(),
    battlesWon: v.number(),
    battlesLost: v.number(),
    decksCreated: v.number(),
    questsCompleted: v.number(),
    votescast: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  // ============================================
  // FEATURE 5: Card Collection & Deck Building
  // ============================================
  userDecks: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    toolIds: v.array(v.id("tools")),
    categoryAssignments: v.optional(v.array(v.object({
      categorySlug: v.string(),
      toolId: v.id("tools"),
    }))),
    isPublic: v.boolean(),
    shareToken: v.optional(v.string()),
    totalSynergyScore: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_share_token", ["shareToken"]),

  // ============================================
  // FEATURE 6: Daily/Weekly Loot Drops
  // ============================================
  lootDrops: defineTable({
    type: v.union(v.literal("daily"), v.literal("weekly")),
    toolId: v.id("tools"),
    title: v.string(),
    description: v.string(),
    activeFrom: v.number(),
    activeUntil: v.number(),
    bonusXp: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_active", ["activeFrom", "activeUntil"]),

  userLootClaims: defineTable({
    userId: v.string(),
    lootDropId: v.id("lootDrops"),
    claimedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_loot", ["userId", "lootDropId"]),

  // ============================================
  // FEATURE 7: Party System (Team Collaboration)
  // ============================================
  parties: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    ownerId: v.string(),
    inviteCode: v.string(),
    createdAt: v.number(),
  })
    .index("by_owner", ["ownerId"])
    .index("by_invite_code", ["inviteCode"]),

  partyMembers: defineTable({
    partyId: v.id("parties"),
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    joinedAt: v.number(),
  })
    .index("by_party", ["partyId"])
    .index("by_user", ["userId"]),

  partyDecks: defineTable({
    partyId: v.id("parties"),
    deckId: v.id("userDecks"),
    sharedBy: v.string(),
    sharedAt: v.number(),
  }).index("by_party", ["partyId"]),

  partyComments: defineTable({
    partyId: v.id("parties"),
    userId: v.string(),
    toolId: v.optional(v.id("tools")),
    deckId: v.optional(v.id("userDecks")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_party", ["partyId"]),

  // ============================================
  // FEATURE 8: Legendary Tool Voting
  // ============================================
  monthlyVotingPeriods: defineTable({
    categoryId: v.id("categories"),
    month: v.number(),  // YYYYMM format
    year: v.number(),
    isActive: v.boolean(),
    winnerId: v.optional(v.id("tools")),
  })
    .index("by_category_month", ["categoryId", "month"])
    .index("by_active", ["isActive"]),

  toolVotes: defineTable({
    userId: v.string(),
    votingPeriodId: v.id("monthlyVotingPeriods"),
    toolId: v.id("tools"),
    votedAt: v.number(),
  })
    .index("by_period", ["votingPeriodId"])
    .index("by_user_period", ["userId", "votingPeriodId"]),

  // ============================================
  // FEATURE 9: Quest History & Replay
  // ============================================
  questHistory: defineTable({
    userId: v.optional(v.string()),
    sessionId: v.string(),  // For anonymous users
    answers: v.object({
      projectType: v.string(),
      scale: v.string(),
      budget: v.string(),
      features: v.array(v.string()),
    }),
    recommendedToolIds: v.array(v.id("tools")),
    aiReasoning: v.optional(v.string()),
    createdAt: v.number(),
    outcome: v.optional(v.union(
      v.literal("shipped"),
      v.literal("in_progress"),
      v.literal("abandoned"),
      v.literal("pending")
    )),
    outcomeNotes: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"]),

  // ============================================
  // FEATURE 10: Boss Battle History
  // ============================================
  battleHistory: defineTable({
    userId: v.optional(v.string()),
    tool1Id: v.id("tools"),
    tool2Id: v.id("tools"),
    winnerId: v.id("tools"),
    battleStats: v.object({
      tool1Score: v.number(),
      tool2Score: v.number(),
      weights: v.object({
        hp: v.number(),
        attack: v.number(),
        defense: v.number(),
        speed: v.number(),
        mana: v.number(),
      }),
    }),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_tools", ["tool1Id", "tool2Id"]),

  // User projects
  projects: defineTable({
    userId: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    prompt: v.optional(v.string()),
    requirements: v.object({
      projectType: v.optional(v.string()),
      scale: v.optional(v.string()),
      budget: v.optional(v.string()),
      teamSize: v.optional(v.string()),
      features: v.array(v.string()),
      constraints: v.array(v.string()),
    }),
    isPublic: v.boolean(),
    shareToken: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_share_token", ["shareToken"]),

  // Recommendations
  recommendations: defineTable({
    projectId: v.id("projects"),
    toolId: v.id("tools"),
    categoryId: v.id("categories"),
    reasoning: v.string(),
    confidenceScore: v.number(),
    priority: v.number(),
    estimatedMonthlyCost: v.optional(v.number()),
  }).index("by_project", ["projectId"]),

  // User tool usage tracking
  toolUsage: defineTable({
    userId: v.string(),
    toolId: v.id("tools"),
    usageCount: v.number(),
    lastUsedAt: v.number(),
    isFavorite: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_tool", ["userId", "toolId"])
    .index("by_user_usage", ["userId", "usageCount"]),

  // Tool comparisons saved by users
  toolComparisons: defineTable({
    userId: v.optional(v.string()),
    toolIds: v.array(v.id("tools")),
    createdAt: v.number(),
    name: v.optional(v.string()),
  }).index("by_user", ["userId"]),
});
