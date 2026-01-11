import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all achievements
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("achievements").collect();
  },
});

// Get user's unlocked achievements
export const getUserAchievements = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const achievementsWithDetails = await Promise.all(
      userAchievements.map(async (ua) => {
        const achievement = await ctx.db.get(ua.achievementId);
        return { ...ua, achievement };
      })
    );

    return achievementsWithDetails.filter((a) => a.achievement !== null);
  },
});

// Get achievements with progress for a user
export const getAchievementsWithProgress = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const allAchievements = await ctx.db.query("achievements").collect();
    const userAchievements = await ctx.db
      .query("userAchievements")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId.toString()));

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
      .first();

    const progressMap: Record<string, number> = {
      tools_viewed: profile?.toolsViewed || 0,
      battles_won: profile?.battlesWon || 0,
      decks_created: profile?.decksCreated || 0,
      quests_completed: profile?.questsCompleted || 0,
      votes_cast: profile?.votescast || 0,
    };

    const achievementsWithProgress = allAchievements.map((achievement) => {
      const isUnlocked = unlockedIds.has(achievement._id.toString());
      const unlockData = userAchievements.find(
        (ua) => ua.achievementId.toString() === achievement._id.toString()
      );
      const currentProgress = progressMap[achievement.requirement.type] || 0;
      const progressPercent = Math.min(100, (currentProgress / achievement.requirement.count) * 100);

      return {
        ...achievement,
        isUnlocked,
        unlockedAt: unlockData?.unlockedAt,
        currentProgress,
        progressPercent,
        remaining: Math.max(0, achievement.requirement.count - currentProgress),
      };
    });

    return {
      achievements: achievementsWithProgress,
      stats: {
        total: allAchievements.length,
        unlocked: userAchievements.length,
        totalXpEarned: achievementsWithProgress
          .filter((a) => a.isUnlocked)
          .reduce((sum, a) => sum + a.xpReward, 0),
      },
    };
  },
});

// Check and unlock achievements for a user
export const checkAndUnlock = mutation({
  args: {
    userId: v.string(),
    actionType: v.string(),
    count: v.number(),
  },
  handler: async (ctx, args) => {
    // Get all achievements that match this action type
    const allAchievements = await ctx.db.query("achievements").collect();
    const matchingAchievements = allAchievements.filter(
      (a) => a.requirement.type === args.actionType && a.requirement.count <= args.count
    );

    const newlyUnlocked = [];

    for (const achievement of matchingAchievements) {
      // Check if already unlocked
      const existing = await ctx.db
        .query("userAchievements")
        .withIndex("by_user_achievement", (q) => 
          q.eq("userId", args.userId).eq("achievementId", achievement._id)
        )
        .first();

      if (!existing) {
        await ctx.db.insert("userAchievements", {
          userId: args.userId,
          achievementId: achievement._id,
          unlockedAt: Date.now(),
        });
        newlyUnlocked.push(achievement);

        // Award XP to user profile
        const profile = await ctx.db
          .query("userProfiles")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.userId))
          .first();

        if (profile) {
          const newXp = profile.xp + achievement.xpReward;
          const newLevel = Math.floor(newXp / 1000) + 1;
          const leveledUp = newLevel > profile.level;
          await ctx.db.patch(profile._id, { xp: newXp, level: newLevel });

          await ctx.db.insert("notifications", {
            userId: args.userId,
            type: "achievement_unlocked",
            title: "Achievement Unlocked!",
            message: `You earned "${achievement.name}" and gained ${achievement.xpReward} XP!`,
            icon: "Trophy",
            isRead: false,
            createdAt: Date.now(),
            metadata: {
              achievementId: achievement._id,
              xpAmount: achievement.xpReward,
              link: "/profile/achievements",
            },
          });

          if (leveledUp) {
            await ctx.db.insert("notifications", {
              userId: args.userId,
              type: "level_up",
              title: "Level Up!",
              message: `Congratulations! You've reached Level ${newLevel}!`,
              icon: "TrendingUp",
              isRead: false,
              createdAt: Date.now(),
              metadata: {
                level: newLevel,
                link: "/profile",
              },
            });
          }
        }
      }
    }

    return newlyUnlocked;
  },
});

