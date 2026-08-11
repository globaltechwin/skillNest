"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Message = {
  id: string;
  content: string;
  senderUserId: string;
  createdAt: Date;
  readAt: Date | null;
};

type Participant = {
  firstName: string | null;
  lastName: string | null;
  profilePhotoUrl?: string | null;
};

type ConversationViewProps = {
  conversationId: string;
  messages: Message[];
  currentUserId: string;
  participant: Participant;
  participantLabel: string;
  backHref: string;
  role: "student" | "teacher";
  sendMessageAction?: (conversationId: string, content: string) => Promise<{ success: boolean; error?: string }>;
};

function formatMessageTime(date: Date): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (msgDay.getTime() === today.getTime()) {
    return `Today, ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (msgDay.getTime() === yesterday.getTime()) {
    return `Yesterday, ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
  }

  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ConversationView({
  conversationId,
  messages: initialMessages,
  currentUserId,
  participant,
  participantLabel,
  backHref,
  sendMessageAction,
}: ConversationViewProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const participantName =
    `${participant.firstName || ""} ${participant.lastName || ""}`.trim() ||
    "Unknown";
  const initials =
    (participant.firstName?.[0] || "") + (participant.lastName?.[0] || "");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const content = newMessage.trim();
    if (!content || isPending) return;

    setError(null);
    setNewMessage("");

    const tempId = `temp-${Date.now()}`;
    const tempMessage: Message = {
      id: tempId,
      content,
      senderUserId: currentUserId,
      createdAt: new Date(),
      readAt: null,
    };
    setMessages((prev) => [...prev, tempMessage]);

    startTransition(async () => {
      try {
        const action =
          sendMessageAction ||
          ((id: string, c: string) =>
            import("@/app/student/messages/actions").then((m) =>
              m.sendMessage(id, c)
            ));
        const result = await action(conversationId, content);
        if (result.success) {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, id: `sent-${Date.now()}` } : m))
          );
        } else {
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
          setError(result.error || "Failed to send message");
          setNewMessage(content);
        }
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        setError("Failed to send message");
        setNewMessage(content);
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="inline-flex items-center justify-center size-8 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0 overflow-hidden">
              {participant.profilePhotoUrl ? (
                <img
                  src={participant.profilePhotoUrl}
                  alt={participantName}
                  className="size-full object-cover rounded-full"
                />
              ) : (
                initials || "?"
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">
                {participantName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {participantLabel}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          </div>
        )}
        {messages.map((msg) => {
          const isOwn = msg.senderUserId === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isOwn
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {msg.content}
                </p>
                <p
                  className={`text-[10px] mt-1 ${
                    isOwn
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {formatMessageTime(msg.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* Input */}
      <div className="shrink-0 border-t border-border bg-card px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 max-h-32"
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || isPending}
            size="icon"
            className="shrink-0 rounded-xl size-10"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
