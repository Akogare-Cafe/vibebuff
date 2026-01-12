"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { MousePointer2 } from "lucide-react";

interface CursorData {
  sessionId: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  x: number;
  y: number;
}

interface LiveCursorsProps {
  page?: string;
}

interface InterpolatedCursor extends CursorData {
  targetX: number;
  targetY: number;
}

const CURSOR_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  
  let sessionId = sessionStorage.getItem("cursor_session_id");
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("cursor_session_id", sessionId);
  }
  return sessionId;
}

function getCursorColor(sessionId: string): string {
  let hash = 0;
  for (let i = 0; i < sessionId.length; i++) {
    hash = sessionId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length];
}

export function LiveCursors({ page = "/" }: LiveCursorsProps) {
  const { user } = useUser();
  const [sessionId] = useState(getSessionId);
  const updateCursor = useMutation(api.liveCursors.updateCursor);
  const removeCursor = useMutation(api.liveCursors.removeCursor);
  const cursors = useQuery(api.liveCursors.getActiveCursors, {
    page,
    excludeSessionId: sessionId,
  });

  const lastUpdateRef = useRef<number>(0);
  const throttleDelay = 50;

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastUpdateRef.current < throttleDelay) return;
      
      lastUpdateRef.current = now;

      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;

      updateCursor({
        sessionId,
        userId: user?.id,
        userName: user?.firstName || user?.username || undefined,
        userAvatar: user?.imageUrl || undefined,
        x,
        y,
        page,
      });
    },
    [updateCursor, sessionId, user, page]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      removeCursor({ sessionId }).catch(() => {});
    };
  }, [handleMouseMove, removeCursor, sessionId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        removeCursor({ sessionId }).catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [removeCursor, sessionId]);

  if (!cursors || cursors.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <AnimatePresence>
        {cursors.map((cursor) => (
          <SmoothCursor key={cursor.sessionId} cursor={cursor} />
        ))}
      </AnimatePresence>
    </div>
  );
}

const springConfig = { damping: 30, stiffness: 400, mass: 0.5 };

function SmoothCursor({ cursor }: { cursor: CursorData }) {
  const color = getCursorColor(cursor.sessionId);
  const displayName = cursor.userName || "Anonymous";
  
  const springX = useSpring(cursor.x, springConfig);
  const springY = useSpring(cursor.y, springConfig);
  
  useEffect(() => {
    springX.set(cursor.x);
    springY.set(cursor.y);
  }, [cursor.x, cursor.y, springX, springY]);

  const left = useTransform(springX, (v) => `${v}%`);
  const top = useTransform(springY, (v) => `${v}%`);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.15 }}
      style={{
        position: "absolute",
        left,
        top,
        x: "-50%",
        y: "-50%",
        willChange: "left, top",
      }}
    >
      <div className="relative">
        <motion.div
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ 
            duration: 0.3, 
            ease: "easeOut",
            times: [0, 0.3, 0.6, 1],
          }}
        >
          <MousePointer2
            className="w-6 h-6"
            style={{ 
              color,
              filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.3)) drop-shadow(0 0 8px ${color}50)`,
            }}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: -5, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
          className="absolute left-7 top-0 whitespace-nowrap"
        >
          <motion.div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white shadow-lg backdrop-blur-sm"
            style={{ 
              backgroundColor: `${color}ee`,
              boxShadow: `0 4px 12px ${color}40, 0 0 20px ${color}20`,
            }}
            whileHover={{ scale: 1.05 }}
          >
            {cursor.userAvatar && (
              <motion.img
                src={cursor.userAvatar}
                alt={displayName}
                className="w-4 h-4 rounded-full border border-white/30"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              />
            )}
            <span className="drop-shadow-sm">{displayName}</span>
          </motion.div>
        </motion.div>
        
        <motion.div
          className="absolute -inset-2 rounded-full"
          style={{ backgroundColor: `${color}15` }}
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </motion.div>
  );
}
