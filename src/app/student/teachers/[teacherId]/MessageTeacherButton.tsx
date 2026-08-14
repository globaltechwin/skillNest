"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { startConversation } from "@/app/student/messages/actions";

type Props = {
  teacherProfileId: string;
};

export function MessageTeacherButton({ teacherProfileId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await startConversation(teacherProfileId);
      if (result.success && result.conversationId) {
        router.push(`/student/messages/${result.conversationId}`);
      } else {
        setError(result.error || "Failed to start conversation.");
      }
    } catch {
      setError("Failed to start conversation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-stretch sm:items-end gap-2">
      <Button
        onClick={handleClick}
        disabled={loading}
        variant="outline"
        className="gap-2"
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <MessageSquare className="size-4" />
        )}
        Message Tutor
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
