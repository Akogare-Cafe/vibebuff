"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bot,
  Cpu,
  Zap,
  Database,
  Code2,
  Package,
  Star,
  ExternalLink,
  Github,
  BookOpen,
  Puzzle,
  Sparkles,
  TrendingUp,
  Calendar,
  Eye,
  Layers,
  Terminal,
  Wrench,
  Globe,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { PixelBadge } from "@/components/pixel-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const CLAUDE_MODELS_STATIC = [
  {
    modelId: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    family: "claude-3-5",
    releaseDate: "2024-10-22",
    contextWindow: 200000,
    maxOutput: 8192,
    capabilities: ["vision", "tool_use", "extended_thinking"],
    description: "Most intelligent model with extended thinking capabilities",
  },
  {
    modelId: "claude-3-5-haiku-20241022",
    name: "Claude 3.5 Haiku",
    family: "claude-3-5",
    releaseDate: "2024-10-22",
    contextWindow: 200000,
    maxOutput: 8192,
    capabilities: ["vision", "tool_use"],
    description: "Fastest and most cost-effective model",
  },
  {
    modelId: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    family: "claude-3",
    releaseDate: "2024-02-29",
    contextWindow: 200000,
    maxOutput: 4096,
    capabilities: ["vision", "tool_use"],
    description: "Most capable Claude 3 model for complex tasks",
  },
];

const AWESOME_LISTS = [
  {
    name: "awesome-claude-code",
    url: "https://github.com/anthropics/awesome-claude-code",
    description: "Official Anthropic curated list of Claude code resources",
    stars: 1200,
  },
  {
    name: "awesome-claude",
    url: "https://github.com/iankelk/awesome-claude",
    description: "Community awesome list for Claude AI",
    stars: 850,
  },
  {
    name: "awesome-claude-prompts",
    url: "https://github.com/langgptai/awesome-claude-prompts",
    description: "Collection of Claude prompts and techniques",
    stars: 620,
  },
];

