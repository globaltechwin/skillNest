"use client";

// Multi-session switcher - allows switching between logged-in accounts
// Shows in the bottom-left corner with active session indicators

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, BookOpen, Shield, ChevronDown, ChevronUp, ArrowLeftRight } from "lucide-react";

type SessionInfo = {
  active: {
    userId: string;
    email: string;
    role: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  sessions: {
    student: boolean;
    teacher: boolean;
    admin: boolean;
  };
};

const roleConfig: Record<string, { icon: typeof User; label: string; color: string; activeColor: string; path: string }> = {
  student: { icon: User, label: "Student", color: "bg-blue-100 text-blue-700", activeColor: "bg-blue-600 text-white", path: "/student" },
  teacher: { icon: BookOpen, label: "Teacher", color: "bg-emerald-100 text-emerald-700", activeColor: "bg-emerald-600 text-white", path: "/teacher" },
  admin: { icon: Shield, label: "Admin", color: "bg-orange-100 text-orange-700", activeColor: "bg-orange-600 text-white", path: "/admin" },
};

export function SessionSwitcher() {
  const router = useRouter();
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then(setSessionInfo)
      .catch(() => {});
  }, []);

  const handleSwitch = async (role: string) => {
    setSwitching(true);
    try {
      const res = await fetch("/api/auth/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(data.redirect);
        router.refresh();
      }
    } finally {
      setSwitching(false);
    }
  };

  if (!sessionInfo || !sessionInfo.active) return null;

  const activeRole = sessionInfo.active.role.toLowerCase();
  const availableSessions = Object.entries(sessionInfo.sessions).filter(
    ([role, exists]) => exists && role !== activeRole
  );

  if (availableSessions.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[200]">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden w-56">
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="size-3.5 text-gray-500" />
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Switch Account
            </span>
          </div>
          {expanded ? (
            <ChevronDown className="size-3.5 text-gray-400" />
          ) : (
            <ChevronUp className="size-3.5 text-gray-400" />
          )}
        </button>

        {/* Session List */}
        {expanded && (
          <div className="p-2 space-y-1.5">
            {/* Current session */}
            <div className="px-2 py-1.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Current</p>
              <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium ${roleConfig[activeRole]?.activeColor || "bg-gray-600 text-white"}`}>
                {(() => {
                  const Icon = roleConfig[activeRole]?.icon || User;
                  return <Icon className="size-3.5" />;
                })()}
                <span>{roleConfig[activeRole]?.label || activeRole}</span>
                <span className="ml-auto opacity-70 text-[10px]">{sessionInfo.active.email}</span>
              </div>
            </div>

            {/* Available sessions */}
            <div className="px-2 py-1.5 border-t border-gray-100">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Switch to</p>
              {availableSessions.map(([role]) => {
                const config = roleConfig[role];
                if (!config) return null;
                const Icon = config.icon;
                return (
                  <button
                    key={role}
                    onClick={() => handleSwitch(role)}
                    disabled={switching}
                    className={`flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${config.color} hover:opacity-80 disabled:opacity-50`}
                  >
                    <Icon className="size-3.5" />
                    <span>{config.label}</span>
                    {switching && <span className="ml-auto text-[10px]">Switching...</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
