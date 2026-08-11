"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Filter } from "lucide-react";
import { Card } from "@/components/ui/card";

type Props = {
  action?: string;
};

const ACTION_OPTIONS = [
  { value: "ALL", label: "All Actions" },
  { value: "TEACHER_SUSPENDED", label: "Teacher Suspended" },
  { value: "TEACHER_UNSUSPENDED", label: "Teacher Unsuspended" },
  { value: "COURSE_ARCHIVED", label: "Course Archived" },
];

export function AuditLogClient({ action }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentAction = action || "ALL";

  const handleFilterChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams();
      if (value && value !== "ALL") params.set("action", value);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="size-4" />
          <span>Filter</span>
        </div>
        <div className="w-56">
          <select
            value={currentAction}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
}
