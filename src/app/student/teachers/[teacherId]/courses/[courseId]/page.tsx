import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Globe, BookOpen } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { EnrollmentButton } from "./EnrollmentButton";
import { MessageTeacherButton } from "../../MessageTeacherButton";

const MODE_LABELS: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "In-person",
  BOTH: "Online & In-person",
};

export default async function PublicCoursePage({
  params,
}: {
  params: Promise<{ teacherId: string; courseId: string }>;
}) {
  const { teacherId, courseId } = await params;

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      teacherProfileId: teacherId,
      status: "PUBLISHED",
    },
    include: {
      subject: { select: { name: true } },
      teacherProfile: {
        select: {
          id: true,
          user: { select: { firstName: true, lastName: true } },
          location: true,
          teachingMode: true,
        },
      },
    },
  });

  if (!course) notFound();

  return (
    <div className="space-y-6">
      <Link
        href={`/student/teachers/${teacherId}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Tutor Profile
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
              <span>
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

          <div className="shrink-0 w-full sm:w-48 space-y-2">
            <MessageTeacherButton teacherProfileId={course.teacherProfileId} />
            <EnrollmentButton courseId={course.id} />
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
    </div>
  );
}
