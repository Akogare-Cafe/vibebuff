"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { markdownToSanitizedHtml } from "@/lib/sanitize";

interface ToolInfo {
  name: string;
  slug: string;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function autoLinkToolsInHtml(html: string, tools: ToolInfo[]): string {
  if (!tools || tools.length === 0) return html;

  const sortedTools = [...tools].sort((a, b) => b.name.length - a.name.length);

  let result = html;

  for (const tool of sortedTools) {
    const pattern = new RegExp(
      `(?<![">])\\b(${escapeRegex(tool.name)})\\b(?![^<]*<\\/a>)(?![^<]*>)`,
      "gi"
    );
    result = result.replace(
      pattern,
      `<a href="/tools/${tool.slug}" class="text-primary hover:underline">$1</a>`
    );
  }

  return result;
}

interface BlogContentProps {
  content: string;
  className?: string;
}

export function BlogContent({ content, className }: BlogContentProps) {
  const tools = useQuery(api.tools.getAllNamesAndSlugs);

  const linkedHtml = useMemo(() => {
    const baseHtml = markdownToSanitizedHtml(content);
    if (!tools) return baseHtml;
    return autoLinkToolsInHtml(baseHtml, tools);
  }, [content, tools]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: linkedHtml }}
    />
  );
}
