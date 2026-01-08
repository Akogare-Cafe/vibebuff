"use client";

import { useState, Suspense } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import {
  Search,
  ThumbsUp,
  Download,
  ExternalLink,
  Github,
  Globe,
  BookOpen,
  Database,
  Cloud,
  Wrench,
  Bot,
  Shield,
  MessageSquare,
  FolderOpen,
  GitBranch,
  FileText,
  TestTube,
  Rocket,
  Package,
  CheckCircle,
  BadgeCheck,
  Star,
  ChevronRight,
  Plus,
  Copy,
  Check,
  Terminal,
  Code,
  Zap,
  BarChart3,
} from "lucide-react";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { PixelBadge } from "@/components/pixel-badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  database: Database,
  api: Globe,
  devtools: Wrench,
  productivity: Zap,
  ai: Bot,
  cloud: Cloud,
  analytics: BarChart3,
  security: Shield,
  communication: MessageSquare,
  file_system: FolderOpen,
  version_control: GitBranch,
  documentation: FileText,
  testing: TestTube,
  deployment: Rocket,
  other: Package,
};

const categoryLabels: Record<string, string> = {
  database: "Database",
  api: "API",
  devtools: "Dev Tools",
  productivity: "Productivity",
  ai: "AI",
  cloud: "Cloud",
  analytics: "Analytics",
  security: "Security",
  communication: "Communication",
  file_system: "File System",
  version_control: "Version Control",
  documentation: "Documentation",
  testing: "Testing",
  deployment: "Deployment",
  other: "Other",
};

const ideInfo: Record<string, { name: string; icon: React.ComponentType<{ className?: string }>; configPath: string; color: string }> = {
  cursor: {
    name: "Cursor",
    icon: Code,
    configPath: "~/.cursor/mcp.json",
    color: "text-blue-400",
  },
  windsurf: {
    name: "Windsurf",
    icon: Terminal,
    configPath: "~/.codeium/windsurf/mcp_config.json",
    color: "text-cyan-400",
  },
  claude_code: {
    name: "Claude Code",
    icon: Terminal,
    configPath: ".mcp.json or CLI",
    color: "text-orange-400",
  },
  vscode: {
    name: "VS Code",
    icon: Code,
    configPath: ".vscode/mcp.json",
    color: "text-blue-500",
  },
  claude_desktop: {
    name: "Claude Desktop",
    icon: Bot,
    configPath: "~/Library/Application Support/Claude/claude_desktop_config.json",
    color: "text-orange-500",
  },
  jetbrains: {
    name: "JetBrains",
    icon: Code,
    configPath: "Settings > AI Assistant > MCP",
    color: "text-purple-400",
  },
  zed: {
    name: "Zed",
    icon: Zap,
    configPath: "~/.config/zed/settings.json",
    color: "text-green-400",
  },
  neovim: {
    name: "Neovim",
    icon: Terminal,
    configPath: "~/.config/nvim/mcp.json",
    color: "text-green-500",
  },
};

export default function McpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-primary text-sm animate-pulse">Loading MCP Directory...</div>
        </div>
      }
    >
      <McpPageContent />
    </Suspense>
  );
}

