"use client";

import { useState, useCallback } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

type Subject = { name: string };

type Filters = {
  search: string;
  subject: string;
  teachingLevel: string;
  teachingMode: string;
  location: string;
};

type Props = {
  subjects: Subject[];
  onSearch: (filters: Filters) => void;
  initialFilters?: Partial<Filters>;
};

const TEACHING_LEVELS = [
  "Primary (1-5)",
  "Middle School (6-8)",
  "High School (9-10)",
  "Higher Secondary (11-12)",
  "Undergraduate",
  "Postgraduate",
  "Professional",
];

const TEACHING_MODES = [
  { value: "ONLINE", label: "Online" },
  { value: "OFFLINE", label: "In-person" },
  { value: "BOTH", label: "Both" },
];

export function TeacherSearch({ subjects, onSearch, initialFilters }: Props) {
  const [filters, setFilters] = useState<Filters>({
    search: initialFilters?.search || "",
    subject: initialFilters?.subject || "",
    teachingLevel: initialFilters?.teachingLevel || "",
    teachingMode: initialFilters?.teachingMode || "",
    location: initialFilters?.location || "",
  });

  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters =
    filters.subject || filters.teachingLevel || filters.teachingMode || filters.location;

  const handleSearch = useCallback(() => {
    onSearch(filters);
  }, [filters, onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const clearFilters = useCallback(() => {
    const cleared = {
      search: filters.search,
      subject: "",
      teachingLevel: "",
      teachingMode: "",
      location: "",
    };
    setFilters(cleared);
    onSearch(cleared);
  }, [filters.search, onSearch]);

  const updateFilter = useCallback(
    (key: keyof Filters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by name, subject, or location..."
            className="pl-9"
          />
        </div>
        <Button onClick={handleSearch} className="shrink-0">
          Search
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="shrink-0 gap-2"
        >
          <SlidersHorizontal className="size-4" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="size-2 rounded-full bg-primary" />
          )}
        </Button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-lg border border-border bg-card">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Subject
            </label>
            <Select
              value={filters.subject}
              onChange={(e) => updateFilter("subject", e.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Teaching Level
            </label>
            <Select
              value={filters.teachingLevel}
              onChange={(e) => updateFilter("teachingLevel", e.target.value)}
            >
              <option value="">All Levels</option>
              {TEACHING_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Teaching Mode
            </label>
            <Select
              value={filters.teachingMode}
              onChange={(e) => updateFilter("teachingMode", e.target.value)}
            >
              <option value="">All Modes</option>
              {TEACHING_MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Location
            </label>
            <Input
              value={filters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
              placeholder="e.g., Chennai"
            />
          </div>

          {hasActiveFilters && (
            <div className="sm:col-span-2 lg:col-span-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-1.5 text-muted-foreground"
              >
                <X className="size-3.5" />
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
