import { notFound } from "next/navigation";
import { getTeacherClass, getTeacherClassesForSelect } from "../../actions";
import { ClassForm } from "../../ClassForm";

function toLocalDateString(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toLocalTimeString(date: Date): string {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

export default async function EditClassPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;

  const [cls, courses] = await Promise.all([
    getTeacherClass(classId),
    getTeacherClassesForSelect(),
  ]);

  if (!cls) notFound();

  return (
    <ClassForm
      courses={courses}
      classData={{
        id: cls.id,
        courseId: cls.course.id,
        title: cls.title,
        description: cls.description || "",
        date: toLocalDateString(cls.startTime),
        startTime: toLocalTimeString(cls.startTime),
        endTime: toLocalTimeString(cls.endTime),
        mode: cls.mode,
        location: cls.location || "",
        meetingUrl: cls.meetingUrl || "",
        status: cls.status,
      }}
      mode="edit"
    />
  );
}
