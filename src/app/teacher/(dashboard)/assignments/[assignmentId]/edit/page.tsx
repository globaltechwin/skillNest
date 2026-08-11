import { notFound } from "next/navigation";
import {
  getAssignmentForEdit,
  getTeacherCoursesForAssignments,
} from "../../actions";
import { AssignmentForm } from "../../AssignmentForm";

export default async function EditAssignmentPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;

  const [assignment, courses] = await Promise.all([
    getAssignmentForEdit(assignmentId),
    getTeacherCoursesForAssignments(),
  ]);

  if (!assignment) notFound();

  return (
    <AssignmentForm
      courses={courses}
      assignment={{
        id: assignment.id,
        courseId: assignment.course.id,
        title: assignment.title,
        description: assignment.description || "",
        dueDate: assignment.dueDate
          ? new Date(assignment.dueDate).toISOString()
          : "",
        maxMarks: assignment.maxMarks,
        status: assignment.status,
      }}
      mode="edit"
    />
  );
}
