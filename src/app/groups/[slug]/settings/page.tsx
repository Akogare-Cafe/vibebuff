"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
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
  Settings,
  Trash2,
  Loader2,
  Save,
  AlertTriangle,
} from "lucide-react";

export default function GroupSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user } = useUser();

  const group = useQuery(api.groups.getBySlug, { slug });
  const updateGroup = useMutation(api.groups.update);
  const deleteGroup = useMutation(api.groups.deleteGroup);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupType, setGroupType] = useState<"public" | "private" | "invite_only">("public");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [initialized, setInitialized] = useState(false);

  if (group && !initialized) {
    setName(group.name);
    setDescription(group.description || "");
    setGroupType(group.groupType);
    setTags(group.tags.join(", "));
    setInitialized(true);
  }

  const isOwner = group?.ownerId === user?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !group?._id) return;
    if (!name.trim()) {
      setError("Group name is required");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await updateGroup({
        groupId: group._id,
        userId: user.id,
        name: name.trim(),
        description: description.trim() || undefined,
        groupType,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      setSuccess("Group settings updated successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update group");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user?.id || !group?._id) return;

    setIsDeleting(true);
    setError("");

    try {
      await deleteGroup({
        groupId: group._id,
        userId: user.id,
      });
      router.push("/groups");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete group");
      setIsDeleting(false);
    }
  };

  if (!group) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50 animate-pulse" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <PixelCard className="p-8 text-center max-w-md">
          <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Only the group owner can access settings.
          </p>
          <Link href={`/groups/${slug}`}>
            <PixelButton>Back to Group</PixelButton>
          </Link>
        </PixelCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/groups/${slug}`} className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-1 mb-4">
            <ChevronLeft className="w-4 h-4" /> Back to Group
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="font-heading text-foreground text-2xl">GROUP SETTINGS</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Manage your group settings and preferences.
          </p>
        </div>

        <PixelCard className="mb-6">
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

              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-500 text-sm">{success}</p>
                </div>
              )}

              <PixelButton type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </PixelButton>
            </form>
          </PixelCardContent>
        </PixelCard>

        <PixelCard className="border-red-500/30">
          <PixelCardContent className="p-6">
            <h2 className="text-lg font-bold text-red-500 flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5" /> Danger Zone
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              Deleting this group is permanent and cannot be undone. All members will be removed and shared content will be unlinked.
            </p>
            {!showDeleteConfirm ? (
              <PixelButton
                variant="outline"
                className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Group
              </PixelButton>
            ) : (
              <div className="space-y-3">
                <p className="text-red-500 text-sm font-medium">
                  Are you sure? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <PixelButton
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </PixelButton>
                  <PixelButton
                    className="bg-red-500 hover:bg-red-600"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Yes, Delete Group
                      </>
                    )}
                  </PixelButton>
                </div>
              </div>
            )}
          </PixelCardContent>
        </PixelCard>
      </main>
    </div>
  );
}
