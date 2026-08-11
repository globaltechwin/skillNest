import { AllCoursesClient } from "./AllCoursesClient";

export default function StudentCoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Courses
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Browse all courses available from our teachers
        </p>
      </div>

      <AllCoursesClient />
    </div>
  );
}
