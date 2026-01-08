"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const scrapeAndParseUrl = action({
  args: {
    url: v.string(),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    tool?: {
      name: string;
      slug: string;
      tagline: string;
      description: string;
      websiteUrl: string;
      githubUrl?: string;
      pricingModel: string;
      isOpenSource: boolean;
      category: string;
      pros: string[];
      cons: string[];
      bestFor: string[];
      features: string[];
      tags: string[];
    };
    error?: string;
  }> => {
    const isGithub = args.url.includes("github.com");
    
    try {
      let repoData: {
        name?: string;
        description?: string;
        html_url?: string;
        homepage?: string;
        stargazers_count?: number;
        forks_count?: number;
        language?: string;
        topics?: string[];
        license?: { name?: string };
      } | null = null;
      let readmeContent = "";

      if (isGithub) {
        const match = args.url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) {
          return { success: false, error: "Invalid GitHub URL" };
        }
        const [, owner, repo] = match;
        const cleanRepo = repo.replace(/\.git$/, "").split("/")[0].split("?")[0].split("#")[0];

        const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`, {
          headers: {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "VibeBuff-Admin",
          },
        });

        if (!repoResponse.ok) {
          return { success: false, error: `GitHub API error: ${repoResponse.status}` };
        }

        repoData = await repoResponse.json();

        const readmeResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/readme`, {
          headers: {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "VibeBuff-Admin",
          },
        });

        if (readmeResponse.ok) {
          const readmeData = await readmeResponse.json();
          if (readmeData.content) {
            readmeContent = Buffer.from(readmeData.content, "base64").toString("utf-8").slice(0, 5000);
          }
        }
      }

      const aiGatewayKey = process.env.VERCEL_AI_GATEWAY_API_KEY;
      
      if (!aiGatewayKey) {
        if (repoData) {
          const name = repoData.name || "Unknown";
          return {
            success: true,
            tool: {
              name: name.charAt(0).toUpperCase() + name.slice(1),
              slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              tagline: repoData.description || "A development tool",
              description: repoData.description || "No description available",
              websiteUrl: repoData.homepage || args.url,
              githubUrl: repoData.html_url,
              pricingModel: "open_source",
              isOpenSource: true,
              category: "frameworks",
              pros: ["Open source", "Active development"],
              cons: ["May require setup"],
              bestFor: ["Developers"],
              features: repoData.topics || [],
              tags: repoData.topics || [],
            },
          };
        }
        return { success: false, error: "AI Gateway not configured and no GitHub data available" };
      }

      const prompt = `Analyze this ${isGithub ? "GitHub repository" : "website"} and extract tool information for a developer tools database.

${isGithub && repoData ? `
GITHUB DATA:
- Name: ${repoData.name}
- Description: ${repoData.description}
- Stars: ${repoData.stargazers_count}
- Language: ${repoData.language}
- Topics: ${repoData.topics?.join(", ")}
- License: ${repoData.license?.name}
- Homepage: ${repoData.homepage}

README EXCERPT:
${readmeContent.slice(0, 3000)}
` : `URL: ${args.url}`}

Extract and return a JSON object with these fields:
{
  "name": "Tool Name (proper casing)",
  "slug": "tool-name-lowercase-dashes",
  "tagline": "One-line description (max 100 chars)",
  "description": "2-3 sentence description of what the tool does",
  "websiteUrl": "main website URL",
  "githubUrl": "GitHub URL if available",
  "pricingModel": "free|freemium|paid|open_source|enterprise",
  "isOpenSource": true/false,
  "category": "frameworks|databases|hosting|auth|payments|analytics|testing|devtools|ai|cms|other",
  "pros": ["3-5 key advantages"],
  "cons": ["2-3 potential drawbacks"],
  "bestFor": ["2-3 ideal use cases"],
  "features": ["5-8 main features"],
  "tags": ["5-10 relevant tags"]
}

Return ONLY valid JSON, no markdown or explanation.`;

      const response = await fetch("https://gateway.ai.vercel.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${aiGatewayKey}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are a developer tools expert. Extract structured tool information from repositories and websites. Always respond with valid JSON only.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        if (repoData) {
          const name = repoData.name || "Unknown";
          return {
            success: true,
            tool: {
              name: name.charAt(0).toUpperCase() + name.slice(1),
              slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              tagline: repoData.description || "A development tool",
              description: repoData.description || "No description available",
              websiteUrl: repoData.homepage || args.url,
              githubUrl: repoData.html_url,
              pricingModel: "open_source",
              isOpenSource: true,
              category: "frameworks",
              pros: ["Open source", "Active development"],
              cons: ["May require setup"],
              bestFor: ["Developers"],
              features: repoData.topics || [],
              tags: repoData.topics || [],
            },
          };
        }
        return { success: false, error: `AI API error: ${response.status}` };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        return { success: false, error: "No AI response content" };
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return { success: false, error: "Could not parse AI response as JSON" };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        success: true,
        tool: {
          name: parsed.name || repoData?.name || "Unknown",
          slug: parsed.slug || (parsed.name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          tagline: parsed.tagline || parsed.description?.slice(0, 100) || "A development tool",
          description: parsed.description || "No description available",
          websiteUrl: parsed.websiteUrl || repoData?.homepage || args.url,
          githubUrl: parsed.githubUrl || (isGithub ? args.url : undefined),
          pricingModel: parsed.pricingModel || "open_source",
          isOpenSource: parsed.isOpenSource ?? isGithub,
          category: parsed.category || "other",
          pros: parsed.pros || [],
          cons: parsed.cons || [],
          bestFor: parsed.bestFor || [],
          features: parsed.features || [],
          tags: parsed.tags || [],
        },
      };
    } catch (error) {
      return { success: false, error: `Scrape failed: ${error}` };
    }
  },
});

export const triggerFeedFetch = action({
  args: {},
  handler: async (ctx) => {
    await ctx.runAction(internal.feeds.fetchAllDueFeeds);
    return { success: true, message: "Feed fetch triggered" };
  },
});
