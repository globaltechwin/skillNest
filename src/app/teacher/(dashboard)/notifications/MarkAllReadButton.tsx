"use client";

import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { markAllNotificationsAsRead } from "./actions";

export function MarkAllReadButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await markAllNotificationsAsRead();
    window.location.reload();
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <CheckCheck className="size-4" />
      {loading ? "Marking..." : "Mark all read"}
    </button>
  );
}
