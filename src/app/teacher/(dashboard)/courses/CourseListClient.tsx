"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  BookOpen,
  Clock,
  Globe,
  MapPin,
  Pencil,
  Trash2,
  Archive,
  Send,
  FileText,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  publishCourse,
  archiveCourse,
  deleteDraftCourse,
  type CourseListItem,
} from "./actions";

type Props = {
  initialCourses: CourseListItem[];
};

const STATUS_CONFIG: Record<
  string,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Draft",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  PUBLISHED: {
    label: "Published",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-gray-100 text-gray-600 border-gray-200",
  },
};

const MODE_LABELS: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "In-person",
  BOTH: "Online & In-person",
};

export function CourseListClient({ initialCourses }: Props) {
  const [courses, setCourses] = useState(initialCourses);
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handlePublish = (courseId: string) => {
    startTransition(async () => {
      const result = await publishCourse(courseId);
      if (result.success) {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === courseId ? { ...c, status: "PUBLISHED" } : c
          )
        );
      }
    });
  };

  const handleArchive = (courseId: string) => {
    startTransition(async () => {
      const result = await archiveCourse(courseId);
      if (result.success) {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === courseId ? { ...c, status: "ARCHIVED" } : c
          )
        );
      }
    });
  };

  const handleDelete = (courseId: string) => {
    startTransition(async () => {
      const result = await deleteDraftCourse(courseId);
      if (result.success) {
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
        setConfirmDelete(null);
      }
    });
  };

  return (
    <div className="space-y-4">
      {courses.map((course) => {
        const statusCfg = STATUS_CONFIG[course.status] || STATUS_CONFIG.DRAFT;

        return (
          <Card key={course.id} className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-foreground truncate">
                    {course.title}
                  </h3>
                  <span
                    className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusCfg.className}`}
                  >
                    {statusCfg.label}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="size-3.5" />
                    {course.subject.name}
                  </span>
                  {course.teachingLevel && (
                    <span>{course.teachingLevel}</span>
                  )}
                  {course.teachingMode && (
                    <span className="flex items-center gap-1">
                      <Globe className="size-3.5" />
                      {MODE_LABELS[course.teachingMode] || course.teachingMode}
                    </span>
                  )}
                  {course.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {course.location}
                    </span>
                  )}
                  {course.maxStudents && (
                    <span>Max {course.maxStudents} students</span>
                  )}
                </div>

                {course.description && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>
                )}

                <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    Updated {new Date(course.updatedAt).toLocaleDateString()}
                  </span>
                  {course._count.assignments > 0 && (
                    <span className="flex items-center gap-1">
                      <FileText className="size-3" />
                      {course._count.assignments} assignment{course._count.assignments !== 1 ? "s" : ""}
                    </span>
                  )}
                  {course._count.students > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="size-3" />
                      {course._count.students} student{course._count.students !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {course.status === "DRAFT" && (
                  <>
                    <Link href={`/teacher/courses/${course.id}/edit`}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Pencil className="size-3.5" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handlePublish(course.id)}
                      disabled={isPending}
                    >
                      <Send className="size-3.5" />
                      Publish
                    </Button>
                    {confirmDelete === course.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(course.id)}
                          disabled={isPending}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDelete(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setConfirmDelete(course.id)}
                      >
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    )}
                  </>
                )}

                {course.status === "PUBLISHED" && (
                  <>
                    <Link href={`/teacher/courses/${course.id}/edit`}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Pencil className="size-3.5" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => handleArchive(course.id)}
                      disabled={isPending}
                    >
                      <Archive className="size-3.5" />
                      Archive
                    </Button>
                  </>
                )}

                {course.status === "ARCHIVED" && (
                  <Link href={`/teacher/courses/${course.id}/edit`}>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
