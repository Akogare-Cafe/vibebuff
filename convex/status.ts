import { query } from "./_generated/server";

export const healthCheck = query({
  args: {},
  handler: async (ctx) => {
    const startTime = Date.now();
    
    try {
      const toolCount = await ctx.db.query("tools").collect();
      const categoryCount = await ctx.db.query("categories").collect();
      const userCount = await ctx.db.query("userProfiles").collect();
      
      const responseTime = Date.now() - startTime;
      
      return {
        status: "healthy" as const,
        responseTime,
        tables: {
          tools: toolCount.length,
          categories: categoryCount.length,
          users: userCount.length,
        },
        timestamp: Date.now(),
      };
    } catch (error) {
      return {
        status: "unhealthy" as const,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      };
    }
  },
});
