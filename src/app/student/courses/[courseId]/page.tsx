import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Globe, BookOpen, User, FileText } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

const MODE_LABELS: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "In-person",
  BOTH: "Online & In-person",
};

function formatDate(date: Date | null): string {
  if (!date) return "No due date";
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function StudentCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "STUDENT") redirect("/login");

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      courseId_studentUserId: {
        courseId,
        studentUserId: user.id,
      },
    },
    select: { status: true },
  });

  if (!enrollment || enrollment.status !== "ACCEPTED") notFound();

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      subject: { select: { name: true } },
      teacherProfile: {
        select: {
          user: { select: { firstName: true, lastName: true } },
          location: true,
          teachingMode: true,
        },
      },
      assignments: {
        where: { status: "PUBLISHED" },
        select: {
          id: true,
          title: true,
          dueDate: true,
          maxMarks: true,
          status: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!course) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/student/courses"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to My Courses
      </Link>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              {course.title}
            </h1>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="size-3.5" />
                {course.subject.name}
              </span>
              <span className="text-border">•</span>
              <span className="flex items-center gap-1">
                <User className="size-3.5" />
                {course.teacherProfile.user.firstName}{" "}
                {course.teacherProfile.user.lastName}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
              {course.teachingMode && (
                <span className="flex items-center gap-1">
                  <Globe className="size-3.5" />
                  {MODE_LABELS[course.teachingMode] || course.teachingMode}
                </span>
              )}
              {course.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {course.location}
                </span>
              )}
              {course.teachingLevel && <span>{course.teachingLevel}</span>}
            </div>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium dark:bg-emerald-900/30 dark:text-emerald-400">
              Enrolled
            </span>
          </div>
        </div>

        {course.description && (
          <div className="mt-6 pt-6 border-t border-border">
            <h2 className="font-semibold text-foreground mb-3">About this course</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {course.description}
            </p>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <FileText className="size-4 text-primary" />
          Assignments ({course.assignments.length})
        </h2>

        {course.assignments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No assignments yet. Your teacher will add assignments soon.
          </p>
        ) : (
          <div className="space-y-3">
            {course.assignments.map((assignment) => {
              const isOverdue =
                assignment.dueDate && new Date(assignment.dueDate) < new Date();

              return (
                <Link
                  key={assignment.id}
                  href={`/student/assignments/${assignment.id}`}
                  className="block p-4 rounded-lg border border-border/60 bg-background/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {assignment.title}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>
                          Due: {formatDate(assignment.dueDate)}
                          {isOverdue && (
                            <span className="text-destructive ml-1">(Overdue)</span>
                          )}
                        </span>
                        {assignment.maxMarks && (
                          <span>Max: {assignment.maxMarks}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
