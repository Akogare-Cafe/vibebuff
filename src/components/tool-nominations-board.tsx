"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelBadge } from "./pixel-badge";
import { PixelInput } from "./pixel-input";
import { cn } from "@/lib/utils";
import {
  PlusCircle,
  ThumbsUp,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Globe,
  Github,
  Send,
  TrendingUp,
  User,
} from "lucide-react";

interface ToolNominationsBoardProps {
  userId: string;
  className?: string;
}

export function ToolNominationsBoard({ userId, className }: ToolNominationsBoardProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    websiteUrl: "",
    githubUrl: "",
    categorySlug: "",
    description: "",
    whyAdd: "",
  });

  const topNominations = useQuery(api.nominations.getTopNominations, { limit: 10 });
  const userNominations = useQuery(api.nominations.getUserNominations, { userId });
  const submitNomination = useMutation(api.nominations.submitNomination);
  const voteForNomination = useMutation(api.nominations.voteForNomination);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "added":
        return "text-green-400 border-green-400";
      case "approved":
        return "text-blue-400 border-blue-400";
      case "under_review":
        return "text-yellow-400 border-yellow-400";
      case "rejected":
        return "text-red-400 border-red-400";
      default:
        return "text-muted-foreground border-border";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "added":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case "under_review":
        return <Eye className="w-4 h-4 text-yellow-400" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.websiteUrl || !formData.categorySlug || !formData.description || !formData.whyAdd) {
      return;
    }

    try {
      await submitNomination({
        userId,
        name: formData.name,
        websiteUrl: formData.websiteUrl,
        githubUrl: formData.githubUrl || undefined,
        categorySlug: formData.categorySlug,
        description: formData.description,
        whyAdd: formData.whyAdd,
      });
      setFormData({
        name: "",
        websiteUrl: "",
        githubUrl: "",
        categorySlug: "",
        description: "",
        whyAdd: "",
      });
      setShowForm(false);
    } catch (error) {
      console.error("Failed to submit nomination:", error);
    }
  };

  const handleVote = async (nominationId: Id<"toolNominations">) => {
    try {
      await voteForNomination({ userId, nominationId });
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <PixelCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-primary text-sm flex items-center gap-2">
            <PlusCircle className="w-5 h-5" /> TOOL NOMINATIONS
          </h2>
          <PixelButton
            size="sm"
            variant={showForm ? "ghost" : "default"}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "CANCEL" : <><PlusCircle className="w-4 h-4 mr-1" /> NOMINATE</>}
          </PixelButton>
        </div>

        {showForm && (
          <div className="mb-6 p-4 border-2 border-primary bg-primary/5">
            <h3 className="text-primary text-sm uppercase mb-4">
              NOMINATE A NEW TOOL
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-muted-foreground text-xs block mb-1">TOOL NAME *</label>
                <PixelInput
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Bun"
                />
              </div>
              <div>
                <label className="text-muted-foreground text-xs block mb-1">CATEGORY *</label>
                <PixelInput
                  value={formData.categorySlug}
                  onChange={(e) => setFormData({ ...formData, categorySlug: e.target.value })}
                  placeholder="e.g., runtime, database, frontend"
                />
              </div>
              <div>
                <label className="text-muted-foreground text-xs block mb-1">WEBSITE URL *</label>
                <PixelInput
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="text-muted-foreground text-xs block mb-1">GITHUB URL</label>
                <PixelInput
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-muted-foreground text-xs block mb-1">DESCRIPTION *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What does this tool do?"
                className="w-full bg-[#0a0f1a] border-2 border-border text-primary text-sm p-2 min-h-[60px]"
              />
            </div>

            <div className="mb-4">
              <label className="text-muted-foreground text-xs block mb-1">WHY ADD IT? *</label>
              <textarea
                value={formData.whyAdd}
                onChange={(e) => setFormData({ ...formData, whyAdd: e.target.value })}
                placeholder="Why should this tool be added to VibeBuff?"
                className="w-full bg-[#0a0f1a] border-2 border-border text-primary text-sm p-2 min-h-[60px]"
              />
            </div>

            <PixelButton onClick={handleSubmit}>
              <Send className="w-4 h-4 mr-1" /> SUBMIT NOMINATION
            </PixelButton>
          </div>
        )}

        <div className="mb-4">
          <h3 className="text-primary text-sm uppercase mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> TOP NOMINATIONS
          </h3>
          <p className="text-muted-foreground text-xs mb-4">
            Vote for tools you want to see added! Tools with 50+ votes go under review.
          </p>
        </div>

        <div className="space-y-3">
          {topNominations?.map((nomination, index) => (
            <div
              key={nomination._id}
              className="border-2 border-border p-4 hover:border-primary transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-base">#{index + 1}</span>
                  <div>
                    <h4 className="text-primary text-base">{nomination.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <PixelBadge variant="outline" className="text-[6px]">
                        {nomination.categorySlug}
                      </PixelBadge>
                      <PixelBadge
                        variant="outline"
                        className={cn("text-[6px]", getStatusColor(nomination.status))}
                      >
                        {nomination.status.replace("_", " ").toUpperCase()}
                      </PixelBadge>
                    </div>
                  </div>
                </div>
                {getStatusIcon(nomination.status)}
              </div>

              <p className="text-muted-foreground text-xs mb-3">{nomination.description}</p>

              <div className="flex items-center gap-3 mb-3">
                {nomination.websiteUrl && (
                  <a
                    href={nomination.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-muted-foreground hover:text-primary text-xs"
                  >
                    <Globe className="w-3 h-3" /> Website
                  </a>
                )}
                {nomination.githubUrl && (
                  <a
                    href={nomination.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-muted-foreground hover:text-primary text-xs"
                  >
                    <Github className="w-3 h-3" /> GitHub
                  </a>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="w-3 h-3" />
                  {nomination.nominatedByUser?.username ?? "Unknown"}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary text-sm">
                    {nomination.upvotes} votes
                  </span>
                  {nomination.status === "pending" && (
                    <PixelButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleVote(nomination._id)}
                    >
                      <ThumbsUp className="w-3 h-3 mr-1" /> VOTE
                    </PixelButton>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {(!topNominations || topNominations.length === 0) && (
          <div className="text-center py-12">
            <PlusCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-sm">
              No nominations yet. Be the first to nominate a tool!
            </p>
          </div>
        )}
      </PixelCard>

      {userNominations && userNominations.length > 0 && (
        <PixelCard className="p-4">
          <h3 className="text-primary text-sm uppercase mb-4">
            YOUR NOMINATIONS
          </h3>
          <div className="space-y-2">
            {userNominations.map((nomination) => (
              <div
                key={nomination._id}
                className="flex items-center justify-between p-2 border border-border"
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(nomination.status)}
                  <span className="text-primary text-sm">{nomination.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs">
                    {nomination.upvotes} votes
                  </span>
                  <PixelBadge
                    variant="outline"
                    className={cn("text-[6px]", getStatusColor(nomination.status))}
                  >
                    {nomination.status.replace("_", " ").toUpperCase()}
                  </PixelBadge>
                </div>
              </div>
            ))}
          </div>
        </PixelCard>
      )}
    </div>
  );
}
