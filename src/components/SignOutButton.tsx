"use client";

import { LogOut } from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  variant?: "default" | "ghost" | "outline";
};

export function SignOutButton({ className, variant = "ghost" }: Props) {
  const { signOut } = useClerk();
  const router = useRouter();

  return (
    <button
      onClick={() => signOut(() => router.push("/login"))}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
        variant === "default" &&
          "bg-destructive text-white hover:bg-destructive/90",
        variant === "ghost" &&
          "text-muted-foreground hover:bg-muted hover:text-foreground",
        variant === "outline" &&
          "border border-border text-foreground hover:bg-muted",
        className
      )}
    >
      <LogOut className="size-4" />
      Sign Out
    </button>
  );
}
