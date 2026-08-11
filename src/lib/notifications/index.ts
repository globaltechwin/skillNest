import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  return prisma.notification.create({
    data: { userId, type, title, message, link: link || null },
  });
}

export async function createBulkNotifications({
  userIds,
  type,
  title,
  message,
  link,
}: {
  userIds: string[];
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}) {
  if (userIds.length === 0) return;
  return prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type,
      title,
      message,
      link: link || null,
    })),
  });
}

export async function notifyNewMessage({
  recipientUserId,
  senderName,
  conversationId,
  recipientRole,
}: {
  recipientUserId: string;
  senderName: string;
  conversationId: string;
  recipientRole: "STUDENT" | "TEACHER";
}) {
  const link =
    recipientRole === "STUDENT"
      ? `/student/messages/${conversationId}`
      : `/teacher/messages/${conversationId}`;

  return createNotification({
    userId: recipientUserId,
    type: "NEW_MESSAGE",
    title: `New message from ${senderName}`,
    message: `You have a new message from ${senderName}.`,
    link,
  });
}

export async function notifyEnrollmentRequested({
  teacherUserId,
  studentName,
  courseTitle,
  courseId,
}: {
  teacherUserId: string;
  studentName: string;
  courseTitle: string;
  courseId: string;
}) {
  return createNotification({
    userId: teacherUserId,
    type: "NEW_ENROLLMENT_REQUEST",
    title: "New enrollment request",
    message: `${studentName} requested to join ${courseTitle}.`,
    link: `/teacher/students`,
  });
}

export async function notifyEnrollmentAccepted({
  studentUserId,
  courseTitle,
  courseId,
}: {
  studentUserId: string;
  courseTitle: string;
  courseId: string;
}) {
  return createNotification({
    userId: studentUserId,
    type: "ENROLLMENT_ACCEPTED",
    title: "Enrollment accepted",
    message: `Your enrollment request for ${courseTitle} has been accepted.`,
    link: `/student/courses/${courseId}`,
  });
}

export async function notifyEnrollmentRejected({
  studentUserId,
  courseTitle,
  courseId,
  teacherProfileId,
}: {
  studentUserId: string;
  courseTitle: string;
  courseId: string;
  teacherProfileId: string;
}) {
  return createNotification({
    userId: studentUserId,
    type: "ENROLLMENT_REJECTED",
    title: "Enrollment request rejected",
    message: `Your enrollment request for ${courseTitle} was rejected.`,
    link: `/student/teachers/${teacherProfileId}/courses/${courseId}`,
  });
}

export async function notifyNewAssignment({
  studentUserIds,
  courseTitle,
  assignmentId,
}: {
  studentUserIds: string[];
  courseTitle: string;
  assignmentId: string;
}) {
  return createBulkNotifications({
    userIds: studentUserIds,
    type: "NEW_ASSIGNMENT",
    title: "New assignment",
    message: `A new assignment has been posted for ${courseTitle}.`,
    link: `/student/assignments/${assignmentId}`,
  });
}

export async function notifyAssignmentGraded({
  studentUserId,
  assignmentTitle,
  assignmentId,
}: {
  studentUserId: string;
  assignmentTitle: string;
  assignmentId: string;
}) {
  return createNotification({
    userId: studentUserId,
    type: "ASSIGNMENT_GRADED",
    title: "Assignment graded",
    message: `Your submission for "${assignmentTitle}" has been graded.`,
    link: `/student/assignments/${assignmentId}`,
  });
}

export async function notifyClassScheduled({
  studentUserIds,
  courseTitle,
  classId,
  startTime,
}: {
  studentUserIds: string[];
  courseTitle: string;
  classId: string;
  startTime: Date;
}) {
  const dateStr = new Date(startTime).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
  });
  const timeStr = new Date(startTime).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return createBulkNotifications({
    userIds: studentUserIds,
    type: "CLASS_SCHEDULED",
    title: "New class scheduled",
    message: `A new class for ${courseTitle} has been scheduled for ${dateStr} at ${timeStr}.`,
    link: `/student/classes/${classId}`,
  });
}

export async function notifyClassUpdated({
  studentUserIds,
  courseTitle,
  classId,
}: {
  studentUserIds: string[];
  courseTitle: string;
  classId: string;
}) {
  return createBulkNotifications({
    userIds: studentUserIds,
    type: "CLASS_UPDATED",
    title: "Class updated",
    message: `Your upcoming ${courseTitle} class has been updated.`,
    link: `/student/classes/${classId}`,
  });
}

export async function notifyClassCancelled({
  studentUserIds,
  courseTitle,
  classId,
}: {
  studentUserIds: string[];
  courseTitle: string;
  classId: string;
}) {
  return createBulkNotifications({
    userIds: studentUserIds,
    type: "CLASS_CANCELLED",
    title: "Class cancelled",
    message: `Your upcoming ${courseTitle} class has been cancelled.`,
    link: `/student/classes/${classId}`,
  });
}
