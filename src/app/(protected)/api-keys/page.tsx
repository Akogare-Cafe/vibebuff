"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { useUser, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  AlertCircle,
  ChevronRight,
  Terminal,
  Shield,
  Clock,
  Activity,
  Eye,
  EyeOff,
} from "lucide-react";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelInput } from "@/components/pixel-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ApiKeysPage() {
  const { isSignedIn, isLoaded } = useUser();
  const apiKeys = useQuery(api.apiKeys.list);
  const createKey = useMutation(api.apiKeys.create);
  const revokeKey = useMutation(api.apiKeys.revoke);
  const deleteKey = useMutation(api.apiKeys.deleteKey);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) return;
    
    setIsCreating(true);
    try {
      const result = await createKey({ name: newKeyName.trim() });
      setNewlyCreatedKey(result.apiKey);
      setNewKeyName("");
    } catch (error) {
      console.error("Failed to create API key:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyKey = async () => {
    if (newlyCreatedKey) {
      await navigator.clipboard.writeText(newlyCreatedKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setNewlyCreatedKey(null);
    setNewKeyName("");
    setShowKey(false);
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      await revokeKey({ keyId: keyId as any });
    } catch (error) {
      console.error("Failed to revoke API key:", error);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      await deleteKey({ keyId: keyId as any });
      setKeyToDelete(null);
    } catch (error) {
      console.error("Failed to delete API key:", error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatLastUsed = (timestamp: number | undefined) => {
    if (!timestamp) return "Never";
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <PixelCard>
            <PixelCardContent className="p-8 text-center">
              <Key className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground font-heading mb-4">
                Sign in to Manage API Keys
              </h1>
              <p className="text-muted-foreground mb-6">
                Create and manage API keys to connect your AI assistant to VibeBuff MCP.
              </p>
              <SignInButton mode="modal">
                <PixelButton size="lg">Sign In</PixelButton>
              </SignInButton>
            </PixelCardContent>
          </PixelCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-background" />
        
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="text-muted-foreground hover:text-primary text-sm">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <Link href="/mcp" className="text-muted-foreground hover:text-primary text-sm">
              MCP
            </Link>
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-primary text-sm">API Keys</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-500/20 p-2 rounded-xl border border-purple-400/30">
                  <Key className="w-6 h-6 text-purple-400" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground font-heading">
                  API Keys
                </h1>
              </div>
              <p className="text-muted-foreground">
                Manage your API keys for VibeBuff MCP integration
              </p>
            </div>

            <PixelButton
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Key
            </PixelButton>
          </motion.div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 mb-8">
            <PixelCard className="bg-amber-500/10 border-amber-500/30">
              <PixelCardContent className="p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-foreground font-medium">Keep your API keys secure</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    API keys grant access to your VibeBuff account. Never share them publicly or commit them to version control.
                  </p>
                </div>
              </PixelCardContent>
            </PixelCard>
          </div>

          {apiKeys === undefined ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <PixelCard key={i}>
                  <PixelCardContent className="p-4">
                    <div className="animate-pulse flex items-center gap-4">
                      <div className="w-10 h-10 bg-muted rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4" />
                        <div className="h-3 bg-muted rounded w-1/3" />
                      </div>
                    </div>
                  </PixelCardContent>
                </PixelCard>
              ))}
            </div>
          ) : apiKeys.length === 0 ? (
            <PixelCard>
              <PixelCardContent className="p-8 text-center">
                <Terminal className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No API Keys Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first API key to start using VibeBuff MCP with your AI assistant.
                </p>
                <PixelButton onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2 mx-auto">
                  <Plus className="w-4 h-4" />
                  Create Your First Key
                </PixelButton>
              </PixelCardContent>
            </PixelCard>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key, index) => (
                <motion.div
                  key={key._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PixelCard className={!key.isActive ? "opacity-60" : ""}>
                    <PixelCardContent className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className={`p-2 rounded-lg ${key.isActive ? "bg-purple-500/20" : "bg-muted"}`}>
                            <Key className={`w-5 h-5 ${key.isActive ? "text-purple-400" : "text-muted-foreground"}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-foreground truncate">{key.name}</h3>
                              {key.isActive ? (
                                <PixelBadge variant="default" className="text-xs">Active</PixelBadge>
                              ) : (
                                <PixelBadge variant="secondary" className="text-xs">Revoked</PixelBadge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <code className="bg-muted px-2 py-0.5 rounded">{key.keyPrefix}</code>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Created {formatDate(key.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              {key.usageCount} requests
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatLastUsed(key.lastUsedAt)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {key.isActive && (
                              <PixelButton
                                variant="outline"
                                size="sm"
                                onClick={() => handleRevokeKey(key._id)}
                                className="text-amber-400 border-amber-400/30 hover:bg-amber-400/10"
                              >
                                <Shield className="w-4 h-4" />
                              </PixelButton>
                            )}
                            <PixelButton
                              variant="outline"
                              size="sm"
                              onClick={() => setKeyToDelete(key._id)}
                              className="text-red-400 border-red-400/30 hover:bg-red-400/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </PixelButton>
                          </div>
                        </div>
                      </div>
                    </PixelCardContent>
                  </PixelCard>
                </motion.div>
              ))}
            </div>
          )}

          <div className="mt-8">
            <PixelCard className="bg-muted/30">
              <PixelCardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">How to use your API key</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your API key to your MCP configuration to authenticate requests:
                </p>
                <pre className="bg-background rounded-lg p-4 overflow-x-auto text-sm">
                  <code className="text-foreground">{`{
  "mcpServers": {
    "vibebuff": {
      "command": "npx",
      "args": ["-y", "vibebuff-mcp"],
      "env": {
        "VIBEBUFF_API_URL": "https://vibebuff.dev/api",
        "VIBEBUFF_API_KEY": "your-api-key-here"
      }
    }
  }
}`}</code>
                </pre>
                <div className="mt-4">
                  <Link href="/mcp" className="text-primary hover:underline text-sm">
                    View full installation guide
                  </Link>
                </div>
              </PixelCardContent>
            </PixelCard>
          </div>
        </div>
      </section>

      <Dialog open={isCreateDialogOpen} onOpenChange={handleCloseCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-purple-400" />
              {newlyCreatedKey ? "API Key Created" : "Create New API Key"}
            </DialogTitle>
            <DialogDescription>
              {newlyCreatedKey
                ? "Copy your API key now. You won't be able to see it again."
                : "Give your API key a name to help you identify it later."}
            </DialogDescription>
          </DialogHeader>

          {newlyCreatedKey ? (
            <div className="space-y-4">
              <div className="relative">
                <div className="bg-muted rounded-lg p-4 pr-12 font-mono text-sm break-all">
                  {showKey ? newlyCreatedKey : "vb_" + "•".repeat(32)}
                </div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="p-2 rounded-md hover:bg-background/80 transition-colors"
                  >
                    {showKey ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <button
                    onClick={handleCopyKey}
                    className="p-2 rounded-md hover:bg-background/80 transition-colors"
                  >
                    {copiedKey ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
              <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/30">
                <p className="text-xs text-amber-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  Make sure to copy your API key now. You won&apos;t be able to see it again!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Key Name
                </label>
                <PixelInput
                  placeholder="e.g., Cursor IDE, Claude Desktop"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateKey()}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            {newlyCreatedKey ? (
              <PixelButton onClick={handleCloseCreateDialog} className="w-full">
                Done
              </PixelButton>
            ) : (
              <>
                <PixelButton variant="outline" onClick={handleCloseCreateDialog}>
                  Cancel
                </PixelButton>
                <PixelButton
                  onClick={handleCreateKey}
                  disabled={!newKeyName.trim() || isCreating}
                >
                  {isCreating ? "Creating..." : "Create Key"}
                </PixelButton>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!keyToDelete} onOpenChange={() => setKeyToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <Trash2 className="w-5 h-5" />
              Delete API Key
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this API key? This action cannot be undone and any applications using this key will stop working.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <PixelButton variant="outline" onClick={() => setKeyToDelete(null)}>
              Cancel
            </PixelButton>
            <PixelButton
              onClick={() => keyToDelete && handleDeleteKey(keyToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete Key
            </PixelButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
