import { getTeacherCoursesForAssignments } from "../actions";
import { AssignmentForm } from "../AssignmentForm";

export default async function NewAssignmentPage() {
  const courses = await getTeacherCoursesForAssignments();

  return <AssignmentForm courses={courses} mode="create" />;
}
