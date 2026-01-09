"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MarkdownRenderer } from "./markdown-renderer";

interface BlogContentProps {
  content: string;
  className?: string;
}

export function BlogContent({ content, className }: BlogContentProps) {
  const tools = useQuery(api.tools.getAllNamesAndSlugs);

  return (
    <MarkdownRenderer
      content={content}
      className={className}
      toolLinks={tools ?? undefined}
    />
  );
}
