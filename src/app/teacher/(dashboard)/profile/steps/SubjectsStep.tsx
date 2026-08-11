"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface Subject {
  id: string;
  name: string;
}

interface SubjectsStepProps {
  subjects: Subject[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  errors?: Record<string, string[]> | null;
}

export function SubjectsStep({
  subjects,
  selectedIds,
  onChange,
  errors,
}: SubjectsStepProps) {
  const [search, setSearch] = useState("");

  const filtered = subjects.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSubject = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((i) => i !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Subjects
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select the subjects you can teach. You can select multiple subjects.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search subjects..."
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filtered.map((subject) => (
          <label
            key={subject.id}
            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedIds.includes(subject.id)
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted"
            }`}
          >
            <Checkbox
              checked={selectedIds.includes(subject.id)}
              onCheckedChange={() => toggleSubject(subject.id)}
            />
            <span className="text-sm font-medium text-foreground">
              {subject.name}
            </span>
          </label>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">
          No subjects found matching &ldquo;{search}&rdquo;
        </p>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{selectedIds.length} subject(s) selected</span>
        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {errors?.subjectIds && (
        <p className="text-xs text-destructive">{errors.subjectIds[0]}</p>
      )}
    </div>
  );
}
