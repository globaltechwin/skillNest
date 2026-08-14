import { getCourseDetail, archiveCourse } from "../../actions";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Users,
  FileText,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourseDetail(courseId);
  if (!course) notFound();

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Courses
      </Link>

      {/* Course Info */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">
                {course.title}
              </h2>
              <StatusBadge status={course.status} />
            </div>
            {course.description && (
              <p className="text-sm text-muted-foreground max-w-2xl">
                {course.description}
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <BookOpen className="size-3.5" />
                {course.subjectName}
              </div>
              {course.teachingLevel && (
                <span>{course.teachingLevel}</span>
              )}
              {course.teachingMode && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {course.teachingMode}
                </span>
              )}
              {course.maxStudents && (
                <span className="flex items-center gap-1.5">
                  <Users className="size-3.5" />
                  Max {course.maxStudents} students
                </span>
              )}
              <span>
                Created{" "}
                {new Date(course.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Teacher Info */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <BookOpen className="size-4 text-muted-foreground" />
          Tutor
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
              <span className="text-sm font-medium text-primary">
                {course.teacherName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </span>
            </div>
            <div>
              <p className="font-medium text-foreground">
                {course.teacherName}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <TeacherStatusBadge status={course.teacherVerified} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Enrollments */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="size-4 text-muted-foreground" />
            Enrollments ({course.enrollments.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                  Student
                </th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                  Requested
                </th>
              </tr>
            </thead>
            <tbody>
              {course.enrollments.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No enrollments yet
                    </p>
                  </td>
                </tr>
              ) : (
                course.enrollments.map((enrollment) => (
                  <tr
                    key={enrollment.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-3 font-medium text-foreground">
                      {enrollment.studentName}
                    </td>
                    <td className="px-6 py-3">
                      <EnrollmentStatusBadge status={enrollment.status} />
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {new Date(enrollment.requestedAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Assignments */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            Assignments ({course.assignments.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                  Title
                </th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                  Due Date
                </th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                  Submissions
                </th>
              </tr>
            </thead>
            <tbody>
              {course.assignments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No assignments yet
                    </p>
                  </td>
                </tr>
              ) : (
                course.assignments.map((assignment) => (
                  <tr
                    key={assignment.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-3 font-medium text-foreground">
                      {assignment.title}
                    </td>
                    <td className="px-6 py-3">
                      <AssignmentStatusBadge status={assignment.status} />
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {assignment.dueDate
                        ? new Date(assignment.dueDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )
                        : "—"}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {assignment.submissionCount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Classes */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Calendar className="size-4 text-muted-foreground" />
            Classes ({course.classes.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                  Title
                </th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                  Date
                </th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                  Time
                </th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                  Mode
                </th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {course.classes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      No classes scheduled
                    </p>
                  </td>
                </tr>
              ) : (
                course.classes.map((cls) => (
                  <tr
                    key={cls.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-6 py-3 font-medium text-foreground">
                      {cls.title}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {new Date(cls.startTime).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {new Date(cls.startTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      –{" "}
                      {new Date(cls.endTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {cls.mode}
                    </td>
                    <td className="px-6 py-3">
                      <ClassStatusBadge status={cls.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Archive Action */}
      {course.status !== "ARCHIVED" && (
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Archive Course
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Archiving will hide this course from students and tutors.
              </p>
            </div>
            <form
              action={async () => {
                "use server";
                await archiveCourse(courseId);
              }}
            >
              <Button type="submit" variant="destructive" size="sm">
                <Archive className="size-3.5 mr-1" />
                Archive Course
              </Button>
            </form>
          </div>
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "PUBLISHED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        Published
      </span>
    );
  }
  if (status === "DRAFT") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        Draft
      </span>
    );
  }
  if (status === "ARCHIVED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
        Archived
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
      {status}
    </span>
  );
}

function TeacherStatusBadge({ status }: { status: string }) {
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
        <CheckCircle2 className="size-3" />
        Verified
      </span>
    );
  }
  if (status === "PENDING_VERIFICATION") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-600">
        <Clock className="size-3" />
        Pending
      </span>
    );
  }
  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-red-600">
        <XCircle className="size-3" />
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
      {status}
    </span>
  );
}

function EnrollmentStatusBadge({ status }: { status: string }) {
  if (status === "ACCEPTED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        Accepted
      </span>
    );
  }
  if (status === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        Pending
      </span>
    );
  }
  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        Rejected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
      {status}
    </span>
  );
}

function AssignmentStatusBadge({ status }: { status: string }) {
  if (status === "PUBLISHED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        Published
      </span>
    );
  }
  if (status === "DRAFT") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        Draft
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
      {status}
    </span>
  );
}

function ClassStatusBadge({ status }: { status: string }) {
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
