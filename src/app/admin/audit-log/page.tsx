import { Card } from "@/components/ui/card";
import { getAuditLog } from "../actions";
import { AuditLogClient } from "./AuditLogClient";
import { ShieldCheck } from "lucide-react";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const action = typeof sp.action === "string" ? sp.action : undefined;
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);

  const result = await getAuditLog(action, page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track all admin actions on the platform
        </p>
      </div>

      <AuditLogClient action={action} />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Admin</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Target</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Details</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {result.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                        <ShieldCheck className="size-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">No audit log entries</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {action && action !== "ALL"
                            ? "No entries match this filter."
                            : "Admin actions will appear here as they are performed."}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                result.data.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">{log.adminName}</td>
                    <td className="px-4 py-3">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {log.targetType} — {log.targetId.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{log.reason || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {result.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(result.page - 1) * result.pageSize + 1}–
              {Math.min(result.page * result.pageSize, result.total)} of {result.total} entries
            </p>
            <AuditLogPagination
              page={result.page}
              totalPages={result.totalPages}
              action={action}
            />
          </div>
        )}
      </Card>
    </div>
  );
}

function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, string> = {
    TEACHER_SUSPENDED: "bg-red-100 text-red-700",
    TEACHER_UNSUSPENDED: "bg-emerald-100 text-emerald-700",
    COURSE_ARCHIVED: "bg-amber-100 text-amber-700",
  };

  const label: Record<string, string> = {
    TEACHER_SUSPENDED: "Suspended",
    TEACHER_UNSUSPENDED: "Unsuspended",
    COURSE_ARCHIVED: "Archived",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[action] || "bg-gray-100 text-gray-700"}`}
    >
      {label[action] || action}
    </span>
  );
}

function AuditLogPagination({
  page,
  totalPages,
  action,
}: {
  page: number;
  totalPages: number;
  action?: string;
}) {
  const makeHref = (p: number) => {
    const params = new URLSearchParams();
    if (action && action !== "ALL") params.set("action", action);
    if (p > 1) params.set("page", String(p));
    return `/admin/audit-log?${params.toString()}`;
  };

  return (
    <div className="flex items-center gap-2">
      <a
        href={makeHref(page - 1)}
        className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-sm rounded-lg border border-border transition-colors ${
          page <= 1
            ? "pointer-events-none opacity-50"
            : "hover:bg-muted text-foreground"
        }`}
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Previous
      </a>
      <span className="text-sm text-muted-foreground px-2">
        Page {page} of {totalPages}
      </span>
      <a
        href={makeHref(page + 1)}
        className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-sm rounded-lg border border-border transition-colors ${
          page >= totalPages
            ? "pointer-events-none opacity-50"
            : "hover:bg-muted text-foreground"
        }`}
      >
        Next
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </a>
    </div>
  );
}
