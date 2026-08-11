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
  createClass,
  updateClass,
  type ClassActionResult,
} from "./actions";

type CourseOption = { id: string; title: string };

type ClassData = {
  id?: string;
  courseId: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  mode: string;
  location: string;
  meetingUrl: string;
  status?: string;
};

type Props = {
  courses: CourseOption[];
  classData?: ClassData;
  mode: "create" | "edit";
};

function toLocalDateString(date: Date | string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}



export function ClassForm({ courses, classData, mode }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ClassData>({
    courseId: classData?.courseId || "",
    title: classData?.title || "",
    description: classData?.description || "",
    date: classData?.date || toLocalDateString(new Date()),
    startTime: classData?.startTime || "",
    endTime: classData?.endTime || "",
    mode: classData?.mode || "ONLINE",
    location: classData?.location || "",
    meetingUrl: classData?.meetingUrl || "",
    status: classData?.status,
  });

  const updateField = (field: keyof ClassData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

      let result: ClassActionResult;

      const payload = {
        courseId: formData.courseId,
        title: formData.title,
        description: formData.description || undefined,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        mode: formData.mode as "ONLINE" | "OFFLINE" | "BOTH",
        location: formData.location || undefined,
        meetingUrl: formData.meetingUrl || undefined,
      };

      if (mode === "create") {
        result = await createClass(payload);
      } else {
        result = await updateClass(classData!.id!, payload);
      }

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/teacher/classes");
      router.refresh();
    });
  };

  const isScheduled = classData?.status === "SCHEDULED";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/teacher/classes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          Back to Classes
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {mode === "create" ? "Create Class" : "Edit Class"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "create"
            ? "Schedule a new class for your students."
            : "Update class details."}
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
              </option>
            ))}
          </Select>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">
            Class Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="e.g., Introduction to Variables"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="What will be covered in this class..."
            className="min-h-20"
          />
        </div>

        {/* Date, Start Time, End Time */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">
              Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => updateField("date", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startTime">
              Start Time <span className="text-destructive">*</span>
            </Label>
            <Input
              id="startTime"
              type="time"
              value={formData.startTime}
              onChange={(e) => updateField("startTime", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endTime">
              End Time <span className="text-destructive">*</span>
            </Label>
            <Input
              id="endTime"
              type="time"
              value={formData.endTime}
              onChange={(e) => updateField("endTime", e.target.value)}
            />
          </div>
        </div>

        {/* Mode */}
        <div className="space-y-2">
          <Label htmlFor="mode">
            Mode <span className="text-destructive">*</span>
          </Label>
          <Select
            id="mode"
            value={formData.mode}
            onChange={(e) => updateField("mode", e.target.value)}
          >
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">In-person</option>
            <option value="BOTH">Both Online & In-person</option>
          </Select>
        </div>

        {/* Conditional fields */}
        {(formData.mode === "ONLINE" || formData.mode === "BOTH") && (
          <div className="space-y-2">
            <Label htmlFor="meetingUrl">Meeting URL</Label>
            <Input
              id="meetingUrl"
              value={formData.meetingUrl}
              onChange={(e) => updateField("meetingUrl", e.target.value)}
              placeholder="https://meet.google.com/..."
            />
            <p className="text-xs text-muted-foreground">
              Google Meet, Zoom, or other meeting link
            </p>
          </div>
        )}

        {(formData.mode === "OFFLINE" || formData.mode === "BOTH") && (
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="e.g., Room 101, Main Campus"
            />
          </div>
        )}
      </Card>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Link href="/teacher/classes">
          <Button variant="outline" type="button">
            Cancel
          </Button>
        </Link>

        {mode === "edit" && isScheduled ? (
          <Button onClick={handleSubmit} disabled={isPending} className="gap-2">
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Save Changes
          </Button>
        ) : mode === "create" ? (
          <Button onClick={handleSubmit} disabled={isPending} className="gap-2">
            {isPending && <Loader2 className="size-4 animate-spin" />}
            Create Class
          </Button>
        ) : null}
      </div>
    </div>
  );
}
