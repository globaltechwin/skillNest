"use server";

import { prisma } from "@/lib/prisma";
import { requireApprovedTeacher } from "@/lib/auth/teacher";

export async function markNotificationAsRead(notificationId: string) {
  const authResult = await requireApprovedTeacher();

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { userId: true },
  });
  if (!notification) return { success: false, error: "Notification not found." };
  if (notification.userId !== authResult.dbUserId) {
    return { success: false, error: "Unauthorized." };
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });

  return { success: true };
}

export async function markAllNotificationsAsRead() {
  const authResult = await requireApprovedTeacher();

  await prisma.notification.updateMany({
    where: { userId: authResult.dbUserId, readAt: null },
    data: { readAt: new Date() },
  });

  return { success: true };
}
