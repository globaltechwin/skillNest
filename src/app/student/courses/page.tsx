import { MyCoursesClient } from "./MyCoursesClient";

export default function StudentCoursesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          My Courses
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Courses you are enrolled in
        </p>
      </div>

      <MyCoursesClient />
    </div>
  );
}
