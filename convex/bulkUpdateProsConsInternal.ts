import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const bulkUpdateToolProsCons = internalMutation({
  args: {
    updates: v.array(
      v.object({
        toolId: v.id("tools"),
        pros: v.array(v.string()),
        cons: v.array(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    let updated = 0;
    const errors: string[] = [];

    for (const update of args.updates) {
      try {
        await ctx.db.patch(update.toolId, {
          pros: update.pros,
          cons: update.cons,
        });
        updated++;
      } catch (error) {
        errors.push(`Failed to update ${update.toolId}: ${error}`);
      }
    }

    return {
      updated,
      total: args.updates.length,
      errors,
    };
  },
});
