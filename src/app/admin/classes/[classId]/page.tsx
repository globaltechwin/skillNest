import { getClassDetail } from "../../actions";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  BookOpen,
  User,
  Link2,
} from "lucide-react";

export default async function AdminClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const detail = await getClassDetail(classId);
  if (!detail) notFound();

  const isOnline = detail.mode === "ONLINE" || detail.mode === "BOTH";

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin/classes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" /> Back to Classes
      </Link>

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {detail.title}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Class session details
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                Class Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Title
                  </p>
                  <p className="text-sm text-foreground mt-1 font-medium">
                    {detail.title}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Status
                  </p>
                  <div className="mt-1">
                    <StatusBadge status={detail.status} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Date
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {new Date(detail.startTime).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Time
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {new Date(detail.startTime).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    –{" "}
                    {new Date(detail.endTime).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Mode
                  </p>
                  <div className="mt-1">
                    <ModeBadge mode={detail.mode} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Enrolled Students
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {detail.enrolledStudentCount} students
                  </p>
                </div>
              </div>

              {detail.description && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Description
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {detail.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location / Meeting Link */}
          {(detail.location || detail.meetingUrl) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  Location / Meeting
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detail.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="size-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Location
                        </p>
                        <p className="text-sm text-foreground mt-0.5">
                          {detail.location}
                        </p>
                      </div>
                    </div>
                  )}
                  {detail.meetingUrl && (
                    <div className="flex items-start gap-2">
                      <Link2 className="size-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Meeting Link
                        </p>
                        <a
                          href={detail.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline mt-0.5 inline-block"
                        >
                          {detail.meetingUrl}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="size-4 text-muted-foreground" />
                Course
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground font-medium">
                {detail.courseTitle}
              </p>
            </CardContent>
          </Card>

          {/* Teacher */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                Tutor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground font-medium">
                {detail.teacherName}
              </p>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Enrolled
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {detail.enrolledStudentCount}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mode</span>
                  <ModeBadge mode={detail.mode} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <StatusBadge status={detail.status} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "SCHEDULED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
        Scheduled
      </span>
    );
  }
  if (status === "COMPLETED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        Completed
      </span>
    );
  }
  if (status === "CANCELLED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        Cancelled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
      {status}
    </span>
  );
}

function ModeBadge({ mode }: { mode: string }) {
  if (mode === "ONLINE") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        <Video className="size-3" /> Online
      </span>
    );
  }
  if (mode === "OFFLINE") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
        <MapPin className="size-3" /> Offline
      </span>
    );
  }
  if (mode === "BOTH") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
        Both
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
      {mode}
    </span>
  );
}
