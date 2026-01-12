"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { CodeBlock } from "./code-block";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  toolLinks?: { name: string; slug: string }[];
}

function linkifyToolNames(text: string, toolLinks?: { name: string; slug: string }[]): React.ReactNode {
  if (!toolLinks || toolLinks.length === 0) return text;
  
  const sortedTools = [...toolLinks].sort((a, b) => b.name.length - a.name.length);
  
  let result: React.ReactNode[] = [text];
  
  for (const tool of sortedTools) {
    const newResult: React.ReactNode[] = [];
    for (const part of result) {
      if (typeof part !== "string") {
        newResult.push(part);
        continue;
      }
      
      const regex = new RegExp(`\\b(${tool.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`, "gi");
      const segments = part.split(regex);
      
      for (let i = 0; i < segments.length; i++) {
        if (segments[i].toLowerCase() === tool.name.toLowerCase()) {
          newResult.push(
            <a
              key={`${tool.slug}-${i}`}
              href={`/tools/${tool.slug}`}
              className="text-primary hover:underline"
            >
              {segments[i]}
            </a>
          );
        } else if (segments[i]) {
          newResult.push(segments[i]);
        }
      }
    }
    result = newResult;
  }
  
  return result.length === 1 ? result[0] : result;
}

export function MarkdownRenderer({ content, className, toolLinks }: MarkdownRendererProps) {
  const components: Components = {
    h2: ({ children }) => (
      <h2 className="text-primary text-sm mt-8 mb-4 font-semibold">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-muted-foreground text-[11px] mt-6 mb-3 font-medium">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-muted-foreground text-[11px] mt-4 mb-2 font-medium">{children}</h4>
    ),
    p: ({ children }) => (
      <p className="mb-4 text-muted-foreground">{children}</p>
    ),
    strong: ({ children }) => (
      <strong className="text-primary font-semibold">{children}</strong>
    ),
    a: ({ href, children }) => (
      <a
        href={href}
        className="text-muted-foreground hover:text-primary underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    ul: ({ children }) => (
      <ul className="list-disc ml-6 mb-4 space-y-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal ml-6 mb-4 space-y-1">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="text-[#a0aec0]">{children}</li>
    ),
    code: ({ className, children }) => {
      const isInline = !className;
      return (
        <code className={isInline ? "bg-card px-1.5 py-0.5 rounded text-primary text-xs border border-border" : "text-primary text-xs"}>
          {children}
        </code>
      );
    },
    pre: ({ children }) => {
      const codeContent = children && typeof children === "object" && "props" in children 
        ? (children as any).props.children 
        : children;
      
      return <CodeBlock>{codeContent}</CodeBlock>;
    },
    table: ({ children }) => (
      <div className="overflow-x-auto my-4">
        <table className="w-full border-collapse text-xs">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead>{children}</thead>
    ),
    tbody: ({ children }) => (
      <tbody>{children}</tbody>
    ),
    tr: ({ children }) => (
      <tr>{children}</tr>
    ),
    th: ({ children }) => (
      <th className="border border-border bg-card px-3 py-2 text-left text-primary font-semibold">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-border px-3 py-2 text-muted-foreground">
        {typeof children === "string" ? linkifyToolNames(children, toolLinks) : children}
      </td>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground">
        {children}
      </blockquote>
    ),
    hr: () => (
      <hr className="border-border my-6" />
    ),
  };

  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
