"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

interface RSSItem {
  title: string;
  link: string;
  description?: string;
  content?: string;
  author?: string;
  pubDate?: string;
  guid?: string;
  enclosure?: { url: string };
  categories?: string[];
}

interface ParsedFeed {
  items: RSSItem[];
  title?: string;
  description?: string;
}

function parseRSSXML(xml: string): ParsedFeed {
  const items: RSSItem[] = [];
  
  const itemMatches = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
  
  for (const itemXml of itemMatches) {
    const getTagContent = (tag: string): string | undefined => {
      const cdataMatch = itemXml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'));
      if (cdataMatch) return cdataMatch[1].trim();
      
      const match = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return match ? match[1].trim().replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') : undefined;
    };

    const title = getTagContent('title');
    const link = getTagContent('link');
    
    if (title && link) {
      const guid = getTagContent('guid') || link;
      const description = getTagContent('description');
      const content = getTagContent('content:encoded') || getTagContent('content');
      const author = getTagContent('author') || getTagContent('dc:creator');
      const pubDate = getTagContent('pubDate') || getTagContent('published');
      
      const enclosureMatch = itemXml.match(/<enclosure[^>]*url=["']([^"']+)["'][^>]*>/i);
      const mediaMatch = itemXml.match(/<media:content[^>]*url=["']([^"']+)["'][^>]*>/i);
      const imageUrl = enclosureMatch?.[1] || mediaMatch?.[1];

      const categoryMatches = itemXml.match(/<category[^>]*>([^<]+)<\/category>/gi) || [];
      const categories = categoryMatches.map(c => {
        const match = c.match(/>([^<]+)</);
        return match ? match[1].trim() : '';
      }).filter(Boolean);

      items.push({
        title,
        link,
        description,
        content,
        author,
        pubDate,
        guid,
        enclosure: imageUrl ? { url: imageUrl } : undefined,
        categories,
      });
    }
  }

  const feedTitle = xml.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
  const feedDesc = xml.match(/<description[^>]*>([^<]+)<\/description>/i)?.[1];

  return { items, title: feedTitle, description: feedDesc };
}

function parseAtomXML(xml: string): ParsedFeed {
  const items: RSSItem[] = [];
  
  const entryMatches = xml.match(/<entry[^>]*>[\s\S]*?<\/entry>/gi) || [];
  
  for (const entryXml of entryMatches) {
    const getTagContent = (tag: string): string | undefined => {
      const match = entryXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
      return match ? match[1].trim().replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1') : undefined;
    };

    const title = getTagContent('title');
    const linkMatch = entryXml.match(/<link[^>]*href=["']([^"']+)["'][^>]*>/i);
    const link = linkMatch?.[1] || getTagContent('link');
    
    if (title && link) {
      const id = getTagContent('id') || link;
      const summary = getTagContent('summary');
      const content = getTagContent('content');
      const authorMatch = entryXml.match(/<author[^>]*>[\s\S]*?<name>([^<]+)<\/name>/i);
      const author = authorMatch?.[1];
      const published = getTagContent('published') || getTagContent('updated');

      items.push({
        title,
        link,
        description: summary,
        content,
        author,
        pubDate: published,
        guid: id,
      });
    }
  }

  const feedTitle = xml.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];

  return { items, title: feedTitle };
}

async function fetchAndParseFeed(url: string, feedType: string): Promise<ParsedFeed> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'VibeBuff-Feed-Fetcher/1.0',
      'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();

  if (feedType === 'json') {
    const json = JSON.parse(text);
    return {
      items: (json.items || []).map((item: Record<string, unknown>) => ({
        title: item.title as string,
        link: item.url as string || item.link as string,
        description: item.summary as string || item.description as string,
        content: item.content_html as string || item.content_text as string,
        author: typeof item.author === 'object' && item.author !== null 
          ? (item.author as { name?: string }).name 
          : item.author as string,
        pubDate: item.date_published as string,
        guid: item.id as string,
      })),
      title: json.title,
      description: json.description,
    };
  }

  if (feedType === 'atom' || text.includes('<feed') && text.includes('xmlns="http://www.w3.org/2005/Atom"')) {
    return parseAtomXML(text);
  }

  return parseRSSXML(text);
}

function parseDate(dateStr: string | undefined): number {
  if (!dateStr) return Date.now();
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? Date.now() : parsed.getTime();
}

function generateExternalId(item: RSSItem): string {
  return item.guid || item.link || `${item.title}-${item.pubDate || Date.now()}`;
}

function stripHtml(html: string | undefined): string | undefined {
  if (!html) return undefined;
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1000);
}

