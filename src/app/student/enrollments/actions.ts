"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export type EnrollmentStatusResult =
  | { status: "NONE" }
  | { status: "PENDING"; enrollmentId: string }
  | { status: "ACCEPTED"; enrollmentId: string }
  | { status: "REJECTED"; enrollmentId: string; rejectionReason: string | null }
  | { status: "CANCELLED"; enrollmentId: string };

export type MyCourseItem = {
  enrollmentId: string;
  enrolledAt: Date;
  courseId: string;
  courseTitle: string;
  subject: { name: string };
  teacher: { firstName: string | null; lastName: string | null };
  teachingMode: string | null;
  location: string | null;
  courseStatus: string;
  assignmentCount: number;
};

export type EnrollmentActionResult =
  | { success: true }
  | { success: false; error: string };

async function getAuthenticatedStudent() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, role: true, firstName: true, lastName: true },
  });
  if (!user || user.role !== "STUDENT") return null;

  return user;
}

export async function getEnrollmentStatus(
  courseId: string
): Promise<EnrollmentStatusResult> {
  const student = await getAuthenticatedStudent();
  if (!student) return { status: "NONE" };

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      courseId_studentUserId: {
        courseId,
        studentUserId: student.id,
      },
    },
    select: { id: true, status: true, rejectionReason: true },
  });

  if (!enrollment) return { status: "NONE" };

  switch (enrollment.status) {
    case "PENDING":
      return { status: "PENDING", enrollmentId: enrollment.id };
    case "ACCEPTED":
      return { status: "ACCEPTED", enrollmentId: enrollment.id };
    case "REJECTED":
      return {
        status: "REJECTED",
        enrollmentId: enrollment.id,
        rejectionReason: enrollment.rejectionReason,
      };
    case "CANCELLED":
      return { status: "CANCELLED", enrollmentId: enrollment.id };
    default:
      return { status: "NONE" };
  }
}

export async function requestEnrollment(
  courseId: string
): Promise<EnrollmentActionResult> {
  const student = await getAuthenticatedStudent();
  if (!student) {
    return { success: false, error: "You must be logged in as a student." };
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, status: true, title: true, teacherProfile: { select: { user: { select: { id: true } } } } },
  });

  if (!course) {
    return { success: false, error: "Course not found." };
  }

  if (course.status !== "PUBLISHED") {
    return { success: false, error: "This course is not currently accepting enrollments." };
  }

  const existing = await prisma.courseEnrollment.findUnique({
    where: {
      courseId_studentUserId: {
        courseId,
        studentUserId: student.id,
      },
    },
  });

  if (existing) {
    if (existing.status === "ACCEPTED") {
      return { success: false, error: "You are already enrolled in this course." };
    }
    if (existing.status === "PENDING") {
      return { success: false, error: "Your request is already pending." };
    }
    if (existing.status === "REJECTED" || existing.status === "CANCELLED") {
      await prisma.courseEnrollment.update({
        where: { id: existing.id },
        data: {
          status: "PENDING",
          requestedAt: new Date(),
          respondedAt: null,
          rejectionReason: null,
        },
      });
      return { success: true };
    }
  }

  await prisma.courseEnrollment.create({
    data: {
      courseId,
      studentUserId: student.id,
      status: "PENDING",
    },
  });

  const studentName = `${student.firstName || ""} ${student.lastName || ""}`.trim() || "A student";
  const { notifyEnrollmentRequested } = await import("@/lib/notifications");
  await notifyEnrollmentRequested({
    teacherUserId: course.teacherProfile.user.id,
    studentName,
    courseTitle: course.title,
    courseId,
  });

  return { success: true };
}

export async function cancelEnrollmentRequest(
  courseId: string
): Promise<EnrollmentActionResult> {
  const student = await getAuthenticatedStudent();
  if (!student) {
    return { success: false, error: "You must be logged in as a student." };
  }

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      courseId_studentUserId: {
        courseId,
        studentUserId: student.id,
      },
    },
  });

  if (!enrollment) {
    return { success: false, error: "No enrollment request found." };
  }

  if (enrollment.status !== "PENDING") {
    return { success: false, error: "Only pending requests can be cancelled." };
  }

  await prisma.courseEnrollment.update({
    where: { id: enrollment.id },
    data: { status: "CANCELLED" },
  });

  return { success: true };
}

export async function getMyEnrollments(): Promise<MyCourseItem[]> {
  const student = await getAuthenticatedStudent();
  if (!student) return [];

  const enrollments = await prisma.courseEnrollment.findMany({
    where: {
      studentUserId: student.id,
      status: "ACCEPTED",
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          status: true,
          teachingMode: true,
          location: true,
          subject: { select: { name: true } },
          teacherProfile: {
            select: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const enrollmentsWithCount = await Promise.all(
    enrollments.map(async (e) => {
      const assignmentCount = await prisma.assignment.count({
        where: { courseId: e.courseId, status: "PUBLISHED" },
      });
      return {
        enrollmentId: e.id,
        enrolledAt: e.createdAt,
        courseId: e.course.id,
        courseTitle: e.course.title,
        subject: e.course.subject,
        teacher: e.course.teacherProfile.user,
        teachingMode: e.course.teachingMode,
        location: e.course.location,
        courseStatus: e.course.status,
        assignmentCount,
      };
    })
  );

  return enrollmentsWithCount;
}
