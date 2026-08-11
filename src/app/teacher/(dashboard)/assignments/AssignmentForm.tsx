"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createAssignment,
  updateAssignment,
  publishAssignment,
  type AssignmentActionResult,
} from "./actions";

type CourseOption = { id: string; title: string; status: string };

type AssignmentData = {
  id?: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  maxMarks: number | null;
  status?: string;
};

type Props = {
  courses: CourseOption[];
  assignment?: AssignmentData;
  mode: "create" | "edit";
};

function toDateString(date: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function AssignmentForm({ courses, assignment, mode }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AssignmentData>({
    courseId: assignment?.courseId || "",
    title: assignment?.title || "",
    description: assignment?.description || "",
    dueDate: assignment?.dueDate
      ? toDateString(new Date(assignment.dueDate))
      : "",
    maxMarks: assignment?.maxMarks ?? null,
    status: assignment?.status,
  });

  const updateField = (field: keyof AssignmentData, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (asDraft: boolean) => {
    setError(null);
    startTransition(async () => {
      let result: AssignmentActionResult;

      const payload = {
        courseId: formData.courseId,
        title: formData.title,
        description: formData.description || undefined,
        dueDate: formData.dueDate || undefined,
        maxMarks: formData.maxMarks || undefined,
      };

      if (mode === "create") {
        result = await createAssignment(payload);
      } else {
        result = await updateAssignment(assignment!.id!, payload);
      }

      if (!result.success) {
        setError(result.error);
        return;
      }

      if (!asDraft && mode === "create") {
        await publishAssignment(result.assignmentId);
      }

      router.push("/teacher/assignments");
      router.refresh();
    });
  };

  const isPublished = assignment?.status === "PUBLISHED";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/teacher/assignments"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          Back to Assignments
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {mode === "create" ? "Create Assignment" : "Edit Assignment"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "create"
            ? "Create a new assignment for your students."
            : "Update assignment details."}
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Course */}
        <div className="space-y-2">
          <Label htmlFor="courseId">
            Course <span className="text-destructive">*</span>
          </Label>
          <Select
            id="courseId"
            value={formData.courseId}
            onChange={(e) => updateField("courseId", e.target.value)}
          >
            <option value="">Select a course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
                {c.status === "DRAFT" ? " (Draft)" : ""}
              </option>
            ))}
          </Select>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">
            Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g., Variables and Data Types"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Describe the assignment requirements..."
            className="min-h-32"
          />
          <p className="text-xs text-muted-foreground">
            {formData.description.length}/5000 characters
          </p>
        </div>

        {/* Due Date + Max Marks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => updateField("dueDate", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for no deadline
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxMarks">Maximum Marks</Label>
            <Input
              id="maxMarks"
              type="number"
              min="1"
              max="10000"
              value={formData.maxMarks ?? ""}
              onChange={(e) =>
                updateField(
                  "maxMarks",
                  e.target.value ? parseInt(e.target.value) : null
                )
              }
              placeholder="No limit"
            />
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Link href="/teacher/assignments">
          <Button variant="outline" type="button">
            Cancel
          </Button>
        </Link>

        {mode === "edit" && isPublished ? (
          <>
            <Button
              onClick={() => handleSubmit(true)}
              disabled={isPending}
              className="gap-2"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Save Changes
            </Button>
          </>
        ) : mode === "edit" && assignment?.status === "ARCHIVED" ? (
          <Button
            onClick={() => handleSubmit(true)}
            disabled={isPending}
            className="gap-2"
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Save Changes
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={isPending}
              className="gap-2"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Save Draft
            </Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isPending}
              className="gap-2"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Save & Publish
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
