"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelInput } from "./pixel-input";
import { PixelBadge } from "./pixel-badge";
import { 
  MessageCircle, 
  Send, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  X,
  Reply,
  Trash2,
  Users,
  Timer,
  Crown,
  Shield,
  Star,
  Zap,
  Heart,
  ThumbsUp,
  Flame,
  Sparkles,
  Megaphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatMessage {
  _id: Id<"globalChatMessages">;
  userId?: string;
  username: string;
  avatarUrl?: string;
  content: string;
  createdAt: number;
  expiresAt: number;
  messageType?: "message" | "announcement" | "system";
  replyToId?: Id<"globalChatMessages">;
  replyToUsername?: string;
  replyToContent?: string;
  reactions?: { emoji: string; userIds: string[] }[];
  userLevel?: number;
  userBadges?: string[];
}

const REACTION_ICONS = [
  { key: "heart", Icon: Heart },
  { key: "thumbsup", Icon: ThumbsUp },
  { key: "flame", Icon: Flame },
  { key: "star", Icon: Star },
  { key: "zap", Icon: Zap },
];

const BADGE_ICONS: Record<string, typeof Crown> = {
  crown: Crown,
  shield: Shield,
  star: Star,
  zap: Zap,
};

function formatTimeRemaining(expiresAt: number): string {
  const remaining = expiresAt - Date.now();
  if (remaining <= 0) return "expiring...";
  
  const minutes = Math.floor(remaining / 60000);
  if (minutes < 1) return "<1m";
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: "2-digit", 
    minute: "2-digit" 
  });
}

function UserBadges({ badges }: { badges?: string[] }) {
  if (!badges || badges.length === 0) return null;
  
  return (
    <span className="inline-flex gap-0.5 mr-1">
      {badges.slice(0, 3).map((badge, i) => {
        const BadgeIcon = BADGE_ICONS[badge] || Star;
        return (
          <BadgeIcon 
            key={i} 
            className="w-3 h-3 text-[#fbbf24]" 
          />
        );
      })}
    </span>
  );
}

function UserLevel({ level }: { level?: number }) {
  if (!level || level < 1) return null;
  
  return (
    <span className="text-[7px] bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white px-1 rounded ml-1">
      Lv.{level}
    </span>
  );
}