export const fetchFeedSource = internalAction({
  args: {
    sourceId: v.id("feedSources"),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    itemsAdded: number;
    error?: string;
  }> => {
    const source = await ctx.runQuery(internal.feedsInternal.getFeedSourceById, {
      sourceId: args.sourceId,
    });

    if (!source) {
      return { success: false, itemsAdded: 0, error: "Source not found" };
    }

    try {
      const feed = await fetchAndParseFeed(source.url, source.feedType);
      let itemsAdded = 0;

      for (const item of feed.items.slice(0, 50)) {
        const externalId = generateExternalId(item);
        
        const exists = await ctx.runQuery(internal.feedsInternal.checkFeedItemExists, {
          sourceId: args.sourceId,
          externalId,
        });

        if (!exists) {
          await ctx.runMutation(internal.feedsInternal.createFeedItem, {
            sourceId: args.sourceId,
            externalId,
            title: item.title,
            url: item.link,
            description: stripHtml(item.description),
            content: stripHtml(item.content),
            author: item.author,
            imageUrl: item.enclosure?.url,
            publishedAt: parseDate(item.pubDate),
            tags: item.categories,
          });
          itemsAdded++;
        }
      }

      await ctx.runMutation(internal.feedsInternal.updateFeedSourceStatus, {
        sourceId: args.sourceId,
        status: "success",
        itemsAdded,
      });

      return { success: true, itemsAdded };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      await ctx.runMutation(internal.feedsInternal.updateFeedSourceStatus, {
        sourceId: args.sourceId,
        status: "error",
        error: errorMessage,
      });

      return { success: false, itemsAdded: 0, error: errorMessage };
    }
  },
});

