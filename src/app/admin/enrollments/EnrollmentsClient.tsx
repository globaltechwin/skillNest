"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  search: string | undefined;
  status: string | undefined;
};

export function EnrollmentsClient({ search: initialSearch, status: initialStatus }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch || "");
  const [statusFilter, setStatusFilter] = useState(initialStatus || "ALL");

  const updateParams = useCallback(
    (newSearch: string, newStatus: string) => {
      const params = new URLSearchParams();
      if (newSearch) params.set("search", newSearch);
      if (newStatus && newStatus !== "ALL") params.set("status", newStatus);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams(search, statusFilter);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    updateParams(search, value);
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSearch} className="flex gap-3 items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by student, teacher, or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="w-44">
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <Button type="submit" size="sm">
          Search
        </Button>
      </form>
    </Card>
  );
}
