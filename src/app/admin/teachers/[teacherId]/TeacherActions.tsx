"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, XCircle, Ban, RotateCcw } from "lucide-react";
import { updateTeacherStatus, suspendTeacher, unsuspendTeacher } from "../../actions";

type Props = {
  teacherId: string;
  status: string;
};

export function TeacherActions({ teacherId, status }: Props) {
  const [isPending, startTransition] = useTransition();
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");

  const handleApprove = () => {
    startTransition(async () => {
      await updateTeacherStatus(teacherId, "APPROVED");
      window.location.reload();
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      await updateTeacherStatus(teacherId, "REJECTED");
      window.location.reload();
    });
  };

  const handleSuspend = () => {
    if (!suspendReason.trim()) return;
    startTransition(async () => {
      await suspendTeacher(teacherId, suspendReason);
      window.location.reload();
    });
  };

  const handleUnsuspend = () => {
    startTransition(async () => {
      await unsuspendTeacher(teacherId);
      window.location.reload();
    });
  };

  return (
    <div className="flex flex-wrap gap-3">
      {status === "PENDING_VERIFICATION" && (
        <>
          <button
            onClick={handleApprove}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            <CheckCircle2 className="size-4" />
            {isPending ? "Processing..." : "Approve"}
          </button>
          <button
            onClick={handleReject}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <XCircle className="size-4" />
            {isPending ? "Processing..." : "Reject"}
          </button>
        </>
      )}

      {status === "APPROVED" && (
        <button
          onClick={() => setShowSuspendModal(true)}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          <Ban className="size-4" />
          Suspend
        </button>
      )}

      {status === "SUSPENDED" && (
        <button
          onClick={handleUnsuspend}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          <RotateCcw className="size-4" />
          {isPending ? "Processing..." : "Unsuspend"}
        </button>
      )}

      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => !isPending && setShowSuspendModal(false)}
          />
          <div className="relative bg-card rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4 ring-1 ring-border">
            <h3 className="text-lg font-semibold text-foreground">Suspend Teacher</h3>
            <p className="text-sm text-muted-foreground">
              Provide a reason for suspending this teacher. This will be logged in the audit trail.
            </p>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm min-h-[100px] placeholder:text-muted-foreground"
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="Enter suspension reason..."
              disabled={isPending}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSuspendModal(false)}
                disabled={isPending}
                className="px-4 py-2 rounded-lg text-sm font-medium border border-border bg-background hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                disabled={isPending || !suspendReason.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <Ban className="size-4" />
                {isPending ? "Suspending..." : "Suspend Teacher"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