export const fetchAllDueFeeds = internalAction({
  args: {},
  handler: async (ctx): Promise<{
    total: number;
    success: number;
    failed: number;
    details: { name: string; status: string; itemsAdded?: number; error?: string }[];
  }> => {
    const sources = await ctx.runQuery(internal.feedsInternal.getSourcesDueForFetch, {});

    const results = {
      total: sources.length,
      success: 0,
      failed: 0,
      details: [] as { name: string; status: string; itemsAdded?: number; error?: string }[],
    };

    for (const source of sources) {
      await new Promise((resolve) => setTimeout(resolve, 500));

      try {
        const result = await ctx.runAction(internal.feeds.fetchFeedSource, {
          sourceId: source._id,
        });

        if (result.success) {
          results.success++;
          results.details.push({
            name: source.name,
            status: "success",
            itemsAdded: result.itemsAdded,
          });
        } else {
          results.failed++;
          results.details.push({
            name: source.name,
            status: "failed",
            error: result.error,
          });
        }
      } catch (error) {
        results.failed++;
        results.details.push({
          name: source.name,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  },
});

export const seedDefaultFeedSources = internalAction({
  args: {},
  handler: async (ctx): Promise<{ added: number; sources: string[] }> => {
    const defaultSources = [
      {
        name: "Hacker News - AI",
        slug: "hackernews-ai",
        url: "https://hnrss.org/newest?q=AI+OR+LLM+OR+GPT+OR+Claude+OR+machine+learning",
        feedType: "rss" as const,
        category: "ai_news" as const,
        description: "AI-related posts from Hacker News",
        websiteUrl: "https://news.ycombinator.com",
        pollIntervalMinutes: 30,
      },
      {
        name: "OpenAI Blog",
        slug: "openai-blog",
        url: "https://openai.com/blog/rss.xml",
        feedType: "rss" as const,
        category: "ai_news" as const,
        description: "Official OpenAI blog updates",
        websiteUrl: "https://openai.com/blog",
        pollIntervalMinutes: 60,
      },
      {
        name: "Anthropic News",
        slug: "anthropic-news",
        url: "https://www.anthropic.com/news/rss.xml",
        feedType: "rss" as const,
        category: "ai_news" as const,
        description: "Official Anthropic news and updates",
        websiteUrl: "https://www.anthropic.com/news",
        pollIntervalMinutes: 60,
      },
      {
        name: "Hugging Face Blog",
        slug: "huggingface-blog",
        url: "https://huggingface.co/blog/feed.xml",
        feedType: "atom" as const,
        category: "ai_news" as const,
        description: "Hugging Face blog posts and tutorials",
        websiteUrl: "https://huggingface.co/blog",
        pollIntervalMinutes: 60,
      },
      {
        name: "GitHub Changelog",
        slug: "github-changelog",
        url: "https://github.blog/changelog/feed/",
        feedType: "rss" as const,
        category: "dev_tools" as const,
        description: "GitHub product updates and changelog",
        websiteUrl: "https://github.blog/changelog",
        pollIntervalMinutes: 60,
      },
      {
        name: "Vercel Blog",
        slug: "vercel-blog",
        url: "https://vercel.com/atom",
        feedType: "atom" as const,
        category: "dev_tools" as const,
        description: "Vercel blog posts and updates",
        websiteUrl: "https://vercel.com/blog",
        pollIntervalMinutes: 120,
      },
      {
        name: "Next.js Blog",
        slug: "nextjs-blog",
        url: "https://nextjs.org/feed.xml",
        feedType: "rss" as const,
        category: "frameworks" as const,
        description: "Next.js official blog",
        websiteUrl: "https://nextjs.org/blog",
        pollIntervalMinutes: 120,
      },
      {
        name: "React Blog",
        slug: "react-blog",
        url: "https://react.dev/rss.xml",
        feedType: "rss" as const,
        category: "frameworks" as const,
        description: "Official React blog",
        websiteUrl: "https://react.dev/blog",
        pollIntervalMinutes: 240,
      },
      {
        name: "Dev.to - AI Tag",
        slug: "devto-ai",
        url: "https://dev.to/feed/tag/ai",
        feedType: "rss" as const,
        category: "tutorials" as const,
        description: "AI-tagged articles from Dev.to",
        websiteUrl: "https://dev.to/t/ai",
        pollIntervalMinutes: 60,
      },
      {
        name: "Dev.to - JavaScript",
        slug: "devto-javascript",
        url: "https://dev.to/feed/tag/javascript",
        feedType: "rss" as const,
        category: "tutorials" as const,
        description: "JavaScript articles from Dev.to",
        websiteUrl: "https://dev.to/t/javascript",
        pollIntervalMinutes: 60,
      },
      {
        name: "CSS-Tricks",
        slug: "css-tricks",
        url: "https://css-tricks.com/feed/",
        feedType: "rss" as const,
        category: "tutorials" as const,
        description: "CSS-Tricks articles and tutorials",
        websiteUrl: "https://css-tricks.com",
        pollIntervalMinutes: 120,
      },
      {
        name: "Smashing Magazine",
        slug: "smashing-magazine",
        url: "https://www.smashingmagazine.com/feed/",
        feedType: "rss" as const,
        category: "tutorials" as const,
        description: "Web development articles from Smashing Magazine",
        websiteUrl: "https://www.smashingmagazine.com",
        pollIntervalMinutes: 120,
      },
      {
        name: "The Pragmatic Engineer",
        slug: "pragmatic-engineer",
        url: "https://newsletter.pragmaticengineer.com/feed",
        feedType: "rss" as const,
        category: "newsletters" as const,
        description: "Gergely Orosz's engineering newsletter",
        websiteUrl: "https://newsletter.pragmaticengineer.com",
        pollIntervalMinutes: 240,
      },
      {
        name: "TLDR Newsletter",
        slug: "tldr-newsletter",
        url: "https://tldr.tech/api/rss/tech",
        feedType: "rss" as const,
        category: "newsletters" as const,
        description: "Daily tech newsletter digest",
        websiteUrl: "https://tldr.tech",
        pollIntervalMinutes: 60,
      },
      {
        name: "Simon Willison's Blog",
        slug: "simon-willison",
        url: "https://simonwillison.net/atom/everything/",
        feedType: "atom" as const,
        category: "blogs" as const,
        description: "Simon Willison's blog on AI and development",
        websiteUrl: "https://simonwillison.net",
        pollIntervalMinutes: 60,
      },
      {
        name: "Changelog",
        slug: "changelog-news",
        url: "https://changelog.com/news/feed",
        feedType: "rss" as const,
        category: "podcasts" as const,
        description: "Changelog news and podcast updates",
        websiteUrl: "https://changelog.com",
        pollIntervalMinutes: 120,
      },
      {
        name: "npm Blog",
        slug: "npm-blog",
        url: "https://github.blog/changelog/label/npm/feed/",
        feedType: "rss" as const,
        category: "releases" as const,
        description: "npm updates and releases",
        websiteUrl: "https://github.blog/changelog/label/npm",
        pollIntervalMinutes: 240,
      },
      {
        name: "Node.js Blog",
        slug: "nodejs-blog",
        url: "https://nodejs.org/en/feed/blog.xml",
        feedType: "rss" as const,
        category: "releases" as const,
        description: "Node.js official blog and releases",
        websiteUrl: "https://nodejs.org/en/blog",
        pollIntervalMinutes: 240,
      },
      {
        name: "TypeScript Blog",
        slug: "typescript-blog",
        url: "https://devblogs.microsoft.com/typescript/feed/",
        feedType: "rss" as const,
        category: "releases" as const,
        description: "TypeScript official blog",
        websiteUrl: "https://devblogs.microsoft.com/typescript",
        pollIntervalMinutes: 240,
      },
      {
        name: "Deno Blog",
        slug: "deno-blog",
        url: "https://deno.com/feed",
        feedType: "rss" as const,
        category: "releases" as const,
        description: "Deno official blog and releases",
        websiteUrl: "https://deno.com/blog",
        pollIntervalMinutes: 120,
      },
    ];

    const addedSources: string[] = [];

    for (const source of defaultSources) {
      await ctx.runMutation(internal.feedsInternal.createFeedSource, source);
      addedSources.push(source.name);
    }

    return { added: addedSources.length, sources: addedSources };
  },
});
