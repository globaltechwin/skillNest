"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  Video,
  MapPin,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ClassRow } from "../actions";

type Props = {
  classes: ClassRow[];
  total: number;
  page: number;
  totalPages: number;
};

const PAGE_SIZE = 20;

export function ClassesClient({ classes, total, page, totalPages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [filter, setFilter] = useState(searchParams.get("filter") || "ALL");

  const updateParams = useCallback(
    (newSearch: string, newFilter: string, newPage?: number) => {
      const params = new URLSearchParams();
      if (newSearch) params.set("search", newSearch);
      if (newFilter && newFilter !== "ALL") params.set("filter", newFilter);
      if (newPage && newPage > 1) params.set("page", String(newPage));
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams(search, filter, 1);
  };

  const handleFilter = (value: string) => {
    setFilter(value);
    updateParams(search, value, 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Classes
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage all class sessions across courses
        </p>
      </div>

      {/* Search & Filter */}
      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex gap-3 items-end">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, course, or tutor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="w-44">
            <Select
              value={filter}
              onChange={(e) => handleFilter(e.target.value)}
            >
              <option value="ALL">All Classes</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </Select>
          </div>
          <Button type="submit" size="sm">
            Search
          </Button>
        </form>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Title
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Course
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Tutor
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Time
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Mode
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {classes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                        <Calendar className="size-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          No classes found
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {search || filter !== "ALL"
                            ? "Try adjusting your search or filter criteria."
                            : "Class sessions will appear here once tutors create them."}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                classes.map((cls) => (
                  <tr
                    key={cls.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-foreground">
                      {cls.title}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {cls.courseTitle}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {cls.teacherName}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(cls.startTime).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
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
                    <td className="px-4 py-3">
                      <ModeBadge mode={cls.mode} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={cls.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/classes/${cls.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="size-3.5 mr-1" /> View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, total)} of {total} classes
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => updateParams(search, filter, page - 1)}
              >
                <ChevronLeft className="size-4" /> Previous
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => updateParams(search, filter, page + 1)}
              >
                Next <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
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
