"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Calendar, BookOpen, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { getTeacherAssignments, type AssignmentListItem } from "./actions";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  ARCHIVED: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
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
  const [assignments, setAssignments] = useState<AssignmentListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeacherAssignments().then((data) => {
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
        description="Create an assignment for one of your courses."
      />
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <Card key={assignment.id} className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">
                  {assignment.title}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[assignment.status]}`}
                >
                  {assignment.status}
                </span>
              </div>

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
                  <Calendar className="size-3.5" />
                  {formatDate(assignment.dueDate)}
                </span>
                {assignment.maxMarks && (
                  <span>Max marks: {assignment.maxMarks}</span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="size-3.5" />
                  {assignment._count.submissions} submission{assignment._count.submissions !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/teacher/assignments/${assignment.id}`}>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </Link>
              {assignment.status === "PUBLISHED" && (
                <Link href={`/teacher/assignments/${assignment.id}/submissions`}>
                  <Button variant="outline" size="sm">
                    Submissions
                  </Button>
                </Link>
              )}
              <Link href={`/teacher/assignments/${assignment.id}/edit`}>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
