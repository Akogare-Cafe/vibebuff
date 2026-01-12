import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

export const analyzePackageJson = action({
  args: {
    packageJsonContent: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{
    score: number;
    grade: string;
    matchedTools: Array<{
      _id: string;
      name: string;
      slug: string;
      tagline: string;
      logoUrl?: string;
      pricingModel: string;
      githubStars?: number;
      npmDownloadsWeekly?: number;
      isOpenSource: boolean;
      isFeatured: boolean;
      categoryName?: string;
      packageName: string;
    }>;
    unmatchedPackages: string[];
    stats: {
      totalDependencies: number;
      matchedCount: number;
      unmatchedCount: number;
      openSourceCount: number;
      featuredCount: number;
      categoryBreakdown: Record<string, number>;
      healthScore: number;
      modernityScore: number;
      popularityScore: number;
    };
    recommendations: string[];
  }> => {
    let packageJson: {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      name?: string;
      version?: string;
    };
    
    try {
      packageJson = JSON.parse(args.packageJsonContent);
    } catch {
      throw new Error("Invalid JSON format. Please provide a valid package.json file.");
    }

    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};
    const allPackages = [
      ...Object.keys(dependencies),
      ...Object.keys(devDependencies),
    ];

    if (allPackages.length === 0) {
      throw new Error("No dependencies found in package.json");
    }

    const result = await ctx.runQuery(api.packageAnalyzer.matchPackagesToTools, {
      packageNames: allPackages,
    });

    const matchedTools = result.matchedTools;
    const unmatchedPackages = result.unmatchedPackages;

    const openSourceCount = matchedTools.filter((t) => t.isOpenSource).length;
    const featuredCount = matchedTools.filter((t) => t.isFeatured).length;

    const categoryBreakdown: Record<string, number> = {};
    for (const tool of matchedTools) {
      const cat = tool.categoryName || "Other";
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    }

    const matchRate = matchedTools.length / allPackages.length;
    const healthScore = Math.round(matchRate * 100);

    let modernityScore = 50;
    const modernPackages = ["next", "react", "vue", "svelte", "astro", "vite", "bun", "deno", "typescript", "tailwindcss"];
    const hasModernPackages = allPackages.filter((p) => modernPackages.some((m) => p.includes(m))).length;
    modernityScore = Math.min(100, 50 + hasModernPackages * 10);

    let popularityScore = 50;
    const avgStars = matchedTools.reduce((sum, t) => sum + (t.githubStars || 0), 0) / Math.max(matchedTools.length, 1);
    if (avgStars > 50000) popularityScore = 100;
    else if (avgStars > 20000) popularityScore = 85;
    else if (avgStars > 10000) popularityScore = 70;
    else if (avgStars > 5000) popularityScore = 60;

    const overallScore = Math.round(
      healthScore * 0.4 +
      modernityScore * 0.3 +
      popularityScore * 0.3
    );

    let grade: string;
    if (overallScore >= 90) grade = "S";
    else if (overallScore >= 80) grade = "A";
    else if (overallScore >= 70) grade = "B";
    else if (overallScore >= 60) grade = "C";
    else if (overallScore >= 50) grade = "D";
    else grade = "F";

    const recommendations: string[] = [];
    
    if (!categoryBreakdown["Testing"]) {
      recommendations.push("Consider adding testing tools like Jest, Vitest, or Playwright");
    }
    if (!categoryBreakdown["Linting & Formatting"]) {
      recommendations.push("Add linting tools like ESLint and Prettier for code quality");
    }
    if (!allPackages.includes("typescript") && !allPackages.includes("@types/node")) {
      recommendations.push("Consider using TypeScript for better type safety");
    }
    if (unmatchedPackages.length > matchedTools.length) {
      recommendations.push("Many packages are not in our database - consider using more mainstream tools");
    }
    if (openSourceCount < matchedTools.length * 0.5) {
      recommendations.push("Consider using more open-source alternatives for flexibility");
    }

    if (args.userId) {
      await ctx.runMutation(api.packageAnalyzer.saveAnalysis, {
        userId: args.userId,
        packageName: packageJson.name || "Unknown",
        score: overallScore,
        grade,
        matchedToolIds: matchedTools.map((t) => t._id),
        stats: {
          totalDependencies: allPackages.length,
          matchedCount: matchedTools.length,
          unmatchedCount: unmatchedPackages.length,
          openSourceCount,
          featuredCount,
          healthScore,
          modernityScore,
          popularityScore,
        },
      });
    }

    return {
      score: overallScore,
      grade,
      matchedTools,
      unmatchedPackages,
      stats: {
        totalDependencies: allPackages.length,
        matchedCount: matchedTools.length,
        unmatchedCount: unmatchedPackages.length,
        openSourceCount,
        featuredCount,
        categoryBreakdown,
        healthScore,
        modernityScore,
        popularityScore,
      },
      recommendations,
    };
  },
});

