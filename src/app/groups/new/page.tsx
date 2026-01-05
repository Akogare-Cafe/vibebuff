"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { PixelButton } from "@/components/pixel-button";
import { PixelInput } from "@/components/pixel-input";
import Link from "next/link";
import {
  Users,
  ChevronLeft,
  Globe,
  Lock,
  Mail,
  Loader2,
} from "lucide-react";

export default function CreateGroupPage() {
  const { user } = useUser();
  const router = useRouter();
  const createGroup = useMutation(api.groups.create);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupType, setGroupType] = useState<"public" | "private" | "invite_only">("public");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!name.trim()) {
      setError("Group name is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const result = await createGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        groupType,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        userId: user.id,
      });
      router.push(`/groups/${result.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <PixelCard className="p-8 text-center max-w-md">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold text-foreground mb-2">Sign In Required</h2>
          <p className="text-muted-foreground text-sm mb-4">
            You need to sign in to create a group.
          </p>
          <Link href="/sign-in">
            <PixelButton>Sign In</PixelButton>
          </Link>
        </PixelCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/groups" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 mb-4">
            <ChevronLeft className="w-4 h-4" /> Back to Groups
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="font-heading text-foreground text-2xl">CREATE GROUP</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Create a group to share tools, stacks, and decks with other developers.
          </p>
        </div>

        <PixelCard>
          <PixelCardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Group Name *
                </label>
                <PixelInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., React Enthusiasts"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this group about?"
                  className="w-full h-24 px-4 py-3 bg-background border-2 border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Group Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setGroupType("public")}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      groupType === "public"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Globe className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium text-foreground">Public</p>
                    <p className="text-xs text-muted-foreground">Anyone can join</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroupType("private")}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      groupType === "private"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Lock className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium text-foreground">Private</p>
                    <p className="text-xs text-muted-foreground">Hidden from search</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGroupType("invite_only")}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      groupType === "invite_only"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Mail className="w-6 h-6 mx-auto mb-2 text-primary" />
                    <p className="text-sm font-medium text-foreground">Invite Only</p>
                    <p className="text-xs text-muted-foreground">Requires invitation</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tags (comma separated)
                </label>
                <PixelInput
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., react, frontend, web"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Link href="/groups" className="flex-1">
                  <PixelButton variant="outline" className="w-full" type="button">
                    Cancel
                  </PixelButton>
                </Link>
                <PixelButton type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Create Group
                    </>
                  )}
                </PixelButton>
              </div>
            </form>
          </PixelCardContent>
        </PixelCard>
      </main>
    </div>
  );
}
