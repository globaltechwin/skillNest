import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/custom";
import { CourseForm } from "../../CourseForm";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) notFound();

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "TEACHER") notFound();

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true },
  });
  if (!profile || profile.status !== "APPROVED") notFound();

  const course = await prisma.course.findFirst({
    where: { id: courseId, teacherProfileId: profile.id },
    include: { subject: { select: { id: true, name: true } } },
  });
  if (!course) notFound();

  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <CourseForm
      subjects={subjects}
      course={{
        id: course.id,
        title: course.title,
        description: course.description || "",
        subjectId: course.subjectId,
        teachingLevel: course.teachingLevel || "",
        teachingMode: course.teachingMode || "",
        location: course.location || "",
        maxStudents: course.maxStudents,
        status: course.status,
      }}
      mode="edit"
    />
  );
}
