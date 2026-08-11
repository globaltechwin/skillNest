import { StudentsClient } from "./StudentsClient";

export default function TeacherStudentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          My Students
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage enrollment requests and view your students
        </p>
      </div>

      <StudentsClient />
    </div>
  );
}
