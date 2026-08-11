"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { TeacherSearch } from "./TeacherSearch";
import { TeacherCard } from "./TeacherCard";
import { Pagination } from "./Pagination";
import { EmptyState } from "@/components/dashboard/EmptyState";

type Teacher = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profilePhotoUrl: string | null;
  location: string | null;
  bio: string | null;
  teachingMode: string;
  yearsOfExperience: number;
  languages: string | null;
  teachingLevels: string | null;
  subjects: { name: string }[];
  averageRating: number | null;
  reviewCount: number;
};

type Filters = {
  search: string;
  subject: string;
  teachingLevel: string;
  teachingMode: string;
  location: string;
};

type Props = {
  initialTeachers: Teacher[];
  subjects: { name: string }[];
  initialTotal: number;
  initialPage: number;
  totalPages: number;
  initialFilters: Filters;
};

export function TeacherListClient({
  initialTeachers,
  subjects,
  initialTotal,
  initialPage,
  totalPages,
  initialFilters,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [teachers] = useState(initialTeachers);
  const [total] = useState(initialTotal);
  const [page] = useState(initialPage);
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const buildUrl = useCallback(
    (newFilters: Filters, newPage: number) => {
      const params = new URLSearchParams();
      if (newFilters.search) params.set("search", newFilters.search);
      if (newFilters.subject) params.set("subject", newFilters.subject);
      if (newFilters.teachingLevel)
        params.set("teachingLevel", newFilters.teachingLevel);
      if (newFilters.teachingMode)
        params.set("teachingMode", newFilters.teachingMode);
      if (newFilters.location) params.set("location", newFilters.location);
      if (newPage > 1) params.set("page", String(newPage));
      const qs = params.toString();
      return `${pathname}${qs ? `?${qs}` : ""}`;
    },
    [pathname]
  );

  const handleSearch = useCallback(
    (newFilters: Filters) => {
      setFilters(newFilters);
      router.push(buildUrl(newFilters, 1));
    },
    [router, buildUrl]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      router.push(buildUrl(filters, newPage));
    },
    [router, buildUrl, filters]
  );

  return (
    <div className="space-y-6">
      <TeacherSearch
        subjects={subjects}
        onSearch={handleSearch}
        initialFilters={initialFilters}
      />

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {total} {total === 1 ? "teacher" : "teachers"} found
      </div>

      {/* Teacher grid */}
      {teachers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {teachers.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No teachers found"
          description="Try changing your search or filters."
        />
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
