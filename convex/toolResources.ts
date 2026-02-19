"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: {
      medium?: { url: string };
      high?: { url: string };
    };
    channelTitle: string;
  };
}

interface YouTubeVideoItem {
  id: string;
  contentDetails?: {
    duration?: string;
  };
  statistics?: {
    viewCount?: string;
  };
}

function parseYouTubeDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const hours = match[1] ? `${match[1]}:` : "";
  const minutes = match[2] ? match[2].padStart(hours ? 2 : 1, "0") : "0";
  const seconds = match[3] ? match[3].padStart(2, "0") : "00";
  return `${hours}${minutes}:${seconds}`;
}

async function fetchYouTubeVideos(
  toolName: string,
  apiKey: string,
  maxResults = 8
): Promise<
  {
    title: string;
    url: string;
    description: string;
    thumbnailUrl: string;
    publishedAt: string;
    duration?: string;
    viewCount?: number;
    channelName: string;
  }[]
> {
  try {
    const queries = [
      `${toolName} tutorial`,
      `${toolName} how to use`,
      `${toolName} review 2024 2025`,
    ];

    const allVideos: YouTubeSearchItem[] = [];
    const seenIds = new Set<string>();

    for (const query of queries) {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${Math.ceil(maxResults / queries.length)}&order=relevance&relevanceLanguage=en&key=${apiKey}`;

      const searchResponse = await fetch(searchUrl);
      if (!searchResponse.ok) {
        console.error(`YouTube search error for "${query}": ${searchResponse.status}`);
        continue;
      }

      const searchData = await searchResponse.json();
      for (const item of searchData.items || []) {
        if (!seenIds.has(item.id.videoId)) {
          seenIds.add(item.id.videoId);
          allVideos.push(item);
        }
      }
    }

    if (allVideos.length === 0) return [];

    const videoIds = allVideos.map((v) => v.id.videoId).join(",");
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`;
    const detailsResponse = await fetch(detailsUrl);
    const detailsMap = new Map<string, YouTubeVideoItem>();

    if (detailsResponse.ok) {
      const detailsData = await detailsResponse.json();
      for (const item of detailsData.items || []) {
        detailsMap.set(item.id, item);
      }
    }

    return allVideos.slice(0, maxResults).map((item) => {
      const details = detailsMap.get(item.id.videoId);
      return {
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        description: item.snippet.description.slice(0, 300),
        thumbnailUrl:
          item.snippet.thumbnails.high?.url ||
          item.snippet.thumbnails.medium?.url ||
          "",
        publishedAt: item.snippet.publishedAt,
        duration: details?.contentDetails?.duration
          ? parseYouTubeDuration(details.contentDetails.duration)
          : undefined,
        viewCount: details?.statistics?.viewCount
          ? parseInt(details.statistics.viewCount, 10)
          : undefined,
        channelName: item.snippet.channelTitle,
      };
    });
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    return [];
  }
}

async function fetchDevToArticles(
  toolName: string,
  maxResults = 5
): Promise<
  {
    title: string;
    url: string;
    description: string;
    source: string;
    publishedAt: string;
    resourceType: "article" | "tutorial" | "howto";
  }[]
> {
  try {
    const response = await fetch(
      `https://dev.to/api/articles?tag=${encodeURIComponent(toolName.toLowerCase().replace(/[.\s]+/g, ""))}&per_page=${maxResults}&top=365`,
      {
        headers: { "User-Agent": "VibeBuff-Resource-Fetcher" },
      }
    );

    if (!response.ok) {
      const fallbackResponse = await fetch(
        `https://dev.to/api/articles?tag=${encodeURIComponent(toolName.toLowerCase().replace(/[.\s]+/g, "-"))}&per_page=${maxResults}&top=365`,
        {
          headers: { "User-Agent": "VibeBuff-Resource-Fetcher" },
        }
      );
      if (!fallbackResponse.ok) return [];
      const fallbackData = await fallbackResponse.json();
      return processDevToArticles(fallbackData);
    }

    const data = await response.json();
    return processDevToArticles(data);
  } catch (error) {
    console.error("Error fetching Dev.to articles:", error);
    return [];
  }
}

function processDevToArticles(
  articles: {
    title: string;
    url: string;
    description: string;
    published_at: string;
    tag_list: string[];
  }[]
): {
  title: string;
  url: string;
  description: string;
  source: string;
  publishedAt: string;
  resourceType: "article" | "tutorial" | "howto";
}[] {
  return articles.map((article) => {
    let resourceType: "article" | "tutorial" | "howto" = "article";
    const titleLower = article.title.toLowerCase();
    if (
      titleLower.includes("tutorial") ||
      titleLower.includes("getting started") ||
      titleLower.includes("beginner")
    ) {
      resourceType = "tutorial";
    } else if (
      titleLower.includes("how to") ||
      titleLower.includes("howto") ||
      titleLower.includes("guide")
    ) {
      resourceType = "howto";
    }

    return {
      title: article.title,
      url: article.url,
      description: article.description?.slice(0, 300) || "",
      source: "dev.to",
      publishedAt: article.published_at,
      resourceType,
    };
  });
}

async function fetchHashnodeArticles(
  toolName: string,
  maxResults = 5
): Promise<
  {
    title: string;
    url: string;
    description: string;
    source: string;
    publishedAt: string;
    resourceType: "article" | "tutorial" | "howto";
  }[]
> {
  try {
    const query = `
      query {
        searchPostsOfFeed(input: { query: "${toolName}", first: ${maxResults} }) {
          edges {
            node {
              title
              brief
              url
              publishedAt
              tags { name }
            }
          }
        }
      }
    `;

    const response = await fetch("https://gql.hashnode.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "VibeBuff-Resource-Fetcher",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) return [];

    const data = await response.json();
    const posts = data?.data?.searchPostsOfFeed?.edges || [];

    return posts.map(
      (edge: {
        node: {
          title: string;
          brief: string;
          url: string;
          publishedAt: string;
        };
      }) => {
        const post = edge.node;
        const titleLower = post.title.toLowerCase();
        let resourceType: "article" | "tutorial" | "howto" = "article";
        if (titleLower.includes("tutorial") || titleLower.includes("getting started")) {
          resourceType = "tutorial";
        } else if (titleLower.includes("how to") || titleLower.includes("guide")) {
          resourceType = "howto";
        }

        return {
          title: post.title,
          url: post.url,
          description: post.brief?.slice(0, 300) || "",
          source: "hashnode",
          publishedAt: post.publishedAt,
          resourceType,
        };
      }
    );
  } catch (error) {
    console.error("Error fetching Hashnode articles:", error);
    return [];
  }
}

export const fetchToolResources = action({
  args: {
    toolId: v.id("tools"),
  },
  handler: async (ctx, args) => {
    const tool = (await ctx.runQuery(
      internal.toolResourcesInternal.getToolForResourceFetch,
      { toolId: args.toolId }
    )) as { name: string; slug: string; websiteUrl: string; docsUrl?: string } | null;

    if (!tool) {
      throw new Error("Tool not found");
    }

    const fetchLog = (await ctx.runQuery(
      internal.toolResourcesInternal.getFetchLog,
      { toolId: args.toolId }
    )) as { lastFetchedAt: number } | null;

    const ONE_DAY = 24 * 60 * 60 * 1000;
    if (fetchLog && Date.now() - fetchLog.lastFetchedAt < ONE_DAY) {
      return {
        success: true,
        toolName: tool.name,
        skipped: true,
        message: "Resources were fetched recently",
      };
    }

    const youtubeApiKey = process.env.YOUTUBE_API_KEY;
    let youtubeVideos: Awaited<ReturnType<typeof fetchYouTubeVideos>> = [];
    let devToArticles: Awaited<ReturnType<typeof fetchDevToArticles>> = [];
    let hashnodeArticles: Awaited<ReturnType<typeof fetchHashnodeArticles>> = [];

    if (youtubeApiKey) {
      youtubeVideos = await fetchYouTubeVideos(tool.name, youtubeApiKey, 8);
    } else {
      console.warn("YOUTUBE_API_KEY not set, skipping YouTube fetch");
    }

    devToArticles = await fetchDevToArticles(tool.name, 5);

    await new Promise((resolve) => setTimeout(resolve, 300));

    hashnodeArticles = await fetchHashnodeArticles(tool.name, 5);

    const resources: {
      toolId: typeof args.toolId;
      resourceType: "youtube" | "documentation" | "howto" | "article" | "tutorial";
      title: string;
      url: string;
      description?: string;
      thumbnailUrl?: string;
      source?: string;
      publishedAt?: string;
      duration?: string;
      viewCount?: number;
      channelName?: string;
    }[] = [];

    for (const video of youtubeVideos) {
      resources.push({
        toolId: args.toolId,
        resourceType: "youtube",
        title: video.title,
        url: video.url,
        description: video.description || undefined,
        thumbnailUrl: video.thumbnailUrl || undefined,
        publishedAt: video.publishedAt || undefined,
        duration: video.duration || undefined,
        viewCount: video.viewCount || undefined,
        channelName: video.channelName || undefined,
        source: "youtube",
      });
    }

    if (tool.docsUrl) {
      resources.push({
        toolId: args.toolId,
        resourceType: "documentation",
        title: `${tool.name} Official Documentation`,
        url: tool.docsUrl,
        description: `Official documentation for ${tool.name}`,
        source: "official",
      });
    }

    for (const article of [...devToArticles, ...hashnodeArticles]) {
      resources.push({
        toolId: args.toolId,
        resourceType: article.resourceType,
        title: article.title,
        url: article.url,
        description: article.description || undefined,
        publishedAt: article.publishedAt || undefined,
        source: article.source,
      });
    }

    const seenUrls = new Set<string>();
    const uniqueResources = resources.filter((r) => {
      if (seenUrls.has(r.url)) return false;
      seenUrls.add(r.url);
      return true;
    });

    await ctx.runMutation(internal.toolResourcesInternal.upsertToolResources, {
      toolId: args.toolId,
      resources: uniqueResources.map((r) => ({
        ...r,
        isActive: true,
        fetchedAt: Date.now(),
      })),
    });

    const youtubeCount = uniqueResources.filter((r) => r.resourceType === "youtube").length;
    const articleCount = uniqueResources.filter(
      (r) => r.resourceType !== "youtube" && r.resourceType !== "documentation"
    ).length;

    await ctx.runMutation(internal.toolResourcesInternal.upsertFetchLog, {
      toolId: args.toolId,
      youtubeCount,
      articleCount,
      totalCount: uniqueResources.length,
      status: uniqueResources.length > 0 ? "success" : "failed",
    });

    return {
      success: true,
      toolName: tool.name,
      skipped: false,
      youtubeCount,
      articleCount,
      totalCount: uniqueResources.length,
    };
  },
});
