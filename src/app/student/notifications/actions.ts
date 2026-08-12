"use server";

import { auth } from "@/lib/auth/custom";
import { prisma } from "@/lib/prisma";

export async function getNotifications(limit = 10) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return [];

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "STUDENT") return [];

  return prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadNotificationCount(): Promise<number> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return 0;

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "STUDENT") return 0;

  return prisma.notification.count({
    where: { userId: user.id, readAt: null },
  });
}

export async function markNotificationAsRead(notificationId: string) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized." };

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "STUDENT") return { success: false, error: "Unauthorized." };

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
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { success: false, error: "Unauthorized." };

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "STUDENT") return { success: false, error: "Unauthorized." };

  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });

  return { success: true };
}
