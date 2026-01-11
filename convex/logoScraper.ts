import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

type ToolForLogo = {
  _id: Id<"tools">;
  name: string;
  slug: string;
  websiteUrl: string;
  githubUrl: string | undefined;
  logoUrl: string | undefined;
};

type ScrapeResults = {
  total: number;
  updated: number;
  failed: number;
  skipped: number;
};

export const getAllToolsForLogos = internalQuery({
  handler: async (ctx) => {
    const tools = await ctx.db
      .query("tools")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
    
    return tools.map((tool) => ({
      _id: tool._id,
      name: tool.name,
      slug: tool.slug,
      websiteUrl: tool.websiteUrl,
      githubUrl: tool.githubUrl,
      logoUrl: tool.logoUrl,
    }));
  },
});

export const updateToolLogo = internalMutation({
  args: {
    toolId: v.id("tools"),
    logoUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.toolId, {
      logoUrl: args.logoUrl,
    });
  },
});

async function getDomainFromUrl(url: string): Promise<string | null> {
  try {
    const parsed = new URL(url);
    let domain = parsed.hostname;
    if (domain.startsWith("www.")) {
      domain = domain.slice(4);
    }
    return domain;
  } catch {
    return null;
  }
}

async function checkUrlExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
    });
    if (response.ok) {
      const contentType = response.headers.get("content-type") || "";
      return contentType.includes("image") || contentType.includes("icon");
    }
    return false;
  } catch {
    return false;
  }
}

async function getClearbitLogo(domain: string): Promise<string | null> {
  const url = `https://logo.clearbit.com/${domain}`;
  if (await checkUrlExists(url)) {
    return url;
  }
  return null;
}

async function getGoogleFavicon(domain: string): Promise<string | null> {
  const url = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  if (await checkUrlExists(url)) {
    return url;
  }
  return null;
}

async function getDuckDuckGoFavicon(domain: string): Promise<string | null> {
  const url = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  if (await checkUrlExists(url)) {
    return url;
  }
  return null;
}

async function getGitHubAvatar(githubUrl: string | undefined): Promise<string | null> {
  if (!githubUrl) return null;
  try {
    const parsed = new URL(githubUrl);
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    if (pathParts.length >= 1) {
      const owner = pathParts[0];
      const avatarUrl = `https://github.com/${owner}.png?size=128`;
      if (await checkUrlExists(avatarUrl)) {
        return avatarUrl;
      }
    }
  } catch {
    return null;
  }
  return null;
}

async function fetchLogoForTool(tool: {
  websiteUrl: string;
  githubUrl?: string;
}): Promise<string | null> {
  const { websiteUrl, githubUrl } = tool;
  
  if (!websiteUrl) return null;
  
  const domain = await getDomainFromUrl(websiteUrl);
  if (!domain) return null;
  
  const clearbitLogo = await getClearbitLogo(domain);
  if (clearbitLogo) return clearbitLogo;
  
  const githubAvatar = await getGitHubAvatar(githubUrl);
  if (githubAvatar) return githubAvatar;
  
  const googleFavicon = await getGoogleFavicon(domain);
  if (googleFavicon) return googleFavicon;
  
  const duckDuckGoFavicon = await getDuckDuckGoFavicon(domain);
  if (duckDuckGoFavicon) return duckDuckGoFavicon;
  
  return null;
}

export const scrapeLogos = internalAction({
  args: {
    onlyMissing: v.optional(v.boolean()),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<ScrapeResults> => {
    const onlyMissing = args.onlyMissing ?? true;
    const batchSize = args.batchSize ?? 10;
    
    const allTools: ToolForLogo[] = await ctx.runQuery(internal.logoScraper.getAllToolsForLogos);
    
    let tools: ToolForLogo[] = allTools;
    if (onlyMissing) {
      tools = allTools.filter((t: ToolForLogo) => !t.logoUrl);
    }
    
    console.log(`Found ${tools.length} tools to process (onlyMissing: ${onlyMissing})`);
    
    const results: ScrapeResults = {
      total: tools.length,
      updated: 0,
      failed: 0,
      skipped: 0,
    };
    
    for (let i = 0; i < tools.length; i += batchSize) {
      const batch = tools.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(tools.length / batchSize)}`);
      
      const logoPromises = batch.map((tool: ToolForLogo) =>
        fetchLogoForTool({
          websiteUrl: tool.websiteUrl,
          githubUrl: tool.githubUrl ?? undefined,
        })
      );
      
      const logos = await Promise.all(logoPromises);
      
      for (let j = 0; j < batch.length; j++) {
        const tool = batch[j];
        const logoUrl = logos[j];
        
        if (!logoUrl) {
          console.log(`  No logo found for: ${tool.name}`);
          results.failed++;
          continue;
        }
        
        try {
          await ctx.runMutation(internal.logoScraper.updateToolLogo, {
            toolId: tool._id,
            logoUrl,
          });
          console.log(`  Updated: ${tool.name} -> ${logoUrl}`);
          results.updated++;
        } catch (error) {
          console.error(`  Failed to update ${tool.name}:`, error);
          results.failed++;
        }
      }
      
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    
    console.log(`Logo scraping complete: ${results.updated} updated, ${results.failed} failed`);
    return results;
  },
});

export const scrapeLogosCron = internalAction({
  handler: async (ctx): Promise<ScrapeResults> => {
    console.log("Running scheduled logo scraper...");
    const results: ScrapeResults = await ctx.runAction(internal.logoScraper.scrapeLogos, {
      onlyMissing: true,
      batchSize: 10,
    });
    console.log("Scheduled logo scraper complete:", results);
    return results;
  },
});
