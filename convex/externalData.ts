"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

function extractGithubOwnerRepo(githubUrl: string): { owner: string; repo: string } | null {
  try {
    const url = new URL(githubUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }
  } catch {
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
      return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
    }
  }
  return null;
}

async function fetchGithubData(owner: string, repo: string) {
  try {
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "VibeBuff-Tool-Fetcher",
      },
    });

    if (!repoResponse.ok) {
      console.error(`GitHub API error: ${repoResponse.status}`);
      return null;
    }

    const repoData = await repoResponse.json();

    let latestRelease = undefined;
    try {
      const releaseResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "VibeBuff-Tool-Fetcher",
          },
        }
      );
      if (releaseResponse.ok) {
        const releaseData = await releaseResponse.json();
        latestRelease = {
          tagName: releaseData.tag_name,
          name: releaseData.name || undefined,
          publishedAt: releaseData.published_at || undefined,
        };
      }
    } catch {
      // No releases available
    }

    let contributors = undefined;
    try {
      const contribResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1&anon=true`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "VibeBuff-Tool-Fetcher",
          },
        }
      );
      if (contribResponse.ok) {
        const linkHeader = contribResponse.headers.get("Link");
        if (linkHeader) {
          const match = linkHeader.match(/page=(\d+)>; rel="last"/);
          if (match) {
            contributors = parseInt(match[1], 10);
          }
        }
      }
    } catch {
      // Contributors count unavailable
    }

    let releases = undefined;
    try {
      const releasesResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/releases?per_page=1`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "VibeBuff-Tool-Fetcher",
          },
        }
      );
      if (releasesResponse.ok) {
        const linkHeader = releasesResponse.headers.get("Link");
        if (linkHeader) {
          const match = linkHeader.match(/page=(\d+)>; rel="last"/);
          if (match) {
            releases = parseInt(match[1], 10);
          }
        }
      }
    } catch {
      // Releases count unavailable
    }

    let commits = undefined;
    try {
      const commitsResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "VibeBuff-Tool-Fetcher",
          },
        }
      );
      if (commitsResponse.ok) {
        const linkHeader = commitsResponse.headers.get("Link");
        if (linkHeader) {
          const match = linkHeader.match(/page=(\d+)>; rel="last"/);
          if (match) {
            commits = parseInt(match[1], 10);
          }
        }
      }
    } catch {
      // Commits count unavailable
    }

    return {
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      watchers: repoData.subscribers_count || repoData.watchers_count,
      openIssues: repoData.open_issues_count,
      license: repoData.license?.spdx_id || repoData.license?.name || undefined,
      language: repoData.language || undefined,
      topics: repoData.topics?.length > 0 ? repoData.topics : undefined,
      createdAt: repoData.created_at || undefined,
      updatedAt: repoData.updated_at || undefined,
      pushedAt: repoData.pushed_at || undefined,
      description: repoData.description || undefined,
      homepage: repoData.homepage || undefined,
      size: repoData.size || undefined,
      defaultBranch: repoData.default_branch || undefined,
      hasWiki: repoData.has_wiki || undefined,
      hasIssues: repoData.has_issues || undefined,
      archived: repoData.archived || undefined,
      contributors,
      commits,
      releases,
      latestRelease,
    };
  } catch (error) {
    console.error("Error fetching GitHub data:", error);
    return null;
  }
}

