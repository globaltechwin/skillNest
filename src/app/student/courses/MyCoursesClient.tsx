"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, User, Globe, MapPin, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { getMyEnrollments, type MyCourseItem } from "../enrollments/actions";

const MODE_LABELS: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "In-person",
  BOTH: "Online & In-person",
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function MyCoursesClient() {
  const [courses, setCourses] = useState<MyCourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyEnrollments().then((data) => {
      setCourses(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="space-y-3">
              <div className="h-5 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No courses yet"
        description="Your enrolled courses will appear here once you join a course."
      />
    );
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <Card key={course.enrollmentId} className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {course.courseTitle}
              </h3>

              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                <span className="flex items-center gap-1">
                  <BookOpen className="size-3.5" />
                  {course.subject.name}
                </span>
                <span className="text-border">•</span>
                <span className="flex items-center gap-1">
                  <User className="size-3.5" />
                  {course.teacher.firstName} {course.teacher.lastName}
                </span>
              </div>

              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
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
                {course.assignmentCount > 0 && (
                  <span className="flex items-center gap-1">
                    <FileText className="size-3.5" />
                    {course.assignmentCount} assignment{course.assignmentCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              <div className="mt-2 text-xs text-muted-foreground">
                Enrolled {formatDate(course.enrolledAt)}
              </div>
            </div>

            <Link href={`/student/courses/${course.courseId}`}>
              <Button variant="outline" size="sm" className="shrink-0">
                View Course
              </Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
