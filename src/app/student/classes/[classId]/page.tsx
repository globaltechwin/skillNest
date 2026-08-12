import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  MapPin,
  User,
  ExternalLink,
} from "lucide-react";
import { auth } from "@/lib/auth/custom";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MODE_LABELS: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "In-person",
  BOTH: "Both Online & In-person",
};

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function StudentClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "STUDENT") redirect("/login");

  const classSession = await prisma.classSession.findUnique({
    where: { id: classId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          teacherProfile: {
            select: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
    },
  });

  if (!classSession) notFound();

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      courseId_studentUserId: {
        courseId: classSession.courseId,
        studentUserId: user.id,
      },
    },
    select: { status: true },
  });

  if (!enrollment || enrollment.status !== "ACCEPTED") notFound();

  const isOnline =
    classSession.mode === "ONLINE" || classSession.mode === "BOTH";

  return (
    <div className="space-y-6">
      <Link
        href="/student/classes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Classes
      </Link>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-foreground">
                {classSession.title}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[classSession.status]}`}
              >
                {classSession.status}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{classSession.course.title}</span>
              <span className="text-border">•</span>
              <span className="flex items-center gap-1">
                <User className="size-3.5" />
                {classSession.course.teacherProfile.user.firstName}{" "}
                {classSession.course.teacherProfile.user.lastName}
              </span>
            </div>
          </div>

          {isOnline && classSession.meetingUrl && classSession.status === "SCHEDULED" && (
            <a
              href={classSession.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="gap-1.5">
                <ExternalLink className="size-3.5" />
                Join Class
              </Button>
            </a>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {classSession.description && (
            <Card className="p-6">
              <h2 className="font-semibold text-foreground mb-3">Description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {classSession.description}
              </p>
            </Card>
          )}

          {isOnline && classSession.meetingUrl && (
            <Card className="p-6">
              <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Globe className="size-4 text-primary" />
                Meeting Link
              </h2>
              <a
                href={classSession.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                {classSession.meetingUrl}
              </a>
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
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium text-foreground">
                    {formatDateTime(classSession.startTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="size-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground">Time</p>
                  <p className="font-medium text-foreground">
                    {formatTime(classSession.startTime)} - {formatTime(classSession.endTime)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Globe className="size-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground">Mode</p>
                  <p className="font-medium text-foreground">
                    {MODE_LABELS[classSession.mode]}
                  </p>
                </div>
              </div>

              {classSession.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="size-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">
                      {classSession.location}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
