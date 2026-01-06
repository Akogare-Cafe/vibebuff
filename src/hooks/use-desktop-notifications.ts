"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

interface DesktopNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  onClick?: () => void;
}

export function useDesktopNotifications() {
  const { user } = useUser();
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);
  const lastNotificationTime = useRef<number>(0);
  const seenNotificationIds = useRef<Set<string>>(new Set());

  const desktopEnabled = useQuery(
    api.notifications.getUserDesktopNotificationPreference,
    user?.id ? { userId: user.id } : "skip"
  );

  const updatePreference = useMutation(api.notifications.updateDesktopNotificationPreference);

  const notifications = useQuery(
    api.notifications.list,
    user?.id ? { userId: user.id, limit: 10, unreadOnly: true } : "skip"
  );

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === "granted" && user?.id) {
        await updatePreference({ userId: user.id, enabled: true });
      }
      
      return result === "granted";
    } catch {
      return false;
    }
  }, [isSupported, user?.id, updatePreference]);

  const showNotification = useCallback(
    (options: DesktopNotificationOptions) => {
      if (!isSupported || permission !== "granted" || !desktopEnabled) {
        return null;
      }

      const now = Date.now();
      if (now - lastNotificationTime.current < 1000) {
        return null;
      }
      lastNotificationTime.current = now;

      try {
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || "/icon-192.png",
          tag: options.tag,
          requireInteraction: false,
        });

        if (options.onClick) {
          notification.onclick = () => {
            window.focus();
            options.onClick?.();
            notification.close();
          };
        }

        setTimeout(() => notification.close(), 5000);

        return notification;
      } catch {
        return null;
      }
    },
    [isSupported, permission, desktopEnabled]
  );

  const enableDesktopNotifications = useCallback(async () => {
    if (!user?.id) return false;

    const granted = await requestPermission();
    if (granted) {
      await updatePreference({ userId: user.id, enabled: true });
    }
    return granted;
  }, [user?.id, requestPermission, updatePreference]);

  const disableDesktopNotifications = useCallback(async () => {
    if (!user?.id) return;
    await updatePreference({ userId: user.id, enabled: false });
  }, [user?.id, updatePreference]);

  useEffect(() => {
    if (!notifications || !desktopEnabled || permission !== "granted") return;

    for (const notification of notifications) {
      if (
        notification.type === "new_tool_discovered" &&
        !notification.isRead &&
        !seenNotificationIds.current.has(notification._id)
      ) {
        const notificationAge = Date.now() - notification.createdAt;
        if (notificationAge < 60000) {
          showNotification({
            title: notification.title,
            body: notification.message,
            tag: `new-tool-${notification._id}`,
            onClick: () => {
              if (notification.metadata?.link) {
                window.location.href = notification.metadata.link;
              }
            },
          });
          seenNotificationIds.current.add(notification._id);
        }
      }
    }
  }, [notifications, desktopEnabled, permission, showNotification]);

  return {
    isSupported,
    permission,
    isEnabled: desktopEnabled ?? false,
    requestPermission,
    showNotification,
    enableDesktopNotifications,
    disableDesktopNotifications,
  };
}