export function GlobalChat() {
  const { user, isSignedIn } = useUser();
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const messages = useQuery(api.globalChat.getMessages) as ChatMessage[] | undefined;
  const chatSettings = useQuery(api.globalChat.getChatSettings);
  const onlineCount = useQuery(api.globalChat.getOnlineCount);
  const sendMessageMutation = useMutation(api.globalChat.sendMessage);
  const addReaction = useMutation(api.globalChat.addReaction);
  const deleteMessage = useMutation(api.globalChat.deleteMessage);

  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  }, []);

  useEffect(() => {
    if (isExpanded && autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isExpanded, autoScroll]);

  const handleSend = async () => {
    if (!message.trim()) return;
    setError(null);

    const username = isSignedIn && user 
      ? (user.username || user.firstName || "Anonymous")
      : `Guest_${Math.random().toString(36).slice(2, 6)}`;

    try {
      await sendMessageMutation({
        content: message.trim(),
        username,
        avatarUrl: user?.imageUrl,
        userId: user?.id,
        replyToId: replyingTo?._id,
        messageType: "message",
      });

      setMessage("");
      setReplyingTo(null);
      setAutoScroll(true);
      inputRef.current?.focus();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send message";
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleReaction = async (messageId: Id<"globalChatMessages">, emoji: string) => {
    if (!user?.id) return;
    try {
      await addReaction({ messageId, emoji, userId: user.id });
    } catch (err) {
      console.error("Failed to add reaction:", err);
    }
    setShowReactions(null);
  };

  const handleDelete = async (messageId: Id<"globalChatMessages">) => {
    if (!user?.id) return;
    try {
      await deleteMessage({ messageId, userId: user.id });
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape" && replyingTo) {
      setReplyingTo(null);
    }
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-20 right-4 z-50"
      >
        <PixelButton
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2"
          size="sm"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Chat</span>
          {messages && messages.length > 0 && (
            <span className="bg-[#3b82f6] text-[#000000] px-1.5 py-0.5 rounded text-[8px]">
              {messages.length}
            </span>
          )}
          {typeof onlineCount === "number" && onlineCount > 0 && (
            <span className="flex items-center gap-0.5 text-[8px] text-[#22c55e]">
              <Users className="w-3 h-3" />
              {onlineCount}
            </span>
          )}
        </PixelButton>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "fixed top-20 right-4 z-50 w-80",
        isExpanded && "w-96"
      )}
    >
      <PixelCard rarity="uncommon" className="overflow-hidden">
        <PixelCardHeader className="py-2 px-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#60a5fa]" />
            <PixelCardTitle className="text-[10px]">Live Chat</PixelCardTitle>
            {typeof onlineCount === "number" && onlineCount > 0 && (
              <span className="flex items-center gap-0.5 text-[8px] text-[#22c55e]">
                <Users className="w-3 h-3" />
                {onlineCount}
              </span>
            )}
            {chatSettings?.isSlowModeEnabled && (
              <span className="flex items-center gap-0.5 text-[8px] text-[#f59e0b]">
                <Timer className="w-3 h-3" />
                {chatSettings.slowModeSeconds}s
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[7px] text-[#3b82f6] flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              1h
            </span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-[#1e3a5f] rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-[#60a5fa]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#60a5fa]" />
              )}
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 hover:bg-[#1e3a5f] rounded transition-colors"
            >
              <X className="w-4 h-4 text-[#60a5fa]" />
            </button>
          </div>
        </PixelCardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <PixelCardContent className="p-0">
                <div 
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                  className="h-72 overflow-y-auto p-3 space-y-2 bg-[#0a1628]/50"
                >
                  {!messages || messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageCircle className="w-8 h-8 text-[#1e3a5f] mb-2" />
                      <p className="text-[10px] text-[#3b82f6]">No messages yet</p>
                      <p className="text-[8px] text-[#1e3a5f]">Be the first to say hi!</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <motion.div
                        key={msg._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "p-2 rounded border-2 group relative",
                          msg.messageType === "announcement" 
                            ? "border-[#fbbf24]/50 bg-gradient-to-r from-[#fbbf24]/10 to-[#f59e0b]/5"
                            : msg.messageType === "system"
                            ? "border-[#22c55e]/50 bg-[#22c55e]/10"
                            : "border-[#1e3a5f]/50 bg-[#0d1f3c]/80",
                          msg.userId === user?.id && "border-[#3b82f6]/50 bg-[#1e3a5f]/30"
                        )}
                      >
                        {msg.replyToUsername && (
                          <div className="flex items-center gap-1 mb-1 text-[7px] text-[#3b82f6]">
                            <Reply className="w-2.5 h-2.5" />
                            <span>@{msg.replyToUsername}:</span>
                            <span className="truncate opacity-70">{msg.replyToContent}</span>
                          </div>
                        )}
                        
                        {msg.messageType === "announcement" && (
                          <div className="flex items-center gap-1 mb-1">
                            <Megaphone className="w-3 h-3 text-[#fbbf24]" />
                            <span className="text-[7px] text-[#fbbf24] uppercase font-bold">Announcement</span>
                          </div>
                        )}

                        <div className="flex items-start gap-2">
                          {msg.avatarUrl ? (
                            <img
                              src={msg.avatarUrl}
                              alt={msg.username}
                              className="w-6 h-6 rounded border border-[#1e3a5f]"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded border border-[#1e3a5f] bg-[#1e3a5f] flex items-center justify-center">
                              <span className="text-[8px] text-[#60a5fa]">
                                {msg.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[9px] text-[#60a5fa] font-bold truncate flex items-center">
                                <UserBadges badges={msg.userBadges} />
                                {msg.username}
                                <UserLevel level={msg.userLevel} />
                              </span>
                              <span className="text-[7px] text-[#1e3a5f] flex items-center gap-1 shrink-0">
                                <Clock className="w-2.5 h-2.5" />
                                {formatTimeRemaining(msg.expiresAt)}
                              </span>
                            </div>
                            <p className="text-[9px] text-[#93c5fd] break-words mt-0.5">
                              {msg.content}
                            </p>
                            
                            <div className="flex items-center justify-between mt-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[7px] text-[#1e3a5f]">
                                  {formatTime(msg.createdAt)}
                                </span>
                                
                                {msg.reactions && msg.reactions.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    {msg.reactions.map((reaction) => {
                                      const reactionDef = REACTION_ICONS.find(r => r.key === reaction.emoji);
                                      if (!reactionDef) return null;
                                      const ReactionIcon = reactionDef.Icon;
                                      return (
                                        <button
                                          key={reaction.emoji}
                                          onClick={() => handleReaction(msg._id, reaction.emoji)}
                                          className={cn(
                                            "flex items-center gap-0.5 px-1 py-0.5 rounded text-[7px]",
                                            "border border-[#1e3a5f]/50 hover:border-[#3b82f6]",
                                            reaction.userIds.includes(user?.id || "") && "bg-[#3b82f6]/20 border-[#3b82f6]"
                                          )}
                                        >
                                          <ReactionIcon className="w-2.5 h-2.5" />
                                          <span>{reaction.userIds.length}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setReplyingTo(msg)}
                                  className="p-0.5 hover:bg-[#1e3a5f] rounded"
                                  title="Reply"
                                >
                                  <Reply className="w-3 h-3 text-[#3b82f6]" />
                                </button>
                                
                                <div className="relative">
                                  <button
                                    onClick={() => setShowReactions(showReactions === msg._id ? null : msg._id)}
                                    className="p-0.5 hover:bg-[#1e3a5f] rounded"
                                    title="React"
                                  >
                                    <Sparkles className="w-3 h-3 text-[#3b82f6]" />
                                  </button>
                                  
                                  {showReactions === msg._id && (
                                    <div className="absolute bottom-full right-0 mb-1 flex gap-1 p-1 bg-[#0a1628] border-2 border-[#1e3a5f] rounded z-10">
                                      {REACTION_ICONS.map(({ key, Icon }) => (
                                        <button
                                          key={key}
                                          onClick={() => handleReaction(msg._id, key)}
                                          className="p-1 hover:bg-[#1e3a5f] rounded"
                                        >
                                          <Icon className="w-3 h-3 text-[#60a5fa]" />
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {msg.userId === user?.id && (
                                  <button
                                    onClick={() => handleDelete(msg._id)}
                                    className="p-0.5 hover:bg-[#1e3a5f] rounded"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3 h-3 text-[#ef4444]" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {!autoScroll && messages && messages.length > 0 && (
                  <button
                    onClick={() => {
                      setAutoScroll(true);
                      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="absolute bottom-20 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#3b82f6] text-[#000000] text-[8px] rounded flex items-center gap-1"
                  >
                    <ChevronDown className="w-3 h-3" />
                    New messages
                  </button>
                )}

                {error && (
                  <div className="px-3 py-1 bg-[#ef4444]/20 border-t border-[#ef4444]/50">
                    <p className="text-[8px] text-[#ef4444]">{error}</p>
                  </div>
                )}

                {replyingTo && (
                  <div className="px-3 py-1 bg-[#1e3a5f]/30 border-t border-[#1e3a5f]/50 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[8px] text-[#3b82f6]">
                      <Reply className="w-3 h-3" />
                      <span>Replying to @{replyingTo.username}</span>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="p-0.5 hover:bg-[#1e3a5f] rounded">
                      <X className="w-3 h-3 text-[#60a5fa]" />
                    </button>
                  </div>
                )}

                <div className="p-2 border-t-2 border-[#1e3a5f]/50 bg-[#0a1628]">
                  <div className="flex gap-2">
                    <PixelInput
                      ref={inputRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : isSignedIn ? "Type a message..." : "Chat as guest..."}
                      className="flex-1 h-8 text-[9px]"
                      maxLength={500}
                    />
                    <PixelButton
                      onClick={handleSend}
                      disabled={!message.trim()}
                      size="sm"
                      className="px-2"
                    >
                      <Send className="w-3 h-3" />
                    </PixelButton>
                  </div>
                  {!isSignedIn && (
                    <p className="text-[7px] text-[#1e3a5f] mt-1 text-center">
                      Sign in for a persistent username
                    </p>
                  )}
                </div>
              </PixelCardContent>
            </motion.div>
          )}
        </AnimatePresence>

        {!isExpanded && (
          <PixelCardContent className="py-2 px-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-[#3b82f6]">
                {messages?.length || 0} messages
              </span>
              <PixelButton
                onClick={() => setIsExpanded(true)}
                size="sm"
                variant="ghost"
                className="text-[8px]"
              >
                Open Chat
              </PixelButton>
            </div>
          </PixelCardContent>
        )}
      </PixelCard>
    </motion.div>
  );
}
