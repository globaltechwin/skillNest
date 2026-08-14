"use server";

import { prisma } from "@/lib/prisma";
import { classSchema, type ClassInput } from "@/lib/validations/teacher";
import { requireApprovedTeacher } from "@/lib/auth/teacher";

export type ClassListItem = {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  mode: string;
  location: string | null;
  meetingUrl: string | null;
  status: string;
  createdAt: Date;
  course: { id: string; title: string; subject: { name: string } };
  _count: { enrollments: number };
};

export type ClassActionResult =
  | { success: true; classId: string }
  | { success: false; error: string };

export async function getTeacherClasses(): Promise<ClassListItem[]> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const classes = await prisma.classSession.findMany({
    where: {
      course: { teacherProfileId: profile.id },
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          subject: { select: { name: true } },
          _count: {
            select: { enrollments: { where: { status: "ACCEPTED" } } },
          },
        },
      },
    },
    orderBy: { startTime: "desc" },
  });

  return classes.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    startTime: c.startTime,
    endTime: c.endTime,
    mode: c.mode,
    location: c.location,
    meetingUrl: c.meetingUrl,
    status: c.status,
    createdAt: c.createdAt,
    course: { id: c.course.id, title: c.course.title, subject: c.course.subject },
    _count: { enrollments: c.course._count.enrollments },
  }));
}

export async function getTeacherClass(classId: string): Promise<ClassListItem | null> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const classSession = await prisma.classSession.findFirst({
    where: {
      id: classId,
      course: { teacherProfileId: profile.id },
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          subject: { select: { name: true } },
        },
      },
    },
  });

  if (!classSession) return null;

  const enrollmentCount = await prisma.courseEnrollment.count({
    where: { courseId: classSession.courseId, status: "ACCEPTED" },
  });

  return {
    id: classSession.id,
    title: classSession.title,
    description: classSession.description,
    startTime: classSession.startTime,
    endTime: classSession.endTime,
    mode: classSession.mode,
    location: classSession.location,
    meetingUrl: classSession.meetingUrl,
    status: classSession.status,
    createdAt: classSession.createdAt,
    course: classSession.course,
    _count: { enrollments: enrollmentCount },
  };
}

export async function getTeacherClassesForSelect() {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  return prisma.course.findMany({
    where: {
      teacherProfileId: profile.id,
      status: "PUBLISHED",
    },
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createClass(
  data: ClassInput
): Promise<ClassActionResult> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const result = classSchema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid class data.";
    return { success: false, error: firstError };
  }

  const validated = result.data;

  const course = await prisma.course.findFirst({
    where: { id: validated.courseId, teacherProfileId: profile.id, status: "PUBLISHED" },
  });
  if (!course) {
    return { success: false, error: "Course not found or is not published." };
  }

  const startTime = new Date(validated.startTime);
  const endTime = new Date(validated.endTime);

  if (startTime >= endTime) {
    return { success: false, error: "Start time must be before end time." };
  }

  const overlapping = await prisma.classSession.findFirst({
    where: {
      course: { teacherProfileId: profile.id },
      status: "SCHEDULED",
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });

  if (overlapping) {
    return {
      success: false,
      error: "This time slot overlaps with another scheduled class.",
    };
  }

  const classSession = await prisma.classSession.create({
    data: {
      courseId: validated.courseId,
      title: validated.title,
      description: validated.description || null,
      startTime,
      endTime,
      mode: validated.mode,
      location: validated.location || null,
      meetingUrl: validated.meetingUrl || null,
      status: "SCHEDULED",
    },
  });

  const acceptedStudents = await prisma.courseEnrollment.findMany({
    where: { courseId: validated.courseId, status: "ACCEPTED" },
    select: { studentUserId: true },
  });

  if (acceptedStudents.length > 0) {
    const { notifyClassScheduled } = await import("@/lib/notifications");
    await notifyClassScheduled({
      studentUserIds: acceptedStudents.map((s) => s.studentUserId),
      courseTitle: course.title,
      classId: classSession.id,
      startTime,
    });
  }

  return { success: true, classId: classSession.id };
}

export async function updateClass(
  classId: string,
  data: ClassInput
): Promise<ClassActionResult> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const existing = await prisma.classSession.findFirst({
    where: {
      id: classId,
      course: { teacherProfileId: profile.id },
    },
  });
  if (!existing) {
    return { success: false, error: "Class not found or you do not have permission." };
  }

  if (existing.status !== "SCHEDULED") {
    return { success: false, error: "Only scheduled classes can be edited." };
  }

  const result = classSchema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid class data.";
    return { success: false, error: firstError };
  }

  const validated = result.data;

  const course = await prisma.course.findFirst({
    where: { id: validated.courseId, teacherProfileId: profile.id, status: "PUBLISHED" },
  });
  if (!course) {
    return { success: false, error: "Course not found or is not published." };
  }

  const startTime = new Date(validated.startTime);
  const endTime = new Date(validated.endTime);

  if (startTime >= endTime) {
    return { success: false, error: "Start time must be before end time." };
  }

  const overlapping = await prisma.classSession.findFirst({
    where: {
      id: { not: classId },
      course: { teacherProfileId: profile.id },
      status: "SCHEDULED",
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });

  if (overlapping) {
    return {
      success: false,
      error: "This time slot overlaps with another scheduled class.",
    };
  }

  await prisma.classSession.update({
    where: { id: classId },
    data: {
      courseId: validated.courseId,
      title: validated.title,
      description: validated.description || null,
      startTime,
      endTime,
      mode: validated.mode,
      location: validated.location || null,
      meetingUrl: validated.meetingUrl || null,
    },
  });

  const acceptedStudents = await prisma.courseEnrollment.findMany({
    where: { courseId: validated.courseId, status: "ACCEPTED" },
    select: { studentUserId: true },
  });

  if (acceptedStudents.length > 0) {
    const course = await prisma.course.findUnique({
      where: { id: validated.courseId },
      select: { title: true },
    });
    if (course) {
      const { notifyClassUpdated } = await import("@/lib/notifications");
      await notifyClassUpdated({
        studentUserIds: acceptedStudents.map((s) => s.studentUserId),
        courseTitle: course.title,
        classId,
      });
    }
  }

  return { success: true, classId };
}

export async function cancelClass(
  classId: string
): Promise<ClassActionResult> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const existing = await prisma.classSession.findFirst({
    where: {
      id: classId,
      course: { teacherProfileId: profile.id },
    },
  });
  if (!existing) {
    return { success: false, error: "Class not found or you do not have permission." };
  }

  if (existing.status !== "SCHEDULED") {
    return { success: false, error: "Only scheduled classes can be cancelled." };
  }

  await prisma.classSession.update({
    where: { id: classId },
    data: { status: "CANCELLED" },
  });

  const acceptedStudents = await prisma.courseEnrollment.findMany({
    where: { courseId: existing.courseId, status: "ACCEPTED" },
    select: { studentUserId: true },
  });

  if (acceptedStudents.length > 0) {
    const course = await prisma.course.findUnique({
      where: { id: existing.courseId },
      select: { title: true },
    });
    if (course) {
      const { notifyClassCancelled } = await import("@/lib/notifications");
      await notifyClassCancelled({
        studentUserIds: acceptedStudents.map((s) => s.studentUserId),
        courseTitle: course.title,
        classId,
      });
    }
  }

  return { success: true, classId };
}
