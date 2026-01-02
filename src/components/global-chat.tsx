"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../convex/_generated/api";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "./pixel-card";
import { PixelButton } from "./pixel-button";
import { PixelInput } from "./pixel-input";
import { MessageCircle, Send, Clock, ChevronDown, ChevronUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatMessage {
  _id: string;
  userId?: string;
  username: string;
  avatarUrl?: string;
  content: string;
  createdAt: number;
  expiresAt: number;
}

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

export function GlobalChat() {
  const { user, isSignedIn } = useUser();
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const messages = useQuery(api.globalChat.getMessages) as ChatMessage[] | undefined;
  const sendMessage = useMutation(api.globalChat.sendMessage);

  useEffect(() => {
    if (isExpanded && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isExpanded]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const username = isSignedIn && user 
      ? (user.username || user.firstName || "Anonymous")
      : `Guest_${Math.random().toString(36).slice(2, 6)}`;

    await sendMessage({
      content: message.trim(),
      username,
      avatarUrl: user?.imageUrl,
      userId: user?.id,
    });

    setMessage("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
            <PixelCardTitle className="text-[10px]">Global Chat</PixelCardTitle>
            <span className="text-[8px] text-[#3b82f6] flex items-center gap-1">
              <Clock className="w-3 h-3" />
              1h TTL
            </span>
          </div>
          <div className="flex items-center gap-1">
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
                <div className="h-64 overflow-y-auto p-3 space-y-2 bg-[#0a1628]/50">
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
                          "p-2 rounded border-2 border-[#1e3a5f]/50",
                          "bg-[#0d1f3c]/80",
                          msg.userId === user?.id && "border-[#3b82f6]/50 bg-[#1e3a5f]/30"
                        )}
                      >
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
                              <span className="text-[9px] text-[#60a5fa] font-bold truncate">
                                {msg.username}
                              </span>
                              <span className="text-[7px] text-[#1e3a5f] flex items-center gap-1 shrink-0">
                                <Clock className="w-2.5 h-2.5" />
                                {formatTimeRemaining(msg.expiresAt)}
                              </span>
                            </div>
                            <p className="text-[9px] text-[#93c5fd] break-words mt-0.5">
                              {msg.content}
                            </p>
                            <span className="text-[7px] text-[#1e3a5f]">
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-2 border-t-2 border-[#1e3a5f]/50 bg-[#0a1628]">
                  <div className="flex gap-2">
                    <PixelInput
                      ref={inputRef}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={isSignedIn ? "Type a message..." : "Chat as guest..."}
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