async function fetchGithubReadme(owner: string, repo: string) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "VibeBuff-Tool-Fetcher",
        },
      }
    );
    if (!response.ok) return null;

    const data = await response.json();
    const content = Buffer.from(data.content, "base64").toString("utf-8");
    
    const excerpt = content
      .replace(/^#[^\n]+\n/, "")
      .replace(/!\[.*?\]\(.*?\)/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/```[\s\S]*?```/g, "")
      .replace(/`[^`]+`/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
      .slice(0, 500);

    const badges = (content.match(/\[!\[.*?\]\(.*?\)\]\(.*?\)/g) || []).slice(0, 10);
    const hasQuickStart = /quick\s*start|getting\s*started|installation/i.test(content);
    const hasContributing = /contributing|contribute/i.test(content);
    const hasChangelog = /changelog|release\s*notes/i.test(content);

    return {
      excerpt: excerpt || undefined,
      badges: badges.length > 0 ? badges : undefined,
      hasQuickStart,
      hasContributing,
      hasChangelog,
    };
  } catch (error) {
    console.error("Error fetching README:", error);
    return null;
  }
}

async function fetchGithubReleases(owner: string, repo: string, limit = 5) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases?per_page=${limit}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "VibeBuff-Tool-Fetcher",
        },
      }
    );
    if (!response.ok) return null;

    const releases = await response.json();
    return releases.map((release: {
      tag_name: string;
      published_at?: string;
      body?: string;
      prerelease?: boolean;
    }) => {
      const changes = (release.body || "")
        .split("\n")
        .filter((line: string) => line.trim().startsWith("-") || line.trim().startsWith("*"))
        .map((line: string) => line.replace(/^[\s\-\*]+/, "").trim())
        .filter((line: string) => line.length > 0)
        .slice(0, 5);

      const isBreaking = /breaking|major/i.test(release.body || "") || 
        /^v?\d+\.0\.0/.test(release.tag_name);

      return {
        version: release.tag_name,
        date: release.published_at || undefined,
        changes: changes.length > 0 ? changes : ["Release " + release.tag_name],
        isBreaking: isBreaking || undefined,
      };
    });
  } catch (error) {
    console.error("Error fetching releases:", error);
    return null;
  }
}

async function fetchNpmData(packageName: string) {
  try {
    const registryResponse = await fetch(`https://registry.npmjs.org/${packageName}`);
    if (!registryResponse.ok) {
      console.error(`NPM Registry API error: ${registryResponse.status}`);
      return null;
    }
    const registryData = await registryResponse.json();

    const latestVersion = registryData["dist-tags"]?.latest;
    const latestVersionData = latestVersion ? registryData.versions?.[latestVersion] : null;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const formatDate = (d: Date) => d.toISOString().split("T")[0];

    let downloadsWeekly = 0;
    let downloadsMonthly = 0;
    let downloadsYearly = 0;

    try {
      const weeklyResponse = await fetch(
        `https://api.npmjs.org/downloads/point/${formatDate(weekAgo)}:${formatDate(now)}/${packageName}`
      );
      if (weeklyResponse.ok) {
        const weeklyData = await weeklyResponse.json();
        downloadsWeekly = weeklyData.downloads || 0;
      }
    } catch {
      // Weekly downloads unavailable
    }

    try {
      const monthlyResponse = await fetch(
        `https://api.npmjs.org/downloads/point/${formatDate(monthAgo)}:${formatDate(now)}/${packageName}`
      );
      if (monthlyResponse.ok) {
        const monthlyData = await monthlyResponse.json();
        downloadsMonthly = monthlyData.downloads || 0;
      }
    } catch {
      // Monthly downloads unavailable
    }

    try {
      const yearlyResponse = await fetch(
        `https://api.npmjs.org/downloads/point/${formatDate(yearAgo)}:${formatDate(now)}/${packageName}`
      );
      if (yearlyResponse.ok) {
        const yearlyData = await yearlyResponse.json();
        downloadsYearly = yearlyData.downloads || 0;
      }
    } catch {
      // Yearly downloads unavailable
    }

    const times = registryData.time || {};
    const versionTimes = Object.entries(times).filter(
      ([key]) => key !== "created" && key !== "modified"
    );
    const firstPublished = times.created || undefined;
    const lastPublished = versionTimes.length > 0 
      ? versionTimes.sort((a, b) => new Date(b[1] as string).getTime() - new Date(a[1] as string).getTime())[0]?.[1] as string
      : undefined;

    const hasTypes = !!(
      latestVersionData?.types ||
      latestVersionData?.typings ||
      registryData.name?.startsWith("@types/")
    );

    return {
      downloadsWeekly,
      downloadsMonthly: downloadsMonthly || undefined,
      downloadsYearly: downloadsYearly || undefined,
      version: latestVersion || undefined,
      license: registryData.license || latestVersionData?.license || undefined,
      dependencies: latestVersionData?.dependencies
        ? Object.keys(latestVersionData.dependencies).length
        : undefined,
      devDependencies: latestVersionData?.devDependencies
        ? Object.keys(latestVersionData.devDependencies).length
        : undefined,
      maintainers: registryData.maintainers?.length || undefined,
      lastPublished,
      firstPublished,
      types: hasTypes || undefined,
      unpackedSize: latestVersionData?.dist?.unpackedSize || undefined,
      keywords: registryData.keywords?.length > 0 ? registryData.keywords : undefined,
    };
  } catch (error) {
    console.error("Error fetching NPM data:", error);
    return null;
  }
}

async function fetchBundlephobiaData(packageName: string) {
  try {
    const response = await fetch(`https://bundlephobia.com/api/size?package=${packageName}`);
    if (!response.ok) {
      console.error(`Bundlephobia API error: ${response.status}`);
      return null;
    }
    const data = await response.json();

    return {
      size: data.size,
      gzip: data.gzip,
      dependencyCount: data.dependencyCount || undefined,
      hasJSModule: typeof data.hasJSModule === 'boolean' ? data.hasJSModule : undefined,
      hasJSNext: typeof data.hasJSNext === 'boolean' ? data.hasJSNext : undefined,
      hasSideEffects: typeof data.hasSideEffects === 'boolean' ? data.hasSideEffects : undefined,
    };
  } catch (error) {
    console.error("Error fetching Bundlephobia data:", error);
    return null;
  }
}

