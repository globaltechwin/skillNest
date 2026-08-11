"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Props = {
  search: string;
  status: string;
  total: number;
  page: number;
  totalPages: number;
};

export function CoursesClient({
  search: initialSearch,
  status: initialStatus,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);

  const updateParams = useCallback(
    (newSearch: string, newStatus: string, newPage?: number) => {
      const params = new URLSearchParams();
      if (newSearch) params.set("search", newSearch);
      if (newStatus && newStatus !== "ALL") params.set("status", newStatus);
      if (newPage && newPage > 1) params.set("page", String(newPage));
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams(search, initialStatus, 1);
  };

  const handleStatusFilter = (value: string) => {
    updateParams(search, value, 1);
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSearch} className="flex gap-3 items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search courses by title or teacher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="w-44">
          <Select
            defaultValue={initialStatus}
            onChange={(e) => handleStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
        </div>
        <Button type="submit" size="sm">
          Search
        </Button>
      </form>
    </Card>
  );
}
