"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck,
  Trash2,
  Trophy,
  TrendingUp,
  Zap,
  Swords,
  Shield,
  Sparkles,
  Package,
  Star,
  MessageSquare,
  Megaphone,
  Flame,
  Target,
  BellRing,
} from "lucide-react";
import { PixelButton } from "@/components/pixel-button";
import { cn } from "@/lib/utils";
import type { Id } from "../../convex/_generated/dataModel";
import { useDesktopNotifications } from "@/hooks/use-desktop-notifications";

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

type NotificationType = 
  | "achievement_unlocked"
  | "level_up"
  | "xp_earned"
  | "deck_shared"
  | "battle_result"
  | "review_response"
  | "system_announcement"
  | "tool_update"
  | "streak_reminder"
  | "welcome"
  | "quest_completed"
  | "new_tool_discovered";

interface Notification {
  _id: Id<"notifications">;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: {
    toolId?: Id<"tools">;
    achievementId?: Id<"achievements">;
    deckId?: Id<"userDecks">;
    battleId?: Id<"battleHistory">;
    xpAmount?: number;
    level?: number;
    link?: string;
  };
  icon?: string;
  isRead: boolean;
  createdAt: number;
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  achievement_unlocked: <Trophy className="w-4 h-4 text-yellow-500" />,
  level_up: <TrendingUp className="w-4 h-4 text-green-500" />,
  xp_earned: <Zap className="w-4 h-4 text-primary" />,
  deck_shared: <Package className="w-4 h-4 text-blue-500" />,
  battle_result: <Swords className="w-4 h-4 text-red-500" />,
  review_response: <MessageSquare className="w-4 h-4 text-purple-500" />,
  system_announcement: <Megaphone className="w-4 h-4 text-orange-500" />,
  tool_update: <Star className="w-4 h-4 text-cyan-500" />,
  streak_reminder: <Flame className="w-4 h-4 text-orange-500" />,
  welcome: <Sparkles className="w-4 h-4 text-primary" />,
  quest_completed: <Target className="w-4 h-4 text-green-500" />,
  new_tool_discovered: <Sparkles className="w-4 h-4 text-emerald-500" />,
};

const notificationColors: Record<NotificationType, string> = {
  achievement_unlocked: "border-l-yellow-500",
  level_up: "border-l-green-500",
  xp_earned: "border-l-primary",
  deck_shared: "border-l-blue-500",
  battle_result: "border-l-red-500",
  review_response: "border-l-purple-500",
  system_announcement: "border-l-orange-500",
  tool_update: "border-l-cyan-500",
  streak_reminder: "border-l-orange-500",
  welcome: "border-l-primary",
  quest_completed: "border-l-green-500",
  new_tool_discovered: "border-l-emerald-500",
};

