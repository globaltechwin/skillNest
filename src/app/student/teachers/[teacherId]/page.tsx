import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Globe,
  BookOpen,
  GraduationCap,
  Layers,
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { ContactTeacherButton } from "./ContactTeacherButton";
import { MessageTeacherButton } from "./MessageTeacherButton";
import ReviewSection from "@/components/reviews/ReviewSection";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

const MODE_LABELS: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "In-person",
  BOTH: "Online & In-person",
};

export default async function TeacherProfilePage({
  params,
}: {
  params: Promise<{ teacherId: string }>;
}) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true },
  });
  if (!user || user.role !== "STUDENT") redirect("/login");

  const { teacherId } = await params;

  const profile = await prisma.teacherProfile.findUnique({
    where: { id: teacherId, status: "APPROVED" },
    include: {
      user: { select: { firstName: true, lastName: true } },
      subjects: { include: { subject: { select: { name: true } } } },
      qualifications: true,
      availability: true,
      courses: {
        where: { status: "PUBLISHED" },
        include: { subject: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!profile) notFound();

  const initials =
    (profile.user.firstName?.[0] || "") + (profile.user.lastName?.[0] || "");

  const enabledDays = profile.availability
    .filter((a) => a)
    .sort((a, b) => {
      const order = [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ];
      return order.indexOf(a.day) - order.indexOf(b.day);
    });

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/student/teachers"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Teachers
      </Link>

      {/* Header card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0 overflow-hidden">
            {profile.profilePhotoUrl ? (
              <img
                src={profile.profilePhotoUrl}
                alt={`${profile.user.firstName} ${profile.user.lastName}`}
                className="size-full object-cover rounded-full"
              />
            ) : (
              initials || "?"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-foreground">
              {profile.user.firstName} {profile.user.lastName}
            </h1>
            {profile.location && (
              <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                <MapPin className="size-4" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.bio && (
              <p className="text-muted-foreground mt-3 leading-relaxed">
                {profile.bio}
              </p>
            )}
          </div>
          <div className="flex flex-col items-stretch sm:items-end gap-2">
            <MessageTeacherButton teacherProfileId={profile.id} />
            <ContactTeacherButton teacherId={profile.id} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Teaching info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subjects */}
          {profile.subjects.length > 0 && (
            <Card className="p-6">
              <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <BookOpen className="size-4 text-primary" />
                Subjects
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.subjects.map((s) => (
                  <span
                    key={s.subject.name}
                    className="px-3 py-1 rounded-full bg-primary/10 text-sm font-medium text-primary"
                  >
                    {s.subject.name}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Teaching details */}
          <Card className="p-6">
            <h2 className="font-semibold text-foreground mb-3">Teaching Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Globe className="size-4 shrink-0" />
                <span>{MODE_LABELS[profile.teachingMode] || profile.teachingMode}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="size-4 shrink-0" />
                <span>{profile.yearsOfExperience} years experience</span>
              </div>
              {profile.languages && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="size-4 shrink-0" />
                  <span>{profile.languages}</span>
                </div>
              )}
              {profile.teachingLevels && (
                <div className="text-muted-foreground">
                  Levels: {profile.teachingLevels}
                </div>
              )}
            </div>
            {profile.teachingApproach && (
              <div className="mt-4 text-sm text-muted-foreground leading-relaxed">
                <p className="font-medium text-foreground mb-1">Teaching Approach</p>
                {profile.teachingApproach}
              </div>
            )}
          </Card>

          {/* Qualifications */}
          {profile.qualifications.length > 0 && (
            <Card className="p-6">
              <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <GraduationCap className="size-4 text-primary" />
                Qualifications
              </h2>
              <div className="space-y-3">
                {profile.qualifications.map((q, i) => (
                  <div key={i} className="text-sm">
                    <p className="font-medium text-foreground">{q.title}</p>
                    {(q.institution || q.year) && (
                      <p className="text-muted-foreground">
                        {q.institution}
                        {q.institution && q.year ? " \u2022 " : ""}
                        {q.year}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Published Courses */}
          {profile.courses.length > 0 && (
            <Card className="p-6">
              <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Layers className="size-4 text-primary" />
                Courses Offered ({profile.courses.length})
              </h2>
              <div className="space-y-3">
                {profile.courses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/student/teachers/${profile.id}/courses/${course.id}`}
                    className="block p-4 rounded-lg border border-border/60 bg-background/50 hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {course.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {course.subject.name}
                          </span>
                          {course.teachingMode && (
                            <span>
                              {MODE_LABELS[course.teachingMode] || course.teachingMode}
                            </span>
                          )}
                          {course.teachingLevel && <span>{course.teachingLevel}</span>}
                        </div>
                        {course.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {course.description}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-primary font-medium shrink-0 mt-1">
                        View &rarr;
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right column - Availability */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="font-semibold text-foreground mb-3">Availability</h2>
            {enabledDays.length > 0 ? (
              <div className="space-y-2">
                {enabledDays.map((a) => (
                  <div
                    key={a.day}
                    className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0"
                  >
                    <span className="font-medium text-foreground">
                      {DAY_LABELS[a.day]}
                    </span>
                    <span className="text-muted-foreground">
                      {a.startTime} - {a.endTime}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Availability not provided.
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Reviews */}
      <ReviewSection
        teacherProfileId={profile.id}
        isStudent={user.role === "STUDENT"}
      />
    </div>
  );
}