export const fetchToolExternalData = action({
  args: {
    toolId: v.id("tools"),
  },
  handler: async (ctx, args): Promise<{
    success: boolean;
    toolName: string;
    hasGithub: boolean;
    hasNpm: boolean;
    hasBundlephobia: boolean;
    hasReadme: boolean;
    hasChangelog: boolean;
  }> => {
    const tool = await ctx.runQuery(internal.externalDataInternal.getToolForFetch, { toolId: args.toolId }) as {
      name: string;
      slug: string;
      githubUrl?: string;
      npmPackageName?: string;
    } | null;
    if (!tool) {
      throw new Error("Tool not found");
    }

    let githubData: Awaited<ReturnType<typeof fetchGithubData>> = null;
    let npmData: Awaited<ReturnType<typeof fetchNpmData>> = null;
    let bundlephobiaData: Awaited<ReturnType<typeof fetchBundlephobiaData>> = null;
    let readmeData: Awaited<ReturnType<typeof fetchGithubReadme>> = null;
    let changelogData: Awaited<ReturnType<typeof fetchGithubReleases>> = null;

    if (tool.githubUrl) {
      const parsed = extractGithubOwnerRepo(tool.githubUrl);
      if (parsed) {
        githubData = await fetchGithubData(parsed.owner, parsed.repo);
        readmeData = await fetchGithubReadme(parsed.owner, parsed.repo);
        changelogData = await fetchGithubReleases(parsed.owner, parsed.repo, 5);
      }
    }

    const npmPackageName = tool.npmPackageName || tool.slug;
    npmData = await fetchNpmData(npmPackageName);
    
    if (npmData && npmData.downloadsWeekly > 0) {
      bundlephobiaData = await fetchBundlephobiaData(npmPackageName);
    }

    const externalData = {
      github: githubData || undefined,
      npm: npmData || undefined,
      bundlephobia: bundlephobiaData || undefined,
      lastFetched: Date.now(),
    };

    await ctx.runMutation(internal.externalDataInternal.updateToolExternalData, {
      toolId: args.toolId,
      externalData,
      githubStars: githubData?.stars,
      npmDownloadsWeekly: npmData?.downloadsWeekly,
      readme: readmeData || undefined,
      changelog: changelogData || undefined,
    });

    return {
      success: true,
      toolName: tool.name,
      hasGithub: !!githubData,
      hasNpm: !!npmData,
      hasBundlephobia: !!bundlephobiaData,
      hasReadme: !!readmeData,
      hasChangelog: !!changelogData,
    };
  },
});

interface ToolForFetch {
  _id: string;
  name: string;
  slug: string;
  githubUrl?: string;
  npmPackageName?: string;
}

interface FetchResults {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  details: { name: string; status: string; error?: string }[];
}

export const fetchAllToolsExternalData = action({
  args: {
    limit: v.optional(v.number()),
    skipRecent: v.optional(v.boolean()),
  },
  handler: async (ctx, args): Promise<FetchResults> => {
    const tools = await ctx.runQuery(internal.externalDataInternal.getAllToolsForFetch, {
      limit: args.limit,
      skipRecent: args.skipRecent,
    }) as ToolForFetch[];

    const results: FetchResults = {
      total: tools.length,
      success: 0,
      failed: 0,
      skipped: 0,
      details: [],
    };

    for (const tool of tools) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        let githubData: Awaited<ReturnType<typeof fetchGithubData>> = null;
        let npmData: Awaited<ReturnType<typeof fetchNpmData>> = null;
        let bundlephobiaData: Awaited<ReturnType<typeof fetchBundlephobiaData>> = null;
        let readmeData: Awaited<ReturnType<typeof fetchGithubReadme>> = null;
        let changelogData: Awaited<ReturnType<typeof fetchGithubReleases>> = null;

        if (tool.githubUrl) {
          const parsed = extractGithubOwnerRepo(tool.githubUrl);
          if (parsed) {
            githubData = await fetchGithubData(parsed.owner, parsed.repo);
            readmeData = await fetchGithubReadme(parsed.owner, parsed.repo);
            changelogData = await fetchGithubReleases(parsed.owner, parsed.repo, 5);
          }
        }

        const npmPackageName = tool.npmPackageName || tool.slug;
        npmData = await fetchNpmData(npmPackageName);

        if (npmData && npmData.downloadsWeekly > 0) {
          bundlephobiaData = await fetchBundlephobiaData(npmPackageName);
        }

        if (!githubData && !npmData) {
          results.skipped++;
          results.details.push({ name: tool.name, status: "skipped", error: "No data sources available" });
          continue;
        }

        const externalData = {
          github: githubData || undefined,
          npm: npmData || undefined,
          bundlephobia: bundlephobiaData || undefined,
          lastFetched: Date.now(),
        };

        await ctx.runMutation(internal.externalDataInternal.updateToolExternalData, {
          toolId: tool._id as any,
          externalData,
          githubStars: githubData?.stars,
          npmDownloadsWeekly: npmData?.downloadsWeekly,
          readme: readmeData || undefined,
          changelog: changelogData || undefined,
        });

        results.success++;
        results.details.push({ name: tool.name, status: "success" });
      } catch (error) {
        results.failed++;
        results.details.push({
          name: tool.name,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  },
});

