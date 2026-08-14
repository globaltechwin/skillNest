"use server";

import { auth } from "@/lib/auth/custom";
import { prisma } from "@/lib/prisma";

export async function getAdminNotifications(limit = 50) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return [];

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "ADMIN") return [];

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return notifications;
}

export async function getAdminUnreadNotificationCount() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return 0;

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "ADMIN") return 0;

  const count = await prisma.notification.count({
    where: { userId: user.id, readAt: null },
  });

  return count;
}

export async function markAdminNotificationAsRead(notificationId: string) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return;

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "ADMIN") return;

  await prisma.notification.updateMany({
    where: { id: notificationId, userId: user.id },
    data: { readAt: new Date() },
  });
}

export async function markAllAdminNotificationsAsRead() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return;

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "ADMIN") return;

  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
}
