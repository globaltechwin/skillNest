"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  User,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { submitAssignment, type SubmitActionResult } from "../actions";

type AssignmentData = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  maxMarks: number | null;
  status: string;
  course: { title: string; subject: { name: string } };
  teacher: { firstName: string | null; lastName: string | null };
  submission: {
    id: string;
    content: string | null;
    submittedAt: Date | null;
    status: string;
    marks: number | null;
    feedback: string | null;
  } | null;
};

type Props = {
  assignment: AssignmentData;
};

function formatDate(date: Date | null): string {
  if (!date) return "No due date";
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(date: Date | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const SUBMISSION_STATUS_STYLES: Record<string, string> = {
  NOT_SUBMITTED: "bg-muted text-muted-foreground",
  SUBMITTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  GRADED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export function AssignmentDetailClient({ assignment }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [content, setContent] = useState<string>(
    assignment.submission?.content || ""
  );

  const isOverdue =
    assignment.dueDate && new Date(assignment.dueDate) < new Date();
  const hasSubmitted = assignment.submission !== null;
  const isGraded = assignment.submission?.status === "GRADED";
  const isSubmitted = assignment.submission?.status === "SUBMITTED";
  const canSubmit = !isGraded && !isOverdue;

  const handleSubmit = () => {
    setError(null);
    setSuccess(false);

    if (!content.trim()) {
      setError("Please provide your answer.");
      return;
    }

    startTransition(async () => {
      const result: SubmitActionResult = await submitAssignment(
        assignment.id,
        content
      );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <Link
        href="/student/assignments"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Assignments
      </Link>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {assignment.title}
            </h1>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="size-3.5" />
                {assignment.course.title}
              </span>
              <span className="text-border">•</span>
              <span>{assignment.course.subject.name}</span>
            </div>

            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="size-3.5" />
                {assignment.teacher.firstName} {assignment.teacher.lastName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                <span className={isOverdue && !hasSubmitted ? "text-destructive font-medium" : ""}>
                  {formatDate(assignment.dueDate)}
                  {isOverdue && !hasSubmitted && " (Overdue)"}
                </span>
              </span>
              {assignment.maxMarks && (
                <span>Max marks: {assignment.maxMarks}</span>
              )}
            </div>
          </div>

          {hasSubmitted && (
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${SUBMISSION_STATUS_STYLES[assignment.submission!.status]}`}
              >
                {isGraded ? "Graded" : isSubmitted ? "Submitted" : "Not Submitted"}
              </span>
              {isGraded && assignment.submission!.marks !== null && (
                <span className="text-lg font-bold text-foreground">
                  {assignment.submission!.marks}
                  {assignment.maxMarks ? ` / ${assignment.maxMarks}` : ""}
                </span>
              )}
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {assignment.description && (
            <Card className="p-6">
              <h2 className="font-semibold text-foreground mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {assignment.description}
              </p>
            </Card>
          )}

          <Card className="p-6">
            <h2 className="font-semibold text-foreground mb-4">
              {hasSubmitted ? "Your Submission" : "Your Answer"}
            </h2>

            {isGraded ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {assignment.submission!.content || "No content provided."}
                  </p>
                </div>

                {assignment.submission!.feedback && (
                  <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800">
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 mb-1">
                      Feedback from Teacher
                    </p>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {assignment.submission!.feedback}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Your Answer</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    disabled={!canSubmit}
                    placeholder={
                      isOverdue
                        ? "This assignment is overdue and no longer accepts submissions."
                        : "Write your answer here..."
                    }
                    className="min-h-48"
                  />
                  <p className="text-xs text-muted-foreground">
                    {content.length}/10000 characters
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm font-medium text-destructive">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800">
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="size-4" />
                      Assignment submitted successfully!
                    </p>
                  </div>
                )}

                {canSubmit && (
                  <Button
                    onClick={handleSubmit}
                    disabled={isPending || !content.trim()}
                    className="gap-2"
                  >
                    {isPending && <Loader2 className="size-4 animate-spin" />}
                    {isSubmitted ? "Update Submission" : "Submit Assignment"}
                  </Button>
                )}

                {isOverdue && !hasSubmitted && (
                  <p className="text-sm text-destructive">
                    This assignment is overdue and no longer accepts submissions.
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-semibold text-foreground mb-4">Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className={`font-medium ${isOverdue ? "text-destructive" : "text-foreground"}`}>
                    {formatDate(assignment.dueDate)}
                  </p>
                </div>
              </div>

              {assignment.maxMarks && (
                <div className="flex items-center gap-3">
                  <div className="size-4 text-muted-foreground shrink-0 text-center font-bold text-xs">
                    #
                  </div>
                  <div>
                    <p className="text-muted-foreground">Maximum Marks</p>
                    <p className="font-medium text-foreground">{assignment.maxMarks}</p>
                  </div>
                </div>
              )}

              {hasSubmitted && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Submitted: {formatDateTime(assignment.submission!.submittedAt)}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
