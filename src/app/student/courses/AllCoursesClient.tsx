"use client";

import { useState, useEffect } from "react";
import { BookOpen, User, Globe, MapPin, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { getAllCourses, type AllCourseItem } from "./actions";

const MODE_LABELS: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "In-person",
  BOTH: "Online & In-person",
};

export function AllCoursesClient() {
  const [courses, setCourses] = useState<AllCourseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCourses().then((data) => {
      setCourses(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      <div className="text-center py-12">
        <div className="size-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="size-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses available</h3>
        <p className="text-sm text-gray-500">Courses added by teachers will appear here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {courses.map((course) => (
        <Card key={course.courseId} className="p-5 hover:shadow-md transition-shadow border border-gray-100">
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 line-clamp-2">
                {course.title}
              </h3>

              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                  <BookOpen className="size-3" />
                  {course.subject.name}
                </span>
                {course.teachingMode && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <Globe className="size-3" />
                    {MODE_LABELS[course.teachingMode] || course.teachingMode}
                  </span>
                )}
              </div>

              {course.description && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {course.description}
                </p>
              )}

              <div className="flex items-center gap-3 mt-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <User className="size-3.5" />
                  {course.teacher.firstName} {course.teacher.lastName}
                </span>
              </div>

              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                {course.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {course.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="size-3" />
                  {course.enrollmentCount} enrolled
                  {course.maxStudents ? ` / ${course.maxStudents} max` : ""}
                </span>
              </div>
            </div>

          </div>
        </Card>
      ))}
    </div>
  );
}
