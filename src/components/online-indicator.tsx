"use client";

import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Users } from "lucide-react";
import { useUser } from "@clerk/nextjs";

const HEARTBEAT_INTERVAL = 60 * 1000;
const SESSION_KEY = "vibebuff_session_id";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

export function OnlineIndicator() {
  const { isSignedIn } = useUser();
  const onlineData = useQuery(api.presence.getOnlineCount);
  const heartbeat = useMutation(api.presence.heartbeat);
  const setOffline = useMutation(api.presence.setOffline);
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId();
    const sessionId = sessionIdRef.current;

    heartbeat({ sessionId: isSignedIn ? undefined : sessionId });

    const interval = setInterval(() => {
      heartbeat({ sessionId: isSignedIn ? undefined : sessionId });
    }, HEARTBEAT_INTERVAL);

    const handleBeforeUnload = () => {
      setOffline({ sessionId: isSignedIn ? undefined : sessionId });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setOffline({ sessionId: isSignedIn ? undefined : sessionId });
      } else {
        heartbeat({ sessionId: isSignedIn ? undefined : sessionId });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isSignedIn, heartbeat, setOffline]);

  const count = onlineData?.count ?? 0;

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card border border-border text-xs font-medium">
      <div className="relative flex items-center justify-center">
        <span className="absolute w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75" />
        <span className="relative w-2 h-2 bg-green-500 rounded-full" />
      </div>
      <Users className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-foreground tabular-nums">{count}</span>
      <span className="text-muted-foreground hidden sm:inline">online</span>
    </div>
  );
}
