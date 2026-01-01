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
          await ctx.db.patch(profile._id, { xp: newXp, level: newLevel });
        }
      }
    }

    return newlyUnlocked;
  },
});

// Seed achievements
export const seedAchievements = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query("achievements").first();
    if (existing) return { message: "Achievements already seeded" };

    const achievements = [
      // Exploration
      { slug: "first-quest", name: "First Quest", description: "Complete your first recommendation quest", icon: "Trophy", category: "exploration" as const, requirement: { type: "quests_completed", count: 1 }, xpReward: 100, rarity: "common" as const },
      { slug: "tool-scout", name: "Tool Scout", description: "View 10 different tools", icon: "Search", category: "exploration" as const, requirement: { type: "tools_viewed", count: 10 }, xpReward: 150, rarity: "common" as const },
      { slug: "tool-explorer", name: "Tool Explorer", description: "View 50 different tools", icon: "Map", category: "exploration" as const, requirement: { type: "tools_viewed", count: 50 }, xpReward: 500, rarity: "uncommon" as const },
      { slug: "tool-master", name: "Tool Master", description: "View 100 different tools", icon: "Crown", category: "exploration" as const, requirement: { type: "tools_viewed", count: 100 }, xpReward: 1000, rarity: "rare" as const },
      
      // Collection
      { slug: "deck-builder", name: "Deck Builder", description: "Create your first deck", icon: "Layers", category: "collection" as const, requirement: { type: "decks_created", count: 1 }, xpReward: 200, rarity: "common" as const },
      { slug: "stack-master", name: "Stack Master", description: "Create 5 different decks", icon: "Swords", category: "collection" as const, requirement: { type: "decks_created", count: 5 }, xpReward: 500, rarity: "uncommon" as const },
      { slug: "legendary-hunter", name: "Legendary Hunter", description: "Add 10 legendary tools to your decks", icon: "Flame", category: "collection" as const, requirement: { type: "legendary_tools_collected", count: 10 }, xpReward: 750, rarity: "rare" as const },
      
      // Battles
      { slug: "first-blood", name: "First Blood", description: "Win your first battle", icon: "Swords", category: "mastery" as const, requirement: { type: "battles_won", count: 1 }, xpReward: 100, rarity: "common" as const },
      { slug: "battle-veteran", name: "Battle Veteran", description: "Win 10 battles", icon: "Shield", category: "mastery" as const, requirement: { type: "battles_won", count: 10 }, xpReward: 400, rarity: "uncommon" as const },
      { slug: "champion", name: "Champion", description: "Win 50 battles", icon: "Medal", category: "mastery" as const, requirement: { type: "battles_won", count: 50 }, xpReward: 1500, rarity: "legendary" as const },
      
      // Social
      { slug: "party-starter", name: "Party Starter", description: "Create your first party", icon: "PartyPopper", category: "social" as const, requirement: { type: "parties_created", count: 1 }, xpReward: 200, rarity: "common" as const },
      { slug: "team-player", name: "Team Player", description: "Join 3 parties", icon: "Users", category: "social" as const, requirement: { type: "parties_joined", count: 3 }, xpReward: 300, rarity: "uncommon" as const },
      { slug: "voice-heard", name: "Voice Heard", description: "Cast 10 votes for legendary tools", icon: "Vote", category: "social" as const, requirement: { type: "votes_cast", count: 10 }, xpReward: 250, rarity: "uncommon" as const },
      
      // Special
      { slug: "budget-warrior", name: "Budget Warrior", description: "Build a full stack under $50/mo", icon: "Coins", category: "mastery" as const, requirement: { type: "budget_deck_created", count: 1 }, xpReward: 500, rarity: "rare" as const },
      { slug: "open-source-advocate", name: "Open Source Advocate", description: "Build a deck with only OSS tools", icon: "Star", category: "mastery" as const, requirement: { type: "oss_deck_created", count: 1 }, xpReward: 600, rarity: "rare" as const },
    ];

    for (const achievement of achievements) {
      await ctx.db.insert("achievements", achievement);
    }

    return { message: "Achievements seeded successfully" };
  },
});
