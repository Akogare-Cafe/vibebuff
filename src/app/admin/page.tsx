"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  PixelCard,
  PixelCardContent,
  PixelCardHeader,
  PixelCardTitle,
} from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelButton } from "@/components/pixel-button";
import { PixelInput } from "@/components/pixel-input";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Package,
  MessageSquarePlus,
  Megaphone,
  Shield,
  ShieldOff,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  TrendingUp,
  Zap,
  Star,
  ChevronRight,
  ExternalLink,
  Loader2,
  AlertTriangle,
  Plus,
  RefreshCw,
  Timer,
  Rss,
  Globe,
  Github,
  Play,
  Pause,
  Sparkles,
  Link as LinkIcon,
  Edit,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Tab = "overview" | "users" | "tools" | "suggestions" | "ads" | "crons" | "scrape" | "add-tool";

export default function AdminDashboardPage() {
  const { isSignedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [userSearch, setUserSearch] = useState("");
  const [toolSearch, setToolSearch] = useState("");
  const [suggestionFilter, setSuggestionFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scrapedTool, setScrapedTool] = useState<any>(null);
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapeError, setScrapeError] = useState("");
  const [newToolCategory, setNewToolCategory] = useState("");

  const isAdmin = useQuery(api.admin.isAdmin);
  const cronJobs = useQuery(api.admin.getCronJobs);
  const feedSources = useQuery(api.admin.getFeedSources);
  const scrapeJobs = useQuery(api.admin.getScrapeJobs);
  
  const initializeAdmin = useMutation(api.admin.initializeAdminByEmail);
  const createTool = useMutation(api.admin.createTool);
  const updateFeedSource = useMutation(api.admin.updateFeedSource);
  const scrapeAndParse = useAction(api.admin.scrapeAndParseUrl);
  const approveScrapeJob = useMutation(api.admin.approveScrapeJob);
  const stats = useQuery(api.admin.getDashboardStats);
  const users = useQuery(api.admin.getAllUsers, { search: userSearch || undefined, limit: 50 });
  const tools = useQuery(api.admin.getAllTools, { search: toolSearch || undefined, includeInactive: true, limit: 50 });
  const suggestions = useQuery(api.toolSuggestions.listAll, { 
    status: suggestionFilter === "all" ? undefined : suggestionFilter 
  });
  const categories = useQuery(api.admin.getCategories);

  const setAdminStatus = useMutation(api.admin.setAdminStatus);
  const updateTool = useMutation(api.admin.updateTool);
  const approveSuggestion = useMutation(api.toolSuggestions.approve);
  const rejectSuggestion = useMutation(api.toolSuggestions.reject);

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <PixelCard className="max-w-md">
          <PixelCardContent className="py-8 text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-primary text-lg mb-2">SIGN IN REQUIRED</h2>
            <p className="text-muted-foreground text-sm mb-4">
              Please sign in to access the admin dashboard.
            </p>
            <Link href="/sign-in">
              <PixelButton>SIGN IN</PixelButton>
            </Link>
          </PixelCardContent>
        </PixelCard>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <PixelCard className="max-w-md">
          <PixelCardContent className="py-8 text-center">
            <ShieldOff className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-primary text-lg mb-2">ACCESS DENIED</h2>
            <p className="text-muted-foreground text-sm mb-4">
              You do not have admin privileges to access this page.
            </p>
            <Link href="/">
              <PixelButton>RETURN HOME</PixelButton>
            </Link>
          </PixelCardContent>
        </PixelCard>
      </div>
    );
  }

  if (isAdmin === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "users", label: "Users", icon: <Users className="w-4 h-4" />, badge: stats?.totalUsers },
    { id: "tools", label: "Tools", icon: <Package className="w-4 h-4" />, badge: stats?.totalTools },
    { id: "add-tool", label: "Add Tool", icon: <Plus className="w-4 h-4" /> },
    { id: "scrape", label: "Scrape", icon: <Globe className="w-4 h-4" /> },
    { id: "crons", label: "Crons", icon: <Timer className="w-4 h-4" /> },
    { id: "suggestions", label: "Suggestions", icon: <MessageSquarePlus className="w-4 h-4" />, badge: stats?.pendingSuggestions },
    { id: "ads", label: "Ads", icon: <Megaphone className="w-4 h-4" /> },
  ];

  const handleScrapeUrl = async () => {
    if (!scrapeUrl.trim()) return;
    setScrapeLoading(true);
    setScrapeError("");
    setScrapedTool(null);
    
    try {
      const result = await scrapeAndParse({ url: scrapeUrl });
      if (result.success && result.tool) {
        setScrapedTool(result.tool);
      } else {
        setScrapeError(result.error || "Failed to scrape URL");
      }
    } catch (error) {
      setScrapeError(`Error: ${error}`);
    } finally {
      setScrapeLoading(false);
    }
  };

  const handleAddScrapedTool = async () => {
    if (!scrapedTool || !newToolCategory) return;
    
    try {
      await createTool({
        name: scrapedTool.name,
        slug: scrapedTool.slug,
        tagline: scrapedTool.tagline,
        description: scrapedTool.description,
        websiteUrl: scrapedTool.websiteUrl,
        githubUrl: scrapedTool.githubUrl,
        categorySlug: newToolCategory,
        pricingModel: scrapedTool.pricingModel as "free" | "freemium" | "paid" | "open_source" | "enterprise",
        isOpenSource: scrapedTool.isOpenSource,
        pros: scrapedTool.pros,
        cons: scrapedTool.cons,
        bestFor: scrapedTool.bestFor,
        features: scrapedTool.features,
        tags: scrapedTool.tags,
      });
      setScrapedTool(null);
      setScrapeUrl("");
      setNewToolCategory("");
      alert("Tool added successfully!");
    } catch (error) {
      alert(`Error adding tool: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-heading flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage users, tools, and suggestions
            </p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  activeTab === tab.id ? "bg-primary-foreground/20" : "bg-primary/20 text-primary"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <OverviewTab stats={stats} suggestions={suggestions} />
        )}

        {activeTab === "users" && (
          <UsersTab
            users={users}
            search={userSearch}
            onSearchChange={setUserSearch}
            onSetAdmin={setAdminStatus}
          />
        )}

        {activeTab === "tools" && (
          <ToolsTab
            tools={tools}
            categories={categories}
            search={toolSearch}
            onSearchChange={setToolSearch}
            onUpdateTool={updateTool}
          />
        )}

        {activeTab === "suggestions" && (
          <SuggestionsTab
            suggestions={suggestions}
            filter={suggestionFilter}
            onFilterChange={setSuggestionFilter}
            onApprove={approveSuggestion}
            onReject={rejectSuggestion}
          />
        )}

        {activeTab === "ads" && (
          <div className="text-center py-8">
            <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Ad management is available on a dedicated page.</p>
            <Link href="/admin/ads">
              <PixelButton>
                GO TO AD MANAGEMENT <ChevronRight className="w-4 h-4 ml-1" />
              </PixelButton>
            </Link>
          </div>
        )}

        {activeTab === "crons" && (
          <CronsTab cronJobs={cronJobs} feedSources={feedSources} onUpdateFeedSource={updateFeedSource} />
        )}

        {activeTab === "scrape" && (
          <ScrapeTab
            scrapeUrl={scrapeUrl}
            setScrapeUrl={setScrapeUrl}
            scrapeLoading={scrapeLoading}
            scrapeError={scrapeError}
            scrapedTool={scrapedTool}
            setScrapedTool={setScrapedTool}
            newToolCategory={newToolCategory}
            setNewToolCategory={setNewToolCategory}
            categories={categories}
            onScrape={handleScrapeUrl}
            onAddTool={handleAddScrapedTool}
          />
        )}

        {activeTab === "add-tool" && (
          <AddToolTab categories={categories} onCreateTool={createTool} />
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string; value: number | string; icon: React.ReactNode; trend?: string }) {
  return (
    <PixelCard>
      <PixelCardContent className="py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground text-xs uppercase">{title}</p>
            <p className="text-primary text-2xl font-bold">{value}</p>
            {trend && <p className="text-green-500 text-xs">{trend}</p>}
          </div>
          <div className="text-primary opacity-50">{icon}</div>
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}

function OverviewTab({ stats, suggestions }: { stats: any; suggestions: any }) {
  const pendingSuggestions = suggestions?.filter((s: any) => s.status === "pending").slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={<Users className="w-8 h-8" />}
        />
        <StatCard
          title="Active Tools"
          value={stats?.activeTools ?? 0}
          icon={<Package className="w-8 h-8" />}
        />
        <StatCard
          title="Pending Suggestions"
          value={stats?.pendingSuggestions ?? 0}
          icon={<MessageSquarePlus className="w-8 h-8" />}
        />
        <StatCard
          title="Total XP Earned"
          value={stats?.totalXp ? `${(stats.totalXp / 1000).toFixed(1)}K` : "0"}
          icon={<Zap className="w-8 h-8" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PixelCard>
          <PixelCardHeader>
            <PixelCardTitle className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> QUICK STATS
            </PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Categories</span>
                <span className="text-primary font-mono">{stats?.totalCategories ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Total Suggestions</span>
                <span className="text-primary font-mono">{stats?.totalSuggestions ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Recent Suggestions (7d)</span>
                <span className="text-primary font-mono">{stats?.recentSuggestions ?? 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Admin Users</span>
                <span className="text-primary font-mono">{stats?.adminCount ?? 0}</span>
              </div>
            </div>
          </PixelCardContent>
        </PixelCard>

        <PixelCard>
          <PixelCardHeader>
            <PixelCardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> PENDING REVIEWS
            </PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent>
            {pendingSuggestions.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No pending suggestions</p>
            ) : (
              <div className="space-y-2">
                {pendingSuggestions.map((suggestion: any) => (
                  <div key={suggestion._id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{suggestion.tool?.name || "Unknown Tool"}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(suggestion.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </PixelCardContent>
        </PixelCard>
      </div>
    </div>
  );
}

function UsersTab({ 
  users, 
  search, 
  onSearchChange, 
  onSetAdmin 
}: { 
  users: any; 
  search: string; 
  onSearchChange: (v: string) => void;
  onSetAdmin: (args: { targetUserId: string; isAdmin: boolean }) => Promise<any>;
}) {
  const [loadingUser, setLoadingUser] = useState<string | null>(null);

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    setLoadingUser(userId);
    try {
      await onSetAdmin({ targetUserId: userId, isAdmin: !currentStatus });
    } catch (error) {
      console.error("Failed to update admin status:", error);
    } finally {
      setLoadingUser(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <PixelInput
            placeholder="Search users..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <p className="text-muted-foreground text-sm">{users?.length ?? 0} users</p>
      </div>

      <PixelCard>
        <PixelCardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs text-muted-foreground uppercase">User</th>
                  <th className="text-left p-4 text-xs text-muted-foreground uppercase">Level</th>
                  <th className="text-left p-4 text-xs text-muted-foreground uppercase">XP</th>
                  <th className="text-left p-4 text-xs text-muted-foreground uppercase">Stats</th>
                  <th className="text-left p-4 text-xs text-muted-foreground uppercase">Admin</th>
                  <th className="text-left p-4 text-xs text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user: any) => (
                  <tr key={user._id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-foreground">{user.username || "Anonymous"}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user.clerkId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <PixelBadge variant="secondary">LVL {user.level}</PixelBadge>
                    </td>
                    <td className="p-4">
                      <span className="text-primary font-mono">{user.xp.toLocaleString()}</span>
                    </td>
                    <td className="p-4">
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Battles: {user.battlesWon}W / {user.battlesLost}L</p>
                        <p>Decks: {user.decksCreated}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      {user.isAdmin ? (
                        <PixelBadge variant="default" className="flex items-center gap-1">
                          <Shield className="w-3 h-3" /> ADMIN
                        </PixelBadge>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <PixelButton
                        size="sm"
                        variant={user.isAdmin ? "outline" : "default"}
                        onClick={() => handleToggleAdmin(user.clerkId, user.isAdmin || false)}
                        disabled={loadingUser === user.clerkId}
                      >
                        {loadingUser === user.clerkId ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : user.isAdmin ? (
                          <>
                            <ShieldOff className="w-3 h-3 mr-1" /> REVOKE
                          </>
                        ) : (
                          <>
                            <Shield className="w-3 h-3 mr-1" /> GRANT
                          </>
                        )}
                      </PixelButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PixelCardContent>
      </PixelCard>
    </div>
  );
}

function ToolsTab({ 
  tools, 
  categories,
  search, 
  onSearchChange,
  onUpdateTool,
}: { 
  tools: any; 
  categories: any;
  search: string; 
  onSearchChange: (v: string) => void;
  onUpdateTool: (args: { toolId: Id<"tools">; updates: any }) => Promise<any>;
}) {
  const [loadingTool, setLoadingTool] = useState<string | null>(null);

  const handleToggleActive = async (toolId: Id<"tools">, currentStatus: boolean) => {
    setLoadingTool(toolId);
    try {
      await onUpdateTool({ toolId, updates: { isActive: !currentStatus } });
    } catch (error) {
      console.error("Failed to update tool:", error);
    } finally {
      setLoadingTool(null);
    }
  };

  const handleToggleFeatured = async (toolId: Id<"tools">, currentStatus: boolean) => {
    setLoadingTool(toolId);
    try {
      await onUpdateTool({ toolId, updates: { isFeatured: !currentStatus } });
    } catch (error) {
      console.error("Failed to update tool:", error);
    } finally {
      setLoadingTool(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <PixelInput
            placeholder="Search tools..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <p className="text-muted-foreground text-sm">{tools?.length ?? 0} tools</p>
      </div>

      <PixelCard>
        <PixelCardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-xs text-muted-foreground uppercase">Tool</th>
                  <th className="text-left p-4 text-xs text-muted-foreground uppercase">Category</th>
                  <th className="text-left p-4 text-xs text-muted-foreground uppercase">Pricing</th>
                  <th className="text-left p-4 text-xs text-muted-foreground uppercase">Status</th>
                  <th className="text-left p-4 text-xs text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tools?.map((tool: any) => (
                  <tr key={tool._id} className={`border-b border-border/50 hover:bg-muted/30 ${!tool.isActive ? "opacity-50" : ""}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {tool.logoUrl ? (
                          <img src={tool.logoUrl} alt="" className="w-8 h-8 rounded object-contain" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
                            <Package className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-foreground font-medium">{tool.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{tool.tagline}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <PixelBadge variant="outline">{tool.category?.name || "Unknown"}</PixelBadge>
                    </td>
                    <td className="p-4">
                      <span className="text-xs text-muted-foreground uppercase">{tool.pricingModel}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        {tool.isActive ? (
                          <PixelBadge variant="default" className="text-[10px]">ACTIVE</PixelBadge>
                        ) : (
                          <PixelBadge variant="secondary" className="text-[10px]">INACTIVE</PixelBadge>
                        )}
                        {tool.isFeatured && (
                          <PixelBadge variant="default" className="text-[10px] flex items-center gap-1">
                            <Star className="w-2 h-2" /> FEATURED
                          </PixelBadge>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/tools/${tool.slug}`} target="_blank">
                          <PixelButton size="sm" variant="ghost">
                            <Eye className="w-3 h-3" />
                          </PixelButton>
                        </Link>
                        <PixelButton
                          size="sm"
                          variant={tool.isFeatured ? "default" : "outline"}
                          onClick={() => handleToggleFeatured(tool._id, tool.isFeatured)}
                          disabled={loadingTool === tool._id}
                        >
                          <Star className="w-3 h-3" />
                        </PixelButton>
                        <PixelButton
                          size="sm"
                          variant={tool.isActive ? "outline" : "default"}
                          onClick={() => handleToggleActive(tool._id, tool.isActive)}
                          disabled={loadingTool === tool._id}
                        >
                          {loadingTool === tool._id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : tool.isActive ? (
                            "DEACTIVATE"
                          ) : (
                            "ACTIVATE"
                          )}
                        </PixelButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PixelCardContent>
      </PixelCard>
    </div>
  );
}

function SuggestionsTab({ 
  suggestions, 
  filter, 
  onFilterChange,
  onApprove,
  onReject,
}: { 
  suggestions: any; 
  filter: "all" | "pending" | "approved" | "rejected";
  onFilterChange: (v: "all" | "pending" | "approved" | "rejected") => void;
  onApprove: (args: { suggestionId: Id<"toolSuggestions">; reviewNote?: string }) => Promise<any>;
  onReject: (args: { suggestionId: Id<"toolSuggestions">; reviewNote?: string }) => Promise<any>;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleApprove = async (suggestionId: Id<"toolSuggestions">) => {
    setLoadingId(suggestionId);
    try {
      await onApprove({ suggestionId, reviewNote: reviewNote || undefined });
      setExpandedId(null);
      setReviewNote("");
    } catch (error) {
      console.error("Failed to approve:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (suggestionId: Id<"toolSuggestions">) => {
    setLoadingId(suggestionId);
    try {
      await onReject({ suggestionId, reviewNote: reviewNote || undefined });
      setExpandedId(null);
      setReviewNote("");
    } catch (error) {
      console.error("Failed to reject:", error);
    } finally {
      setLoadingId(null);
    }
  };

  const filters: { value: "all" | "pending" | "approved" | "rejected"; label: string; icon: React.ReactNode }[] = [
    { value: "pending", label: "Pending", icon: <Clock className="w-3 h-3" /> },
    { value: "approved", label: "Approved", icon: <CheckCircle className="w-3 h-3" /> },
    { value: "rejected", label: "Rejected", icon: <XCircle className="w-3 h-3" /> },
    { value: "all", label: "All", icon: <MessageSquarePlus className="w-3 h-3" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {filters.map((f) => (
          <PixelButton
            key={f.value}
            size="sm"
            variant={filter === f.value ? "default" : "outline"}
            onClick={() => onFilterChange(f.value)}
          >
            {f.icon}
            <span className="ml-1">{f.label}</span>
          </PixelButton>
        ))}
        <span className="text-muted-foreground text-sm ml-auto">{suggestions?.length ?? 0} suggestions</span>
      </div>

      <div className="space-y-4">
        {suggestions?.length === 0 ? (
          <PixelCard>
            <PixelCardContent className="py-8 text-center">
              <MessageSquarePlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No suggestions found</p>
            </PixelCardContent>
          </PixelCard>
        ) : (
          suggestions?.map((suggestion: any) => (
            <PixelCard key={suggestion._id}>
              <PixelCardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Link href={`/tools/${suggestion.tool?.slug}`} className="text-primary font-medium hover:underline">
                        {suggestion.tool?.name || "Unknown Tool"}
                      </Link>
                      <PixelBadge
                        variant={
                          suggestion.status === "pending" ? "secondary" :
                          suggestion.status === "approved" ? "default" : "outline"
                        }
                        className="text-[10px]"
                      >
                        {suggestion.status.toUpperCase()}
                      </PixelBadge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                      <span>By: {suggestion.userProfile?.username || "Anonymous"}</span>
                      <span>{new Date(suggestion.createdAt).toLocaleString()}</span>
                    </div>

                    {suggestion.reason && (
                      <p className="text-sm text-muted-foreground mb-3 italic">
                        Reason: {suggestion.reason}
                      </p>
                    )}

                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground uppercase">Suggested Changes:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {Object.entries(suggestion.suggestedChanges).map(([key, value]) => (
                          <div key={key} className="bg-muted/50 p-2 rounded">
                            <span className="text-primary text-xs uppercase">{key}:</span>
                            <p className="text-foreground text-xs mt-1 break-words">
                              {Array.isArray(value) ? value.join(", ") : String(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {suggestion.status === "pending" && expandedId === suggestion._id && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <label className="text-xs text-muted-foreground block mb-2">Review Note (optional)</label>
                        <Textarea
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          placeholder="Add a note for the user..."
                          className="w-full min-h-[60px] bg-background border border-border text-foreground text-sm mb-3"
                        />
                        <div className="flex gap-2">
                          <PixelButton
                            onClick={() => handleApprove(suggestion._id)}
                            disabled={loadingId === suggestion._id}
                          >
                            {loadingId === suggestion._id ? (
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            ) : (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            APPROVE
                          </PixelButton>
                          <PixelButton
                            variant="outline"
                            onClick={() => handleReject(suggestion._id)}
                            disabled={loadingId === suggestion._id}
                          >
                            {loadingId === suggestion._id ? (
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            REJECT
                          </PixelButton>
                          <PixelButton
                            variant="ghost"
                            onClick={() => {
                              setExpandedId(null);
                              setReviewNote("");
                            }}
                          >
                            CANCEL
                          </PixelButton>
                        </div>
                      </div>
                    )}

                    {suggestion.reviewNote && (
                      <div className="mt-3 p-2 bg-muted/50 rounded">
                        <p className="text-xs text-muted-foreground">
                          Review note: {suggestion.reviewNote}
                        </p>
                      </div>
                    )}
                  </div>

                  {suggestion.status === "pending" && expandedId !== suggestion._id && (
                    <PixelButton
                      size="sm"
                      onClick={() => setExpandedId(suggestion._id)}
                    >
                      REVIEW
                    </PixelButton>
                  )}
                </div>
              </PixelCardContent>
            </PixelCard>
          ))
        )}
      </div>
    </div>
  );
}

function CronsTab({ 
  cronJobs, 
  feedSources,
  onUpdateFeedSource,
}: { 
  cronJobs: any; 
  feedSources: any;
  onUpdateFeedSource: (args: { sourceId: any; updates: any }) => Promise<any>;
}) {
  const [loadingSource, setLoadingSource] = useState<string | null>(null);

  const handleToggleFeedSource = async (sourceId: any, isActive: boolean) => {
    setLoadingSource(sourceId);
    try {
      await onUpdateFeedSource({ sourceId, updates: { isActive: !isActive } });
    } catch (error) {
      console.error("Failed to update feed source:", error);
    } finally {
      setLoadingSource(null);
    }
  };

  return (
    <div className="space-y-6">
      <PixelCard>
        <PixelCardHeader>
          <PixelCardTitle className="flex items-center gap-2">
            <Timer className="w-4 h-4" /> CRON JOBS
          </PixelCardTitle>
        </PixelCardHeader>
        <PixelCardContent>
          {cronJobs ? (
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Rss className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-foreground font-medium">{cronJobs.feedFetcher.name}</p>
                      <p className="text-muted-foreground text-xs">Interval: {cronJobs.feedFetcher.interval}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <PixelBadge variant="default">{cronJobs.feedFetcher.status.toUpperCase()}</PixelBadge>
                    <p className="text-muted-foreground text-xs mt-1">
                      {cronJobs.feedFetcher.activeSources} active sources
                    </p>
                    {cronJobs.feedFetcher.lastRun > 0 && (
                      <p className="text-muted-foreground text-xs">
                        Last run: {new Date(cronJobs.feedFetcher.lastRun).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </PixelCardContent>
      </PixelCard>

      <PixelCard>
        <PixelCardHeader>
          <PixelCardTitle className="flex items-center gap-2">
            <Rss className="w-4 h-4" /> FEED SOURCES
          </PixelCardTitle>
        </PixelCardHeader>
        <PixelCardContent>
          {feedSources ? (
            <div className="space-y-2">
              {feedSources.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No feed sources configured</p>
              ) : (
                feedSources.map((source: any) => (
                  <div key={source._id} className={`p-3 bg-muted/30 rounded-lg flex items-center justify-between ${!source.isActive ? "opacity-50" : ""}`}>
                    <div className="flex items-center gap-3">
                      {source.logoUrl ? (
                        <img src={source.logoUrl} alt="" className="w-8 h-8 rounded object-contain" />
                      ) : (
                        <Rss className="w-8 h-8 text-muted-foreground" />
                      )}
                      <div>
                        <p className="text-foreground font-medium text-sm">{source.name}</p>
                        <p className="text-muted-foreground text-xs">{source.category} - {source.feedType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-xs text-muted-foreground">
                        <p>{source.itemCount} items</p>
                        {source.lastFetchedAt && (
                          <p>Last: {new Date(source.lastFetchedAt).toLocaleDateString()}</p>
                        )}
                        {source.lastFetchStatus && (
                          <PixelBadge 
                            variant={source.lastFetchStatus === "success" ? "default" : "secondary"}
                            className="text-[10px]"
                          >
                            {source.lastFetchStatus.toUpperCase()}
                          </PixelBadge>
                        )}
                      </div>
                      <PixelButton
                        size="sm"
                        variant={source.isActive ? "outline" : "default"}
                        onClick={() => handleToggleFeedSource(source._id, source.isActive)}
                        disabled={loadingSource === source._id}
                      >
                        {loadingSource === source._id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : source.isActive ? (
                          <Pause className="w-3 h-3" />
                        ) : (
                          <Play className="w-3 h-3" />
                        )}
                      </PixelButton>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}
        </PixelCardContent>
      </PixelCard>
    </div>
  );
}

function ScrapeTab({
  scrapeUrl,
  setScrapeUrl,
  scrapeLoading,
  scrapeError,
  scrapedTool,
  setScrapedTool,
  newToolCategory,
  setNewToolCategory,
  categories,
  onScrape,
  onAddTool,
}: {
  scrapeUrl: string;
  setScrapeUrl: (v: string) => void;
  scrapeLoading: boolean;
  scrapeError: string;
  scrapedTool: any;
  setScrapedTool: (v: any) => void;
  newToolCategory: string;
  setNewToolCategory: (v: string) => void;
  categories: any;
  onScrape: () => void;
  onAddTool: () => void;
}) {
  return (
    <div className="space-y-6">
      <PixelCard>
        <PixelCardHeader>
          <PixelCardTitle className="flex items-center gap-2">
            <Globe className="w-4 h-4" /> SCRAPE URL
          </PixelCardTitle>
        </PixelCardHeader>
        <PixelCardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <PixelInput
                placeholder="Enter GitHub URL or website URL..."
                value={scrapeUrl}
                onChange={(e) => setScrapeUrl(e.target.value)}
                className="flex-1"
              />
              <PixelButton onClick={onScrape} disabled={scrapeLoading || !scrapeUrl.trim()}>
                {scrapeLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                SCRAPE & PARSE
              </PixelButton>
            </div>
            <p className="text-muted-foreground text-xs">
              Enter a GitHub repository URL or website URL. AI will analyze and extract tool information.
            </p>

            {scrapeError && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-500 text-sm flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> {scrapeError}
                </p>
              </div>
            )}
          </div>
        </PixelCardContent>
      </PixelCard>

      {scrapedTool && (
        <PixelCard>
          <PixelCardHeader>
            <PixelCardTitle className="flex items-center gap-2">
              <Package className="w-4 h-4" /> SCRAPED TOOL DATA
            </PixelCardTitle>
          </PixelCardHeader>
          <PixelCardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Name</label>
                  <PixelInput value={scrapedTool.name} onChange={(e) => setScrapedTool({ ...scrapedTool, name: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Slug</label>
                  <PixelInput value={scrapedTool.slug} onChange={(e) => setScrapedTool({ ...scrapedTool, slug: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-muted-foreground block mb-1">Tagline</label>
                  <PixelInput value={scrapedTool.tagline} onChange={(e) => setScrapedTool({ ...scrapedTool, tagline: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-muted-foreground block mb-1">Description</label>
                  <Textarea 
                    value={scrapedTool.description} 
                    onChange={(e) => setScrapedTool({ ...scrapedTool, description: e.target.value })}
                    className="w-full min-h-[80px] bg-background border border-border text-foreground text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Website URL</label>
                  <PixelInput value={scrapedTool.websiteUrl} onChange={(e) => setScrapedTool({ ...scrapedTool, websiteUrl: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">GitHub URL</label>
                  <PixelInput value={scrapedTool.githubUrl || ""} onChange={(e) => setScrapedTool({ ...scrapedTool, githubUrl: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Pricing Model</label>
                  <Select value={scrapedTool.pricingModel} onValueChange={(v) => setScrapedTool({ ...scrapedTool, pricingModel: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="freemium">Freemium</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="open_source">Open Source</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Category</label>
                  <Select value={newToolCategory} onValueChange={setNewToolCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat: any) => (
                        <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Pros</label>
                  <div className="flex flex-wrap gap-1">
                    {scrapedTool.pros?.map((pro: string, i: number) => (
                      <PixelBadge key={i} variant="default" className="text-xs">{pro}</PixelBadge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Cons</label>
                  <div className="flex flex-wrap gap-1">
                    {scrapedTool.cons?.map((con: string, i: number) => (
                      <PixelBadge key={i} variant="secondary" className="text-xs">{con}</PixelBadge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Features</label>
                  <div className="flex flex-wrap gap-1">
                    {scrapedTool.features?.map((f: string, i: number) => (
                      <PixelBadge key={i} variant="outline" className="text-xs">{f}</PixelBadge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Tags</label>
                  <div className="flex flex-wrap gap-1">
                    {scrapedTool.tags?.map((tag: string, i: number) => (
                      <PixelBadge key={i} variant="outline" className="text-xs">{tag}</PixelBadge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-border">
                <PixelButton onClick={onAddTool} disabled={!newToolCategory}>
                  <Plus className="w-4 h-4 mr-2" /> ADD TO DATABASE
                </PixelButton>
                <PixelButton variant="outline" onClick={() => setScrapedTool(null)}>
                  <XCircle className="w-4 h-4 mr-2" /> DISCARD
                </PixelButton>
              </div>
            </div>
          </PixelCardContent>
        </PixelCard>
      )}
    </div>
  );
}

function AddToolTab({
  categories,
  onCreateTool,
}: {
  categories: any;
  onCreateTool: (args: any) => Promise<any>;
}) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    tagline: "",
    description: "",
    websiteUrl: "",
    githubUrl: "",
    docsUrl: "",
    categorySlug: "",
    pricingModel: "free" as "free" | "freemium" | "paid" | "open_source" | "enterprise",
    isOpenSource: false,
    pros: "",
    cons: "",
    bestFor: "",
    features: "",
    tags: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug || !formData.tagline || !formData.description || !formData.websiteUrl || !formData.categorySlug) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onCreateTool({
        name: formData.name,
        slug: formData.slug,
        tagline: formData.tagline,
        description: formData.description,
        websiteUrl: formData.websiteUrl,
        githubUrl: formData.githubUrl || undefined,
        docsUrl: formData.docsUrl || undefined,
        categorySlug: formData.categorySlug,
        pricingModel: formData.pricingModel,
        isOpenSource: formData.isOpenSource,
        pros: formData.pros.split("\n").filter(Boolean),
        cons: formData.cons.split("\n").filter(Boolean),
        bestFor: formData.bestFor.split("\n").filter(Boolean),
        features: formData.features.split("\n").filter(Boolean),
        tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
      });
      setFormData({
        name: "",
        slug: "",
        tagline: "",
        description: "",
        websiteUrl: "",
        githubUrl: "",
        docsUrl: "",
        categorySlug: "",
        pricingModel: "free",
        isOpenSource: false,
        pros: "",
        cons: "",
        bestFor: "",
        features: "",
        tags: "",
      });
      alert("Tool created successfully!");
    } catch (err) {
      setError(`Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setFormData({ ...formData, slug });
  };

  return (
    <div className="space-y-6">
      <PixelCard>
        <PixelCardHeader>
          <PixelCardTitle className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> ADD NEW TOOL
          </PixelCardTitle>
        </PixelCardHeader>
        <PixelCardContent>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-500 text-sm flex items-center gap-2">
                  <XCircle className="w-4 h-4" /> {error}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Name *</label>
                <PixelInput 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onBlur={generateSlug}
                  placeholder="e.g., Next.js"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Slug *</label>
                <PixelInput 
                  value={formData.slug} 
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g., nextjs"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground block mb-1">Tagline *</label>
                <PixelInput 
                  value={formData.tagline} 
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Short description (max 100 chars)"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground block mb-1">Description *</label>
                <Textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the tool..."
                  className="w-full min-h-[100px] bg-background border border-border text-foreground text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Website URL *</label>
                <PixelInput 
                  value={formData.websiteUrl} 
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">GitHub URL</label>
                <PixelInput 
                  value={formData.githubUrl} 
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Docs URL</label>
                <PixelInput 
                  value={formData.docsUrl} 
                  onChange={(e) => setFormData({ ...formData, docsUrl: e.target.value })}
                  placeholder="https://docs..."
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Category *</label>
                <Select value={formData.categorySlug} onValueChange={(v) => setFormData({ ...formData, categorySlug: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat: any) => (
                      <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Pricing Model</label>
                <Select value={formData.pricingModel} onValueChange={(v: any) => setFormData({ ...formData, pricingModel: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="freemium">Freemium</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="open_source">Open Source</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={formData.isOpenSource}
                  onChange={(e) => setFormData({ ...formData, isOpenSource: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm text-foreground">Is Open Source</label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Pros (one per line)</label>
                <Textarea 
                  value={formData.pros} 
                  onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
                  placeholder="Easy to use&#10;Great documentation&#10;Active community"
                  className="w-full min-h-[80px] bg-background border border-border text-foreground text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Cons (one per line)</label>
                <Textarea 
                  value={formData.cons} 
                  onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
                  placeholder="Steep learning curve&#10;Limited customization"
                  className="w-full min-h-[80px] bg-background border border-border text-foreground text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Best For (one per line)</label>
                <Textarea 
                  value={formData.bestFor} 
                  onChange={(e) => setFormData({ ...formData, bestFor: e.target.value })}
                  placeholder="Web applications&#10;Static sites&#10;E-commerce"
                  className="w-full min-h-[80px] bg-background border border-border text-foreground text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Features (one per line)</label>
                <Textarea 
                  value={formData.features} 
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Server-side rendering&#10;Static generation&#10;API routes"
                  className="w-full min-h-[80px] bg-background border border-border text-foreground text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground block mb-1">Tags (comma separated)</label>
                <PixelInput 
                  value={formData.tags} 
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="react, framework, ssr, ssg, typescript"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <PixelButton onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                CREATE TOOL
              </PixelButton>
            </div>
          </div>
        </PixelCardContent>
      </PixelCard>
    </div>
  );
}
