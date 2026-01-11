"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Terminal,
  Zap,
  Users,
  Database,
  ArrowRight,
  Sparkles,
  Code2,
  Copy,
  Check,
  Layers,
  Search,
  Scale,
  TrendingUp,
  Github,
  ChevronRight,
  Bot,
  Cpu,
} from "lucide-react";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { PixelBadge } from "@/components/pixel-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const IDE_CONFIGS = {
  cursor: {
    name: "Cursor",
    icon: Code2,
    color: "text-blue-400",
    config: `{
  "mcpServers": {
    "vibebuff": {
      "command": "npx",
      "args": ["-y", "vibebuff-mcp"],
      "env": {
        "VIBEBUFF_API_URL": "https://vibebuff.dev/api"
      }
    }
  }
}`,
    path: "~/.cursor/mcp.json",
  },
  windsurf: {
    name: "Windsurf",
    icon: Terminal,
    color: "text-cyan-400",
    config: `{
  "mcpServers": {
    "vibebuff": {
      "command": "npx",
      "args": ["-y", "vibebuff-mcp"],
      "env": {
        "VIBEBUFF_API_URL": "https://vibebuff.dev/api"
      }
    }
  }
}`,
    path: "~/.codeium/windsurf/mcp_config.json",
  },
  claude: {
    name: "Claude Desktop",
    icon: Bot,
    color: "text-orange-400",
    config: `{
  "mcpServers": {
    "vibebuff": {
      "command": "npx",
      "args": ["-y", "vibebuff-mcp"],
      "env": {
        "VIBEBUFF_API_URL": "https://vibebuff.dev/api"
      }
    }
  }
}`,
    path: "~/Library/Application Support/Claude/claude_desktop_config.json",
  },
};

const FEATURES = [
  {
    icon: Database,
    title: "500+ Developer Tools",
    description: "Access our complete database of developer tools with detailed information, pros/cons, and pricing.",
  },
  {
    icon: Scale,
    title: "Side-by-Side Comparisons",
    description: "Compare 2-4 tools instantly with feature matrices, performance scores, and community ratings.",
  },
  {
    icon: Sparkles,
    title: "AI Stack Recommendations",
    description: "Get personalized tech stack recommendations based on project type, budget, and team size.",
  },
  {
    icon: Users,
    title: "Community Insights",
    description: "Access stack recommendations and reviews from thousands of engineers in our community.",
  },
  {
    icon: Layers,
    title: "Pre-built Templates",
    description: "Start with battle-tested stack templates for SaaS, e-commerce, APIs, and more.",
  },
  {
    icon: TrendingUp,
    title: "Trend Analysis",
    description: "See what tools are trending, rising stars, and which ones are losing popularity.",
  },
];

const USE_CASES = [
  {
    title: "New Project Architecture",
    description: "Ask your AI assistant to recommend a complete stack for your new project. It will query VibeBuff for the latest tool data and community preferences.",
    example: '"Recommend a tech stack for a SaaS with real-time features, targeting startups, with a low budget"',
  },
  {
    title: "Tool Evaluation",
    description: "Before adopting a new tool, get comprehensive information including pros, cons, alternatives, and what other teams are using.",
    example: '"Compare Supabase vs Firebase vs Convex for a mobile app backend"',
  },
  {
    title: "Migration Planning",
    description: "Planning to migrate from one tool to another? Get insights on migration paths and what other teams have experienced.",
    example: '"What are the pros and cons of migrating from Prisma to Drizzle?"',
  },
  {
    title: "Team Onboarding",
    description: "Help new team members understand your tech stack by providing context on why each tool was chosen.",
    example: '"Explain the benefits of our Next.js + Convex + Clerk stack"',
  },
];

const TOOLS_AVAILABLE = [
  { name: "recommend_stack", description: "Get AI-powered stack recommendations based on project requirements" },
  { name: "search_tools", description: "Search 500+ developer tools by name, category, or use case" },
  { name: "get_tool_details", description: "Get detailed information about any tool including pros, cons, and alternatives" },
  { name: "compare_tools", description: "Compare 2-4 tools side by side with feature and score comparisons" },
  { name: "get_stack_template", description: "Get pre-built stack templates for common project types" },
  { name: "get_categories", description: "List all tool categories with counts" },
];

