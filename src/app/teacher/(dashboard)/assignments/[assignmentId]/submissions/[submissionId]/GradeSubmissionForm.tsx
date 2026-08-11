"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { gradeSubmission, type GradeActionResult } from "../../../actions";

type SubmissionData = {
  id: string;
  content: string | null;
  submittedAt: Date | null;
  status: string;
  marks: number | null;
  feedback: string | null;
  studentUser: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
};

type AssignmentData = {
  id: string;
  title: string;
  maxMarks: number | null;
  course: { title: string; subject: { name: string } };
};

type Props = {
  assignment: AssignmentData;
  submission: SubmissionData;
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

export function GradeSubmissionForm({ assignment, submission }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [marks, setMarks] = useState<string>(
    submission.marks !== null ? String(submission.marks) : ""
  );
  const [feedback, setFeedback] = useState<string>(
    submission.feedback || ""
  );

  const isGraded = submission.status === "GRADED";

  const handleGrade = () => {
    setError(null);
    setSuccess(false);

    const marksNum = marks ? parseInt(marks, 10) : null;

    if (marksNum === null) {
      setError("Please enter marks.");
      return;
    }

    if (marksNum < 0) {
      setError("Marks cannot be negative.");
      return;
    }

    if (assignment.maxMarks !== null && marksNum > assignment.maxMarks) {
      setError(`Marks cannot exceed maximum marks (${assignment.maxMarks}).`);
      return;
    }

    startTransition(async () => {
      const result: GradeActionResult = await gradeSubmission(
        assignment.id,
        submission.id,
        {
          marks: marksNum,
          feedback: feedback || undefined,
        }
      );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/teacher/assignments/${assignment.id}/submissions`);
        router.refresh();
      }, 1500);
    });
  };

  return (
    <div className="space-y-6">
      <Link
        href={`/teacher/assignments/${assignment.id}/submissions`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Submissions
      </Link>

      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Review Submission
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {assignment.title} — {assignment.course.title}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-2">
              {submission.studentUser.firstName} {submission.studentUser.lastName}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {submission.studentUser.email}
            </p>

            <div className="text-sm text-muted-foreground mb-4">
              Submitted: {formatDate(submission.submittedAt)}
            </div>

            {submission.content ? (
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                  {submission.content}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No submission content provided.
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">
              {isGraded ? "Grade" : "Enter Grade"}
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="marks">
                  Marks
                  {assignment.maxMarks && (
                    <span className="text-muted-foreground font-normal">
                      {" "}
                      (max {assignment.maxMarks})
                    </span>
                  )}
                </Label>
                <Input
                  id="marks"
                  type="number"
                  min="0"
                  max={assignment.maxMarks || 10000}
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  disabled={isGraded}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  disabled={isGraded}
                  placeholder="Provide feedback for the student..."
                  className="min-h-32"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm font-medium text-destructive">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800">
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Grade saved successfully!
                  </p>
                </div>
              )}

              {!isGraded && (
                <Button
                  onClick={handleGrade}
                  disabled={isPending}
                  className="w-full gap-2"
                >
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  Save Grade
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
