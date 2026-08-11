import { BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { getTeacherCourses } from "./actions";
import { CourseListClient } from "./CourseListClient";

export default async function TeacherCoursesPage() {
  const courses = await getTeacherCourses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            My Courses
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the courses you offer to students.
          </p>
        </div>
        {courses.length > 0 && (
          <Link href="/teacher/courses/new">
            <Button className="gap-2">
              <Plus className="size-4" />
              Create Course
            </Button>
          </Link>
        )}
      </div>

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Create your first course to let students know what you teach."
        />
      ) : (
        <CourseListClient initialCourses={courses} />
      )}

      {courses.length === 0 && (
        <div className="flex justify-center">
          <Link href="/teacher/courses/new">
            <Button className="gap-2">
              <Plus className="size-4" />
              Create Course
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
