"use client";

import { NotificationsList } from "@/components/notifications";
import { ChevronRight } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
        <h1 className="font-heading text-foreground text-2xl md:text-3xl mb-8 flex items-center gap-3">
          <ChevronRight className="w-6 h-6 text-primary" />
          Notifications
        </h1>
        <NotificationsList />
      </div>
    </div>
  );
}
