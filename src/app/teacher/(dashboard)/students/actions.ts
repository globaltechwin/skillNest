"use server";

import { prisma } from "@/lib/prisma";
import { requireApprovedTeacher } from "@/lib/auth/teacher";

export type EnrollmentRequestItem = {
  id: string;
  status: string;
  requestedAt: Date;
  rejectionReason: string | null;
  student: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  course: {
    id: string;
    title: string;
  };
};

export type EnrolledStudentItem = {
  enrollmentId: string;
  enrolledAt: Date;
  student: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  course: {
    id: string;
    title: string;
  };
};

export type EnrollmentActionResult =
  | { success: true }
  | { success: false; error: string };

export async function getEnrollmentRequests(): Promise<EnrollmentRequestItem[]> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const enrollments = await prisma.courseEnrollment.findMany({
    where: {
      status: "PENDING",
      course: { teacherProfileId: profile.id },
    },
    include: {
      studentUser: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      course: {
        select: { id: true, title: true },
      },
    },
    orderBy: { requestedAt: "desc" },
  });

  return enrollments.map((e) => ({
    id: e.id,
    status: e.status,
    requestedAt: e.requestedAt,
    rejectionReason: e.rejectionReason,
    student: e.studentUser,
    course: e.course,
  }));
}

export async function getEnrolledStudents(): Promise<EnrolledStudentItem[]> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const enrollments = await prisma.courseEnrollment.findMany({
    where: {
      status: "ACCEPTED",
      course: { teacherProfileId: profile.id },
    },
    include: {
      studentUser: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      course: {
        select: { id: true, title: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return enrollments.map((e) => ({
    enrollmentId: e.id,
    enrolledAt: e.createdAt,
    student: e.studentUser,
    course: e.course,
  }));
}

export async function acceptEnrollment(
  enrollmentId: string
): Promise<EnrollmentActionResult> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: { select: { teacherProfileId: true, maxStudents: true } } },
  });

  if (!enrollment) {
    return { success: false, error: "Enrollment not found." };
  }

  if (enrollment.course.teacherProfileId !== profile.id) {
    return { success: false, error: "You do not have permission to manage this enrollment." };
  }

  if (enrollment.status !== "PENDING") {
    return { success: false, error: "Only pending requests can be accepted." };
  }

  // Atomic enrollment: count + update inside a transaction to prevent race conditions
  if (enrollment.course.maxStudents) {
    const result = await prisma.$transaction(async (tx) => {
      const acceptedCount = await tx.courseEnrollment.count({
        where: {
          courseId: enrollment.courseId,
          status: "ACCEPTED",
        },
      });

      if (acceptedCount >= enrollment.course.maxStudents!) {
        return { success: false as const, error: "This course has reached its maximum student capacity." };
      }

      await tx.courseEnrollment.update({
        where: { id: enrollmentId },
        data: {
          status: "ACCEPTED",
          respondedAt: new Date(),
        },
      });

      return { success: true as const };
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }
  } else {
    await prisma.courseEnrollment.update({
      where: { id: enrollmentId },
      data: {
        status: "ACCEPTED",
        respondedAt: new Date(),
      },
    });
  }

  const course = await prisma.course.findUnique({
    where: { id: enrollment.courseId },
    select: { title: true },
  });

  if (course) {
    const { notifyEnrollmentAccepted } = await import("@/lib/notifications");
    await notifyEnrollmentAccepted({
      studentUserId: enrollment.studentUserId,
      courseTitle: course.title,
      courseId: enrollment.courseId,
    });
  }

  return { success: true };
}

export async function rejectEnrollment(
  enrollmentId: string,
  reason?: string
): Promise<EnrollmentActionResult> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  if (reason && reason.length > 500) {
    return { success: false, error: "Reason must be 500 characters or less." };
  }

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { id: enrollmentId },
    include: { course: { select: { teacherProfileId: true } } },
  });

  if (!enrollment) {
    return { success: false, error: "Enrollment not found." };
  }

  if (enrollment.course.teacherProfileId !== profile.id) {
    return { success: false, error: "You do not have permission to manage this enrollment." };
  }

  if (enrollment.status !== "PENDING") {
    return { success: false, error: "Only pending requests can be rejected." };
  }

  await prisma.courseEnrollment.update({
    where: { id: enrollmentId },
    data: {
      status: "REJECTED",
      respondedAt: new Date(),
      rejectionReason: reason || null,
    },
  });

  const course = await prisma.course.findUnique({
    where: { id: enrollment.courseId },
    select: { title: true, teacherProfileId: true },
  });

  if (course) {
    const { notifyEnrollmentRejected } = await import("@/lib/notifications");
    await notifyEnrollmentRejected({
      studentUserId: enrollment.studentUserId,
      courseTitle: course.title,
      courseId: enrollment.courseId,
      teacherProfileId: course.teacherProfileId,
    });
  }

  return { success: true };
}
