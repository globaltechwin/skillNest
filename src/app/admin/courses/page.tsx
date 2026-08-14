import { Card } from "@/components/ui/card";
import Link from "next/link";
import { BookOpen, Users, FileText, ArrowRight } from "lucide-react";
import { getCourses } from "../actions";
import { CoursesClient } from "./CoursesClient";

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search =
    typeof params.search === "string" ? params.search : undefined;
  const status =
    typeof params.status === "string" ? params.status : undefined;
  const page =
    typeof params.page === "string"
      ? Math.max(1, parseInt(params.page, 10) || 1)
      : 1;

  const result = await getCourses(search, status, page);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Course Management
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage all courses on the platform
        </p>
      </div>

      {/* Search & Filter */}
      <CoursesClient
        search={search || ""}
        status={status || "ALL"}
        total={result.total}
        page={result.page}
        totalPages={result.totalPages}
      />

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Course Title
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Tutor
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Subject
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Students
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Assignments
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {result.data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                        <BookOpen className="size-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          No courses found
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {search || status !== "ALL"
                            ? "Try adjusting your search or filter criteria."
                            : "Courses will appear here when tutors create them."}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                result.data.map((course) => (
                  <tr
                    key={course.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">
                      {course.title}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {course.teacherName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {course.subjectName}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={course.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Users className="size-3.5" />
                        {course.studentCount}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <FileText className="size-3.5" />
                        {course.assignmentCount}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="text-primary hover:underline text-sm font-medium inline-flex items-center gap-1"
                      >
                        View <ArrowRight className="size-3" />
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
              {result.total} courses
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/courses${buildQueryString(search, status, result.page - 1)}`}
                className={`inline-flex items-center justify-center rounded-lg border border-transparent bg-clip-padding px-2.5 py-1 text-sm font-medium transition-all outline-none select-none border-border bg-background hover:bg-muted hover:text-foreground ${
                  result.page <= 1 ? "pointer-events-none opacity-50" : ""
                }`}
              >
                Previous
              </Link>
              <span className="text-sm text-muted-foreground px-2">
                Page {result.page} of {result.totalPages}
              </span>
              <Link
                href={`/admin/courses${buildQueryString(search, status, result.page + 1)}`}
                className={`inline-flex items-center justify-center rounded-lg border border-transparent bg-clip-padding px-2.5 py-1 text-sm font-medium transition-all outline-none select-none border-border bg-background hover:bg-muted hover:text-foreground ${
                  result.page >= result.totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }`}
              >
                Next
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function buildQueryString(
  search?: string,
  status?: string,
  page?: number
): string {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status && status !== "ALL") params.set("status", status);
  if (page && page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
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
