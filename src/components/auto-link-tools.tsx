"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { sanitizeHtml } from "@/lib/sanitize";

interface ToolInfo {
  name: string;
  slug: string;
}

interface TextSegment {
  type: "text" | "tool";
  content: string;
  slug?: string;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseTextWithTools(text: string, tools: ToolInfo[]): TextSegment[] {
  if (!tools || tools.length === 0) {
    return [{ type: "text", content: text }];
  }

  const sortedTools = [...tools].sort((a, b) => b.name.length - a.name.length);

  const toolMap = new Map<string, ToolInfo>();
  for (const tool of sortedTools) {
    toolMap.set(tool.name.toLowerCase(), tool);
  }

  const pattern = sortedTools
    .map((t) => `\\b${escapeRegex(t.name)}\\b`)
    .join("|");
  const regex = new RegExp(`(${pattern})`, "gi");

  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: text.slice(lastIndex, match.index),
      });
    }

    const matchedText = match[0];
    const tool = toolMap.get(matchedText.toLowerCase());

    if (tool) {
      segments.push({
        type: "tool",
        content: matchedText,
        slug: tool.slug,
      });
    } else {
      segments.push({
        type: "text",
        content: matchedText,
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  return segments;
}

interface AutoLinkToolsProps {
  text: string;
  className?: string;
  linkClassName?: string;
}

export function AutoLinkTools({
  text,
  className,
  linkClassName = "text-primary hover:underline cursor-pointer",
}: AutoLinkToolsProps) {
  const tools = useQuery(api.tools.getAllNamesAndSlugs);

  const segments = useMemo(() => {
    if (!tools) return [{ type: "text" as const, content: text }];
    return parseTextWithTools(text, tools);
  }, [text, tools]);

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.type === "tool" && segment.slug) {
          return (
            <Link
              key={index}
              href={`/tools/${segment.slug}`}
              className={linkClassName}
              onClick={(e) => e.stopPropagation()}
            >
              {segment.content}
            </Link>
          );
        }
        return <span key={index}>{segment.content}</span>;
      })}
    </span>
  );
}

export function autoLinkToolsInHtml(
  html: string,
  tools: ToolInfo[]
): string {
  if (!tools || tools.length === 0) return html;

  const sortedTools = [...tools].sort((a, b) => b.name.length - a.name.length);

  let result = html;

  for (const tool of sortedTools) {
    const pattern = new RegExp(
      `(?<!<[^>]*|href=["'][^"']*|>)\\b(${escapeRegex(tool.name)})\\b(?![^<]*>)`,
      "gi"
    );
    result = result.replace(
      pattern,
      `<a href="/tools/${tool.slug}" class="text-primary hover:underline">$1</a>`
    );
  }

  return result;
}

interface AutoLinkToolsHtmlProps {
  html: string;
  className?: string;
}

export function AutoLinkToolsHtml({ html, className }: AutoLinkToolsHtmlProps) {
  const tools = useQuery(api.tools.getAllNamesAndSlugs);

  const linkedHtml = useMemo(() => {
    if (!tools) return sanitizeHtml(html);
    return sanitizeHtml(autoLinkToolsInHtml(html, tools));
  }, [html, tools]);

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: linkedHtml }}
    />
  );
}
