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
  MessageCircle,
  Lock,
  Unlock,
  ThumbsUp,
  Lightbulb,
  AlertTriangle,
  Zap,
  DollarSign,
  BookOpen,
  Eye,
  Send,
  CheckCircle,
} from "lucide-react";

interface ToolWhispersProps {
  toolId: Id<"tools">;
  userId?: string;
  className?: string;
}

export function ToolWhispers({ toolId, userId, className }: ToolWhispersProps) {
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [newWhisper, setNewWhisper] = useState({
    content: "",
    whisperType: "pro_tip" as const,
    source: "",
  });

  const whispers = useQuery(api.toolWhispers.getWhispersForTool, { toolId, userId });
  const unlockWhisper = useMutation(api.toolWhispers.unlockWhisper);
  const submitWhisper = useMutation(api.toolWhispers.submitWhisper);
  const upvoteWhisper = useMutation(api.toolWhispers.upvoteWhisper);

  const getWhisperIcon = (type: string) => {
    switch (type) {
      case "pro_tip":
        return <Lightbulb className="w-4 h-4" />;
      case "hidden_feature":
        return <Eye className="w-4 h-4" />;
      case "gotcha":
        return <AlertTriangle className="w-4 h-4" />;
      case "best_practice":
        return <BookOpen className="w-4 h-4" />;
      case "performance_tip":
        return <Zap className="w-4 h-4" />;
      case "cost_saving":
        return <DollarSign className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getWhisperColor = (type: string) => {
    switch (type) {
      case "pro_tip":
        return "text-yellow-400 border-yellow-400";
      case "hidden_feature":
        return "text-purple-400 border-purple-400";
      case "gotcha":
        return "text-red-400 border-red-400";
      case "best_practice":
        return "text-blue-400 border-blue-400";
      case "performance_tip":
        return "text-green-400 border-green-400";
      case "cost_saving":
        return "text-cyan-400 border-cyan-400";
      default:
        return "text-[#60a5fa] border-[#1e3a5f]";
    }
  };

  const handleUnlock = async (whisperId: Id<"toolWhispers">) => {
    if (!userId) return;
    try {
      await unlockWhisper({ userId, toolId, whisperId });
    } catch (error) {
      console.error("Failed to unlock whisper:", error);
    }
  };

  const handleUpvote = async (whisperId: Id<"toolWhispers">) => {
    if (!userId) return;
    try {
      await upvoteWhisper({ userId, whisperId });
    } catch (error) {
      console.error("Failed to upvote:", error);
    }
  };

  const handleSubmit = async () => {
    if (!userId || !newWhisper.content) return;
    try {
      await submitWhisper({
        userId,
        toolId,
        whisperType: newWhisper.whisperType,
        content: newWhisper.content,
        source: newWhisper.source || undefined,
      });
      setNewWhisper({ content: "", whisperType: "pro_tip", source: "" });
      setShowSubmitForm(false);
    } catch (error) {
      console.error("Failed to submit whisper:", error);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <PixelCard className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#60a5fa] text-[10px] uppercase flex items-center gap-2">
            <MessageCircle className="w-4 h-4" /> TOOL WHISPERS
          </h3>
          {userId && (
            <PixelButton
              size="sm"
              variant="outline"
              onClick={() => setShowSubmitForm(!showSubmitForm)}
            >
              <Send className="w-3 h-3 mr-1" /> SHARE TIP
            </PixelButton>
          )}
        </div>

        {showSubmitForm && (
          <div className="mb-4 p-4 border-2 border-[#3b82f6] bg-[#3b82f6]/5">
            <h4 className="text-[#60a5fa] text-[10px] mb-3">SHARE YOUR KNOWLEDGE</h4>
            
            <div className="mb-3">
              <label className="text-[#3b82f6] text-[8px] block mb-1">TYPE</label>
              <select
                value={newWhisper.whisperType}
                onChange={(e) => setNewWhisper({ ...newWhisper, whisperType: e.target.value as typeof newWhisper.whisperType })}
                className="w-full bg-[#0a1628] border-2 border-[#1e3a5f] text-[#60a5fa] text-[10px] p-2"
              >
                <option value="pro_tip">Pro Tip</option>
                <option value="hidden_feature">Hidden Feature</option>
                <option value="gotcha">Gotcha / Warning</option>
                <option value="best_practice">Best Practice</option>
                <option value="performance_tip">Performance Tip</option>
                <option value="cost_saving">Cost Saving</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="text-[#3b82f6] text-[8px] block mb-1">WHISPER</label>
              <textarea
                value={newWhisper.content}
                onChange={(e) => setNewWhisper({ ...newWhisper, content: e.target.value })}
                placeholder="Share your insider knowledge..."
                className="w-full bg-[#0a1628] border-2 border-[#1e3a5f] text-[#60a5fa] text-[10px] p-2 min-h-[80px]"
              />
            </div>

            <div className="mb-3">
              <label className="text-[#3b82f6] text-[8px] block mb-1">SOURCE (OPTIONAL)</label>
              <PixelInput
                value={newWhisper.source}
                onChange={(e) => setNewWhisper({ ...newWhisper, source: e.target.value })}
                placeholder="Link to docs, blog post, etc."
              />
            </div>

            <div className="flex gap-2">
              <PixelButton size="sm" onClick={handleSubmit} disabled={!newWhisper.content}>
                <Send className="w-3 h-3 mr-1" /> SUBMIT
              </PixelButton>
              <PixelButton size="sm" variant="ghost" onClick={() => setShowSubmitForm(false)}>
                CANCEL
              </PixelButton>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {whispers?.map((whisper) => (
            <div
              key={whisper._id}
              className={cn(
                "border-2 p-3 transition-all",
                whisper.isLocked
                  ? "border-[#1e3a5f] opacity-70"
                  : getWhisperColor(whisper.whisperType)
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={getWhisperColor(whisper.whisperType)}>
                    {getWhisperIcon(whisper.whisperType)}
                  </span>
                  <PixelBadge
                    variant="outline"
                    className={cn("text-[6px]", getWhisperColor(whisper.whisperType))}
                  >
                    {whisper.whisperType.replace("_", " ").toUpperCase()}
                  </PixelBadge>
                  {whisper.isVerified && (
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  )}
                </div>
                {whisper.isLocked ? (
                  <Lock className="w-4 h-4 text-[#3b82f6]" />
                ) : (
                  <Unlock className="w-4 h-4 text-green-400" />
                )}
              </div>

              {whisper.isLocked ? (
                <div className="text-center py-4">
                  <Lock className="w-8 h-8 mx-auto text-[#1e3a5f] mb-2" />
                  <p className="text-[#3b82f6] text-[8px] mb-2">
                    This whisper is locked
                  </p>
                  {userId && (
                    <PixelButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnlock(whisper._id)}
                    >
                      <Unlock className="w-3 h-3 mr-1" /> UNLOCK (+10 XP)
                    </PixelButton>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-[#60a5fa] text-[10px] mb-2">{whisper.content}</p>
                  
                  {whisper.source && (
                    <a
                      href={whisper.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#3b82f6] text-[8px] hover:text-[#60a5fa] underline"
                    >
                      Source
                    </a>
                  )}

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1e3a5f]">
                    <button
                      onClick={() => handleUpvote(whisper._id)}
                      className="flex items-center gap-1 text-[#3b82f6] hover:text-green-400 transition-colors"
                      disabled={!userId}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span className="text-[8px]">{whisper.upvotes}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {(!whispers || whispers.length === 0) && (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto text-[#1e3a5f] mb-4" />
            <p className="text-[#3b82f6] text-[10px]">
              No whispers yet. Be the first to share a tip!
            </p>
          </div>
        )}
      </PixelCard>
    </div>
  );
}
