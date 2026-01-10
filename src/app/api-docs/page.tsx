"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Code2,
  Copy,
  Check,
  Terminal,
  Database,
  Zap,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Globe,
  ChevronRight,
  Search,
  Scale,
  Layers,
  Bot,
} from "lucide-react";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { PixelBadge } from "@/components/pixel-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API_ENDPOINTS = [
  {
    method: "GET",
    path: "/api/ai/tools",
    description: "List all developer tools with metadata",
    params: [
      { name: "category", type: "string", required: false, description: "Filter by category slug" },
      { name: "limit", type: "number", required: false, description: "Max results (default: 50)" },
    ],
    response: `{
  "tools": [
    {
      "slug": "nextjs",
      "name": "Next.js",
      "tagline": "The React Framework for the Web",
      "category": "Frontend Framework",
      "pricing": "free",
      "isOpenSource": true,
      "url": "https://vibebuff.dev/tools/nextjs"
    }
  ],
  "total": 500,
  "_meta": {
    "source": "VibeBuff",
    "documentation": "https://vibebuff.dev/llms.txt"
  }
}`,
  },
  {
    method: "GET",
    path: "/api/ai/tools/{slug}",
    description: "Get detailed information about a specific tool",
    params: [
      { name: "slug", type: "string", required: true, description: "Tool identifier (e.g., nextjs, supabase)" },
    ],
    response: `{
  "tool": {
    "slug": "nextjs",
    "name": "Next.js",
    "tagline": "The React Framework for the Web",
    "description": "Next.js is a React framework...",
    "category": "Frontend Framework",
    "pricing": "free",
    "isOpenSource": true,
    "pros": ["Great DX", "Excellent performance"],
    "cons": ["Learning curve"],
    "features": ["SSR", "SSG", "API Routes"],
    "bestFor": ["Web apps", "E-commerce"],
    "website": "https://nextjs.org",
    "github": "https://github.com/vercel/next.js"
  },
  "alternatives": [...]
}`,
  },
  {
    method: "GET",
    path: "/api/ai/compare",
    description: "Compare 2-4 tools side by side",
    params: [
      { name: "tools", type: "string", required: true, description: "Comma-separated tool slugs (e.g., nextjs,remix,sveltekit)" },
    ],
    response: `{
  "tools": [
    {
      "slug": "nextjs",
      "name": "Next.js",
      "found": true,
      "category": "Frontend Framework",
      "pricing": "free",
      "isOpenSource": true,
      "pros": [...],
      "cons": [...]
    }
  ],
  "summary": "Comparison of Next.js vs Remix...",
  "notFound": []
}`,
  },
  {
    method: "GET",
    path: "/api/ai/categories",
    description: "List all tool categories with counts",
    params: [],
    response: `{
  "categories": [
    {
      "slug": "frontend",
      "name": "Frontend Framework",
      "description": "UI frameworks and libraries",
      "toolCount": 45,
      "popularTools": ["nextjs", "react", "vue"]
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/ai/recommend",
    description: "Get AI-powered stack recommendations",
    params: [
      { name: "type", type: "string", required: true, description: "Project type: saas, ecommerce, blog, portfolio, api, mobile, ai-app, realtime" },
      { name: "budget", type: "string", required: false, description: "Budget: free, low, medium, high, enterprise" },
      { name: "scale", type: "string", required: false, description: "Scale: hobby, startup, growth, enterprise" },
    ],
    response: `{
  "recommendation": {
    "type": "saas",
    "name": "Modern SaaS Stack",
    "description": "Full-stack for SaaS applications",
    "stack": {
      "frontend": {
        "primary": { "name": "Next.js", "slug": "nextjs" },
        "alternatives": [...]
      },
      "database": {...},
      "auth": {...}
    },
    "estimatedCost": "$0-50/month"
  }
}`,
  },
];

const AI_RESOURCES = [
  {
    name: "llms.txt",
    path: "/llms.txt",
    description: "AI-readable site description for LLM crawlers",
  },
  {
    name: "OpenAPI Spec",
    path: "/.well-known/openapi.yaml",
    description: "OpenAPI 3.0 specification for API integration",
  },
  {
    name: "AI Plugin Manifest",
    path: "/.well-known/ai-plugin.json",
    description: "ChatGPT plugin manifest for GPT integration",
  },
  {
    name: "MCP Server",
    path: "/mcp/vibebuff",
    description: "Model Context Protocol server for AI assistants",
  },
];

export default function ApiDocsPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border bg-gradient-to-br from-green-900/20 via-background to-background">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center gap-2 mb-4 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary">Home</Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-primary">API Documentation</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-500/20 p-3 rounded-xl border border-green-400/30">
                <Code2 className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground font-heading">
                  AI API Documentation
                </h1>
              </div>
            </div>

            <p className="text-xl text-muted-foreground mb-6 max-w-2xl">
              Public API endpoints for AI agents, LLMs, and developers. 
              Access 500+ developer tools programmatically with no authentication required.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="#endpoints">
                <PixelButton className="flex items-center gap-2">
                  <Terminal className="w-4 h-4" />
                  View Endpoints
                </PixelButton>
              </a>
              <a href="/.well-known/openapi.yaml" target="_blank" rel="noopener noreferrer">
                <PixelButton variant="outline" className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  OpenAPI Spec
                </PixelButton>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 border-b border-border">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground font-heading mb-6">AI Discovery Resources</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {AI_RESOURCES.map((resource) => (
              <PixelCard key={resource.path} className="h-full">
                <PixelCardContent className="p-4">
                  <h3 className="text-primary font-semibold mb-1">{resource.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{resource.description}</p>
                  <a
                    href={resource.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-400 hover:underline flex items-center gap-1"
                  >
                    <code>{resource.path}</code>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </PixelCardContent>
              </PixelCard>
            ))}
          </div>
        </div>
      </section>

      <section id="endpoints" className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-foreground font-heading mb-2">API Endpoints</h2>
          <p className="text-muted-foreground mb-8">
            Base URL: <code className="text-green-400 bg-muted px-2 py-0.5 rounded">https://vibebuff.dev/api/ai</code>
          </p>

          <div className="space-y-6">
            {API_ENDPOINTS.map((endpoint, index) => (
              <motion.div
                key={endpoint.path}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <PixelCard>
                  <PixelCardHeader>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <PixelBadge variant="default" className="bg-green-500/20 text-green-400 border-green-500/30">
                          {endpoint.method}
                        </PixelBadge>
                        <code className="text-primary font-mono">{endpoint.path}</code>
                      </div>
                      <button
                        onClick={() => handleCopy(`curl "https://vibebuff.dev${endpoint.path.replace("{slug}", "nextjs")}"`, endpoint.path)}
                        className="p-2 rounded-md hover:bg-muted transition-colors"
                      >
                        {copiedEndpoint === endpoint.path ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                    <p className="text-muted-foreground text-sm mt-2">{endpoint.description}</p>
                  </PixelCardHeader>

                  <PixelCardContent>
                    {endpoint.params.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-foreground mb-2">Parameters</h4>
                        <div className="space-y-2">
                          {endpoint.params.map((param) => (
                            <div key={param.name} className="flex items-start gap-2 text-sm">
                              <code className="text-green-400 bg-muted px-1.5 py-0.5 rounded">{param.name}</code>
                              <span className="text-muted-foreground">({param.type})</span>
                              {param.required && (
                                <PixelBadge variant="secondary" className="text-xs">required</PixelBadge>
                              )}
                              <span className="text-muted-foreground">- {param.description}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Response</h4>
                      <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-xs">
                        <code className="text-foreground">{endpoint.response}</code>
                      </pre>
                    </div>
                  </PixelCardContent>
                </PixelCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 border-t border-border bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Bot className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground font-heading mb-4">
            Build with VibeBuff API
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Integrate VibeBuff data into your AI assistant, CLI tool, or application. 
            No API key required for public endpoints.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/mcp/vibebuff">
              <PixelButton className="flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                MCP Server
              </PixelButton>
            </Link>
            <a href="/llms.txt" target="_blank" rel="noopener noreferrer">
              <PixelButton variant="outline" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                llms.txt
              </PixelButton>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
