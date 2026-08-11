"use server";

import { prisma } from "@/lib/prisma";
import { courseSchema, type CourseInput } from "@/lib/validations/teacher";
import { requireApprovedTeacher } from "@/lib/auth/teacher";

export type CourseListItem = {
  id: string;
  title: string;
  description: string | null;
  teachingLevel: string | null;
  teachingMode: string | null;
  location: string | null;
  maxStudents: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  subject: { name: string };
  _count: { assignments: number; students: number };
};

export type CourseActionResult =
  | { success: true; courseId: string }
  | { success: false; error: string };



export async function getTeacherCourses(): Promise<CourseListItem[]> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const courses = await prisma.course.findMany({
    where: { teacherProfileId: profile.id },
    include: { subject: { select: { name: true } } },
    orderBy: { updatedAt: "desc" },
  });

  const coursesWithCount = await Promise.all(
    courses.map(async (c) => {
      const [assignmentCount, studentCount] = await Promise.all([
        prisma.assignment.count({ where: { courseId: c.id } }),
        prisma.courseEnrollment.count({
          where: { courseId: c.id, status: "ACCEPTED" },
        }),
      ]);
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        teachingLevel: c.teachingLevel,
        teachingMode: c.teachingMode,
        location: c.location,
        maxStudents: c.maxStudents,
        status: c.status,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        subject: c.subject,
        _count: { assignments: assignmentCount, students: studentCount },
      };
    })
  );

  return coursesWithCount;
}

export async function getCourseForEdit(courseId: string) {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const course = await prisma.course.findFirst({
    where: { id: courseId, teacherProfileId: profile.id },
    include: { subject: { select: { id: true, name: true } } },
  });

  if (!course) return null;

  return {
    id: course.id,
    title: course.title,
    description: course.description || "",
    subjectId: course.subjectId,
    subjectName: course.subject.name,
    teachingLevel: course.teachingLevel || "",
    teachingMode: course.teachingMode || "",
    location: course.location || "",
    maxStudents: course.maxStudents,
    status: course.status,
  };
}

export async function createCourse(
  data: CourseInput
): Promise<CourseActionResult> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const result = courseSchema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid course data.";
    return { success: false, error: firstError };
  }

  const validated = result.data;

  const subject = await prisma.subject.findUnique({
    where: { id: validated.subjectId },
  });
  if (!subject) {
    return { success: false, error: "Selected subject does not exist." };
  }

  const course = await prisma.course.create({
    data: {
      teacherProfileId: profile.id,
      subjectId: validated.subjectId,
      title: validated.title,
      description: validated.description || null,
      teachingLevel: validated.teachingLevel || null,
      teachingMode: validated.teachingMode || null,
      location: validated.location || null,
      maxStudents: validated.maxStudents || null,
      status: "DRAFT",
    },
  });

  return { success: true, courseId: course.id };
}

export async function updateCourse(
  courseId: string,
  data: CourseInput
): Promise<CourseActionResult> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const existing = await prisma.course.findFirst({
    where: { id: courseId, teacherProfileId: profile.id },
  });
  if (!existing) {
    return { success: false, error: "Course not found or you do not have permission to edit it." };
  }

  const result = courseSchema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid course data.";
    return { success: false, error: firstError };
  }

  const validated = result.data;

  const subject = await prisma.subject.findUnique({
    where: { id: validated.subjectId },
  });
  if (!subject) {
    return { success: false, error: "Selected subject does not exist." };
  }

  await prisma.course.update({
    where: { id: courseId },
    data: {
      title: validated.title,
      subjectId: validated.subjectId,
      description: validated.description || null,
      teachingLevel: validated.teachingLevel || null,
      teachingMode: validated.teachingMode || null,
      location: validated.location || null,
      maxStudents: validated.maxStudents || null,
    },
  });

  return { success: true, courseId };
}

export async function publishCourse(
  courseId: string
): Promise<CourseActionResult> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const existing = await prisma.course.findFirst({
    where: { id: courseId, teacherProfileId: profile.id },
  });
  if (!existing) {
    return { success: false, error: "Course not found or you do not have permission." };
  }

  if (!existing.title || !existing.subjectId) {
    return { success: false, error: "Course must have a title and subject before publishing." };
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { status: "PUBLISHED" },
  });

  return { success: true, courseId };
}

export async function archiveCourse(
  courseId: string
): Promise<CourseActionResult> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const existing = await prisma.course.findFirst({
    where: { id: courseId, teacherProfileId: profile.id },
  });
  if (!existing) {
    return { success: false, error: "Course not found or you do not have permission." };
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { status: "ARCHIVED" },
  });

  return { success: true, courseId };
}

export async function deleteDraftCourse(
  courseId: string
): Promise<CourseActionResult> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const existing = await prisma.course.findFirst({
    where: { id: courseId, teacherProfileId: profile.id },
  });
  if (!existing) {
    return { success: false, error: "Course not found or you do not have permission." };
  }

  if (existing.status !== "DRAFT") {
    return { success: false, error: "Only draft courses can be permanently deleted. Archive published courses instead." };
  }

  await prisma.course.delete({
    where: { id: courseId },
  });

  return { success: true, courseId };
}
