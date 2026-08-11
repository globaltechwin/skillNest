import { getTeacherClassesForSelect } from "../actions";
import { ClassForm } from "../ClassForm";

export default async function NewClassPage() {
  const courses = await getTeacherClassesForSelect();

  return <ClassForm courses={courses} mode="create" />;
}
