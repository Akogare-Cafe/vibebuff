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
        return "text-yellow-400 border-yellow-400/50";
      case "hidden_feature":
        return "text-[#9d4dff] border-[#3b82f6]/50";
      case "gotcha":
        return "text-red-400 border-red-400/50";
      case "best_practice":
        return "text-blue-400 border-blue-400/50";
      case "performance_tip":
        return "text-green-400 border-green-400/50";
      case "cost_saving":
        return "text-cyan-400 border-cyan-400/50";
      default:
        return "text-primary border-border";
    }
  };

  const getWhisperGlow = (type: string) => {
    switch (type) {
      case "pro_tip":
        return "shadow-[0_0_10px_rgba(250,204,21,0.3)]";
      case "hidden_feature":
        return "shadow-[0_0_10px_rgba(127,19,236,0.5)]";
      case "gotcha":
        return "shadow-[0_0_10px_rgba(248,113,113,0.3)]";
      case "best_practice":
        return "shadow-[0_0_10px_rgba(59,130,246,0.3)]";
      case "performance_tip":
        return "shadow-[0_0_10px_rgba(74,222,128,0.3)]";
      case "cost_saving":
        return "shadow-[0_0_10px_rgba(34,211,238,0.3)]";
      default:
        return "";
    }
  };

  const getWhisperBgGlow = (type: string) => {
    switch (type) {
      case "pro_tip":
        return "bg-yellow-500/5";
      case "hidden_feature":
        return "bg-[#3b82f6]/10";
      case "gotcha":
        return "bg-red-500/5";
      case "best_practice":
        return "bg-blue-500/5";
      case "performance_tip":
        return "bg-green-500/5";
      case "cost_saving":
        return "bg-cyan-500/5";
      default:
        return "";
    }
  };

  const handleUnlock = async (whisperId: Id<"toolWhispers">) => {
    if (!userId) return;
    try {
      await unlockWhisper({ userId, toolId, whisperId });
    } catch (error) {
    }
  };

  const handleUpvote = async (whisperId: Id<"toolWhispers">) => {
    if (!userId) return;
    try {
      await upvoteWhisper({ userId, whisperId });
    } catch (error) {
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
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <PixelCard className="p-6 bg-[#0a0f1a] border-[#1e293b]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#111827] border border-[#1e293b] flex items-center justify-center group-hover:bg-[#3b82f6]/20 transition-colors">
              <MessageCircle className="w-5 h-5 text-[#9d4dff]" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm tracking-tight">Tool Whispers</h3>
              <p className="text-[#ad92c9] text-sm">Insider tips & secrets</p>
            </div>
          </div>
          {userId && (
            <PixelButton
              size="sm"
              variant="outline"
              onClick={() => setShowSubmitForm(!showSubmitForm)}
              className="border-[#3b82f6]/50 hover:border-[#3b82f6] hover:bg-[#3b82f6]/10 hover:shadow-[0_0_10px_rgba(127,19,236,0.3)] transition-all"
            >
              <Send className="w-3 h-3 mr-1" /> SHARE TIP
            </PixelButton>
          )}
        </div>

        {showSubmitForm && (
          <div className="mb-6 p-5 rounded-xl border border-[#3b82f6]/30 bg-gradient-to-b from-[#111827] to-[#0a0f1a] shadow-[0_0_15px_rgba(127,19,236,0.2)]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse"></div>
              <h4 className="text-[#9d4dff] text-xs font-bold uppercase tracking-wider">Share Your Knowledge</h4>
            </div>
            
            <div className="mb-4">
              <label className="text-[#ad92c9] text-sm block mb-2 uppercase tracking-wider">Type</label>
              <select
                value={newWhisper.whisperType}
                onChange={(e) => setNewWhisper({ ...newWhisper, whisperType: e.target.value as typeof newWhisper.whisperType })}
                className="w-full bg-[#0a0f1a] border border-[#1e293b] rounded-lg text-white text-xs p-3 focus:border-[#3b82f6] focus:outline-none focus:ring-0 transition-colors"
              >
                <option value="pro_tip">Pro Tip</option>
                <option value="hidden_feature">Hidden Feature</option>
                <option value="gotcha">Gotcha / Warning</option>
                <option value="best_practice">Best Practice</option>
                <option value="performance_tip">Performance Tip</option>
                <option value="cost_saving">Cost Saving</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="text-[#ad92c9] text-sm block mb-2 uppercase tracking-wider">Whisper</label>
              <textarea
                value={newWhisper.content}
                onChange={(e) => setNewWhisper({ ...newWhisper, content: e.target.value })}
                placeholder="Share your insider knowledge..."
                className="w-full bg-[#0a0f1a] border border-[#1e293b] rounded-lg text-white text-xs p-3 min-h-[100px] focus:border-[#3b82f6] focus:outline-none focus:ring-0 transition-colors placeholder:text-[#ad92c9]/50"
              />
            </div>

            <div className="mb-4">
              <label className="text-[#ad92c9] text-sm block mb-2 uppercase tracking-wider">Source (Optional)</label>
              <PixelInput
                value={newWhisper.source}
                onChange={(e) => setNewWhisper({ ...newWhisper, source: e.target.value })}
                placeholder="Link to docs, blog post, etc."
                className="bg-[#0a0f1a] border-[#1e293b] focus:border-[#3b82f6]"
              />
            </div>

            <div className="flex gap-3">
              <PixelButton 
                size="sm" 
                onClick={handleSubmit} 
                disabled={!newWhisper.content}
                className="bg-[#3b82f6] hover:bg-[#9d4dff] shadow-[0_0_10px_rgba(127,19,236,0.5)] hover:shadow-[0_0_15px_rgba(127,19,236,0.7)] transition-all"
              >
                <Send className="w-3 h-3 mr-1" /> SUBMIT
              </PixelButton>
              <PixelButton 
                size="sm" 
                variant="ghost" 
                onClick={() => setShowSubmitForm(false)}
                className="text-[#ad92c9] hover:text-white hover:bg-[#1e293b]"
              >
                CANCEL
              </PixelButton>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {whispers?.map((whisper) => (
            <div
              key={whisper._id}
              className={cn(
                "group relative rounded-xl border p-4 transition-all duration-300 overflow-hidden",
                whisper.isLocked
                  ? "border-[#1e293b] bg-[#111827]/50 opacity-80"
                  : cn(
                      getWhisperColor(whisper.whisperType),
                      getWhisperGlow(whisper.whisperType),
                      getWhisperBgGlow(whisper.whisperType),
                      "hover:scale-[1.01]"
                    )
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg border flex items-center justify-center transition-all duration-300",
                    whisper.isLocked 
                      ? "bg-[#111827] border-[#1e293b]" 
                      : cn("bg-[#0a0f1a]", getWhisperColor(whisper.whisperType), "group-hover:scale-110")
                  )}>
                    <span className={cn(
                      whisper.isLocked ? "text-[#ad92c9]" : getWhisperColor(whisper.whisperType).split(" ")[0]
                    )}>
                      {getWhisperIcon(whisper.whisperType)}
                    </span>
                  </div>
                  <div>
                    <PixelBadge
                      variant="outline"
                      className={cn(
                        "text-xs uppercase tracking-wider",
                        whisper.isLocked ? "text-[#ad92c9] border-[#1e293b]" : getWhisperColor(whisper.whisperType)
                      )}
                    >
                      {whisper.whisperType.replace("_", " ").toUpperCase()}
                    </PixelBadge>
                    {whisper.isVerified && (
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400 font-medium">Verified</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  whisper.isLocked ? "bg-[#1e293b]/50" : "bg-green-500/10"
                )}>
                  {whisper.isLocked ? (
                    <Lock className="w-4 h-4 text-[#ad92c9]" />
                  ) : (
                    <Unlock className="w-4 h-4 text-green-400" />
                  )}
                </div>
              </div>

              {whisper.isLocked ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#1e293b]/50 flex items-center justify-center mb-3">
                    <Lock className="w-8 h-8 text-[#ad92c9]" />
                  </div>
                  <p className="text-[#ad92c9] text-xs mb-4">
                    This whisper is locked
                  </p>
                  {userId && (
                    <PixelButton
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnlock(whisper._id)}
                      className="border-[#3b82f6]/50 hover:border-[#3b82f6] hover:bg-[#3b82f6]/10 hover:shadow-[0_0_10px_rgba(127,19,236,0.3)] transition-all"
                    >
                      <Unlock className="w-3 h-3 mr-1" /> UNLOCK (+10 XP)
                    </PixelButton>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-white text-sm leading-relaxed mb-3">{whisper.content}</p>
                  
                  {whisper.source && (
                    <a
                      href={whisper.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#ad92c9] text-sm hover:text-[#9d4dff] underline transition-colors"
                    >
                      View Source
                    </a>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#1e293b]">
                    <button
                      onClick={() => handleUpvote(whisper._id)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] border border-[#1e293b] text-[#ad92c9] hover:text-green-400 hover:border-green-400/50 hover:shadow-[0_0_10px_rgba(74,222,128,0.2)] transition-all"
                      disabled={!userId}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span className="text-xs font-medium">{whisper.upvotes}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {(!whispers || whispers.length === 0) && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#111827] border border-[#1e293b] flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-[#ad92c9]" />
            </div>
            <p className="text-[#ad92c9] text-sm mb-2">
              No whispers yet
            </p>
            <p className="text-[#ad92c9]/60 text-xs">
              Be the first to share a tip!
            </p>
          </div>
        )}
      </PixelCard>
    </div>
  );
}