function NotificationItem({ 
  notification, 
  onMarkRead, 
  onDelete,
  onClose,
}: { 
  notification: Notification;
  onMarkRead: (id: Id<"notifications">) => void;
  onDelete: (id: Id<"notifications">) => void;
  onClose: () => void;
}) {
  const link = notification.metadata?.link;
  
  const content = (
    <div 
      className={cn(
        "p-3 border-l-4 bg-card hover:bg-secondary/50 transition-colors cursor-pointer",
        notificationColors[notification.type],
        !notification.isRead && "bg-primary/5"
      )}
      onClick={() => {
        if (!notification.isRead) {
          onMarkRead(notification._id);
        }
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {notificationIcons[notification.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={cn(
              "text-sm truncate",
              notification.isRead ? "text-muted-foreground" : "text-foreground font-medium"
            )}>
              {notification.title}
            </p>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!notification.isRead && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkRead(notification._id);
                  }}
                  className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification._id);
                }}
                className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-destructive transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {formatTimeAgo(notification.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );

  if (link) {
    return (
      <Link href={link} onClick={onClose}>
        {content}
      </Link>
    );
  }

  return content;
}

export function NotificationBell() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    isSupported: desktopSupported,
    permission: desktopPermission,
    isEnabled: desktopEnabled,
    enableDesktopNotifications,
    disableDesktopNotifications,
  } = useDesktopNotifications();

  const notifications = useQuery(
    api.notifications.list,
    user?.id ? { userId: user.id, limit: 20 } : "skip"
  ) as Notification[] | undefined;

  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    user?.id ? { userId: user.id } : "skip"
  ) as number | undefined;

  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);
  const clearAll = useMutation(api.notifications.clearAll);

  const handleToggleDesktop = async () => {
    if (desktopEnabled) {
      await disableDesktopNotifications();
    } else {
      await enableDesktopNotifications();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id: Id<"notifications">) => {
    await markAsRead({ notificationId: id });
  };

  const handleDelete = async (id: Id<"notifications">) => {
    await deleteNotification({ notificationId: id });
  };

  const handleMarkAllRead = async () => {
    if (user?.id) {
      await markAllAsRead({ userId: user.id });
    }
  };

  const handleClearAll = async () => {
    if (user?.id) {
      await clearAll({ userId: user.id });
      setIsOpen(false);
    }
  };

  if (!user) {
    return (
      <button 
        className="flex items-center justify-center rounded-lg size-10 bg-card hover:bg-secondary text-muted-foreground transition-colors border border-border"
        disabled
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className="flex items-center justify-center rounded-lg size-10 bg-card hover:bg-secondary text-foreground transition-colors border border-border relative"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open notifications"
      >
        <Bell className="w-5 h-5" />
        {(unreadCount ?? 0) > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center px-1">
            {unreadCount && unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
          <div className="flex items-center justify-between p-3 border-b border-border bg-secondary/30">
            <h3 className="font-heading text-sm text-foreground">Notifications</h3>
            <div className="flex items-center gap-2">
              {(unreadCount ?? 0) > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3 h-3" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {!notifications || notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Start exploring to earn achievements!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                    onClose={() => setIsOpen(false)}
                  />
                ))}
              </div>
            )}
          </div>

          {desktopSupported && (
            <div className="p-2 border-t border-border bg-secondary/30">
              <button
                onClick={handleToggleDesktop}
                disabled={desktopPermission === "denied"}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs transition-colors",
                  desktopEnabled
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                  desktopPermission === "denied" && "opacity-50 cursor-not-allowed"
                )}
              >
                <BellRing className="w-3.5 h-3.5" />
                <span className="flex-1 text-left">
                  {desktopPermission === "denied"
                    ? "Desktop notifications blocked"
                    : desktopEnabled
                      ? "Desktop notifications enabled"
                      : "Enable desktop notifications"}
                </span>
                {desktopEnabled && (
                  <span className="text-[10px] bg-primary/20 px-1.5 py-0.5 rounded">ON</span>
                )}
              </button>
            </div>
          )}

          {notifications && notifications.length > 0 && (
            <div className="p-2 border-t border-border bg-secondary/30 flex justify-between items-center">
              <Link 
                href="/notifications" 
                onClick={() => setIsOpen(false)}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                View all notifications
              </Link>
              <button
                onClick={handleClearAll}
                className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function NotificationsList() {
  const { user } = useUser();
  
  const notifications = useQuery(
    api.notifications.list,
    user?.id ? { userId: user.id, limit: 50 } : "skip"
  ) as Notification[] | undefined;

  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);
  const clearAll = useMutation(api.notifications.clearAll);

  const handleMarkRead = async (id: Id<"notifications">) => {
    await markAsRead({ notificationId: id });
  };

  const handleDelete = async (id: Id<"notifications">) => {
    await deleteNotification({ notificationId: id });
  };

  const handleMarkAllRead = async () => {
    if (user?.id) {
      await markAllAsRead({ userId: user.id });
    }
  };

  const handleClearAll = async () => {
    if (user?.id) {
      await clearAll({ userId: user.id });
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">Sign in to view notifications</p>
      </div>
    );
  }

  const unreadNotifications = notifications?.filter(n => !n.isRead) ?? [];
  const readNotifications = notifications?.filter(n => n.isRead) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl text-foreground">All Notifications</h2>
        <div className="flex items-center gap-2">
          {unreadNotifications.length > 0 && (
            <PixelButton size="sm" variant="secondary" onClick={handleMarkAllRead}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all read
            </PixelButton>
          )}
          {notifications && notifications.length > 0 && (
            <PixelButton size="sm" variant="outline" onClick={handleClearAll}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear all
            </PixelButton>
          )}
        </div>
      </div>

      {!notifications || notifications.length === 0 ? (
        <div className="text-center py-12 border border-border rounded-lg bg-card">
          <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No notifications yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Start exploring to earn achievements and receive updates!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {unreadNotifications.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full" />
                Unread ({unreadNotifications.length})
              </h3>
              <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
                {unreadNotifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                    onClose={() => {}}
                  />
                ))}
              </div>
            </div>
          )}

          {readNotifications.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Earlier
              </h3>
              <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
                {readNotifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                    onClose={() => {}}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
