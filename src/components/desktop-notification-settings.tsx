"use client";

import { Bell, BellOff, BellRing } from "lucide-react";
import { useDesktopNotifications } from "@/hooks/use-desktop-notifications";
import { PixelButton } from "@/components/pixel-button";
import { cn } from "@/lib/utils";

interface DesktopNotificationSettingsProps {
  variant?: "inline" | "card";
  className?: string;
}

export function DesktopNotificationSettings({
  variant = "inline",
  className,
}: DesktopNotificationSettingsProps) {
  const {
    isSupported,
    permission,
    isEnabled,
    enableDesktopNotifications,
    disableDesktopNotifications,
  } = useDesktopNotifications();

  if (!isSupported) {
    return null;
  }

  const handleToggle = async () => {
    if (isEnabled) {
      await disableDesktopNotifications();
    } else {
      await enableDesktopNotifications();
    }
  };

  if (variant === "card") {
    return (
      <div
        className={cn(
          "p-4 border border-border rounded-lg bg-card",
          className
        )}
      >
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-primary/10">
            {isEnabled ? (
              <BellRing className="w-5 h-5 text-primary" />
            ) : (
              <BellOff className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-sm text-foreground">
              Desktop Notifications
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Get notified when new tools are discovered
            </p>
            {permission === "denied" && (
              <p className="text-xs text-destructive mt-2">
                Notifications are blocked. Please enable them in your browser settings.
              </p>
            )}
          </div>
          <PixelButton
            size="sm"
            variant={isEnabled ? "secondary" : "default"}
            onClick={handleToggle}
            disabled={permission === "denied"}
          >
            {isEnabled ? "Disable" : "Enable"}
          </PixelButton>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        onClick={handleToggle}
        disabled={permission === "denied"}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors",
          isEnabled
            ? "border-primary bg-primary/10 text-primary"
            : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/50",
          permission === "denied" && "opacity-50 cursor-not-allowed"
        )}
        title={
          permission === "denied"
            ? "Notifications blocked in browser"
            : isEnabled
              ? "Desktop notifications enabled"
              : "Enable desktop notifications"
        }
      >
        {isEnabled ? (
          <BellRing className="w-4 h-4" />
        ) : (
          <Bell className="w-4 h-4" />
        )}
        <span className="text-xs font-medium">
          {isEnabled ? "Notifications On" : "Notifications Off"}
        </span>
      </button>
    </div>
  );
}

export function DesktopNotificationBanner() {
  const {
    isSupported,
    permission,
    isEnabled,
    enableDesktopNotifications,
  } = useDesktopNotifications();

  if (!isSupported || isEnabled || permission === "denied") {
    return null;
  }

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center gap-3">
      <BellRing className="w-5 h-5 text-primary flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          Want to know when new tools are added?
        </p>
        <p className="text-xs text-muted-foreground">
          Enable desktop notifications to stay updated
        </p>
      </div>
      <PixelButton size="sm" onClick={enableDesktopNotifications}>
        Enable
      </PixelButton>
    </div>
  );
}
