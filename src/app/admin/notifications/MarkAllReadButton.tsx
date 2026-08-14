"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck, Loader2 } from "lucide-react";
import { markAllAdminNotificationsAsRead } from "./actions";

export function MarkAllReadButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleMarkAllRead = async () => {
    setLoading(true);
    await markAllAdminNotificationsAsRead();
    router.refresh();
    setLoading(false);
  };

  return (
    <button
      onClick={handleMarkAllRead}
      disabled={loading}
      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <CheckCheck className="size-4" />
      )}
      Mark all as read
    </button>
  );
}