export default function ClaudePage() {
  const [selectedTab, setSelectedTab] = useState("models");
  
  const stats = useQuery(api.claude.getClaudeStats);
  const models = useQuery(api.claude.getClaudeModels);
  const mcpServers = useQuery(api.claude.getClaudeMcpServers, {});
  const resources = useQuery(api.claude.getClaudeResources, {});
  const releases = useQuery(api.claude.getClaudeReleases, { limit: 5 });

  const displayModels = models && models.length > 0 ? models : CLAUDE_MODELS_STATIC;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bot className="w-12 h-12 text-orange-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent">
              Claude Ecosystem
            </h1>
          </div>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Comprehensive directory of Claude models, MCP servers, skills, plugins, and community resources
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12"
        >
          <PixelCard className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20">
            <PixelCardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Cpu className="w-6 h-6 text-orange-400" />
                <h3 className="text-lg font-bold text-white">Models</h3>
              </div>
              <p className="text-3xl font-bold text-orange-400">
                {stats?.totalModels || displayModels.length}
              </p>
              <p className="text-sm text-gray-400">Latest: {stats?.latestFamily || "claude-3-5"}</p>
            </PixelCardContent>
          </PixelCard>

          <PixelCard className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <PixelCardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Terminal className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-bold text-white">MCP Servers</h3>
              </div>
              <p className="text-3xl font-bold text-blue-400">
                {stats?.totalMcpServers || 0}
              </p>
              <p className="text-sm text-gray-400">
                {stats?.officialMcpServers || 0} official, {stats?.communityMcpServers || 0} community
              </p>
            </PixelCardContent>
          </PixelCard>

          <PixelCard className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <PixelCardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-6 h-6 text-purple-400" />
                <h3 className="text-lg font-bold text-white">Resources</h3>
              </div>
              <p className="text-3xl font-bold text-purple-400">
                {stats?.totalResources || 0}
              </p>
              <p className="text-sm text-gray-400">Skills, plugins, extensions</p>
            </PixelCardContent>
          </PixelCard>

          <PixelCard className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <PixelCardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
                <h3 className="text-lg font-bold text-white">Releases</h3>
              </div>
              <p className="text-3xl font-bold text-green-400">
                {stats?.totalReleases || 0}
              </p>
              <p className="text-sm text-gray-400">SDK updates tracked</p>
            </PixelCardContent>
          </PixelCard>
        </motion.div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-gray-900/50 border border-gray-800">
            <TabsTrigger value="models" className="data-[state=active]:bg-orange-500/20">
              <Cpu className="w-4 h-4 mr-2" />
              Models
            </TabsTrigger>
            <TabsTrigger value="mcp" className="data-[state=active]:bg-blue-500/20">
              <Terminal className="w-4 h-4 mr-2" />
              MCP Servers
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-purple-500/20">
              <Puzzle className="w-4 h-4 mr-2" />
              Skills & Plugins
            </TabsTrigger>
            <TabsTrigger value="awesome" className="data-[state=active]:bg-yellow-500/20">
              <Star className="w-4 h-4 mr-2" />
              Awesome Lists
            </TabsTrigger>
            <TabsTrigger value="releases" className="data-[state=active]:bg-green-500/20">
              <Calendar className="w-4 h-4 mr-2" />
              Releases
            </TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {displayModels.map((model, index) => (
                <motion.div
                  key={model.modelId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PixelCard className="bg-gray-900/50 border-orange-500/20 hover:border-orange-500/40 transition-all">
                    <PixelCardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">{model.name}</h3>
                          <PixelBadge variant="default" className="bg-orange-500/20 text-orange-400">
                            {model.family}
                          </PixelBadge>
                        </div>
                        <Cpu className="w-8 h-8 text-orange-400" />
                      </div>
                      
                      <p className="text-gray-400 text-sm mb-4">
                        {model.description || `Released ${model.releaseDate}`}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Context Window</p>
                          <p className="text-sm font-bold text-white">
                            {(model.contextWindow / 1000).toFixed(0)}K tokens
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Max Output</p>
                          <p className="text-sm font-bold text-white">
                            {(model.maxOutput / 1000).toFixed(1)}K tokens
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {model.capabilities.map((cap) => (
                          <PixelBadge
                            key={cap}
                            variant="outline"
                            className="text-xs border-gray-700 text-gray-300"
                          >
                            {cap.replace(/_/g, " ")}
                          </PixelBadge>
                        ))}
                      </div>
                    </PixelCardContent>
                  </PixelCard>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mcp" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Model Context Protocol Servers</h2>
              <p className="text-gray-400">
                MCP servers extend Claude's capabilities with custom tools and data sources
              </p>
            </div>

            {mcpServers && mcpServers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mcpServers.map((server, index) => (
                  <motion.div
                    key={server._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PixelCard className="bg-gray-900/50 border-blue-500/20 hover:border-blue-500/40 transition-all h-full">
                      <PixelCardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1">{server.name}</h3>
                            {server.isOfficial && (
                              <PixelBadge variant="default" className="bg-blue-500/20 text-blue-400 text-xs">
                                Official
                              </PixelBadge>
                            )}
                          </div>
                          {server.stars && (
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Star className="w-4 h-4" />
                              <span className="text-sm font-bold">{server.stars}</span>
                            </div>
                          )}
                        </div>

                        {server.description && (
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                            {server.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          {server.language && (
                            <PixelBadge variant="outline" className="text-xs border-gray-700">
                              {server.language}
                            </PixelBadge>
                          )}
                          <Link href={server.url} target="_blank" rel="noopener noreferrer">
                            <PixelButton size="sm" variant="ghost" className="text-blue-400">
                              <ExternalLink className="w-4 h-4" />
                            </PixelButton>
                          </Link>
                        </div>
                      </PixelCardContent>
                    </PixelCard>
                  </motion.div>
                ))}
              </div>
            ) : (
              <PixelCard className="bg-gray-900/50 border-gray-800">
                <PixelCardContent className="p-8 text-center">
                  <Terminal className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No MCP servers found. Run the scraper to populate data.</p>
                </PixelCardContent>
              </PixelCard>
            )}
          </TabsContent>

          <TabsContent value="skills" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Skills, Plugins & Extensions</h2>
              <p className="text-gray-400">
                Community-built tools and extensions for Claude
              </p>
            </div>

            {resources && resources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map((resource, index) => (
                  <motion.div
                    key={resource._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <PixelCard className="bg-gray-900/50 border-purple-500/20 hover:border-purple-500/40 transition-all h-full">
                      <PixelCardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1">{resource.name}</h3>
                            <PixelBadge variant="outline" className="text-xs border-gray-700">
                              {resource.resourceType}
                            </PixelBadge>
                          </div>
                          {resource.stars && (
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Star className="w-4 h-4" />
                              <span className="text-sm font-bold">{resource.stars}</span>
                            </div>
                          )}
                        </div>

                        {resource.description && (
                          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                            {resource.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <PixelBadge variant="outline" className="text-xs border-gray-700">
                            {resource.category}
                          </PixelBadge>
                          <Link href={resource.url} target="_blank" rel="noopener noreferrer">
                            <PixelButton size="sm" variant="ghost" className="text-purple-400">
                              <ExternalLink className="w-4 h-4" />
                            </PixelButton>
                          </Link>
                        </div>
                      </PixelCardContent>
                    </PixelCard>
                  </motion.div>
                ))}
              </div>
            ) : (
              <PixelCard className="bg-gray-900/50 border-gray-800">
                <PixelCardContent className="p-8 text-center">
                  <Puzzle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No resources found. Run the scraper to populate data.</p>
                </PixelCardContent>
              </PixelCard>
            )}
          </TabsContent>

          <TabsContent value="awesome" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Awesome Claude Lists</h2>
              <p className="text-gray-400">
                Curated collections of Claude resources from the community
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {AWESOME_LISTS.map((list, index) => (
                <motion.div
                  key={list.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PixelCard className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20 hover:border-yellow-500/40 transition-all h-full">
                    <PixelCardContent className="p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <Star className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{list.name}</h3>
                          <p className="text-sm text-gray-400 mb-3">{list.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-yellow-400">
                          <Star className="w-4 h-4" />
                          <span className="text-sm font-bold">{list.stars}</span>
                        </div>
                        <Link href={list.url} target="_blank" rel="noopener noreferrer">
                          <PixelButton size="sm" className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400">
                            <Github className="w-4 h-4 mr-2" />
                            View on GitHub
                          </PixelButton>
                        </Link>
                      </div>
                    </PixelCardContent>
                  </PixelCard>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="releases" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Recent SDK Releases</h2>
              <p className="text-gray-400">
                Latest updates to the Anthropic SDK and related packages
              </p>
            </div>

            {releases && releases.length > 0 ? (
              <div className="space-y-4">
                {releases.map((release, index) => (
                  <motion.div
                    key={release._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PixelCard className="bg-gray-900/50 border-green-500/20 hover:border-green-500/40 transition-all">
                      <PixelCardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <PixelBadge variant="default" className="bg-green-500/20 text-green-400">
                                {release.version}
                              </PixelBadge>
                              <h3 className="text-lg font-bold text-white">{release.name}</h3>
                            </div>
                            <p className="text-sm text-gray-400">
                              Released {new Date(release.publishedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Link href={release.url} target="_blank" rel="noopener noreferrer">
                            <PixelButton size="sm" variant="ghost" className="text-green-400">
                              <ExternalLink className="w-4 h-4" />
                            </PixelButton>
                          </Link>
                        </div>

                        {release.body && (
                          <p className="text-sm text-gray-400 line-clamp-3">{release.body}</p>
                        )}
                      </PixelCardContent>
                    </PixelCard>
                  </motion.div>
                ))}
              </div>
            ) : (
              <PixelCard className="bg-gray-900/50 border-gray-800">
                <PixelCardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No releases found. Run the scraper to populate data.</p>
                </PixelCardContent>
              </PixelCard>
            )}
          </TabsContent>
        </Tabs>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <PixelCard className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 border-orange-500/20">
            <PixelCardContent className="p-8 text-center">
              <Bot className="w-12 h-12 text-orange-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Want to contribute?</h2>
              <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
                Help us expand the Claude ecosystem directory by submitting your skills, plugins, or MCP servers
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link href="https://github.com/anthropics/awesome-claude-code" target="_blank">
                  <PixelButton className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400">
                    <Github className="w-4 h-4 mr-2" />
                    Contribute on GitHub
                  </PixelButton>
                </Link>
                <Link href="https://docs.anthropic.com" target="_blank">
                  <PixelButton variant="outline" className="border-orange-500/20 text-orange-400">
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Documentation
                  </PixelButton>
                </Link>
              </div>
            </PixelCardContent>
          </PixelCard>
        </motion.div>
      </div>
    </div>
  );
}
