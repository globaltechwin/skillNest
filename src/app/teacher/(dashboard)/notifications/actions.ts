"use server";

import { prisma } from "@/lib/prisma";
import { requireApprovedTeacher } from "@/lib/auth/teacher";

export async function markNotificationAsRead(notificationId: string) {
  const authResult = await requireApprovedTeacher();
  const user = await prisma.user.findUnique({
    where: { id: authResult.dbUserId },
    select: { id: true },
  });
  if (!user) return { success: false, error: "User not found." };

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    select: { userId: true },
  });
  if (!notification) return { success: false, error: "Notification not found." };
  if (notification.userId !== user.id) {
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
  const user = await prisma.user.findUnique({
    where: { id: authResult.dbUserId },
    select: { id: true },
  });
  if (!user) return { success: false, error: "User not found." };

  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  return { success: true };
}