function McpPageContent() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedServer, setSelectedServer] = useState<Id<"mcpServers"> | null>(null);
  const [selectedIde, setSelectedIde] = useState("cursor");
  const [copiedConfig, setCopiedConfig] = useState(false);

  const servers = useQuery(api.mcpServers.list, {
    category: selectedCategory || undefined,
    search: searchQuery || undefined,
  });
  const categories = useQuery(api.mcpServers.getCategories);
  const selectedServerData = useQuery(
    api.mcpServers.getById,
    selectedServer ? { id: selectedServer } : "skip"
  );
  const hasUpvoted = useQuery(
    api.mcpServers.hasUpvoted,
    selectedServer && user?.id ? { mcpServerId: selectedServer, userId: user.id } : "skip"
  );

  const upvote = useMutation(api.mcpServers.upvote);
  const trackInstall = useMutation(api.mcpServers.trackInstall);
  const seedServers = useMutation(api.mcpServers.seedMcpServers);

  const handleUpvote = async (serverId: Id<"mcpServers">) => {
    if (!user?.id) return;
    await upvote({ mcpServerId: serverId, userId: user.id });
  };

  const handleCopyConfig = async (config: string) => {
    await navigator.clipboard.writeText(config);
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
    if (selectedServer && user?.id) {
      await trackInstall({ mcpServerId: selectedServer, userId: user.id, ide: selectedIde });
    }
  };

  const selectedConfig = selectedServerData?.configs?.find((c) => c.ide === selectedIde);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground font-heading">MCP Directory</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Browse and install Model Context Protocol servers for your favorite IDE. Connect your AI assistant to databases, APIs, and tools.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-80 flex-shrink-0">
            <PixelCard className="sticky top-4">
              <PixelCardContent className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search MCP servers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === null
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    All Categories
                    <span className="ml-auto text-xs opacity-70">
                      {servers?.length || 0}
                    </span>
                  </button>

                  {categories?.map(({ category, count }) => {
                    const Icon = categoryIcons[category] || Package;
                    return (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedCategory === category
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {categoryLabels[category] || category}
                        <span className="ml-auto text-xs opacity-70">{count}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <Link href="/mcp/submit">
                    <PixelButton variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Submit MCP Server
                    </PixelButton>
                  </Link>
                </div>

                {!servers?.length && (
                  <div className="mt-4">
                    <PixelButton
                      variant="secondary"
                      className="w-full text-xs"
                      onClick={() => seedServers()}
                    >
                      Seed Sample Data
                    </PixelButton>
                  </div>
                )}
              </PixelCardContent>
            </PixelCard>
          </div>

          <div className="flex-1">
            {selectedServer && selectedServerData ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <button
                  onClick={() => setSelectedServer(null)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back to list
                </button>

                <PixelCard rarity={selectedServerData.isFeatured ? "legendary" : "common"}>
                  <PixelCardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {selectedServerData.logoUrl ? (
                          <img
                            src={selectedServerData.logoUrl}
                            alt={selectedServerData.name}
                            className="w-12 h-12 rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            {(() => {
                              const Icon = categoryIcons[selectedServerData.category] || Package;
                              return <Icon className="w-6 h-6 text-muted-foreground" />;
                            })()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <PixelCardTitle>{selectedServerData.name}</PixelCardTitle>
                            {selectedServerData.isVerified && (
                              <BadgeCheck className="w-5 h-5 text-blue-500" />
                            )}
                            {selectedServerData.isOfficial && (
                              <PixelBadge variant="default" className="text-xs">
                                Official
                              </PixelBadge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {selectedServerData.author && `by ${selectedServerData.author}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpvote(selectedServerData._id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                            hasUpvoted
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          {selectedServerData.upvotes}
                        </button>
                      </div>
                    </div>
                  </PixelCardHeader>

                  <PixelCardContent>
                    <p className="text-foreground mb-4">{selectedServerData.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedServerData.tags.map((tag) => (
                        <PixelBadge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </PixelBadge>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        {selectedServerData.installCount.toLocaleString()} installs
                      </span>
                      {selectedServerData.transportTypes.map((t) => (
                        <PixelBadge key={t} variant="secondary" className="text-xs uppercase">
                          {t}
                        </PixelBadge>
                      ))}
                      {selectedServerData.supportsOAuth && (
                        <PixelBadge variant="secondary" className="text-xs">
                          OAuth
                        </PixelBadge>
                      )}
                    </div>

                    <div className="flex gap-3 mb-6">
                      {selectedServerData.websiteUrl && (
                        <a
                          href={selectedServerData.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <Globe className="w-4 h-4" />
                          Website
                        </a>
                      )}
                      {selectedServerData.githubUrl && (
                        <a
                          href={selectedServerData.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <Github className="w-4 h-4" />
                          GitHub
                        </a>
                      )}
                      {selectedServerData.docsUrl && (
                        <a
                          href={selectedServerData.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          <BookOpen className="w-4 h-4" />
                          Docs
                        </a>
                      )}
                    </div>

                    <div className="border-t border-border pt-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4 font-heading">
                        Installation
                      </h3>

                      <Tabs value={selectedIde} onValueChange={setSelectedIde}>
                        <TabsList className="flex flex-wrap gap-1 h-auto bg-muted p-1 rounded-lg mb-4">
                          {Object.entries(ideInfo).map(([key, info]) => {
                            const hasConfig = selectedServerData.configs?.some((c) => c.ide === key);
                            if (!hasConfig) return null;
                            const Icon = info.icon;
                            return (
                              <TabsTrigger
                                key={key}
                                value={key}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs data-[state=active]:bg-background"
                              >
                                <Icon className={`w-3.5 h-3.5 ${info.color}`} />
                                {info.name}
                              </TabsTrigger>
                            );
                          })}
                        </TabsList>

                        {selectedConfig && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Config path: <code className="text-foreground">{ideInfo[selectedIde]?.configPath}</code>
                              </span>
                            </div>

                            {selectedConfig.setupInstructions && (
                              <p className="text-sm text-muted-foreground">
                                {selectedConfig.setupInstructions}
                              </p>
                            )}

                            <div className="relative">
                              <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm">
                                <code className="text-foreground">{selectedConfig.configJson}</code>
                              </pre>
                              <button
                                onClick={() => handleCopyConfig(selectedConfig.configJson)}
                                className="absolute top-2 right-2 p-2 rounded-md bg-background/80 hover:bg-background transition-colors"
                              >
                                {copiedConfig ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4 text-muted-foreground" />
                                )}
                              </button>
                            </div>

                            {selectedConfig.envVars && selectedConfig.envVars.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-semibold text-foreground mb-2">
                                  Environment Variables
                                </h4>
                                <div className="space-y-2">
                                  {selectedConfig.envVars.map((env) => (
                                    <div
                                      key={env.name}
                                      className="flex items-start gap-2 text-sm"
                                    >
                                      <code className="text-primary">{env.name}</code>
                                      {env.required && (
                                        <PixelBadge variant="secondary" className="text-xs bg-red-500/20 text-red-400">
                                          Required
                                        </PixelBadge>
                                      )}
                                      <span className="text-muted-foreground">
                                        {env.description}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </Tabs>
                    </div>

                    {selectedServerData.tools && selectedServerData.tools.length > 0 && (
                      <div className="border-t border-border pt-6 mt-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4 font-heading">
                          Available Tools ({selectedServerData.tools.length})
                        </h3>
                        <div className="grid gap-2">
                          {selectedServerData.tools.map((tool) => (
                            <div
                              key={tool._id}
                              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                            >
                              <Wrench className="w-4 h-4 text-primary mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {tool.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {tool.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </PixelCardContent>
                </PixelCard>
              </motion.div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <AnimatePresence mode="popLayout">
                  {servers?.map((server, index) => {
                    const Icon = categoryIcons[server.category] || Package;
                    return (
                      <motion.div
                        key={server._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <PixelCard
                          rarity={server.isFeatured ? "rare" : "common"}
                          className="cursor-pointer h-full"
                          onClick={() => setSelectedServer(server._id)}
                        >
                          <PixelCardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {server.logoUrl ? (
                                <img
                                  src={server.logoUrl}
                                  alt={server.name}
                                  className="w-10 h-10 rounded-lg"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                  <Icon className="w-5 h-5 text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-foreground truncate">
                                    {server.name}
                                  </h3>
                                  {server.isVerified && (
                                    <BadgeCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                  {server.shortDescription || server.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Download className="w-3.5 h-3.5" />
                                  {server.installCount.toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                  {server.upvotes}
                                </span>
                              </div>
                              <div className="flex gap-1">
                                {server.transportTypes.slice(0, 2).map((t) => (
                                  <PixelBadge
                                    key={t}
                                    variant="secondary"
                                    className="text-xs uppercase"
                                  >
                                    {t}
                                  </PixelBadge>
                                ))}
                              </div>
                            </div>
                          </PixelCardContent>
                        </PixelCard>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {servers?.length === 0 && (
                  <div className="col-span-2 text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No MCP servers found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery
                        ? "Try a different search term"
                        : "Be the first to submit an MCP server!"}
                    </p>
                    <Link href="/mcp/submit">
                      <PixelButton>
                        <Plus className="w-4 h-4 mr-2" />
                        Submit MCP Server
                      </PixelButton>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
