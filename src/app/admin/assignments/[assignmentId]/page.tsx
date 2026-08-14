import { getAssignmentDetail } from "../../actions";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  GraduationCap,
  User,
  Calendar,
  BarChart3,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

export default async function AdminAssignmentDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const detail = await getAssignmentDetail(assignmentId);
  if (!detail) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/assignments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="size-4 mr-1" /> Back
          </Button>
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {detail.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Assignment Details
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="size-5 text-muted-foreground" />
              <h3 className="text-base font-semibold text-foreground">
                Assignment Info
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Tutor</span>
                <p className="font-medium text-foreground mt-0.5">
                  {detail.teacherName}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Status</span>
                <p className="mt-0.5">
                  <StatusBadge status={detail.status} />
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Course</span>
                <p className="font-medium text-foreground mt-0.5">
                  {detail.courseTitle}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Tutor</span>
                <p className="font-medium text-foreground mt-0.5">
                  {detail.teacherName}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Due Date</span>
                <p className="font-medium text-foreground mt-0.5">
                  {detail.dueDate
                    ? new Date(detail.dueDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "No due date"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Max Marks</span>
                <p className="font-medium text-foreground mt-0.5">
                  {detail.maxMarks ?? "Not set"}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Created</span>
                <p className="font-medium text-foreground mt-0.5">
                  {new Date(detail.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            {detail.description && (
              <div className="mt-5">
                <span className="text-muted-foreground text-sm">Description</span>
                <div className="mt-1.5 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground whitespace-pre-wrap">
                  {detail.description}
                </div>
              </div>
            )}
          </Card>

          <Card className="overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="size-5 text-muted-foreground" />
                Submissions
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Student
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Marks
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Submitted
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {detail.submissions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                            <FileText className="size-5 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            No submissions yet
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    detail.submissions.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {s.studentName}
                        </td>
                        <td className="px-4 py-3">
                          <SubmissionStatusBadge status={s.status} />
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {s.marks ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {s.submittedAt
                            ? new Date(s.submittedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="size-5 text-muted-foreground" />
              Submission Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  <span className="text-sm font-medium text-foreground">
                    Graded
                  </span>
                </div>
                <span className="text-lg font-bold text-emerald-700">
                  {detail.submissionStats.graded}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-amber-600" />
                  <span className="text-sm font-medium text-foreground">
                    Submitted
                  </span>
                </div>
                <span className="text-lg font-bold text-amber-700">
                  {detail.submissionStats.total}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
                <div className="flex items-center gap-2">
                  <XCircle className="size-4 text-red-600" />
                  <span className="text-sm font-medium text-foreground">
                    Not Submitted
                  </span>
                </div>
                <span className="text-lg font-bold text-red-700">
                  {detail.submissionStats.notSubmitted}
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <GraduationCap className="size-5 text-muted-foreground" />
              Course Info
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Course</span>
                <p className="font-medium text-foreground mt-0.5">
                  {detail.courseTitle}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Tutor</span>
                <p className="font-medium text-foreground mt-0.5">
                  {detail.teacherName}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "PUBLISHED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        Published
      </span>
    );
  }
  if (status === "DRAFT") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        Draft
      </span>
    );
  }
  if (status === "ARCHIVED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
        Archived
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
      {status}
    </span>
  );
}

function SubmissionStatusBadge({ status }: { status: string }) {
  if (status === "GRADED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="size-3" /> Graded
      </span>
    );
  }
  if (status === "SUBMITTED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        <Clock className="size-3" /> Submitted
      </span>
    );
  }
  if (status === "NOT_SUBMITTED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        <XCircle className="size-3" /> Not Submitted
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
      {status}
    </span>
  );
}

