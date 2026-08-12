import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  MapPin,
  Users,
  Edit,
  XCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/custom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cancelClass } from "../actions";

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const MODE_LABELS: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "In-person",
  BOTH: "Both Online & In-person",
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

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;

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

  const classSession = await prisma.classSession.findFirst({
    where: {
      id: classId,
      course: { teacherProfileId: profile.id },
    },
    include: {
      course: {
        select: { id: true, title: true, subject: { select: { name: true } } },
      },
    },
  });

  if (!classSession) notFound();

  const enrollmentCount = await prisma.courseEnrollment.count({
    where: { courseId: classSession.courseId, status: "ACCEPTED" },
  });

  return (
    <div className="space-y-6">
      <Link
        href="/teacher/classes"
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
              <span>{classSession.course.subject.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {classSession.status === "SCHEDULED" && (
              <>
                <Link href={`/teacher/classes/${classSession.id}/edit`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Edit className="size-3.5" />
                    Edit
                  </Button>
                </Link>
                <form
                  action={async () => {
                    "use server";
                    await cancelClass(classSession.id);
                  }}
                >
                  <Button type="submit" variant="outline" size="sm" className="gap-1.5 text-destructive">
                    <XCircle className="size-3.5" />
                    Cancel Class
                  </Button>
                </form>
              </>
            )}
          </div>
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

          {(classSession.mode === "ONLINE" || classSession.mode === "BOTH") &&
            classSession.meetingUrl && (
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

              <div className="flex items-center gap-3">
                <Users className="size-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-muted-foreground">Enrolled Students</p>
                  <p className="font-medium text-foreground">
                    {enrollmentCount}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
