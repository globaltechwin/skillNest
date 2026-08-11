"use client";

import { useState, useEffect, useTransition } from "react";
import { UserCheck, Clock, XCircle, CheckCircle, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getEnrollmentRequests,
  getEnrolledStudents,
  acceptEnrollment,
  rejectEnrollment,
  type EnrollmentRequestItem,
  type EnrolledStudentItem,
} from "./actions";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function StudentsClient() {
  const [requests, setRequests] = useState<EnrollmentRequestItem[]>([]);
  const [students, setStudents] = useState<EnrolledStudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    Promise.all([getEnrollmentRequests(), getEnrolledStudents()]).then(
      ([r, s]) => {
        setRequests(r);
        setStudents(s);
        setLoading(false);
      }
    );
  }, []);

  const handleAccept = (enrollmentId: string) => {
    startTransition(async () => {
      const result = await acceptEnrollment(enrollmentId);
      if (result.success) {
        setRequests((prev) => prev.filter((r) => r.id !== enrollmentId));
        const accepted = requests.find((r) => r.id === enrollmentId);
        if (accepted) {
          setStudents((prev) => [
            {
              enrollmentId: accepted.id,
              enrolledAt: new Date(),
              student: accepted.student,
              course: accepted.course,
            },
            ...prev,
          ]);
        }
      }
    });
  };

  const handleReject = (enrollmentId: string) => {
    startTransition(async () => {
      const result = await rejectEnrollment(enrollmentId, rejectReason || undefined);
      if (result.success) {
        setRequests((prev) => prev.filter((r) => r.id !== enrollmentId));
        setRejectingId(null);
        setRejectReason("");
      }
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="space-y-3">
              <div className="h-5 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/4" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enrollment Requests */}
      <div>
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="size-4 text-amber-500" />
          Enrollment Requests ({requests.length})
        </h3>

        {requests.length === 0 ? (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground text-center">
              No pending enrollment requests.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <Card key={request.id} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-foreground">
                        {request.student.firstName} {request.student.lastName}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {request.student.email}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Course: <span className="font-medium text-foreground">{request.course.title}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Requested: {formatDate(request.requestedAt)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {rejectingId === request.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Reason (optional)"
                          className="px-3 py-1.5 text-sm border border-border rounded-md bg-background w-48"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(request.id)}
                          disabled={isPending}
                        >
                          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : "Reject"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setRejectingId(null);
                            setRejectReason("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          variant="default"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleAccept(request.id)}
                          disabled={isPending}
                        >
                          <CheckCircle className="size-3.5" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => setRejectingId(request.id)}
                        >
                          <XCircle className="size-3.5" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Enrolled Students */}
      <div>
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <UserCheck className="size-4 text-emerald-500" />
          Enrolled Students ({students.length})
        </h3>

        {students.length === 0 ? (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground text-center">
              No enrolled students yet.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {students.map((student) => (
              <Card key={student.enrollmentId} className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground">
                      {student.student.firstName} {student.student.lastName}
                    </h4>
                    <div className="text-sm text-muted-foreground">
                      Course: <span className="font-medium text-foreground">{student.course.title}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Enrolled: {formatDate(student.enrolledAt)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
