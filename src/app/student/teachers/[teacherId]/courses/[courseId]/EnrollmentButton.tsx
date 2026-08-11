"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getEnrollmentStatus,
  requestEnrollment,
  cancelEnrollmentRequest,
  type EnrollmentStatusResult,
} from "@/app/student/enrollments/actions";

type Props = {
  courseId: string;
};

export function EnrollmentButton({ courseId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<EnrollmentStatusResult>({ status: "NONE" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEnrollmentStatus(courseId).then((s) => {
      setStatus(s);
      setLoading(false);
    });
  }, [courseId]);

  const handleRequest = () => {
    setError(null);
    startTransition(async () => {
      const result = await requestEnrollment(courseId);
      if (result.success) {
        setStatus({ status: "PENDING", enrollmentId: "" });
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  const handleCancel = () => {
    setError(null);
    startTransition(async () => {
      const result = await cancelEnrollmentRequest(courseId);
      if (result.success) {
        setStatus({ status: "NONE" });
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  };

  if (loading) {
    return (
      <Button disabled className="w-full gap-2">
        <Loader2 className="size-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {status.status === "NONE" && (
        <Button onClick={handleRequest} disabled={isPending} className="w-full gap-2">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Request to Join
        </Button>
      )}

      {status.status === "PENDING" && (
        <div className="space-y-2">
          <Button disabled className="w-full gap-2" variant="outline">
            <Clock className="size-4" />
            Request Pending
          </Button>
          <Button
            onClick={handleCancel}
            disabled={isPending}
            variant="ghost"
            className="w-full"
            size="sm"
          >
            Cancel Request
          </Button>
        </div>
      )}

      {status.status === "ACCEPTED" && (
        <Button disabled className="w-full gap-2" variant="default">
          <CheckCircle2 className="size-4" />
          Enrolled
        </Button>
      )}

      {status.status === "REJECTED" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-destructive">
            <XCircle className="size-4" />
            Request Rejected
          </div>
          {status.rejectionReason && (
            <p className="text-xs text-muted-foreground">
              Reason: {status.rejectionReason}
            </p>
          )}
          <Button onClick={handleRequest} disabled={isPending} className="w-full gap-2">
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Request Again
          </Button>
        </div>
      )}

      {status.status === "CANCELLED" && (
        <Button onClick={handleRequest} disabled={isPending} className="w-full gap-2">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Request to Join
        </Button>
      )}
    </div>
  );
}
