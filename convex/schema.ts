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

  // ============================================
  // NEW FEATURE 1: Daily Challenges & Bounty Board
  // ============================================
  challenges: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    type: v.union(v.literal("daily"), v.literal("weekly"), v.literal("special")),
    category: v.union(
      v.literal("building"),
      v.literal("exploration"),
      v.literal("social"),
      v.literal("battle")
    ),
    requirement: v.object({
      type: v.string(),  // e.g., "create_deck_budget", "win_battles", "view_tools"
      target: v.number(),
      conditions: v.optional(v.object({
        maxBudget: v.optional(v.number()),
        categorySlug: v.optional(v.string()),
        toolRarity: v.optional(v.string()),
        openSourceOnly: v.optional(v.boolean()),
      })),
    }),
    rewards: v.object({
      xp: v.number(),
      badge: v.optional(v.string()),
      title: v.optional(v.string()),
    }),
    activeFrom: v.number(),
    activeUntil: v.number(),
    difficulty: v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"), v.literal("legendary")),
  })
    .index("by_slug", ["slug"])
    .index("by_type", ["type"])
    .index("by_active", ["activeFrom", "activeUntil"]),

  userChallengeProgress: defineTable({
    userId: v.string(),
    challengeId: v.id("challenges"),
    progress: v.number(),
    completedAt: v.optional(v.number()),
    claimedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_user_challenge", ["userId", "challengeId"]),

  // ============================================
  // NEW FEATURE 2: Tool Mastery & Skill Points
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
  // NEW FEATURE 3: Stack Templates (Netdecking)
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
    createdBy: v.optional(v.string()),  // null = official template
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_featured", ["isFeatured"]),

  // ============================================
  // NEW FEATURE 4: Gacha/Pack System
  // ============================================
  packTypes: defineTable({
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    cost: v.union(v.literal("free"), v.literal("premium")),
    cardCount: v.number(),
    rarityWeights: v.object({
      common: v.number(),
      uncommon: v.number(),
      rare: v.number(),
      legendary: v.number(),
    }),
    categoryFilter: v.optional(v.id("categories")),
    isActive: v.boolean(),
  }).index("by_slug", ["slug"]),

  userPackOpens: defineTable({
    userId: v.string(),
    packTypeId: v.id("packTypes"),
    toolsRevealed: v.array(v.id("tools")),
    openedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_pack", ["packTypeId"]),

  userCollection: defineTable({
    userId: v.string(),
    toolId: v.id("tools"),
    obtainedAt: v.number(),
    obtainedFrom: v.union(
      v.literal("pack"),
      v.literal("quest"),
      v.literal("challenge"),
      v.literal("loot"),
      v.literal("starter")
    ),
    isNew: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_tool", ["userId", "toolId"]),

  // ============================================
  // NEW FEATURE 5: Tool Tier Lists
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
  // NEW FEATURE 6: Tool Fusion System
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
  // NEW FEATURE 7: Tool Reviews & Reputation
  // ============================================
  toolReviews: defineTable({
    userId: v.string(),
    toolId: v.id("tools"),
    rating: v.number(),  // 1-5
    title: v.string(),
    content: v.string(),
    pros: v.array(v.string()),
    cons: v.array(v.string()),
    usedFor: v.optional(v.string()),  // What project they used it for
    shippedWith: v.boolean(),  // Did they ship a project with this tool?
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
  // NEW FEATURE 8: Seasonal Battle Pass
  // ============================================
  seasons: defineTable({
    slug: v.string(),
    name: v.string(),
    theme: v.string(),
    description: v.string(),
    startDate: v.number(),
    endDate: v.number(),
    isActive: v.boolean(),
    maxLevel: v.number(),
    xpPerLevel: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["isActive"]),

  battlePassRewards: defineTable({
    seasonId: v.id("seasons"),
    level: v.number(),
    track: v.union(v.literal("free"), v.literal("premium")),
    rewardType: v.union(
      v.literal("xp_boost"),
      v.literal("title"),
      v.literal("badge"),
      v.literal("profile_frame"),
      v.literal("pack"),
      v.literal("exclusive_tool_skin")
    ),
    rewardValue: v.string(),
    rewardIcon: v.optional(v.string()),
  })
    .index("by_season", ["seasonId"])
    .index("by_season_level", ["seasonId", "level"]),

  userSeasonProgress: defineTable({
    userId: v.string(),
    seasonId: v.id("seasons"),
    xp: v.number(),
    level: v.number(),
    isPremium: v.boolean(),
    claimedRewards: v.array(v.number()),  // Array of levels claimed
  })
    .index("by_user", ["userId"])
    .index("by_user_season", ["userId", "seasonId"]),

  // ============================================
  // NEW FEATURE 9: Tool Draft Mode
  // ============================================
  draftLobbies: defineTable({
    code: v.string(),
    name: v.string(),
    hostId: v.string(),
    status: v.union(
      v.literal("waiting"),
      v.literal("drafting"),
      v.literal("voting"),
      v.literal("completed")
    ),
    settings: v.object({
      maxPlayers: v.number(),
      picksPerRound: v.number(),
      totalRounds: v.number(),
      categoryFilter: v.optional(v.id("categories")),
      timePerPick: v.number(),  // seconds
    }),
    currentRound: v.number(),
    currentPickerIndex: v.number(),
    availableToolIds: v.array(v.id("tools")),
    createdAt: v.number(),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
  })
    .index("by_code", ["code"])
    .index("by_host", ["hostId"])
    .index("by_status", ["status"]),

  draftPlayers: defineTable({
    lobbyId: v.id("draftLobbies"),
    userId: v.string(),
    pickOrder: v.number(),
    pickedToolIds: v.array(v.id("tools")),
    isReady: v.boolean(),
    joinedAt: v.number(),
  })
    .index("by_lobby", ["lobbyId"])
    .index("by_user", ["userId"]),

  draftVotes: defineTable({
    lobbyId: v.id("draftLobbies"),
    oderId: v.string(),
    votedForUserId: v.string(),
    votedAt: v.number(),
  }).index("by_lobby", ["lobbyId"]),

  // ============================================
  // NEW FEATURE 10: Roguelike Quest Mode
  // ============================================
  roguelikeRuns: defineTable({
    userId: v.string(),
    seed: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("completed"),
      v.literal("failed")
    ),
    currentRoom: v.number(),
    maxRooms: v.number(),
    hp: v.number(),
    maxHp: v.number(),
    score: v.number(),
    selectedToolIds: v.array(v.id("tools")),
    roomHistory: v.array(v.object({
      roomNumber: v.number(),
      challenge: v.string(),
      selectedToolId: v.optional(v.id("tools")),
      wasCorrect: v.boolean(),
      xpGained: v.number(),
    })),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  roguelikeLeaderboard: defineTable({
    userId: v.string(),
    runId: v.id("roguelikeRuns"),
    score: v.number(),
    roomsCleared: v.number(),
    achievedAt: v.number(),
  })
    .index("by_score", ["score"])
    .index("by_user", ["userId"]),

  // ============================================
  // TOOL POPULARITY TRACKING
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
  // NEW FEATURE 11: Guild System & Team Stacks
  // ============================================
  guilds: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    icon: v.string(),
    banner: v.optional(v.string()),
    ownerId: v.string(),
    isPublic: v.boolean(),
    maxMembers: v.number(),
    xp: v.number(),
    level: v.number(),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"]),

  guildMembers: defineTable({
    guildId: v.id("guilds"),
    userId: v.string(),
    role: v.union(v.literal("owner"), v.literal("admin"), v.literal("member")),
    joinedAt: v.number(),
    contributedXp: v.number(),
  })
    .index("by_guild", ["guildId"])
    .index("by_user", ["userId"]),

  guildStacks: defineTable({
    guildId: v.id("guilds"),
    name: v.string(),
    description: v.string(),
    toolIds: v.array(v.id("tools")),
    createdBy: v.string(),
    upvotes: v.number(),
    createdAt: v.number(),
  }).index("by_guild", ["guildId"]),

  guildChallenges: defineTable({
    guildId: v.id("guilds"),
    opponentGuildId: v.id("guilds"),
    challengeType: v.union(v.literal("battle"), v.literal("build"), v.literal("quiz")),
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("completed")),
    winnerId: v.optional(v.id("guilds")),
    stakes: v.object({
      xp: v.number(),
      badge: v.optional(v.string()),
    }),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_guild", ["guildId"])
    .index("by_status", ["status"]),

  // ============================================
  // NEW FEATURE 12: Tool Evolution & Prestige
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
  // NEW FEATURE 13: Stack Simulator / Sandbox
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
  // NEW FEATURE 14: Trading Post / Marketplace
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
  // NEW FEATURE 15: Mentor/Apprentice System
  // ============================================
  mentorships: defineTable({
    odorId: v.string(),
    apprenticeId: v.string(),
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("completed"), v.literal("cancelled")),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    mentorXpEarned: v.number(),
    apprenticeXpEarned: v.number(),
  })
    .index("by_mentor", ["odorId"])
    .index("by_apprentice", ["apprenticeId"])
    .index("by_status", ["status"]),

  mentorChallenges: defineTable({
    mentorshipId: v.id("mentorships"),
    createdBy: v.string(),
    title: v.string(),
    description: v.string(),
    requirement: v.object({
      type: v.string(),
      target: v.number(),
    }),
    reward: v.object({
      mentorXp: v.number(),
      apprenticeXp: v.number(),
    }),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("expired")),
    progress: v.number(),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_mentorship", ["mentorshipId"]),

  // ============================================
  // NEW FEATURE 16: Weekly Meta Reports
  // ============================================
  metaReports: defineTable({
    weekStart: v.number(),
    weekEnd: v.number(),
    generatedAt: v.number(),
    toolTrends: v.array(v.object({
      toolId: v.id("tools"),
      previousRank: v.number(),
      currentRank: v.number(),
      usageChange: v.number(),
      sentiment: v.union(v.literal("rising"), v.literal("stable"), v.literal("falling")),
    })),
    categoryTrends: v.array(v.object({
      categoryId: v.id("categories"),
      topTools: v.array(v.id("tools")),
      emergingTools: v.array(v.id("tools")),
    })),
    predictions: v.array(v.object({
      prediction: v.string(),
      confidence: v.number(),
    })),
  }).index("by_week", ["weekStart"]),

  metaPredictionBets: defineTable({
    userId: v.string(),
    reportId: v.id("metaReports"),
    predictionIndex: v.number(),
    betAmount: v.number(),
    outcome: v.optional(v.union(v.literal("won"), v.literal("lost"))),
    payout: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_report", ["reportId"]),

  // ============================================
  // NEW FEATURE 17: Achievement Showcase / Trophy Room
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
  // NEW FEATURE 18: Tool Lore & Encyclopedia
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
  // NEW FEATURE 19: Seasonal Events
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
  // NEW FEATURE 20: Stack Replay & Highlight Reel
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
  // NEW FEATURE 21: Stack Architect Mode (Puzzles)
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
  // NEW FEATURE 22: Tool Debate Arena
  // ============================================
  debates: defineTable({
    tool1Id: v.id("tools"),
    tool2Id: v.id("tools"),
    topic: v.string(),
    status: v.union(
      v.literal("open"),
      v.literal("voting"),
      v.literal("closed")
    ),
    pro1UserId: v.optional(v.string()),
    pro2UserId: v.optional(v.string()),
    judgeUserIds: v.optional(v.array(v.string())),
    winnerId: v.optional(v.id("tools")),
    isFeatured: v.boolean(),
    startedAt: v.number(),
    votingEndsAt: v.optional(v.number()),
    closedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_tools", ["tool1Id", "tool2Id"])
    .index("by_featured", ["isFeatured"]),

  debateArguments: defineTable({
    debateId: v.id("debates"),
    userId: v.string(),
    forToolId: v.id("tools"),
    argumentType: v.union(
      v.literal("opening"),
      v.literal("rebuttal"),
      v.literal("closing")
    ),
    content: v.string(),
    upvotes: v.number(),
    createdAt: v.number(),
  })
    .index("by_debate", ["debateId"])
    .index("by_user", ["userId"]),

  debateVotes: defineTable({
    debateId: v.id("debates"),
    oderId: v.string(),
    votedForToolId: v.id("tools"),
    isJudgeVote: v.boolean(),
    votedAt: v.number(),
  })
    .index("by_debate", ["debateId"])
    .index("by_user", ["oderId"]),

  // ============================================
  // NEW FEATURE 23: Tech Stack Time Machine
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
  // NEW FEATURE 24: Stack Interview Prep
  // ============================================
  interviewScenarios: defineTable({
    slug: v.string(),
    title: v.string(),
    company: v.optional(v.string()),
    difficulty: v.union(
      v.literal("junior"),
      v.literal("mid"),
      v.literal("senior"),
      v.literal("staff")
    ),
    description: v.string(),
    requirements: v.array(v.object({
      category: v.string(),
      description: v.string(),
      weight: v.number(),
    })),
    followUpQuestions: v.array(v.object({
      question: v.string(),
      expectedTopics: v.array(v.string()),
    })),
    timeLimit: v.number(),
    rubric: v.object({
      scalability: v.number(),
      cost: v.number(),
      maintainability: v.number(),
      innovation: v.number(),
    }),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_difficulty", ["difficulty"])
    .index("by_company", ["company"]),

  interviewAttempts: defineTable({
    scenarioId: v.id("interviewScenarios"),
    userId: v.string(),
    toolIds: v.array(v.id("tools")),
    answers: v.array(v.object({
      questionIndex: v.number(),
      answer: v.string(),
    })),
    timeSpent: v.number(),
    score: v.number(),
    feedback: v.optional(v.string()),
    peerReviews: v.array(v.object({
      oderId: v.string(),
      score: v.number(),
      comment: v.string(),
      reviewedAt: v.number(),
    })),
    submittedAt: v.number(),
  })
    .index("by_scenario", ["scenarioId"])
    .index("by_user", ["userId"])
    .index("by_score", ["scenarioId", "score"]),

  // ============================================
  // NEW FEATURE 25: Tool Relationship Map
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
  // NEW FEATURE 26: Startup Stack Stories
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
  // NEW FEATURE 27: Tool Compatibility Matrix
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
  // NEW FEATURE 28: Tech Trend Predictions Market
  // ============================================
  predictions: defineTable({
    slug: v.string(),
    title: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("tool_growth"),
      v.literal("tool_decline"),
      v.literal("new_release"),
      v.literal("acquisition"),
      v.literal("trend"),
      v.literal("custom")
    ),
    targetToolId: v.optional(v.id("tools")),
    targetMetric: v.optional(v.string()),
    targetValue: v.optional(v.number()),
    resolutionCriteria: v.string(),
    resolutionDate: v.number(),
    status: v.union(
      v.literal("open"),
      v.literal("closed"),
      v.literal("resolved_yes"),
      v.literal("resolved_no")
    ),
    totalYesStake: v.number(),
    totalNoStake: v.number(),
    createdBy: v.string(),
    isExpertPrediction: v.boolean(),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .index("by_resolution_date", ["resolutionDate"]),

  predictionBets: defineTable({
    predictionId: v.id("predictions"),
    oderId: v.string(),
    position: v.union(v.literal("yes"), v.literal("no")),
    stakeAmount: v.number(),
    confidence: v.number(),
    payout: v.optional(v.number()),
    placedAt: v.number(),
  })
    .index("by_prediction", ["predictionId"])
    .index("by_user", ["oderId"]),

  predictionLeaderboard: defineTable({
    oderId: v.string(),
    totalPredictions: v.number(),
    correctPredictions: v.number(),
    accuracy: v.number(),
    totalProfit: v.number(),
    streak: v.number(),
    bestStreak: v.number(),
    lastUpdated: v.number(),
  })
    .index("by_accuracy", ["accuracy"])
    .index("by_profit", ["totalProfit"]),

  // ============================================
  // NEW FEATURE 29: Stack Speedrun Mode
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
  // NEW FEATURE 30: Tool Graveyard & Resurrection
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
});
