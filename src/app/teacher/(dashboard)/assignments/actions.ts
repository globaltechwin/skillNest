"use server";

import { prisma } from "@/lib/prisma";
import {
  assignmentSchema,
  gradeSchema,
  type AssignmentInput,
  type GradeInput,
} from "@/lib/validations/teacher";
import { requireApprovedTeacher } from "@/lib/auth/teacher";

export type AssignmentListItem = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  maxMarks: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  course: { id: string; title: string; subject: { name: string } };
  _count: { submissions: number };
};

export type AssignmentDetail = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  maxMarks: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  course: { id: string; title: string; subject: { name: string } };
};

export type SubmissionListItem = {
  id: string;
  content: string | null;
  submittedAt: Date | null;
  status: string;
  marks: number | null;
  feedback: string | null;
  studentUser: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
};

export type AssignmentActionResult =
  | { success: true; assignmentId: string }
  | { success: false; error: string };

export type GradeActionResult =
  | { success: true }
  | { success: false; error: string };

export async function getTeacherAssignments(): Promise<AssignmentListItem[]> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const assignments = await prisma.assignment.findMany({
    where: {
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
      _count: { select: { submissions: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return assignments.map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    dueDate: a.dueDate,
    maxMarks: a.maxMarks,
    status: a.status,
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
    course: a.course,
    _count: { submissions: a._count.submissions },
  }));
}

export async function getAssignmentForEdit(
  assignmentId: string
): Promise<{ id: string; title: string; description: string | null; dueDate: Date | null; maxMarks: number | null; status: string; createdAt: Date; updatedAt: Date; course: { id: string; title: string } } | null> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      course: { teacherProfileId: profile.id },
    },
    include: {
      course: {
        select: { id: true, title: true },
      },
    },
  });

  if (!assignment) return null;

  return {
    id: assignment.id,
    title: assignment.title,
    description: assignment.description,
    dueDate: assignment.dueDate,
    maxMarks: assignment.maxMarks,
    status: assignment.status,
    createdAt: assignment.createdAt,
    updatedAt: assignment.updatedAt,
    course: assignment.course,
  };
}

export async function getTeacherCoursesForAssignments() {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  return prisma.course.findMany({
    where: {
      teacherProfileId: profile.id,
      status: { in: ["PUBLISHED", "DRAFT"] },
    },
    select: { id: true, title: true, status: true },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createAssignment(
  data: AssignmentInput
): Promise<AssignmentActionResult> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const result = assignmentSchema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid assignment data.";
    return { success: false, error: firstError };
  }

  const validated = result.data;

  const course = await prisma.course.findFirst({
    where: { id: validated.courseId, teacherProfileId: profile.id },
  });
  if (!course) {
    return { success: false, error: "Course not found or you do not have permission." };
  }

  const assignment = await prisma.assignment.create({
    data: {
      courseId: validated.courseId,
      title: validated.title,
      description: validated.description || null,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
      maxMarks: validated.maxMarks || null,
      status: "DRAFT",
    },
  });

  return { success: true, assignmentId: assignment.id };
}

export async function updateAssignment(
  assignmentId: string,
  data: AssignmentInput
): Promise<AssignmentActionResult> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const existing = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      course: { teacherProfileId: profile.id },
    },
  });
  if (!existing) {
    return { success: false, error: "Assignment not found or you do not have permission." };
  }

  const result = assignmentSchema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid assignment data.";
    return { success: false, error: firstError };
  }

  const validated = result.data;

  const course = await prisma.course.findFirst({
    where: { id: validated.courseId, teacherProfileId: profile.id },
  });
  if (!course) {
    return { success: false, error: "Course not found or you do not have permission." };
  }

  await prisma.assignment.update({
    where: { id: assignmentId },
    data: {
      courseId: validated.courseId,
      title: validated.title,
      description: validated.description || null,
      dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
      maxMarks: validated.maxMarks || null,
    },
  });

  return { success: true, assignmentId };
}

export async function publishAssignment(
  assignmentId: string
): Promise<AssignmentActionResult> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const existing = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      course: { teacherProfileId: profile.id },
    },
  });
  if (!existing) {
    return { success: false, error: "Assignment not found or you do not have permission." };
  }

  if (!existing.title) {
    return { success: false, error: "Assignment must have a title before publishing." };
  }

  await prisma.assignment.update({
    where: { id: assignmentId },
    data: { status: "PUBLISHED" },
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
      const { notifyNewAssignment } = await import("@/lib/notifications");
      await notifyNewAssignment({
        studentUserIds: acceptedStudents.map((s) => s.studentUserId),
        courseTitle: course.title,
        assignmentId,
      });
    }
  }

  return { success: true, assignmentId };
}

