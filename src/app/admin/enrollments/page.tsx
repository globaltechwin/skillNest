import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getEnrollments } from "../actions";
import { EnrollmentsClient } from "./EnrollmentsClient";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";

export default async function AdminEnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const search = typeof sp.search === "string" ? sp.search : undefined;
  const status = typeof sp.status === "string" ? sp.status : undefined;
  const page =
    typeof sp.page === "string"
      ? Math.max(1, parseInt(sp.page, 10) || 1)
      : 1;

  const result = await getEnrollments(search, status, page);

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status && status !== "ALL") params.set("status", status);
    if (p > 1) params.set("page", String(p));
    return `/admin/enrollments?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Enrollment Management
        </h1>
        <p className="text-muted-foreground mt-1">
          View and manage all student enrollments
        </p>
      </div>

      {/* Filters */}
      <EnrollmentsClient search={search} status={status} />

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Student Name
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Course Title
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Teacher Name
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Enrolled Date
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {result.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                        <Users className="size-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          No enrollments found
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {search || (status && status !== "ALL")
                            ? "Try adjusting your search or filter criteria."
                            : "Enrollment records will appear here when students enroll in courses."}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                result.data.map((enrollment) => (
                  <tr
                    key={enrollment.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {enrollment.studentName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {enrollment.courseTitle}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {enrollment.teacherName}
                    </td>
                    <td className="px-4 py-3">
                      <EnrollmentStatusBadge status={enrollment.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(enrollment.requestedAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/courses/${enrollment.courseId}`}
                        className="text-sm text-primary hover:underline"
                      >
                        View Course
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {result.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(result.page - 1) * result.pageSize + 1}–
              {Math.min(result.page * result.pageSize, result.total)} of{" "}
              {result.total} enrollments
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={buildHref(result.page - 1)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-muted transition-colors ${
                  result.page <= 1 ? "pointer-events-none opacity-50" : ""
                }`}
              >
                <ChevronLeft className="size-4" /> Previous
              </Link>
              <span className="text-sm text-muted-foreground px-2">
                Page {result.page} of {result.totalPages}
              </span>
              <Link
                href={buildHref(result.page + 1)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-muted transition-colors ${
                  result.page >= result.totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }`}
              >
                Next <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
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
