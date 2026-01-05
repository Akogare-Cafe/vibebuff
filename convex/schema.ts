import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============================================
  // CORE: Tool Categories
  // ============================================
  categories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    parentId: v.optional(v.id("categories")),
    sortOrder: v.number(),
  }).index("by_slug", ["slug"]),

  // ============================================
  // CORE: Development Tools
  // ============================================
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
    githubStars: v.optional(v.number()),
    npmDownloadsWeekly: v.optional(v.number()),
    pros: v.array(v.string()),
    cons: v.array(v.string()),
    bestFor: v.array(v.string()),
    features: v.array(v.string()),
    tags: v.array(v.string()),
    isOpenSource: v.boolean(),
    isActive: v.boolean(),
    isFeatured: v.boolean(),
    stats: v.optional(v.object({
      hp: v.number(),
      attack: v.number(),
      defense: v.number(),
      speed: v.number(),
      mana: v.number(),
    })),
    majorVersions: v.optional(v.array(v.object({
      version: v.string(),
      releasedAt: v.number(),
      highlights: v.array(v.string()),
    }))),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["categoryId"])
    .index("by_featured", ["isFeatured"]),

  // ============================================
  // CORE: Pricing Tiers
  // ============================================
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
  // Tool Synergies
  // ============================================
  toolSynergies: defineTable({
    toolAId: v.id("tools"),
    toolBId: v.id("tools"),
    synergyType: v.union(
      v.literal("combo"),
      v.literal("integration"),
      v.literal("alternative"),
      v.literal("conflict")
    ),
    synergyScore: v.number(),
    description: v.string(),
    bonusEffect: v.optional(v.string()),
  })
    .index("by_tool_a", ["toolAId"])
    .index("by_tool_b", ["toolBId"]),

  // ============================================
  // Achievements & Badges
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
      type: v.string(),
      count: v.number(),
    }),
    xpReward: v.number(),
    rarity: v.union(
      v.literal("common"),
      v.literal("uncommon"),
      v.literal("rare"),
      v.literal("epic"),
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
  // User Profiles & XP
  // ============================================
  userProfiles: defineTable({
    clerkId: v.string(),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    xp: v.number(),
    level: v.number(),
    title: v.optional(v.string()),
    toolsViewed: v.number(),
    battlesWon: v.number(),
    battlesLost: v.number(),
    decksCreated: v.number(),
    questsCompleted: v.number(),
    votescast: v.number(),
  }).index("by_clerk_id", ["clerkId"]),

  // ============================================
  // User Decks
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
  // Quest History
  // ============================================
  questHistory: defineTable({
    userId: v.optional(v.string()),
    sessionId: v.string(),
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
  // Tool Usage Tracking
  // ============================================
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

  // ============================================
  // Tool Comparisons
  // ============================================
  toolComparisons: defineTable({
    userId: v.optional(v.string()),
    toolIds: v.array(v.id("tools")),
    createdAt: v.number(),
    name: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // ============================================
  // Tool Mastery
  // ============================================
  toolMastery: defineTable({
    userId: v.string(),
    toolId: v.id("tools"),
    xp: v.number(),
    level: v.union(
      v.literal("novice"),
      v.literal("apprentice"),
      v.literal("journeyman"),
      v.literal("expert"),
      v.literal("master"),
      v.literal("grandmaster")
    ),
    interactions: v.object({
      views: v.number(),
      deckAdds: v.number(),
      battleWins: v.number(),
      battleLosses: v.number(),
      comparisons: v.number(),
      reviews: v.number(),
    }),
    firstInteractionAt: v.number(),
    lastInteractionAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_tool", ["userId", "toolId"])
    .index("by_tool", ["toolId"]),

  // ============================================
  // Stack Templates
  // ============================================
  stackTemplates: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("indie"),
      v.literal("startup"),
      v.literal("enterprise"),
      v.literal("agency"),
      v.literal("hobby")
    ),
    toolIds: v.array(v.id("tools")),
    categoryAssignments: v.array(v.object({
      categorySlug: v.string(),
      toolId: v.id("tools"),
    })),
    estimatedMonthlyCost: v.number(),
    caseStudy: v.optional(v.object({
      projectName: v.string(),
      projectUrl: v.optional(v.string()),
      description: v.string(),
      outcome: v.string(),
    })),
    tags: v.array(v.string()),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    isFeatured: v.boolean(),
    usageCount: v.number(),
    createdBy: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_featured", ["isFeatured"]),

  // ============================================
  // Tier Lists
  // ============================================
  tierLists: defineTable({
    userId: v.string(),
    categoryId: v.id("categories"),
    name: v.string(),
    description: v.optional(v.string()),
    tiers: v.object({
      s: v.array(v.id("tools")),
      a: v.array(v.id("tools")),
      b: v.array(v.id("tools")),
      c: v.array(v.id("tools")),
      d: v.array(v.id("tools")),
    }),
    isPublic: v.boolean(),
    shareToken: v.optional(v.string()),
    upvotes: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_category", ["categoryId"])
    .index("by_share_token", ["shareToken"]),

  tierListVotes: defineTable({
    userId: v.string(),
    tierListId: v.id("tierLists"),
    votedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_tier_list", ["tierListId"]),

  // ============================================
  // Tool Fusions
  // ============================================
  toolFusions: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    tool1Id: v.id("tools"),
    tool2Id: v.id("tools"),
    resultStats: v.object({
      hp: v.number(),
      attack: v.number(),
      defense: v.number(),
      speed: v.number(),
      mana: v.number(),
    }),
    bonusEffects: v.array(v.string()),
    rarity: v.union(v.literal("rare"), v.literal("epic"), v.literal("legendary")),
    discoveredBy: v.optional(v.string()),
    discoveredAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_tools", ["tool1Id", "tool2Id"]),

  userFusions: defineTable({
    userId: v.string(),
    fusionId: v.id("toolFusions"),
    discoveredAt: v.number(),
    timesUsed: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_fusion", ["userId", "fusionId"]),

  // ============================================
  // Tool Reviews
  // ============================================
  toolReviews: defineTable({
    userId: v.string(),
    toolId: v.id("tools"),
    rating: v.number(),
    title: v.string(),
    content: v.string(),
    pros: v.array(v.string()),
    cons: v.array(v.string()),
    usedFor: v.optional(v.string()),
    shippedWith: v.boolean(),
    experienceLevel: v.union(
      v.literal("tried_it"),
      v.literal("used_in_project"),
      v.literal("shipped_product"),
      v.literal("production_veteran")
    ),
    helpfulVotes: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_tool", ["toolId"])
    .index("by_user_tool", ["userId", "toolId"]),

  reviewVotes: defineTable({
    userId: v.string(),
    reviewId: v.id("toolReviews"),
    isHelpful: v.boolean(),
    votedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_review", ["reviewId"]),

  // ============================================
  // Tool Popularity
  // ============================================
  toolPopularity: defineTable({
    toolId: v.id("tools"),
    views: v.number(),
    clicks: v.number(),
    favorites: v.number(),
    deckAdds: v.number(),
    battlePicks: v.number(),
    comparisons: v.number(),
    weeklyViews: v.number(),
    weeklyClicks: v.number(),
    lastUpdated: v.number(),
    trendScore: v.number(),
  })
    .index("by_tool", ["toolId"])
    .index("by_views", ["views"])
    .index("by_clicks", ["clicks"])
    .index("by_trend", ["trendScore"]),

  toolPopularityEvents: defineTable({
    toolId: v.id("tools"),
    eventType: v.union(
      v.literal("view"),
      v.literal("click"),
      v.literal("favorite"),
      v.literal("deck_add"),
      v.literal("battle_pick"),
      v.literal("comparison")
    ),
    userId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_tool", ["toolId"])
    .index("by_type", ["eventType"])
    .index("by_timestamp", ["timestamp"]),

  // ============================================
  // Tool Evolution
  // ============================================
  toolEvolutions: defineTable({
    toolId: v.id("tools"),
    tier: v.union(
      v.literal("bronze"),
      v.literal("silver"),
      v.literal("gold"),
      v.literal("diamond"),
      v.literal("legendary")
    ),
    previousTier: v.optional(v.string()),
    evolvedAt: v.number(),
    milestone: v.object({
      type: v.string(),
      value: v.number(),
    }),
  })
    .index("by_tool", ["toolId"])
    .index("by_tier", ["tier"]),

  ogCollectors: defineTable({
    userId: v.string(),
    toolId: v.id("tools"),
    collectedAt: v.number(),
    tierAtCollection: v.string(),
    isOG: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_tool", ["toolId"]),

  // ============================================
  // Simulations
  // ============================================
  simulations: defineTable({
    userId: v.string(),
    deckId: v.optional(v.id("userDecks")),
    toolIds: v.array(v.id("tools")),
    scenario: v.object({
      type: v.string(),
      name: v.string(),
      description: v.string(),
      challenges: v.array(v.object({
        name: v.string(),
        weight: v.number(),
      })),
    }),
    results: v.object({
      overallScore: v.number(),
      scalability: v.number(),
      security: v.number(),
      performance: v.number(),
      devExperience: v.number(),
      costEfficiency: v.number(),
    }),
    xpEarned: v.number(),
    completedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_score", ["results.overallScore"]),

  simulationScenarios: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"), v.literal("nightmare")),
    challenges: v.array(v.object({
      name: v.string(),
      description: v.string(),
      weight: v.number(),
      idealToolTypes: v.array(v.string()),
    })),
    isActive: v.boolean(),
  }).index("by_slug", ["slug"]),

  // ============================================
  // Trading Post
  // ============================================
  tradableCards: defineTable({
    userId: v.string(),
    toolId: v.id("tools"),
    rarity: v.union(v.literal("common"), v.literal("uncommon"), v.literal("rare"), v.literal("legendary"), v.literal("mythic")),
    edition: v.string(),
    serialNumber: v.number(),
    isListed: v.boolean(),
    acquiredAt: v.number(),
    acquiredFrom: v.union(v.literal("pack"), v.literal("trade"), v.literal("achievement"), v.literal("event")),
  })
    .index("by_user", ["userId"])
    .index("by_tool", ["toolId"])
    .index("by_listed", ["isListed"]),

  tradeListings: defineTable({
    sellerId: v.string(),
    cardId: v.id("tradableCards"),
    listingType: v.union(v.literal("auction"), v.literal("fixed"), v.literal("trade")),
    price: v.optional(v.number()),
    wantedToolIds: v.optional(v.array(v.id("tools"))),
    currentBid: v.optional(v.number()),
    currentBidderId: v.optional(v.string()),
    expiresAt: v.number(),
    status: v.union(v.literal("active"), v.literal("sold"), v.literal("expired"), v.literal("cancelled")),
    createdAt: v.number(),
  })
    .index("by_seller", ["sellerId"])
    .index("by_status", ["status"])
    .index("by_card", ["cardId"]),

  tradeHistory: defineTable({
    listingId: v.id("tradeListings"),
    sellerId: v.string(),
    buyerId: v.string(),
    cardId: v.id("tradableCards"),
    price: v.number(),
    completedAt: v.number(),
  })
    .index("by_seller", ["sellerId"])
    .index("by_buyer", ["buyerId"]),

  // ============================================
  // Battle History
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

  // ============================================
  // Trophy Room
  // ============================================
  trophyRooms: defineTable({
    userId: v.string(),
    layout: v.string(),
    theme: v.string(),
    displayedAchievements: v.array(v.object({
      achievementId: v.id("achievements"),
      position: v.object({ x: v.number(), y: v.number() }),
      size: v.union(v.literal("small"), v.literal("medium"), v.literal("large")),
    })),
    displayedBadges: v.array(v.string()),
    featuredDeckId: v.optional(v.id("userDecks")),
    featuredBattleId: v.optional(v.id("battleHistory")),
    customTitle: v.optional(v.string()),
    views: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  profileFrames: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    rarity: v.union(v.literal("common"), v.literal("rare"), v.literal("epic"), v.literal("legendary")),
    imageUrl: v.string(),
    unlockRequirement: v.optional(v.object({
      type: v.string(),
      value: v.number(),
    })),
  }).index("by_slug", ["slug"]),

  // ============================================
  // Tool Lore
  // ============================================
  toolLore: defineTable({
    toolId: v.id("tools"),
    originStory: v.string(),
    creatorInfo: v.optional(v.object({
      name: v.string(),
      bio: v.string(),
      quote: v.optional(v.string()),
    })),
    eras: v.array(v.object({
      version: v.string(),
      name: v.string(),
      description: v.string(),
      releaseDate: v.number(),
      majorChanges: v.array(v.string()),
    })),
    funFacts: v.array(v.string()),
    relatedTools: v.array(v.id("tools")),
  }).index("by_tool", ["toolId"]),

  loreUnlocks: defineTable({
    userId: v.string(),
    toolId: v.id("tools"),
    unlockedSections: v.array(v.string()),
    unlockedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_tool", ["toolId"]),

  // ============================================
  // Seasonal Events
  // ============================================
  seasonalEvents: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    eventType: v.union(
      v.literal("hackathon"),
      v.literal("retro_week"),
      v.literal("framework_war"),
      v.literal("limited_mode")
    ),
    rules: v.object({
      allowedToolIds: v.optional(v.array(v.id("tools"))),
      maxYear: v.optional(v.number()),
      factions: v.optional(v.array(v.string())),
      customRules: v.optional(v.array(v.string())),
    }),
    rewards: v.array(v.object({
      rank: v.number(),
      rewardType: v.string(),
      rewardValue: v.string(),
    })),
    startDate: v.number(),
    endDate: v.number(),
    isActive: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["isActive"]),

  eventParticipants: defineTable({
    eventId: v.id("seasonalEvents"),
    userId: v.string(),
    faction: v.optional(v.string()),
    score: v.number(),
    submissions: v.array(v.object({
      type: v.string(),
      referenceId: v.string(),
      submittedAt: v.number(),
    })),
    joinedAt: v.number(),
  })
    .index("by_event", ["eventId"])
    .index("by_user", ["userId"]),

  // ============================================
  // Stack Replays
  // ============================================
  stackReplays: defineTable({
    userId: v.string(),
    replayType: v.union(
      v.literal("battle"),
      v.literal("roguelike"),
      v.literal("draft"),
      v.literal("simulation")
    ),
    referenceId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    replayData: v.object({
      duration: v.number(),
      keyMoments: v.array(v.object({
        timestamp: v.number(),
        event: v.string(),
        description: v.string(),
      })),
    }),
    upvotes: v.number(),
    views: v.number(),
    isFeatured: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_type", ["replayType"])
    .index("by_upvotes", ["upvotes"])
    .index("by_featured", ["isFeatured"]),

  replayVotes: defineTable({
    replayId: v.id("stackReplays"),
    oderId: v.string(),
    votedAt: v.number(),
  })
    .index("by_replay", ["replayId"])
    .index("by_user", ["oderId"]),

  weeklyHighlights: defineTable({
    weekStart: v.number(),
    weekEnd: v.number(),
    topReplays: v.array(v.id("stackReplays")),
    generatedAt: v.number(),
  }).index("by_week", ["weekStart"]),

  // ============================================
  // Stack Architect Puzzles
  // ============================================
  architectPuzzles: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard"),
      v.literal("expert")
    ),
    constraints: v.object({
      maxBudget: v.optional(v.number()),
      maxTools: v.optional(v.number()),
      requiredCategories: v.optional(v.array(v.string())),
      bannedTools: v.optional(v.array(v.id("tools"))),
      mustInclude: v.optional(v.array(v.id("tools"))),
      targetUsers: v.optional(v.number()),
      maxLatency: v.optional(v.number()),
      customConstraints: v.optional(v.array(v.string())),
    }),
    scoringCriteria: v.object({
      costWeight: v.number(),
      performanceWeight: v.number(),
      simplicityWeight: v.number(),
      innovationWeight: v.number(),
    }),
    sampleSolution: v.optional(v.array(v.id("tools"))),
    isDaily: v.boolean(),
    activeDate: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_daily", ["isDaily", "activeDate"])
    .index("by_difficulty", ["difficulty"]),

  puzzleSolutions: defineTable({
    puzzleId: v.id("architectPuzzles"),
    userId: v.string(),
    toolIds: v.array(v.id("tools")),
    score: v.number(),
    breakdown: v.object({
      costScore: v.number(),
      performanceScore: v.number(),
      simplicityScore: v.number(),
      innovationScore: v.number(),
    }),
    timeSpent: v.number(),
    submittedAt: v.number(),
  })
    .index("by_puzzle", ["puzzleId"])
    .index("by_user", ["userId"])
    .index("by_score", ["puzzleId", "score"]),

  // ============================================
  // Time Machine
  // ============================================
  toolSnapshots: defineTable({
    toolId: v.id("tools"),
    year: v.number(),
    githubStars: v.optional(v.number()),
    weeklyDownloads: v.optional(v.number()),
    popularity: v.number(),
    wasAvailable: v.boolean(),
    majorVersion: v.optional(v.string()),
    notableEvents: v.optional(v.array(v.string())),
  })
    .index("by_tool", ["toolId"])
    .index("by_year", ["year"])
    .index("by_tool_year", ["toolId", "year"]),

  timeMachineChallenges: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    targetYear: v.number(),
    projectType: v.string(),
    requirements: v.array(v.string()),
    availableToolIds: v.array(v.id("tools")),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_year", ["targetYear"]),

  timeMachineSubmissions: defineTable({
    challengeId: v.id("timeMachineChallenges"),
    userId: v.string(),
    toolIds: v.array(v.id("tools")),
    explanation: v.string(),
    score: v.number(),
    upvotes: v.number(),
    submittedAt: v.number(),
  })
    .index("by_challenge", ["challengeId"])
    .index("by_user", ["userId"]),

  // ============================================
  // Tool Relationships
  // ============================================
  toolRelationships: defineTable({
    tool1Id: v.id("tools"),
    tool2Id: v.id("tools"),
    relationshipType: v.union(
      v.literal("pairs_with"),
      v.literal("competes_with"),
      v.literal("replaces"),
      v.literal("inspired_by"),
      v.literal("extends"),
      v.literal("requires")
    ),
    strength: v.number(),
    evidence: v.array(v.string()),
    communityVotes: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tool1", ["tool1Id"])
    .index("by_tool2", ["tool2Id"])
    .index("by_type", ["relationshipType"]),

  migrationPaths: defineTable({
    fromToolId: v.id("tools"),
    toToolId: v.id("tools"),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("moderate"),
      v.literal("hard"),
      v.literal("painful")
    ),
    estimatedHours: v.number(),
    steps: v.array(v.string()),
    gotchas: v.array(v.string()),
    resources: v.array(v.object({
      title: v.string(),
      url: v.string(),
    })),
    successRate: v.number(),
    reports: v.number(),
    createdAt: v.number(),
  })
    .index("by_from", ["fromToolId"])
    .index("by_to", ["toToolId"]),

  // ============================================
  // Startup Stories
  // ============================================
  startupStories: defineTable({
    slug: v.string(),
    companyName: v.string(),
    logoUrl: v.optional(v.string()),
    foundedYear: v.number(),
    industry: v.string(),
    stage: v.union(
      v.literal("idea"),
      v.literal("mvp"),
      v.literal("seed"),
      v.literal("series_a"),
      v.literal("series_b_plus"),
      v.literal("public")
    ),
    teamSize: v.optional(v.number()),
    description: v.string(),
    stackEvolution: v.array(v.object({
      phase: v.string(),
      year: v.number(),
      toolIds: v.array(v.id("tools")),
      reasoning: v.string(),
      lessonsLearned: v.optional(v.string()),
    })),
    costBreakdown: v.optional(v.object({
      monthly: v.number(),
      breakdown: v.array(v.object({
        category: v.string(),
        amount: v.number(),
      })),
    })),
    founderQuotes: v.optional(v.array(v.object({
      quote: v.string(),
      author: v.string(),
      role: v.string(),
    }))),
    isVerified: v.boolean(),
    isUserSubmitted: v.boolean(),
    submittedBy: v.optional(v.string()),
    upvotes: v.number(),
    views: v.number(),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_industry", ["industry"])
    .index("by_stage", ["stage"])
    .index("by_upvotes", ["upvotes"]),

  // ============================================
  // Compatibility Matrix
  // ============================================
  compatibilityScores: defineTable({
    tool1Id: v.id("tools"),
    tool2Id: v.id("tools"),
    overallScore: v.number(),
    breakdown: v.object({
      setupEase: v.number(),
      documentation: v.number(),
      communitySupport: v.number(),
      performanceTogether: v.number(),
    }),
    integrationGuide: v.optional(v.string()),
    boilerplateUrl: v.optional(v.string()),
    reportCount: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_tool1", ["tool1Id"])
    .index("by_tool2", ["tool2Id"])
    .index("by_score", ["overallScore"]),

  compatibilityReports: defineTable({
    tool1Id: v.id("tools"),
    tool2Id: v.id("tools"),
    userId: v.string(),
    score: v.number(),
    experience: v.union(
      v.literal("smooth"),
      v.literal("minor_issues"),
      v.literal("major_issues"),
      v.literal("incompatible")
    ),
    gotchas: v.array(v.string()),
    tips: v.array(v.string()),
    projectContext: v.optional(v.string()),
    upvotes: v.number(),
    createdAt: v.number(),
  })
    .index("by_tools", ["tool1Id", "tool2Id"])
    .index("by_user", ["userId"]),

  // ============================================
  // Speedruns
  // ============================================
  speedrunCategories: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    categoryType: v.union(
      v.literal("any_percent"),
      v.literal("full_stack"),
      v.literal("category_specific"),
      v.literal("glitchless")
    ),
    requirements: v.array(v.object({
      category: v.string(),
      count: v.number(),
    })),
    bannedTools: v.optional(v.array(v.id("tools"))),
    verificationSteps: v.array(v.string()),
    worldRecord: v.optional(v.number()),
    worldRecordHolder: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_type", ["categoryType"]),

  speedruns: defineTable({
    categoryId: v.id("speedrunCategories"),
    userId: v.string(),
    toolIds: v.array(v.id("tools")),
    timeMs: v.number(),
    splits: v.array(v.object({
      name: v.string(),
      timeMs: v.number(),
      toolId: v.optional(v.id("tools")),
    })),
    isVerified: v.boolean(),
    verifiedBy: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    isWorldRecord: v.boolean(),
    submittedAt: v.number(),
  })
    .index("by_category", ["categoryId"])
    .index("by_user", ["userId"])
    .index("by_time", ["categoryId", "timeMs"])
    .index("by_world_record", ["isWorldRecord"]),

  weeklyRaces: defineTable({
    categoryId: v.id("speedrunCategories"),
    startTime: v.number(),
    endTime: v.number(),
    participants: v.array(v.string()),
    results: v.array(v.object({
      oderId: v.string(),
      timeMs: v.number(),
      rank: v.number(),
    })),
    status: v.union(
      v.literal("upcoming"),
      v.literal("active"),
      v.literal("completed")
    ),
  })
    .index("by_category", ["categoryId"])
    .index("by_status", ["status"]),

  // ============================================
  // Tool Graveyard
  // ============================================
  toolGraveyard: defineTable({
    toolId: v.optional(v.id("tools")),
    name: v.string(),
    tagline: v.string(),
    logoUrl: v.optional(v.string()),
    category: v.string(),
    peakPopularity: v.number(),
    peakYear: v.number(),
    deathYear: v.number(),
    causeOfDeath: v.union(
      v.literal("abandoned"),
      v.literal("acquired_killed"),
      v.literal("superseded"),
      v.literal("security_issues"),
      v.literal("company_shutdown"),
      v.literal("community_exodus"),
      v.literal("other")
    ),
    obituary: v.string(),
    lessonsLearned: v.array(v.string()),
    successorToolIds: v.optional(v.array(v.id("tools"))),
    memorialMessages: v.number(),
    isResurrected: v.boolean(),
    resurrectionDate: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_death_year", ["deathYear"])
    .index("by_cause", ["causeOfDeath"])
    .index("by_resurrected", ["isResurrected"]),

  graveyardMemorials: defineTable({
    graveyardEntryId: v.id("toolGraveyard"),
    oderId: v.string(),
    message: v.string(),
    yearsUsed: v.optional(v.number()),
    fondestMemory: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_entry", ["graveyardEntryId"])
    .index("by_user", ["oderId"]),

  resurrectionWatch: defineTable({
    toolId: v.optional(v.id("tools")),
    graveyardEntryId: v.optional(v.id("toolGraveyard")),
    name: v.string(),
    signs: v.array(v.object({
      sign: v.string(),
      reportedAt: v.number(),
      reportedBy: v.string(),
    })),
    hopeLevel: v.number(),
    watchers: v.number(),
    lastActivity: v.number(),
  })
    .index("by_hope", ["hopeLevel"])
    .index("by_watchers", ["watchers"]),

  legacyMigrationGuides: defineTable({
    fromToolName: v.string(),
    graveyardEntryId: v.optional(v.id("toolGraveyard")),
    toToolId: v.id("tools"),
    guide: v.string(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("moderate"),
      v.literal("hard"),
      v.literal("nightmare")
    ),
    estimatedHours: v.number(),
    upvotes: v.number(),
    createdBy: v.string(),
    createdAt: v.number(),
  })
    .index("by_from", ["fromToolName"])
    .index("by_to", ["toToolId"]),

  // ============================================
  // XP Activity & Streaks
  // ============================================
  userStreaks: defineTable({
    userId: v.string(),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastClaimDate: v.optional(v.number()),
    totalXpFromStreaks: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  xpActivityLog: defineTable({
    userId: v.string(),
    amount: v.number(),
    source: v.string(),
    description: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_timestamp", ["userId", "timestamp"]),

  // ============================================
  // Spin Wheel
  // ============================================
  spinWheelRewards: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    rewardType: v.union(
      v.literal("xp"),
      v.literal("pack"),
      v.literal("tool_reveal"),
      v.literal("title"),
      v.literal("badge"),
      v.literal("multiplier"),
      v.literal("nothing")
    ),
    rewardValue: v.number(),
    rewardMeta: v.optional(v.string()),
    weight: v.number(),
    rarity: v.union(v.literal("common"), v.literal("uncommon"), v.literal("rare"), v.literal("legendary")),
    isActive: v.boolean(),
  }).index("by_slug", ["slug"]),

  userSpins: defineTable({
    userId: v.string(),
    rewardId: v.id("spinWheelRewards"),
    rewardType: v.string(),
    rewardValue: v.number(),
    spunAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "spunAt"]),

  // ============================================
  // Stack Contracts
  // ============================================
  stackContracts: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    clientName: v.string(),
    clientAvatar: v.optional(v.string()),
    contractType: v.union(v.literal("daily"), v.literal("weekly"), v.literal("special")),
    requirements: v.object({
      projectType: v.string(),
      maxBudget: v.optional(v.number()),
      minTools: v.optional(v.number()),
      maxTools: v.optional(v.number()),
      requiredCategories: v.array(v.string()),
      bannedCategories: v.optional(v.array(v.string())),
      mustIncludeToolIds: v.optional(v.array(v.id("tools"))),
    }),
    rewards: v.object({
      xp: v.number(),
      coins: v.optional(v.number()),
      bonusTitle: v.optional(v.string()),
    }),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"), v.literal("expert")),
    expiresAt: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_type", ["contractType"])
    .index("by_active", ["isActive"]),

  contractSubmissions: defineTable({
    contractId: v.id("stackContracts"),
    userId: v.string(),
    toolIds: v.array(v.id("tools")),
    totalCost: v.number(),
    score: v.number(),
    feedback: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_contract", ["contractId"])
    .index("by_user", ["userId"]),

  // ============================================
  // Tool Affinity
  // ============================================
  userToolAffinity: defineTable({
    userId: v.string(),
    toolId: v.id("tools"),
    affinityLevel: v.union(
      v.literal("stranger"),
      v.literal("acquaintance"),
      v.literal("friend"),
      v.literal("companion"),
      v.literal("soulmate")
    ),
    affinityPoints: v.number(),
    interactions: v.object({
      views: v.number(),
      deckAdds: v.number(),
      battleWins: v.number(),
      reviews: v.number(),
      recommendations: v.number(),
    }),
    unlockedPerks: v.array(v.string()),
    firstInteractionAt: v.number(),
    lastInteractionAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_tool", ["userId", "toolId"])
    .index("by_affinity", ["affinityLevel"]),

  affinityPerks: defineTable({
    toolId: v.id("tools"),
    level: v.string(),
    perkType: v.union(
      v.literal("stat_boost"),
      v.literal("xp_bonus"),
      v.literal("exclusive_whisper"),
      v.literal("battle_ability"),
      v.literal("cosmetic")
    ),
    perkValue: v.string(),
    description: v.string(),
  })
    .index("by_tool", ["toolId"])
    .index("by_level", ["level"]),

  // ============================================
  // Leaderboard Seasons
  // ============================================
  leaderboardSeasons: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    leaderboardType: v.union(
      v.literal("xp"),
      v.literal("battles"),
      v.literal("decks"),
      v.literal("reviews"),
      v.literal("speedruns"),
      v.literal("predictions")
    ),
    rewards: v.array(v.object({
      rank: v.number(),
      rewardType: v.string(),
      rewardValue: v.string(),
    })),
    isActive: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["isActive"]),

  seasonalRankings: defineTable({
    seasonId: v.id("leaderboardSeasons"),
    userId: v.string(),
    score: v.number(),
    rank: v.number(),
    previousRank: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_season", ["seasonId"])
    .index("by_season_score", ["seasonId", "score"])
    .index("by_user", ["userId"]),

  // ============================================
  // Tool Nominations
  // ============================================
  toolNominations: defineTable({
    name: v.string(),
    websiteUrl: v.string(),
    githubUrl: v.optional(v.string()),
    categorySlug: v.string(),
    description: v.string(),
    whyAdd: v.string(),
    nominatedBy: v.string(),
    upvotes: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("under_review"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("added")
    ),
    reviewNotes: v.optional(v.string()),
    addedToolId: v.optional(v.id("tools")),
    createdAt: v.number(),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_user", ["nominatedBy"])
    .index("by_upvotes", ["upvotes"]),

  nominationVotes: defineTable({
    nominationId: v.id("toolNominations"),
    userId: v.string(),
    votedAt: v.number(),
  })
    .index("by_nomination", ["nominationId"])
    .index("by_user", ["userId"]),

  // ============================================
  // SEO System
  // ============================================
  seoMetadata: defineTable({
    entityType: v.union(
      v.literal("tool"),
      v.literal("comparison"),
      v.literal("category"),
      v.literal("blog")
    ),
    entityId: v.string(),
    slug: v.string(),
    title: v.string(),
    metaDescription: v.string(),
    keywords: v.array(v.string()),
    ogTitle: v.optional(v.string()),
    ogDescription: v.optional(v.string()),
    canonicalUrl: v.optional(v.string()),
    structuredData: v.optional(v.string()),
    generatedAt: v.number(),
    lastUpdated: v.number(),
    isAiGenerated: v.boolean(),
  })
    .index("by_entity", ["entityType", "entityId"])
    .index("by_slug", ["slug"]),

  seoFaqs: defineTable({
    entityType: v.union(
      v.literal("tool"),
      v.literal("comparison"),
      v.literal("category")
    ),
    entityId: v.string(),
    question: v.string(),
    answer: v.string(),
    sortOrder: v.number(),
    isAiGenerated: v.boolean(),
    generatedAt: v.number(),
  })
    .index("by_entity", ["entityType", "entityId"]),

  seoComparisons: defineTable({
    tool1Slug: v.string(),
    tool2Slug: v.string(),
    slug: v.string(),
    title: v.string(),
    metaDescription: v.string(),
    introduction: v.string(),
    tool1Summary: v.string(),
    tool2Summary: v.string(),
    comparisonPoints: v.array(v.object({
      category: v.string(),
      tool1Score: v.number(),
      tool2Score: v.number(),
      tool1Reason: v.string(),
      tool2Reason: v.string(),
    })),
    verdict: v.string(),
    useCaseRecommendations: v.array(v.object({
      useCase: v.string(),
      recommendedTool: v.string(),
      reason: v.string(),
    })),
    faqs: v.array(v.object({
      question: v.string(),
      answer: v.string(),
    })),
    generatedAt: v.number(),
    lastUpdated: v.number(),
    views: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_tools", ["tool1Slug", "tool2Slug"])
    .index("by_views", ["views"]),

  seoBlogOutlines: defineTable({
    targetKeyword: v.string(),
    title: v.string(),
    slug: v.string(),
    outline: v.array(v.object({
      heading: v.string(),
      subheadings: v.array(v.string()),
      keyPoints: v.array(v.string()),
    })),
    suggestedInternalLinks: v.array(v.object({
      anchorText: v.string(),
      targetUrl: v.string(),
    })),
    estimatedWordCount: v.number(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard")),
    status: v.union(v.literal("draft"), v.literal("approved"), v.literal("published")),
    generatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_keyword", ["targetKeyword"]),

  seoKeywordClusters: defineTable({
    primaryKeyword: v.string(),
    relatedKeywords: v.array(v.object({
      keyword: v.string(),
      searchVolume: v.optional(v.number()),
      difficulty: v.optional(v.number()),
      relevanceScore: v.number(),
    })),
    suggestedContent: v.array(v.object({
      title: v.string(),
      contentType: v.union(v.literal("blog"), v.literal("comparison"), v.literal("guide"), v.literal("faq")),
      targetKeywords: v.array(v.string()),
    })),
    toolIds: v.optional(v.array(v.id("tools"))),
    generatedAt: v.number(),
  })
    .index("by_keyword", ["primaryKeyword"]),

  seoContentScores: defineTable({
    contentType: v.union(v.literal("blog"), v.literal("tool"), v.literal("comparison")),
    contentId: v.string(),
    overallScore: v.number(),
    keywordScore: v.number(),
    readabilityScore: v.number(),
    structureScore: v.number(),
    internalLinkScore: v.number(),
    suggestions: v.array(v.object({
      type: v.string(),
      priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
      suggestion: v.string(),
    })),
    analyzedAt: v.number(),
  })
    .index("by_content", ["contentType", "contentId"])
    .index("by_score", ["overallScore"]),

  seoAltTexts: defineTable({
    imageUrl: v.string(),
    altText: v.string(),
    context: v.optional(v.string()),
    toolId: v.optional(v.id("tools")),
    generatedAt: v.number(),
  })
    .index("by_image", ["imageUrl"])
    .index("by_tool", ["toolId"]),

  // ============================================
  // Tool Whispers
  // ============================================
  toolWhispers: defineTable({
    toolId: v.id("tools"),
    whisperType: v.union(
      v.literal("pro_tip"),
      v.literal("hidden_feature"),
      v.literal("gotcha"),
      v.literal("best_practice"),
      v.literal("performance_tip"),
      v.literal("cost_saving")
    ),
    content: v.string(),
    source: v.optional(v.string()),
    upvotes: v.number(),
    isVerified: v.boolean(),
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_tool", ["toolId"])
    .index("by_type", ["whisperType"]),

  whisperUnlocks: defineTable({
    userId: v.string(),
    toolId: v.id("tools"),
    unlockedWhisperIds: v.array(v.id("toolWhispers")),
    unlockedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_tool", ["userId", "toolId"]),

  // ============================================
  // Onboarding
  // ============================================
  userOnboarding: defineTable({
    userId: v.string(),
    currentStep: v.number(),
    completedSteps: v.array(v.number()),
    answers: v.object({
      experienceLevel: v.optional(v.union(
        v.literal("no-coding"),
        v.literal("some-coding"),
        v.literal("experienced")
      )),
      goal: v.optional(v.union(
        v.literal("learn"),
        v.literal("build-project"),
        v.literal("explore-tools")
      )),
      projectType: v.optional(v.string()),
      preferredIde: v.optional(v.string()),
      budget: v.optional(v.union(
        v.literal("free"),
        v.literal("low"),
        v.literal("medium"),
        v.literal("high")
      )),
    }),
    recommendedPathId: v.optional(v.id("learningPaths")),
    recommendedToolIds: v.array(v.id("tools")),
    isCompleted: v.boolean(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"]),

  // ============================================
  // User Settings
  // ============================================
  userSettings: defineTable({
    userId: v.string(),
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    githubUsername: v.optional(v.string()),
    twitterUsername: v.optional(v.string()),
    notifications: v.object({
      emailDigest: v.boolean(),
      achievementAlerts: v.boolean(),
      weeklyProgress: v.boolean(),
      communityUpdates: v.boolean(),
      battleInvites: v.boolean(),
    }),
    privacy: v.object({
      showProfile: v.boolean(),
      showActivity: v.boolean(),
      showDecks: v.boolean(),
      showAchievements: v.boolean(),
      showOnLeaderboard: v.boolean(),
    }),
    preferences: v.object({
      theme: v.union(v.literal("dark"), v.literal("light"), v.literal("system")),
      soundEffects: v.boolean(),
      animations: v.boolean(),
      compactMode: v.boolean(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // ============================================
  // Learning Paths
  // ============================================
  learningPaths: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    estimatedMinutes: v.number(),
    icon: v.string(),
    color: v.string(),
    prerequisites: v.array(v.string()),
    toolIds: v.array(v.id("tools")),
    xpReward: v.number(),
    isPublished: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_difficulty", ["difficulty"])
    .index("by_published", ["isPublished"]),

  // ============================================
  // Visual Stack Builder
  // ============================================
  stackBlueprints: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    projectType: v.union(
      v.literal("landing-page"),
      v.literal("saas"),
      v.literal("e-commerce"),
      v.literal("blog"),
      v.literal("dashboard"),
      v.literal("mobile-app"),
      v.literal("api")
    ),
    difficulty: v.union(v.literal("beginner"), v.literal("intermediate"), v.literal("advanced")),
    nodes: v.array(v.object({
      id: v.string(),
      type: v.string(),
      position: v.object({ x: v.number(), y: v.number() }),
      data: v.object({
        label: v.string(),
        toolId: v.optional(v.id("tools")),
        category: v.string(),
        description: v.optional(v.string()),
      }),
    })),
    edges: v.array(v.object({
      id: v.string(),
      source: v.string(),
      target: v.string(),
      label: v.optional(v.string()),
      animated: v.optional(v.boolean()),
    })),
    toolIds: v.array(v.id("tools")),
    estimatedCost: v.optional(v.string()),
    isTemplate: v.boolean(),
    isFeatured: v.boolean(),
    views: v.number(),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_project_type", ["projectType"])
    .index("by_featured", ["isFeatured"]),

  userStackBuilds: defineTable({
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    nodes: v.array(v.object({
      id: v.string(),
      type: v.string(),
      position: v.object({ x: v.number(), y: v.number() }),
      data: v.object({
        label: v.string(),
        toolId: v.optional(v.id("tools")),
        category: v.string(),
        description: v.optional(v.string()),
      }),
    })),
    edges: v.array(v.object({
      id: v.string(),
      source: v.string(),
      target: v.string(),
      label: v.optional(v.string()),
      animated: v.optional(v.boolean()),
    })),
    isPublic: v.boolean(),
    shareToken: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_share_token", ["shareToken"]),

  // ============================================
  // Stack Marketplace
  // ============================================
  marketplaceStacks: defineTable({
    buildId: v.id("userStackBuilds"),
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    tags: v.array(v.string()),
    projectType: v.optional(v.union(
      v.literal("landing-page"),
      v.literal("saas"),
      v.literal("e-commerce"),
      v.literal("blog"),
      v.literal("dashboard"),
      v.literal("mobile-app"),
      v.literal("api"),
      v.literal("other")
    )),
    difficulty: v.optional(v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced")
    )),
    toolCount: v.number(),
    upvotes: v.number(),
    commentCount: v.number(),
    importCount: v.number(),
    views: v.number(),
    isFeatured: v.boolean(),
    publishedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_build", ["buildId"])
    .index("by_upvotes", ["upvotes"])
    .index("by_published", ["publishedAt"])
    .index("by_featured", ["isFeatured"])
    .index("by_project_type", ["projectType"]),

  marketplaceUpvotes: defineTable({
    stackId: v.id("marketplaceStacks"),
    userId: v.string(),
    votedAt: v.number(),
  })
    .index("by_stack", ["stackId"])
    .index("by_user", ["userId"])
    .index("by_user_stack", ["userId", "stackId"]),

  marketplaceComments: defineTable({
    stackId: v.id("marketplaceStacks"),
    userId: v.string(),
    content: v.string(),
    parentId: v.optional(v.id("marketplaceComments")),
    upvotes: v.number(),
    isEdited: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_stack", ["stackId"])
    .index("by_user", ["userId"])
    .index("by_parent", ["parentId"]),

  marketplaceCommentVotes: defineTable({
    commentId: v.id("marketplaceComments"),
    userId: v.string(),
    votedAt: v.number(),
  })
    .index("by_comment", ["commentId"])
    .index("by_user", ["userId"])
    .index("by_user_comment", ["userId", "commentId"]),

  marketplaceFavorites: defineTable({
    stackId: v.id("marketplaceStacks"),
    userId: v.string(),
    savedAt: v.number(),
  })
    .index("by_stack", ["stackId"])
    .index("by_user", ["userId"])
    .index("by_user_stack", ["userId", "stackId"]),

  marketplaceImports: defineTable({
    sourceStackId: v.id("marketplaceStacks"),
    targetBuildId: v.id("userStackBuilds"),
    userId: v.string(),
    importedAt: v.number(),
  })
    .index("by_source", ["sourceStackId"])
    .index("by_user", ["userId"]),

  // ============================================
  // Social: Friends & Connections
  // ============================================
  friendships: defineTable({
    userId: v.string(),
    friendId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("blocked")
    ),
    initiatedBy: v.string(),
    createdAt: v.number(),
    acceptedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_friend", ["friendId"])
    .index("by_user_friend", ["userId", "friendId"])
    .index("by_status", ["status"]),

  // ============================================
  // Social: Groups
  // ============================================
  groups: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    groupType: v.union(
      v.literal("public"),
      v.literal("private"),
      v.literal("invite_only")
    ),
    ownerId: v.string(),
    memberCount: v.number(),
    tags: v.array(v.string()),
    isVerified: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"])
    .index("by_type", ["groupType"])
    .index("by_member_count", ["memberCount"]),

  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.string(),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("moderator"),
      v.literal("member")
    ),
    joinedAt: v.number(),
    invitedBy: v.optional(v.string()),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_group_user", ["groupId", "userId"]),

  groupInvites: defineTable({
    groupId: v.id("groups"),
    inviterId: v.string(),
    inviteeId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired")
    ),
    message: v.optional(v.string()),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_invitee", ["inviteeId"])
    .index("by_status", ["status"]),

  groupSharedDecks: defineTable({
    groupId: v.id("groups"),
    deckId: v.id("userDecks"),
    sharedBy: v.string(),
    sharedAt: v.number(),
    isPinned: v.boolean(),
  })
    .index("by_group", ["groupId"])
    .index("by_deck", ["deckId"]),

  groupSharedStacks: defineTable({
    groupId: v.id("groups"),
    stackId: v.id("userStackBuilds"),
    sharedBy: v.string(),
    sharedAt: v.number(),
    isPinned: v.boolean(),
  })
    .index("by_group", ["groupId"])
    .index("by_stack", ["stackId"]),

  // ============================================
  // Social: Companies/Teams
  // ============================================
  companies: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    websiteUrl: v.optional(v.string()),
    industry: v.optional(v.string()),
    size: v.optional(v.union(
      v.literal("1-10"),
      v.literal("11-50"),
      v.literal("51-200"),
      v.literal("201-500"),
      v.literal("501-1000"),
      v.literal("1000+")
    )),
    location: v.optional(v.string()),
    ownerId: v.string(),
    memberCount: v.number(),
    isVerified: v.boolean(),
    techStackPublic: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"])
    .index("by_industry", ["industry"]),

  companyMembers: defineTable({
    companyId: v.id("companies"),
    userId: v.string(),
    role: v.union(
      v.literal("owner"),
      v.literal("admin"),
      v.literal("member")
    ),
    title: v.optional(v.string()),
    joinedAt: v.number(),
    invitedBy: v.optional(v.string()),
  })
    .index("by_company", ["companyId"])
    .index("by_user", ["userId"])
    .index("by_company_user", ["companyId", "userId"]),

  companyInvites: defineTable({
    companyId: v.id("companies"),
    inviterId: v.string(),
    inviteeEmail: v.optional(v.string()),
    inviteeId: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined"),
      v.literal("expired")
    ),
    role: v.union(
      v.literal("admin"),
      v.literal("member")
    ),
    message: v.optional(v.string()),
    createdAt: v.number(),
    expiresAt: v.number(),
  })
    .index("by_company", ["companyId"])
    .index("by_invitee", ["inviteeId"])
    .index("by_email", ["inviteeEmail"])
    .index("by_status", ["status"]),

  companyTechStack: defineTable({
    companyId: v.id("companies"),
    toolId: v.id("tools"),
    category: v.string(),
    addedBy: v.string(),
    addedAt: v.number(),
    notes: v.optional(v.string()),
  })
    .index("by_company", ["companyId"])
    .index("by_tool", ["toolId"]),

  companySharedDecks: defineTable({
    companyId: v.id("companies"),
    deckId: v.id("userDecks"),
    sharedBy: v.string(),
    sharedAt: v.number(),
    isPinned: v.boolean(),
  })
    .index("by_company", ["companyId"])
    .index("by_deck", ["deckId"]),

  // ============================================
  // Notifications
  // ============================================
  notifications: defineTable({
    userId: v.string(),
    type: v.union(
      v.literal("achievement_unlocked"),
      v.literal("level_up"),
      v.literal("xp_earned"),
      v.literal("deck_shared"),
      v.literal("battle_result"),
      v.literal("review_response"),
      v.literal("system_announcement"),
      v.literal("tool_update"),
      v.literal("streak_reminder"),
      v.literal("welcome"),
      v.literal("quest_completed"),
      v.literal("friend_request"),
      v.literal("friend_accepted"),
      v.literal("group_invite"),
      v.literal("group_joined"),
      v.literal("company_invite"),
      v.literal("company_joined")
    ),
    title: v.string(),
    message: v.string(),
    metadata: v.optional(v.object({
      toolId: v.optional(v.id("tools")),
      achievementId: v.optional(v.id("achievements")),
      deckId: v.optional(v.id("userDecks")),
      battleId: v.optional(v.id("battleHistory")),
      xpAmount: v.optional(v.number()),
      level: v.optional(v.number()),
      link: v.optional(v.string()),
    })),
    icon: v.optional(v.string()),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"])
    .index("by_created", ["createdAt"]),
});