export async function archiveAssignment(
  assignmentId: string
): Promise<AssignmentActionResult> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const existing = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      course: { teacherProfileId: profile.id },
    },
  });
  if (!existing) {
    return { success: false, error: "Assignment not found or you do not have permission." };
  }

  await prisma.assignment.update({
    where: { id: assignmentId },
    data: { status: "ARCHIVED" },
  });

  return { success: true, assignmentId };
}

export async function deleteDraftAssignment(
  assignmentId: string
): Promise<AssignmentActionResult> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const existing = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      course: { teacherProfileId: profile.id },
    },
  });
  if (!existing) {
    return { success: false, error: "Assignment not found or you do not have permission." };
  }

  if (existing.status !== "DRAFT") {
    return { success: false, error: "Only draft assignments can be permanently deleted. Archive published assignments instead." };
  }

  await prisma.assignment.delete({
    where: { id: assignmentId },
  });

  return { success: true, assignmentId };
}

export async function getAssignmentSubmissions(
  assignmentId: string
): Promise<{ assignment: AssignmentDetail; submissions: SubmissionListItem[] } | null> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      course: { teacherProfileId: profile.id },
    },
    include: {
      course: {
        select: { id: true, title: true, subject: { select: { name: true } } },
      },
    },
  });

  if (!assignment) return null;

  const submissions = await prisma.assignmentSubmission.findMany({
    where: { assignmentId },
    include: {
      studentUser: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  return {
    assignment: {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      maxMarks: assignment.maxMarks,
      status: assignment.status,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
      course: assignment.course,
    },
    submissions: submissions.map((s) => ({
      id: s.id,
      content: s.content,
      submittedAt: s.submittedAt,
      status: s.status,
      marks: s.marks,
      feedback: s.feedback,
      studentUser: s.studentUser,
    })),
  };
}

export async function getSubmissionForGrading(
  assignmentId: string,
  submissionId: string
): Promise<{
  assignment: AssignmentDetail;
  submission: SubmissionListItem;
} | null> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      course: { teacherProfileId: profile.id },
    },
    include: {
      course: {
        select: { id: true, title: true, subject: { select: { name: true } } },
      },
    },
  });

  if (!assignment) return null;

  const submission = await prisma.assignmentSubmission.findFirst({
    where: { id: submissionId, assignmentId },
    include: {
      studentUser: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  if (!submission) return null;

  return {
    assignment: {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueDate,
      maxMarks: assignment.maxMarks,
      status: assignment.status,
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt,
      course: assignment.course,
    },
    submission: {
      id: submission.id,
      content: submission.content,
      submittedAt: submission.submittedAt,
      status: submission.status,
      marks: submission.marks,
      feedback: submission.feedback,
      studentUser: submission.studentUser,
    },
  };
}

export async function gradeSubmission(
  assignmentId: string,
  submissionId: string,
  data: GradeInput
): Promise<GradeActionResult> {
  const auth = await requireApprovedTeacher();
  const profile = auth.profile;

  const assignment = await prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      course: { teacherProfileId: profile.id },
    },
  });

  if (!assignment) {
    return { success: false, error: "Assignment not found or you do not have permission." };
  }

  const submission = await prisma.assignmentSubmission.findFirst({
    where: { id: submissionId, assignmentId },
  });

  if (!submission) {
    return { success: false, error: "Submission not found." };
  }

  if (submission.status !== "SUBMITTED") {
    return { success: false, error: "Only submitted assignments can be graded." };
  }

  const result = gradeSchema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0]?.message || "Invalid grade data.";
    return { success: false, error: firstError };
  }

  const validated = result.data;

  if (assignment.maxMarks !== null && validated.marks > assignment.maxMarks) {
    return {
      success: false,
      error: `Marks cannot exceed maximum marks (${assignment.maxMarks}).`,
    };
  }

  await prisma.assignmentSubmission.update({
    where: { id: submissionId },
    data: {
      marks: validated.marks,
      feedback: validated.feedback || null,
      status: "GRADED",
    },
  });

  const { notifyAssignmentGraded } = await import("@/lib/notifications");
  await notifyAssignmentGraded({
    studentUserId: submission.studentUserId,
    assignmentTitle: assignment.title,
    assignmentId,
  });

  return { success: true };
}