export default function McpPage() {
  const [selectedIde, setSelectedIde] = useState<keyof typeof IDE_CONFIGS>("cursor");
  const [copiedConfig, setCopiedConfig] = useState(false);

  const handleCopyConfig = async () => {
    await navigator.clipboard.writeText(IDE_CONFIGS[selectedIde].config);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-background" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="text-muted-foreground hover:text-primary text-sm">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-primary text-sm">Connect to VibeBuff MCP</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-500/20 p-3 rounded-xl border border-purple-400/30">
                <Terminal className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground font-heading">
                    Connect to VibeBuff MCP
                  </h1>
                  <PixelBadge variant="default">Official</PixelBadge>
                </div>
              </div>
            </div>

            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              Connect your AI coding assistant to VibeBuff and get direct access to 500+ developer tools, 
              community stack recommendations, and real-time comparisons. 
              <span className="text-primary font-medium"> Set up in under 2 minutes.</span>
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="#installation">
                <PixelButton size="lg" className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </PixelButton>
              </a>
              <a
                href="https://github.com/kavymi/mcp-server"
                target="_blank"
                rel="noopener noreferrer"
              >
                <PixelButton variant="outline" size="lg" className="flex items-center gap-2">
                  <Github className="w-5 h-5" />
                  View on GitHub
                </PixelButton>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="installation" className="py-16 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground font-heading mb-4">
              Quick Installation
            </h2>
            <p className="text-muted-foreground">
              Add VibeBuff to your AI assistant in under 2 minutes
            </p>
          </div>

          <PixelCard>
            <PixelCardContent className="p-6">
              <Tabs value={selectedIde} onValueChange={(v) => setSelectedIde(v as keyof typeof IDE_CONFIGS)}>
                <TabsList className="flex flex-wrap gap-1 h-auto bg-muted p-1 rounded-lg mb-6">
                  {Object.entries(IDE_CONFIGS).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <TabsTrigger
                        key={key}
                        value={key}
                        className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-background"
                      >
                        <Icon className={`w-4 h-4 ${config.color}`} />
                        {config.name}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {Object.entries(IDE_CONFIGS).map(([key, config]) => (
                  <TabsContent key={key} value={key} className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Config path: <code className="text-foreground bg-muted px-2 py-0.5 rounded">{config.path}</code>
                      </span>
                    </div>

                    <div className="relative">
                      <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm">
                        <code className="text-foreground">{config.config}</code>
                      </pre>
                      <button
                        onClick={handleCopyConfig}
                        className="absolute top-3 right-3 p-2 rounded-md bg-background/80 hover:bg-background transition-colors border border-border"
                      >
                        {copiedConfig ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </div>

                    <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
                      <p className="text-sm text-muted-foreground">
                        <span className="text-purple-400 font-medium">Tip:</span> After adding the config, 
                        restart your IDE to activate the MCP server. Then ask your AI assistant about any developer tool!
                      </p>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </PixelCardContent>
          </PixelCard>
        </div>
      </section>

      <section className="py-16 border-b border-border bg-muted/30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground font-heading mb-4">
              What You Get
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Access the collective knowledge of thousands of developers directly in your AI assistant
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <PixelCard className="h-full">
                  <PixelCardContent className="p-6">
                    <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </PixelCardContent>
                </PixelCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground font-heading mb-4">
              Available Tools
            </h2>
            <p className="text-muted-foreground">
              These tools become available to your AI assistant after installation
            </p>
          </div>

          <div className="grid gap-3">
            {TOOLS_AVAILABLE.map((tool, index) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <PixelCard>
                  <PixelCardContent className="p-4 flex items-start gap-4">
                    <div className="bg-purple-500/10 p-2 rounded-lg">
                      <Cpu className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <code className="text-primary font-mono text-sm">{tool.name}</code>
                      <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
                    </div>
                  </PixelCardContent>
                </PixelCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 border-b border-border bg-muted/30">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground font-heading mb-4">
              Example Use Cases
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real scenarios where VibeBuff MCP saves your team hours of research
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {USE_CASES.map((useCase, index) => (
              <motion.div
                key={useCase.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <PixelCard className="h-full">
                  <PixelCardContent className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">{useCase.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{useCase.description}</p>
                    <div className="bg-background/50 rounded-lg p-3 border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Example prompt:</p>
                      <p className="text-sm text-primary italic">{useCase.example}</p>
                    </div>
                  </PixelCardContent>
                </PixelCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <PixelCard className="bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-background border-purple-500/30">
            <PixelCardContent className="p-8 text-center">
              <Terminal className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground font-heading mb-4">
                Ready to Supercharge Your AI Assistant?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Join thousands of developers who use VibeBuff MCP to make faster, 
                better-informed technology decisions without leaving their IDE.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="#installation">
                  <PixelButton size="lg" className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Install Now
                  </PixelButton>
                </a>
                <Link href="/tools">
                  <PixelButton variant="outline" size="lg" className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Browse Tools
                  </PixelButton>
                </Link>
              </div>
            </PixelCardContent>
          </PixelCard>
        </div>
      </section>
    </div>
  );
}
