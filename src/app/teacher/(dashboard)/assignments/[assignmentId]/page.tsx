import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, BookOpen, Users, Edit, Archive, Send } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/custom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  publishAssignment,
  archiveAssignment,
} from "../actions";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  ARCHIVED: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

function formatDate(date: Date | null): string {
  if (!date) return "No due date";
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) notFound();

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "TEACHER") notFound();

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true },
  });
  if (!profile || profile.status !== "APPROVED") notFound();

  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      course: { teacherProfileId: profile.id },
    },
    include: {
      course: {
        select: { id: true, title: true, subject: { select: { name: true } } },
      },
    },
  });

  if (!assignment) notFound();

  const submissionCount = await prisma.assignmentSubmission.count({
    where: { assignmentId: assignment.id },
  });

  const isOverdue =
    assignment.dueDate && new Date(assignment.dueDate) < new Date();

  return (
    <div className="space-y-6">
      <Link
        href="/teacher/assignments"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Assignments
      </Link>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-foreground">
                {assignment.title}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[assignment.status]}`}
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
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {assignment.status === "DRAFT" && (
              <>
                <Link href={`/teacher/assignments/${assignment.id}/edit`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Edit className="size-3.5" />
                    Edit
                  </Button>
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await publishAssignment(assignment.id);
                  }}
                >
                  <Button type="submit" size="sm" className="gap-1.5">
                    <Send className="size-3.5" />
                    Publish
                  </Button>
                </form>
              </>
            )}

            {assignment.status === "PUBLISHED" && (
              <>
                <Link href={`/teacher/assignments/${assignment.id}/submissions`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Users className="size-3.5" />
                    Submissions ({submissionCount})
                  </Button>
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await archiveAssignment(assignment.id);
                  }}
                >
                  <Button type="submit" variant="outline" size="sm" className="gap-1.5">
                    <Archive className="size-3.5" />
                    Archive
                  </Button>
                </form>
              </>
            )}

            {assignment.status === "ARCHIVED" && (
              <Link href={`/teacher/assignments/${assignment.id}/edit`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Edit className="size-3.5" />
                  Edit
                </Button>
              </Link>
            )}
          </div>
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
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-semibold text-foreground mb-4">Details</h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className={`font-medium ${isOverdue ? "text-destructive" : "text-foreground"}`}>
                    {formatDate(assignment.dueDate)}
                    {isOverdue && " (Overdue)"}
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

              <div className="flex items-center gap-3">
                <Users className="size-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground">Submissions</p>
                  <p className="font-medium text-foreground">
                    {submissionCount}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Created: {formatDateTime(assignment.createdAt)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Updated: {formatDateTime(assignment.updatedAt)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
