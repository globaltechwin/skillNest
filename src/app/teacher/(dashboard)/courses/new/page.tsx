import { prisma } from "@/lib/prisma";
import { CourseForm } from "../CourseForm";

export default async function NewCoursePage() {
  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return <CourseForm subjects={subjects} mode="create" />;
}
