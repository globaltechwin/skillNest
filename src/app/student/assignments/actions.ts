"use server";

import { auth } from "@/lib/auth/custom";
import { prisma } from "@/lib/prisma";

export type StudentAssignmentListItem = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  maxMarks: number | null;
  status: string;
  createdAt: Date;
  course: { id: string; title: string; subject: { name: string } };
  teacher: { firstName: string | null; lastName: string | null };
  submission: {
    id: string;
    status: string;
    marks: number | null;
    feedback: string | null;
  } | null;
};

export type StudentAssignmentDetail = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  maxMarks: number | null;
  status: string;
  createdAt: Date;
  course: { id: string; title: string; subject: { name: string } };
  teacher: { firstName: string | null; lastName: string | null };
  submission: {
    id: string;
    content: string | null;
    submittedAt: Date | null;
    status: string;
    marks: number | null;
    feedback: string | null;
  } | null;
};

export type SubmitActionResult =
  | { success: true }
  | { success: false; error: string };

async function getAuthenticatedStudent() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "STUDENT") return null;

  return user;
}

export async function getStudentAssignments(): Promise<StudentAssignmentListItem[]> {
  const student = await getAuthenticatedStudent();
  if (!student) return [];

  const enrolledCourseIds = await prisma.courseEnrollment.findMany({
    where: { studentUserId: student.id, status: "ACCEPTED" },
    select: { courseId: true },
  });

  const courseIds = enrolledCourseIds.map((e) => e.courseId);

  if (courseIds.length === 0) return [];

  const assignments = await prisma.assignment.findMany({
    where: {
      status: "PUBLISHED",
      courseId: { in: courseIds },
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          subject: { select: { name: true } },
          teacherProfile: {
            select: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
      submissions: {
        where: { studentUserId: student.id },
        select: {
          id: true,
          status: true,
          marks: true,
          feedback: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return assignments.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    dueDate: a.dueDate,
    maxMarks: a.maxMarks,
    status: a.status,
    createdAt: a.createdAt,
    course: {
      id: a.course.id,
      title: a.course.title,
      subject: a.course.subject,
    },
    teacher: a.course.teacherProfile.user,
    submission: a.submissions[0] || null,
  }));
}

export async function getStudentAssignment(
  assignmentId: string
): Promise<StudentAssignmentDetail | null> {
  const student = await getAuthenticatedStudent();
  if (!student) return null;

  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      status: "PUBLISHED",
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          subject: { select: { name: true } },
          teacherProfile: {
            select: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
      submissions: {
        where: { studentUserId: student.id },
        select: {
          id: true,
          content: true,
          submittedAt: true,
          status: true,
          marks: true,
          feedback: true,
        },
      },
    },
  });

  if (!assignment) return null;

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      courseId_studentUserId: {
        courseId: assignment.courseId,
        studentUserId: student.id,
      },
    },
    select: { status: true },
  });

  if (!enrollment || enrollment.status !== "ACCEPTED") return null;

  return {
    id: assignment.id,
    title: assignment.title,
    description: assignment.description,
    dueDate: assignment.dueDate,
    maxMarks: assignment.maxMarks,
    status: assignment.status,
    createdAt: assignment.createdAt,
    course: {
      id: assignment.course.id,
      title: assignment.course.title,
      subject: assignment.course.subject,
    },
    teacher: assignment.course.teacherProfile.user,
    submission: assignment.submissions[0] || null,
  };
}

export async function submitAssignment(
  assignmentId: string,
  content: string
): Promise<SubmitActionResult> {
  const student = await getAuthenticatedStudent();
  if (!student) {
    return { success: false, error: "You must be logged in as a student." };
  }

  const assignment = await prisma.assignment.findFirst({
    where: { id: assignmentId, status: "PUBLISHED" },
  });

  if (!assignment) {
    return { success: false, error: "Assignment not found." };
  }

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: {
      courseId_studentUserId: {
        courseId: assignment.courseId,
        studentUserId: student.id,
      },
    },
    select: { status: true },
  });

  if (!enrollment || enrollment.status !== "ACCEPTED") {
    return { success: false, error: "You must be enrolled in this course to submit assignments." };
  }

  if (!content || content.trim().length === 0) {
    return { success: false, error: "Please provide your answer." };
  }

  if (content.length > 10000) {
    return { success: false, error: "Submission must be 10000 characters or less." };
  }

  if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
    return { success: false, error: "This assignment is overdue and no longer accepts submissions." };
  }

  const existing = await prisma.assignmentSubmission.findUnique({
    where: {
      assignmentId_studentUserId: {
        assignmentId,
        studentUserId: student.id,
      },
    },
  });

  if (existing && existing.status === "GRADED") {
    return { success: false, error: "This submission has already been graded and cannot be overwritten." };
  }

  if (existing) {
    await prisma.assignmentSubmission.update({
      where: { id: existing.id },
      data: {
        content: content.trim(),
        status: "SUBMITTED",
        submittedAt: new Date(),
        marks: null,
        feedback: null,
      },
    });
  } else {
    await prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        studentUserId: student.id,
        content: content.trim(),
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
    });
  }

  return { success: true };
}
