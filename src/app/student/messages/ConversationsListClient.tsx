"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/EmptyState";

type Conversation = {
  id: string;
  lastMessageAt: Date | null;
  teacherProfile: {
    id: string;
    user: { firstName: string | null; lastName: string | null };
    profilePhotoUrl: string | null;
  };
  messages: { content: string; createdAt: Date }[];
  unreadCount: number;
};

type Props = {
  conversations: Conversation[];
  role: "student" | "teacher";
  emptyTitle: string;
  emptyDescription: string;
  emptyHref: string;
  emptyButtonText: string;
};

function formatTime(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (msgDay.getTime() === today.getTime()) {
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (msgDay.getTime() === yesterday.getTime()) return "Yesterday";

  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export function ConversationsListClient({
  conversations,
  role,
  emptyTitle,
  emptyDescription,
  emptyHref,
  emptyButtonText,
}: Props) {
  if (conversations.length === 0) {
    return (
      <div>
        <EmptyState
          icon={MessageSquare}
          title={emptyTitle}
          description={emptyDescription}
        />
        <div className="text-center mt-4">
          <Link href={emptyHref}>
            <Button variant="outline">{emptyButtonText}</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => {
        const name =
          `${conv.teacherProfile.user.firstName || ""} ${conv.teacherProfile.user.lastName || ""}`.trim() ||
          "Unknown Tutor";
        const initials =
          (conv.teacherProfile.user.firstName?.[0] || "") +
          (conv.teacherProfile.user.lastName?.[0] || "");
        const lastMessage = conv.messages[0]?.content || "No messages yet";
        const href =
          role === "student"
            ? `/student/messages/${conv.id}`
            : `/teacher/messages/${conv.id}`;

        return (
          <Link key={conv.id} href={href}>
            <Card className="p-4 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0 overflow-hidden">
                  {conv.teacherProfile.profilePhotoUrl ? (
                    <img
                      src={conv.teacherProfile.profilePhotoUrl}
                      alt={name}
                      className="size-full object-cover rounded-full"
                    />
                  ) : (
                    initials || "?"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-foreground truncate">
                      {name}
                    </p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-sm text-muted-foreground truncate">
                      {lastMessage}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="shrink-0 size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
