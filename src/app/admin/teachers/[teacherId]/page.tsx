import { getTeacherDetail } from "../../actions";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Ban,
  BookOpen,
  Users,
  Award,
  MapPin,
  Phone,
  Globe,
  Calendar,
} from "lucide-react";
import { TeacherActions } from "./TeacherActions";
import { TeacherPhotoUpload } from "./TeacherPhotoUpload";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

function StatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
        <CheckCircle2 className="size-3.5" /> Approved
      </span>
    );
  }
  if (status === "PENDING_VERIFICATION") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
        <Clock className="size-3.5" /> Pending
      </span>
    );
  }
  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        <XCircle className="size-3.5" /> Rejected
      </span>
    );
  }
  if (status === "SUSPENDED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        <Ban className="size-3.5" /> Suspended
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
      {status}
    </span>
  );
}

export default async function AdminTeacherDetailPage({
  params,
}: {
  params: Promise<{ teacherId: string }>;
}) {
  const { teacherId } = await params;
  const teacher = await getTeacherDetail(teacherId);
  if (!teacher) notFound();

  const { user, profile, subjects, qualifications, availability, courseCount, enrolledStudentCount } = teacher;
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unnamed Tutor";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/teachers"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
           Back to Tutors
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {fullName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={profile.status} />
            <TeacherActions teacherId={teacherId} status={profile.status} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="shrink-0">
                <TeacherPhotoUpload
                  teacherUserId={teacherId}
                  currentPhotoUrl={profile.profilePhotoUrl}
                  teacherName={fullName}
                />
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="text-foreground">{profile.phone || "Not set"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Location:</span>
                    <span className="text-foreground">{profile.location || "Not set"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gender:</span>{" "}
                    <span className="text-foreground">{profile.gender || "Not set"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Joined:</span>{" "}
                    <span className="text-foreground">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Unknown"}
                    </span>
                  </div>
                </div>
                {profile.bio && (
                  <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                    {profile.bio}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Teaching Details */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="size-4 text-muted-foreground" />
              Teaching Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Teaching Mode:</span>{" "}
                <span className="text-foreground font-medium">{profile.teachingMode}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Years of Experience:</span>{" "}
                <span className="text-foreground font-medium">{profile.yearsOfExperience}</span>
              </div>
              <div className="flex items-start gap-2">
                <Globe className="size-4 text-muted-foreground mt-0.5" />
                <div>
                  <span className="text-muted-foreground">Languages:</span>{" "}
                  <span className="text-foreground">{profile.languages || "Not specified"}</span>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Teaching Levels:</span>{" "}
                <span className="text-foreground">{profile.teachingLevels || "All levels"}</span>
              </div>
            </div>
          </Card>

          {/* Subjects */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="size-4 text-muted-foreground" />
              Subjects Taught
            </h2>
            {subjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subjects assigned</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {subjects.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            )}
          </Card>

          {/* Qualifications */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Award className="size-4 text-muted-foreground" />
              Qualifications
            </h2>
            {qualifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">No qualifications provided</p>
            ) : (
              <div className="space-y-3">
                {qualifications.map((q, i) => (
                  <div key={i} className="p-3 rounded-lg bg-muted/50 text-sm">
                    <span className="font-medium text-foreground">{q.title}</span>
                    {q.field && (
                      <span className="text-muted-foreground"> — {q.field}</span>
                    )}
                    {q.institution && (
                      <span className="text-muted-foreground"> at {q.institution}</span>
                    )}
                    {q.year && (
                      <span className="text-muted-foreground"> ({q.year})</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Availability */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              Weekly Availability
            </h2>
            {availability.length === 0 ? (
              <p className="text-sm text-muted-foreground">No availability set</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                        Day
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                        Start Time
                      </th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">
                        End Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {availability.map((a, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="px-3 py-2 text-foreground">
                          {DAY_LABELS[a.day] || a.day}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{a.startTime}</td>
                        <td className="px-3 py-2 text-muted-foreground">{a.endTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Stats & Info */}
        <div className="space-y-6">
          {/* Stats */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              Statistics
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Courses Created</span>
                <span className="text-lg font-bold text-foreground">{courseCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Enrolled Students</span>
                <span className="text-lg font-bold text-foreground">{enrolledStudentCount}</span>
              </div>
            </div>
          </Card>

          {/* Review Note */}
          {profile.reviewNote && (
            <Card className="p-6">
              <h2 className="text-base font-semibold text-foreground mb-2">Review Note</h2>
              <p className="text-sm text-muted-foreground">{profile.reviewNote}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
