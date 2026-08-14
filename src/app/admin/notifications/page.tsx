import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/custom";
import { MarkAllReadButton } from "./MarkAllReadButton";

const typeEmojis: Record<string, string> = {
  NEW_MESSAGE: "💬",
  NEW_ENROLLMENT_REQUEST: "📝",
  ENROLLMENT_ACCEPTED: "✅",
  ENROLLMENT_REJECTED: "❌",
  NEW_ASSIGNMENT: "📋",
  ASSIGNMENT_GRADED: "📊",
  CLASS_SCHEDULED: "📅",
  CLASS_UPDATED: "🔄",
  CLASS_CANCELLED: "🚫",
  PAYMENT_SUCCESS: "💰",
  PAYMENT_FAILED: "⚠️",
};

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default async function AdminNotificationsPage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "ADMIN") return null;

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stay updated on platform activities
          </p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-xl border transition-colors ${
                notification.readAt
                  ? "border-border/60 bg-background"
                  : "border-blue-200 bg-blue-50/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg shrink-0">
                  {typeEmojis[notification.type] || "📌"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">
                    {notification.title}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(notification.createdAt)}
                  </p>
                </div>
                {!notification.readAt && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
