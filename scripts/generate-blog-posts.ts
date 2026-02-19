import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");
const POSTS_PER_RUN = parseInt(process.env.BLOG_POSTS_COUNT || "10", 10);

type BlogCategory =
  | "Frameworks"
  | "Backend"
  | "Frontend"
  | "DevOps"
  | "AI & ML"
  | "Database"
  | "Testing"
  | "Performance"
  | "Security"
  | "Mobile"
  | "Architecture"
  | "Tooling";

const CATEGORIES: BlogCategory[] = [
  "Frameworks",
  "Backend",
  "Frontend",
  "DevOps",
  "AI & ML",
  "Database",
  "Testing",
  "Performance",
  "Security",
  "Mobile",
  "Architecture",
  "Tooling",
];

interface BlogTopicPlan {
  slug: string;
  title: string;
  description: string;
  category: BlogCategory;
  tags: string[];
  readTime: string;
}

function getExistingSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
    return [];
  }
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

async function generateTopicPlan(
  existingSlugs: string[],
  count: number
): Promise<BlogTopicPlan[]> {
  const existingList = existingSlugs.slice(-100).join(", ");
  const categoriesStr = CATEGORIES.join(", ");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a content strategist for VIBEBUFF (vibebuff.dev), a developer tools discovery platform. Generate ${count} unique blog post topics about developer tools, frameworks, and tech stacks.

REQUIREMENTS:
- Topics must be SEO-optimized with high search volume keywords
- Each topic should target a specific long-tail keyword
- Topics should be practical, actionable guides that developers search for
- Mix of comparison posts, "best of" lists, tutorials, and guides
- Distribute across categories: ${categoriesStr}
- Slugs must be URL-friendly (lowercase, hyphens, no special chars)
- Each post should be substantial (8-20 min read)

EXISTING SLUGS TO AVOID (do not duplicate these topics):
${existingList}

Think about what developers are actively searching for in 2025-2026:
- New framework releases and migrations
- AI tool comparisons and integrations
- Cloud/edge computing trends
- Developer productivity tools
- Security best practices
- Performance optimization techniques
- Database selection guides
- DevOps and CI/CD improvements

Respond ONLY with valid JSON array:
[
  {
    "slug": "example-topic-slug-2025",
    "title": "SEO-Optimized Title With Target Keyword",
    "description": "Compelling meta description under 160 chars with primary keyword.",
    "category": "Category",
    "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
    "readTime": "12 min read"
  }
]`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Failed to parse topic plan from AI response");
  }

  const topics: BlogTopicPlan[] = JSON.parse(jsonMatch[0]);

  return topics.filter((t) => !existingSlugs.includes(t.slug)).slice(0, count);
}

async function generateBlogPost(topic: BlogTopicPlan): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: `Write a comprehensive, SEO-optimized blog post for VIBEBUFF (vibebuff.dev), a developer tools discovery platform.

TOPIC: ${topic.title}
CATEGORY: ${topic.category}
TARGET KEYWORDS: ${topic.tags.join(", ")}

WRITING GUIDELINES:
- Write in a professional but approachable tone
- Use markdown formatting (## for h2, ### for h3, **bold**, etc.)
- Include practical code examples where relevant (use fenced code blocks with language)
- Add comparison tables using markdown table syntax where appropriate
- Reference real tools, frameworks, and libraries by name
- Include specific version numbers, pricing, and stats where possible
- Structure with clear H2 and H3 headings for SEO
- Start with a compelling introduction that hooks the reader
- End with a clear conclusion and actionable takeaways
- Aim for 1500-2500 words (substantial but not bloated)
- Naturally mention tools that developers can discover on vibebuff.dev
- Use data, benchmarks, and real-world examples
- Include "Key Takeaways" or "TL;DR" section near the top

SEO REQUIREMENTS:
- Use the primary keyword in the first paragraph
- Include related keywords naturally throughout
- Use descriptive H2/H3 headings that contain keywords
- Write scannable content with short paragraphs
- Include internal linking opportunities (mention comparing tools, discovering alternatives)

DO NOT include the frontmatter/title - just write the markdown body content starting with the first ## heading.
DO NOT use emojis or unicode symbols anywhere in the content.`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

function buildMarkdownFile(topic: BlogTopicPlan, content: string): string {
  const frontmatter = `---
title: "${topic.title.replace(/"/g, '\\"')}"
description: "${topic.description.replace(/"/g, '\\"')}"
date: "${getTodayDate()}"
readTime: "${topic.readTime}"
tags: [${topic.tags.map((t) => `"${t}"`).join(", ")}]
category: "${topic.category}"
featured: false
author: "VIBEBUFF Team"
---

`;
  return frontmatter + content.trim() + "\n";
}

async function main() {
  console.log(`[blog-gen] Starting blog post generation (target: ${POSTS_PER_RUN} posts)`);

  const existingSlugs = getExistingSlugs();
  console.log(`[blog-gen] Found ${existingSlugs.length} existing blog posts`);

  console.log(`[blog-gen] Generating topic plan for ${POSTS_PER_RUN} posts...`);
  const topics = await generateTopicPlan(existingSlugs, POSTS_PER_RUN);
  console.log(`[blog-gen] Planned ${topics.length} unique topics`);

  if (topics.length === 0) {
    console.log("[blog-gen] No new topics to generate. Exiting.");
    return;
  }

  const generated: string[] = [];

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    console.log(
      `[blog-gen] (${i + 1}/${topics.length}) Generating: ${topic.title}`
    );

    try {
      const content = await generateBlogPost(topic);
      const markdown = buildMarkdownFile(topic, content);
      const filePath = path.join(BLOG_DIR, `${topic.slug}.md`);

      if (fs.existsSync(filePath)) {
        console.log(`[blog-gen] SKIP (already exists): ${topic.slug}`);
        continue;
      }

      fs.writeFileSync(filePath, markdown, "utf-8");
      generated.push(topic.slug);
      console.log(`[blog-gen] CREATED: ${filePath}`);

      if (i < topics.length - 1) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    } catch (err) {
      console.error(`[blog-gen] FAILED: ${topic.slug}`, err);
    }
  }

  console.log(
    `\n[blog-gen] Done! Generated ${generated.length} new blog posts:`
  );
  generated.forEach((slug) => console.log(`  - ${slug}`));

  const summaryPath = path.join(process.cwd(), "blog-gen-summary.json");
  fs.writeFileSync(
    summaryPath,
    JSON.stringify(
      {
        date: getTodayDate(),
        generated: generated.length,
        slugs: generated,
        topics: topics
          .filter((t) => generated.includes(t.slug))
          .map((t) => ({
            slug: t.slug,
            title: t.title,
            category: t.category,
          })),
      },
      null,
      2
    ),
    "utf-8"
  );
}

main().catch((err) => {
  console.error("[blog-gen] Fatal error:", err);
  process.exit(1);
});
