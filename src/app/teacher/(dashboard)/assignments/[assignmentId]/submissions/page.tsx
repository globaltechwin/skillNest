import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { getAssignmentSubmissions } from "../../actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/EmptyState";

const STATUS_STYLES: Record<string, string> = {
  NOT_SUBMITTED: "bg-muted text-muted-foreground",
  SUBMITTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  GRADED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function SubmissionsPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;

  const data = await getAssignmentSubmissions(assignmentId);
  if (!data) notFound();

  const { assignment, submissions } = data;

  return (
    <div className="space-y-6">
      <Link
        href={`/teacher/assignments/${assignmentId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Assignment
      </Link>

      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Submissions
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {assignment.title} — {assignment.course.title}
        </p>
      </div>

      {submissions.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No submissions yet"
          description="Student submissions will appear here once students submit their work."
        />
      ) : (
        <div className="space-y-3">
          {submissions.map((submission) => (
            <Card key={submission.id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-foreground">
                      {submission.studentUser.firstName}{" "}
                      {submission.studentUser.lastName}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[submission.status]}`}
                    >
                      {submission.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {submission.submittedAt
                      ? `Submitted: ${formatDate(submission.submittedAt)}`
                      : "Not yet submitted"}
                  </div>

                  {submission.status === "GRADED" && submission.marks !== null && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium text-foreground">
                        Marks: {submission.marks}
                        {assignment.maxMarks ? ` / ${assignment.maxMarks}` : ""}
                      </span>
                      {submission.feedback && (
                        <p className="text-muted-foreground mt-1 line-clamp-2">
                          Feedback: {submission.feedback}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <Link
                  href={`/teacher/assignments/${assignmentId}/submissions/${submission.id}`}
                >
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
