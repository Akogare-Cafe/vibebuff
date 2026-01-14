import { query } from "./_generated/server";

export const checkToolsProsAndCons = query({
  handler: async (ctx) => {
    const tools = await ctx.db
      .query("tools")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    const missingOrEmptyPros = tools.filter(
      (tool) => !tool.pros || tool.pros.length === 0
    );
    
    const missingOrEmptyCons = tools.filter(
      (tool) => !tool.cons || tool.cons.length === 0
    );
    
    return {
      totalTools: tools.length,
      missingOrEmptyPros: missingOrEmptyPros.map((t) => ({
        name: t.name,
        slug: t.slug,
        _id: t._id,
        prosLength: t.pros?.length || 0,
      })),
      missingOrEmptyCons: missingOrEmptyCons.map((t) => ({
        name: t.name,
        slug: t.slug,
        _id: t._id,
        consLength: t.cons?.length || 0,
      })),
    };
  },
});
