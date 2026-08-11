"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Calendar, BookOpen, User, CheckCircle2, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { getStudentAssignments, type StudentAssignmentListItem } from "./actions";

const SUBMISSION_STATUS_STYLES: Record<string, string> = {
  NOT_SUBMITTED: "bg-muted text-muted-foreground",
  SUBMITTED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  GRADED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

function formatDate(date: Date | null): string {
  if (!date) return "No due date";
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function AssignmentListClient() {
  const [assignments, setAssignments] = useState<StudentAssignmentListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentAssignments().then((data) => {
      setAssignments(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="space-y-3">
              <div className="h-5 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No assignments yet"
        description="Your published course assignments will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => {
        const isOverdue =
          assignment.dueDate && new Date(assignment.dueDate) < new Date();
        const hasSubmitted = assignment.submission !== null;
        const isGraded = assignment.submission?.status === "GRADED";

        return (
          <Card key={assignment.id} className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {assignment.title}
                </h3>

                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
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
                    <span>Max: {assignment.maxMarks}</span>
                  )}
                </div>

                {hasSubmitted && (
                  <div className="flex items-center gap-2 mt-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${SUBMISSION_STATUS_STYLES[assignment.submission!.status]}`}
                    >
                      {isGraded ? "Graded" : "Submitted"}
                    </span>
                    {isGraded && assignment.submission!.marks !== null && (
                      <span className="text-sm font-medium text-foreground">
                        {assignment.submission!.marks}
                        {assignment.maxMarks ? ` / ${assignment.maxMarks}` : ""}
                      </span>
                    )}
                    {isGraded && assignment.submission!.feedback && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="size-3" />
                        Feedback
                      </span>
                    )}
                  </div>
                )}
              </div>

              <Link href={`/student/assignments/${assignment.id}`}>
                <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                  <Clock className="size-3.5" />
                  {hasSubmitted ? "View" : "View Assignment"}
                </Button>
              </Link>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