export const matchPackagesToTools = query({
  args: {
    packageNames: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const allTools = await ctx.db
      .query("tools")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const categories = await ctx.db.query("categories").collect();
    const categoryMap = new Map(categories.map((c) => [c._id, c.name]));

    const matchedTools: Array<{
      _id: string;
      name: string;
      slug: string;
      tagline: string;
      logoUrl?: string;
      pricingModel: string;
      githubStars?: number;
      npmDownloadsWeekly?: number;
      isOpenSource: boolean;
      isFeatured: boolean;
      categoryName?: string;
      packageName: string;
    }> = [];
    const matchedPackageNames = new Set<string>();

    for (const packageName of args.packageNames) {
      const normalizedName = packageName.toLowerCase().replace(/^@/, "").replace(/\//g, "-");
      
      const tool = allTools.find((t) => {
        if (t.npmPackageName && t.npmPackageName.toLowerCase() === packageName.toLowerCase()) {
          return true;
        }
        const toolSlug = t.slug.toLowerCase();
        const toolName = t.name.toLowerCase().replace(/\s+/g, "-");
        
        if (toolSlug === normalizedName || toolName === normalizedName) {
          return true;
        }
        if (normalizedName.includes(toolSlug) || toolSlug.includes(normalizedName)) {
          return true;
        }
        return false;
      });

      if (tool && !matchedPackageNames.has(tool._id)) {
        matchedPackageNames.add(tool._id);
        matchedTools.push({
          _id: tool._id,
          name: tool.name,
          slug: tool.slug,
          tagline: tool.tagline,
          logoUrl: tool.logoUrl,
          pricingModel: tool.pricingModel,
          githubStars: tool.githubStars,
          npmDownloadsWeekly: tool.npmDownloadsWeekly,
          isOpenSource: tool.isOpenSource,
          isFeatured: tool.isFeatured,
          categoryName: categoryMap.get(tool.categoryId),
          packageName,
        });
      }
    }

    const unmatchedPackages = args.packageNames.filter(
      (p) => !matchedTools.some((t) => t.packageName === p)
    );

    return { matchedTools, unmatchedPackages };
  },
});

export const saveAnalysis = mutation({
  args: {
    userId: v.string(),
    packageName: v.string(),
    score: v.number(),
    grade: v.string(),
    matchedToolIds: v.array(v.string()),
    stats: v.object({
      totalDependencies: v.number(),
      matchedCount: v.number(),
      unmatchedCount: v.number(),
      openSourceCount: v.number(),
      featuredCount: v.number(),
      healthScore: v.number(),
      modernityScore: v.number(),
      popularityScore: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("packageAnalyses", {
      userId: args.userId,
      packageName: args.packageName,
      score: args.score,
      grade: args.grade,
      matchedToolIds: args.matchedToolIds,
      stats: args.stats,
      analyzedAt: Date.now(),
    });
  },
});

export const getUserAnalyses = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("packageAnalyses")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(10);
  },
});

export const getAnalysis = query({
  args: { analysisId: v.id("packageAnalyses") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.analysisId);
  },
});
