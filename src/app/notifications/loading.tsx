import { Bell } from "lucide-react";
import { NotificationListSkeleton } from "@/components/skeletons";

export default function NotificationsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-primary" />
            <h1 className="font-heading text-foreground text-2xl">NOTIFICATIONS</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Stay updated with your latest activity and interactions.
          </p>
        </div>

        <NotificationListSkeleton count={10} />
      </main>
    </div>
  );
}
