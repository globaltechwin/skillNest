"use server";

import { auth } from "@/lib/auth/custom";
import { prisma } from "@/lib/prisma";

export type LessonData = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  order: number;
  duration: string | null;
};

export async function getCourseLessons(
  courseId: string
): Promise<LessonData[]> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return [];

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user) return [];

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { teacherProfileId: true },
  });
  if (!course) return [];

  if (user.role === "TEACHER") {
    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile || profile.id !== course.teacherProfileId) return [];
  }

  const lessons = await prisma.courseLesson.findMany({
    where: { courseId },
    orderBy: { order: "asc" },
  });

  return lessons;
}

export async function createLesson(
  courseId: string,
  data: {
    title: string;
    description?: string;
    content?: string;
    order?: number;
    duration?: string;
  }
): Promise<{ success: boolean; error?: string; lessonId?: string }> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { success: false, error: "Not authenticated." };
  }

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "TEACHER") {
    return { success: false, error: "Only tutors can create lessons." };
  }

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) {
    return { success: false, error: "Tutor profile not found." };
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { teacherProfileId: true },
  });
  if (!course || course.teacherProfileId !== profile.id) {
    return { success: false, error: "Course not found or unauthorized." };
  }

  if (!data.title || data.title.trim().length < 1) {
    return { success: false, error: "Lesson title is required." };
  }

  const maxOrder = await prisma.courseLesson.aggregate({
    where: { courseId },
    _max: { order: true },
  });

  const lesson = await prisma.courseLesson.create({
    data: {
      courseId,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      content: data.content?.trim() || null,
      order: data.order ?? (maxOrder._max.order ?? 0) + 1,
      duration: data.duration?.trim() || null,
    },
  });

  return { success: true, lessonId: lesson.id };
}

export async function updateLesson(
  lessonId: string,
  data: {
    title?: string;
    description?: string;
    content?: string;
    order?: number;
    duration?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { success: false, error: "Not authenticated." };
  }

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "TEACHER") {
    return { success: false, error: "Only tutors can update lessons." };
  }

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) {
    return { success: false, error: "Tutor profile not found." };
  }

  const lesson = await prisma.courseLesson.findUnique({
    where: { id: lessonId },
    include: { course: { select: { teacherProfileId: true } } },
  });
  if (!lesson || lesson.course.teacherProfileId !== profile.id) {
    return { success: false, error: "Lesson not found or unauthorized." };
  }

  await prisma.courseLesson.update({
    where: { id: lessonId },
    data: {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.description !== undefined && { description: data.description?.trim() || null }),
      ...(data.content !== undefined && { content: data.content?.trim() || null }),
      ...(data.order !== undefined && { order: data.order }),
      ...(data.duration !== undefined && { duration: data.duration?.trim() || null }),
    },
  });

  return { success: true };
}

export async function deleteLesson(
  lessonId: string
): Promise<{ success: boolean; error?: string }> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { success: false, error: "Not authenticated." };
  }

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "TEACHER") {
    return { success: false, error: "Only tutors can delete lessons." };
  }

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!profile) {
    return { success: false, error: "Tutor profile not found." };
  }

  const lesson = await prisma.courseLesson.findUnique({
    where: { id: lessonId },
    include: { course: { select: { teacherProfileId: true } } },
  });
  if (!lesson || lesson.course.teacherProfileId !== profile.id) {
    return { success: false, error: "Lesson not found or unauthorized." };
  }

  await prisma.courseLesson.delete({
    where: { id: lessonId },
  });

  return { success: true };
}
