import { getStudentDetail } from "../../actions";
import { notFound } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  CalendarDays,
  GraduationCap,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACCEPTED: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-amber-100 text-amber-700",
    REJECTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-600",
    GRADED: "bg-emerald-100 text-emerald-700",
    SUBMITTED: "bg-blue-100 text-blue-700",
    NOT_SUBMITTED: "bg-gray-100 text-gray-600",
  };

  const icons: Record<string, React.ReactNode> = {
    ACCEPTED: <CheckCircle2 className="h-3.5 w-3.5" />,
    PENDING: <Clock className="h-3.5 w-3.5" />,
    REJECTED: <XCircle className="h-3.5 w-3.5" />,
    GRADED: <CheckCircle2 className="h-3.5 w-3.5" />,
    SUBMITTED: <Clock className="h-3.5 w-3.5" />,
    NOT_SUBMITTED: <XCircle className="h-3.5 w-3.5" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-600"}`}
    >
      {icons[status]}
      {status.replace(/_/g, " ")}
    </span>
  );
}

export default async function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  const student = await getStudentDetail(studentId);
  if (!student) notFound();

  const { user, enrollments, submissions } = student;
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown";

  const totalEnrollments = enrollments.length;
  const acceptedEnrollments = enrollments.filter(
    (e) => e.status === "ACCEPTED"
  ).length;
  const totalSubmissions = submissions.length;
  const gradedSubmissions = submissions.filter(
    (s) => s.status === "GRADED"
  ).length;

  const stats = [
    {
      label: "Enrollments",
      value: totalEnrollments,
      icon: <BookOpen className="h-5 w-5 text-muted-foreground" />,
    },
    {
      label: "Accepted",
      value: acceptedEnrollments,
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    },
    {
      label: "Submissions",
      value: totalSubmissions,
      icon: <FileText className="h-5 w-5 text-muted-foreground" />,
    },
    {
      label: "Graded",
      value: gradedSubmissions,
      icon: <CheckCircle2 className="h-5 w-5 text-blue-500" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Students
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{fullName}</CardTitle>
          <CardDescription className="flex flex-col sm:flex-row sm:gap-4">
            <span>{user.email}</span>
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              Joined{" "}
              {new Date(user.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                {stat.icon}
                <div>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Enrollments
          </CardTitle>
          <CardDescription>
            {totalEnrollments} course enrollment
            {totalEnrollments !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No enrollments yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Course</th>
                    <th className="pb-3 pr-4 font-medium">Teacher</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        <Link
                          href={`/admin/courses`}
                          className="font-medium hover:underline"
                        >
                          {enrollment.course.title}
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {enrollment.course.teacherName}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={enrollment.status} />
                      </td>
                      <td className="py-3 text-muted-foreground">
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Submissions
          </CardTitle>
          <CardDescription>
            {totalSubmissions} assignment submission
            {totalSubmissions !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No submissions yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Assignment</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Marks</th>
                    <th className="pb-3 font-medium">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">
                        {submission.assignmentTitle}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={submission.status} />
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {submission.marks !== null ? submission.marks : "-"}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {submission.submittedAt
                          ? new Date(
                              submission.submittedAt
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