// Clear and reseed achievements
export const reseedAchievements = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("achievements").collect();
    for (const achievement of existing) {
      await ctx.db.delete(achievement._id);
    }
    return { message: `Cleared ${existing.length} achievements` };
  },
});

// Seed achievements
export const seedAchievements = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("achievements").first();
    if (existing) return { message: "Achievements already seeded" };

    const achievements = [
      // ============================================
      // EXPLORATION ACHIEVEMENTS (15)
      // ============================================
      { slug: "first-steps", name: "First Steps", description: "View your first tool", icon: "Trophy", category: "exploration" as const, requirement: { type: "tools_viewed", count: 1 }, xpReward: 50, rarity: "common" as const },
      { slug: "getting-started", name: "Getting Started", description: "View 5 different tools", icon: "Compass", category: "exploration" as const, requirement: { type: "tools_viewed", count: 5 }, xpReward: 100, rarity: "common" as const },
      { slug: "deck-starter", name: "Deck Starter", description: "Add your first tool to a deck", icon: "Package", category: "exploration" as const, requirement: { type: "tools_collected", count: 1 }, xpReward: 100, rarity: "common" as const },
      { slug: "first-favorite", name: "First Favorite", description: "Add your first tool to favorites", icon: "Heart", category: "exploration" as const, requirement: { type: "favorites_added", count: 1 }, xpReward: 75, rarity: "common" as const },
      { slug: "first-comparison", name: "First Comparison", description: "Compare two tools for the first time", icon: "GitCompare", category: "exploration" as const, requirement: { type: "comparisons_made", count: 1 }, xpReward: 100, rarity: "common" as const },
      
      { slug: "tool-scout", name: "Tool Scout", description: "View 10 different tools", icon: "Search", category: "exploration" as const, requirement: { type: "tools_viewed", count: 10 }, xpReward: 150, rarity: "common" as const },
      { slug: "tool-explorer", name: "Tool Explorer", description: "View 50 different tools", icon: "Binoculars", category: "exploration" as const, requirement: { type: "tools_viewed", count: 50 }, xpReward: 500, rarity: "uncommon" as const },
      { slug: "tool-researcher", name: "Tool Researcher", description: "View 150 different tools", icon: "BookOpen", category: "exploration" as const, requirement: { type: "tools_viewed", count: 150 }, xpReward: 1000, rarity: "rare" as const },
      { slug: "tool-scholar", name: "Tool Scholar", description: "View 300 different tools", icon: "GraduationCap", category: "exploration" as const, requirement: { type: "tools_viewed", count: 300 }, xpReward: 2000, rarity: "epic" as const },
      { slug: "tool-sage", name: "Tool Sage", description: "View 500 different tools - You've seen it all!", icon: "Brain", category: "exploration" as const, requirement: { type: "tools_viewed", count: 500 }, xpReward: 5000, rarity: "legendary" as const },
      
      { slug: "curious-mind", name: "Curious Mind", description: "View tools from 5 different categories", icon: "Lightbulb", category: "exploration" as const, requirement: { type: "categories_explored", count: 5 }, xpReward: 200, rarity: "common" as const },
      { slug: "category-hopper", name: "Category Hopper", description: "View tools from 10 different categories", icon: "Shuffle", category: "exploration" as const, requirement: { type: "categories_explored", count: 10 }, xpReward: 500, rarity: "uncommon" as const },
      { slug: "omniscient", name: "Omniscient", description: "View tools from all categories", icon: "Eye", category: "exploration" as const, requirement: { type: "categories_explored", count: 15 }, xpReward: 1500, rarity: "rare" as const },
      
      { slug: "comparison-curious", name: "Comparison Curious", description: "Compare tools 5 times", icon: "GitCompare", category: "exploration" as const, requirement: { type: "comparisons_made", count: 5 }, xpReward: 200, rarity: "common" as const },
      { slug: "comparison-connoisseur", name: "Comparison Connoisseur", description: "Compare tools 25 times", icon: "Scale", category: "exploration" as const, requirement: { type: "comparisons_made", count: 25 }, xpReward: 750, rarity: "rare" as const },
      
      // ============================================
      // COLLECTION ACHIEVEMENTS (15)
      // ============================================
      { slug: "deck-builder", name: "Deck Builder", description: "Create your first deck", icon: "Layers", category: "collection" as const, requirement: { type: "decks_created", count: 1 }, xpReward: 200, rarity: "common" as const },
      { slug: "stack-architect", name: "Stack Architect", description: "Create 3 different decks", icon: "LayoutGrid", category: "collection" as const, requirement: { type: "decks_created", count: 3 }, xpReward: 400, rarity: "uncommon" as const },
      { slug: "stack-master", name: "Stack Master", description: "Create 5 different decks", icon: "Boxes", category: "collection" as const, requirement: { type: "decks_created", count: 5 }, xpReward: 600, rarity: "uncommon" as const },
      { slug: "stack-collector", name: "Stack Collector", description: "Create 10 different decks", icon: "Library", category: "collection" as const, requirement: { type: "decks_created", count: 10 }, xpReward: 1000, rarity: "rare" as const },
      { slug: "stack-hoarder", name: "Stack Hoarder", description: "Create 20 different decks", icon: "Warehouse", category: "collection" as const, requirement: { type: "decks_created", count: 20 }, xpReward: 2000, rarity: "epic" as const },
      { slug: "stack-emperor", name: "Stack Emperor", description: "Create 50 different decks", icon: "Castle", category: "collection" as const, requirement: { type: "decks_created", count: 50 }, xpReward: 5000, rarity: "legendary" as const },
      
      { slug: "tool-collector", name: "Tool Collector", description: "Add 10 tools to your decks", icon: "Package", category: "collection" as const, requirement: { type: "tools_collected", count: 10 }, xpReward: 200, rarity: "common" as const },
      { slug: "tool-gatherer", name: "Tool Gatherer", description: "Add 50 tools to your decks", icon: "PackagePlus", category: "collection" as const, requirement: { type: "tools_collected", count: 50 }, xpReward: 600, rarity: "uncommon" as const },
      { slug: "tool-amasser", name: "Tool Amasser", description: "Add 100 tools to your decks", icon: "Boxes", category: "collection" as const, requirement: { type: "tools_collected", count: 100 }, xpReward: 1200, rarity: "rare" as const },
      
      { slug: "rare-finder", name: "Rare Finder", description: "Add 5 rare tools to your decks", icon: "Gem", category: "collection" as const, requirement: { type: "rare_tools_collected", count: 5 }, xpReward: 400, rarity: "uncommon" as const },
      { slug: "legendary-hunter", name: "Legendary Hunter", description: "Add 10 legendary tools to your decks", icon: "Flame", category: "collection" as const, requirement: { type: "legendary_tools_collected", count: 10 }, xpReward: 1000, rarity: "rare" as const },
      { slug: "mythic-seeker", name: "Mythic Seeker", description: "Add 25 legendary tools to your decks", icon: "Sparkles", category: "collection" as const, requirement: { type: "legendary_tools_collected", count: 25 }, xpReward: 2500, rarity: "epic" as const },
      
      { slug: "favorite-picker", name: "Favorite Picker", description: "Add 5 tools to favorites", icon: "Heart", category: "collection" as const, requirement: { type: "favorites_added", count: 5 }, xpReward: 150, rarity: "common" as const },
      { slug: "favorite-curator", name: "Favorite Curator", description: "Add 20 tools to favorites", icon: "HeartHandshake", category: "collection" as const, requirement: { type: "favorites_added", count: 20 }, xpReward: 500, rarity: "uncommon" as const },
      { slug: "favorite-connoisseur", name: "Favorite Connoisseur", description: "Add 50 tools to favorites", icon: "Bookmark", category: "collection" as const, requirement: { type: "favorites_added", count: 50 }, xpReward: 1200, rarity: "rare" as const },
      
      // ============================================
      // MASTERY ACHIEVEMENTS (18)
      // ============================================
      { slug: "first-blood", name: "First Blood", description: "Win your first battle", icon: "Swords", category: "mastery" as const, requirement: { type: "battles_won", count: 1 }, xpReward: 100, rarity: "common" as const },
      { slug: "battle-ready", name: "Battle Ready", description: "Win 5 battles", icon: "Shield", category: "mastery" as const, requirement: { type: "battles_won", count: 5 }, xpReward: 300, rarity: "uncommon" as const },
      { slug: "battle-veteran", name: "Battle Veteran", description: "Win 10 battles", icon: "ShieldCheck", category: "mastery" as const, requirement: { type: "battles_won", count: 10 }, xpReward: 500, rarity: "uncommon" as const },
      { slug: "battle-hardened", name: "Battle Hardened", description: "Win 25 battles", icon: "Medal", category: "mastery" as const, requirement: { type: "battles_won", count: 25 }, xpReward: 1000, rarity: "rare" as const },
      { slug: "champion", name: "Champion", description: "Win 50 battles", icon: "Award", category: "mastery" as const, requirement: { type: "battles_won", count: 50 }, xpReward: 2000, rarity: "epic" as const },
      { slug: "legendary-warrior", name: "Legendary Warrior", description: "Win 100 battles", icon: "Crown", category: "mastery" as const, requirement: { type: "battles_won", count: 100 }, xpReward: 5000, rarity: "legendary" as const },
      
      { slug: "level-5", name: "Rising Star", description: "Reach level 5", icon: "TrendingUp", category: "mastery" as const, requirement: { type: "level_reached", count: 5 }, xpReward: 200, rarity: "common" as const },
      { slug: "level-10", name: "Established", description: "Reach level 10", icon: "Star", category: "mastery" as const, requirement: { type: "level_reached", count: 10 }, xpReward: 500, rarity: "uncommon" as const },
      { slug: "level-25", name: "Veteran", description: "Reach level 25", icon: "Zap", category: "mastery" as const, requirement: { type: "level_reached", count: 25 }, xpReward: 1500, rarity: "rare" as const },
      { slug: "level-50", name: "Elite", description: "Reach level 50", icon: "Flame", category: "mastery" as const, requirement: { type: "level_reached", count: 50 }, xpReward: 3000, rarity: "epic" as const },
      { slug: "level-100", name: "Legendary", description: "Reach level 100", icon: "Sparkles", category: "mastery" as const, requirement: { type: "level_reached", count: 100 }, xpReward: 10000, rarity: "legendary" as const },
      
      { slug: "budget-warrior", name: "Budget Warrior", description: "Build a full stack under $50/mo", icon: "Coins", category: "mastery" as const, requirement: { type: "budget_deck_created", count: 1 }, xpReward: 500, rarity: "rare" as const },
      { slug: "free-spirit", name: "Free Spirit", description: "Build a deck with only free tools", icon: "Gift", category: "mastery" as const, requirement: { type: "free_deck_created", count: 1 }, xpReward: 600, rarity: "rare" as const },
      { slug: "open-source-advocate", name: "Open Source Advocate", description: "Build a deck with only OSS tools", icon: "Github", category: "mastery" as const, requirement: { type: "oss_deck_created", count: 1 }, xpReward: 600, rarity: "rare" as const },
      { slug: "enterprise-architect", name: "Enterprise Architect", description: "Build a deck with enterprise-grade tools", icon: "Building", category: "mastery" as const, requirement: { type: "enterprise_deck_created", count: 1 }, xpReward: 800, rarity: "epic" as const },
      
      { slug: "mastery-initiate", name: "Mastery Initiate", description: "Reach apprentice mastery with any tool", icon: "MasteryInitiate", category: "mastery" as const, requirement: { type: "tool_mastery_apprentice", count: 1 }, xpReward: 300, rarity: "common" as const },
      { slug: "mastery-journeyman", name: "Mastery Journeyman", description: "Reach journeyman mastery with 3 tools", icon: "MasteryJourneyman", category: "mastery" as const, requirement: { type: "tool_mastery_journeyman", count: 3 }, xpReward: 800, rarity: "uncommon" as const },
      { slug: "mastery-expert", name: "Mastery Expert", description: "Reach expert mastery with 5 tools", icon: "MasteryExpert", category: "mastery" as const, requirement: { type: "tool_mastery_expert", count: 5 }, xpReward: 2000, rarity: "rare" as const },
      
      // ============================================
      // SOCIAL ACHIEVEMENTS (12)
      // ============================================
      { slug: "party-starter", name: "Party Starter", description: "Create your first party", icon: "PartyPopper", category: "social" as const, requirement: { type: "parties_created", count: 1 }, xpReward: 200, rarity: "common" as const },
      { slug: "party-host", name: "Party Host", description: "Create 3 parties", icon: "Users", category: "social" as const, requirement: { type: "parties_created", count: 3 }, xpReward: 500, rarity: "uncommon" as const },
      { slug: "party-legend", name: "Party Legend", description: "Create 10 parties", icon: "Crown", category: "social" as const, requirement: { type: "parties_created", count: 10 }, xpReward: 1500, rarity: "rare" as const },
      
      { slug: "team-player", name: "Team Player", description: "Join 3 parties", icon: "UserPlus", category: "social" as const, requirement: { type: "parties_joined", count: 3 }, xpReward: 300, rarity: "uncommon" as const },
      { slug: "social-butterfly", name: "Social Butterfly", description: "Join 10 parties", icon: "UsersRound", category: "social" as const, requirement: { type: "parties_joined", count: 10 }, xpReward: 800, rarity: "rare" as const },
      
      { slug: "voice-heard", name: "Voice Heard", description: "Cast 10 votes", icon: "Vote", category: "social" as const, requirement: { type: "votes_cast", count: 10 }, xpReward: 250, rarity: "common" as const },
      { slug: "active-voter", name: "Active Voter", description: "Cast 50 votes", icon: "ThumbsUp", category: "social" as const, requirement: { type: "votes_cast", count: 50 }, xpReward: 600, rarity: "uncommon" as const },
      { slug: "democracy-champion", name: "Democracy Champion", description: "Cast 200 votes", icon: "Megaphone", category: "social" as const, requirement: { type: "votes_cast", count: 200 }, xpReward: 1500, rarity: "rare" as const },
      
      { slug: "deck-sharer", name: "Deck Sharer", description: "Share your first public deck", icon: "Share2", category: "social" as const, requirement: { type: "decks_shared", count: 1 }, xpReward: 200, rarity: "common" as const },
      { slug: "community-contributor", name: "Community Contributor", description: "Share 5 public decks", icon: "Globe", category: "social" as const, requirement: { type: "decks_shared", count: 5 }, xpReward: 600, rarity: "uncommon" as const },
      { slug: "influencer", name: "Influencer", description: "Have your decks viewed 100 times", icon: "Eye", category: "social" as const, requirement: { type: "deck_views_received", count: 100 }, xpReward: 1000, rarity: "rare" as const },
      { slug: "trendsetter", name: "Trendsetter", description: "Have your decks copied 10 times", icon: "Copy", category: "social" as const, requirement: { type: "deck_copies_received", count: 10 }, xpReward: 2000, rarity: "epic" as const },
    ];

    for (const achievement of achievements) {
      await ctx.db.insert("achievements", achievement);
    }

    return { message: "Achievements seeded successfully" };
  },
});
