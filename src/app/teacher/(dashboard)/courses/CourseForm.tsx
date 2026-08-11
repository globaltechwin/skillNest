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
  createCourse,
  updateCourse,
  publishCourse,
  type CourseActionResult,
} from "./actions";

type Subject = { id: string; name: string };

type CourseData = {
  id?: string;
  title: string;
  subjectId: string;
  description: string;
  teachingLevel: string;
  teachingMode: string;
  location: string;
  maxStudents: number | null;
  status?: string;
};

type Props = {
  subjects: Subject[];
  course?: CourseData;
  mode: "create" | "edit";
};

const TEACHING_LEVELS = [
  "Primary (1-5)",
  "Middle School (6-8)",
  "High School (9-10)",
  "Higher Secondary (11-12)",
  "Undergraduate",
  "Postgraduate",
  "Professional",
  "Beginner",
  "Intermediate",
  "Advanced",
];

export function CourseForm({ subjects, course, mode }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CourseData>({
    title: course?.title || "",
    subjectId: course?.subjectId || "",
    description: course?.description || "",
    teachingLevel: course?.teachingLevel || "",
    teachingMode: course?.teachingMode || "BOTH",
    location: course?.location || "",
    maxStudents: course?.maxStudents || null,
    status: course?.status,
  });

  const updateField = (field: keyof CourseData, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (asDraft: boolean) => {
    setError(null);
    startTransition(async () => {
      let result: CourseActionResult;

      if (mode === "create") {
        result = await createCourse({
          title: formData.title,
          subjectId: formData.subjectId,
          description: formData.description || undefined,
          teachingLevel: formData.teachingLevel || undefined,
          teachingMode: (formData.teachingMode as "ONLINE" | "OFFLINE" | "BOTH") || undefined,
          location: formData.location || undefined,
          maxStudents: formData.maxStudents || undefined,
        });
      } else {
        result = await updateCourse(course!.id!, {
          title: formData.title,
          subjectId: formData.subjectId,
          description: formData.description || undefined,
          teachingLevel: formData.teachingLevel || undefined,
          teachingMode: (formData.teachingMode as "ONLINE" | "OFFLINE" | "BOTH") || undefined,
          location: formData.location || undefined,
          maxStudents: formData.maxStudents || undefined,
        });
      }

      if (!result.success) {
        setError(result.error);
        return;
      }

      if (!asDraft && mode === "create") {
        await publishCourse(result.courseId);
      }

      router.push("/teacher/courses");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/teacher/courses"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          Back to Courses
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {mode === "create" ? "Create Course" : "Edit Course"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "create"
            ? "Set up a new course to offer to students."
            : "Update your course details."}
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">
            Course Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g., Python Programming for Beginners"
          />
        </div>

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject">
            Subject <span className="text-destructive">*</span>
          </Label>
          <Select
            id="subject"
            value={formData.subjectId}
            onChange={(e) => updateField("subjectId", e.target.value)}
          >
            <option value="">Select a subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Describe what students will learn in this course..."
            className="min-h-24"
          />
          <p className="text-xs text-muted-foreground">
            {formData.description.length}/2000 characters
          </p>
        </div>

        {/* Teaching Level + Mode */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="teachingLevel">Teaching Level</Label>
            <Select
              id="teachingLevel"
              value={formData.teachingLevel}
              onChange={(e) => updateField("teachingLevel", e.target.value)}
            >
              <option value="">Any level</option>
              {TEACHING_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="teachingMode">Teaching Mode</Label>
            <Select
              id="teachingMode"
              value={formData.teachingMode}
              onChange={(e) => updateField("teachingMode", e.target.value)}
            >
              <option value="ONLINE">Online</option>
              <option value="OFFLINE">In-person</option>
              <option value="BOTH">Both Online & In-person</option>
            </Select>
          </div>
        </div>

        {/* Location + Max Students */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="e.g., Chennai, Tamil Nadu"
            />
            <p className="text-xs text-muted-foreground">
              Required for in-person courses
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxStudents">Maximum Students</Label>
            <Input
              id="maxStudents"
              type="number"
              min="1"
              max="1000"
              value={formData.maxStudents ?? ""}
              onChange={(e) =>
                updateField(
                  "maxStudents",
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
        <Link href="/teacher/courses">
          <Button variant="outline" type="button">
            Cancel
          </Button>
        </Link>

        {mode === "edit" && course?.status === "PUBLISHED" ? (
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
        ) : mode === "edit" && course?.status === "ARCHIVED" ? (
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
