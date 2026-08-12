"use server";

import { auth } from "@/lib/auth/custom";
import { prisma } from "@/lib/prisma";
import { messageSchema } from "@/lib/validations/teacher";

export type ConversationActionResult = {
  success: boolean;
  error?: string;
  conversationId?: string;
};

export async function startConversation(
  teacherProfileId: string
): Promise<ConversationActionResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { success: false, error: "You must be signed in." };
  }

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "STUDENT") {
    return { success: false, error: "Only students can start conversations." };
  }

  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { id: teacherProfileId, status: "APPROVED" },
    select: { id: true },
  });
  if (!teacherProfile) {
    return {
      success: false,
      error: "Teacher not found or not currently available.",
    };
  }

  const existing = await prisma.conversation.findUnique({
    where: {
      studentUserId_teacherProfileId: {
        studentUserId: user.id,
        teacherProfileId: teacherProfile.id,
      },
    },
    select: { id: true },
  });

  if (existing) {
    return { success: true, conversationId: existing.id };
  }

  const conversation = await prisma.conversation.create({
    data: {
      studentUserId: user.id,
      teacherProfileId: teacherProfile.id,
    },
    select: { id: true },
  });

  return { success: true, conversationId: conversation.id };
}

export async function getStudentConversations() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return [];

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "STUDENT") return [];

  const conversations = await prisma.conversation.findMany({
    where: { studentUserId: user.id },
    include: {
      teacherProfile: {
        select: {
          id: true,
          user: { select: { firstName: true, lastName: true } },
          profilePhotoUrl: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true },
      },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  const conversationsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderUserId: { not: user.id },
          readAt: null,
        },
      });
      return { ...conv, unreadCount };
    })
  );

  return conversationsWithUnread;
}

export async function getStudentConversation(conversationId: string) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "STUDENT") return null;

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      studentUserId: user.id,
    },
    include: {
      teacherProfile: {
        select: {
          id: true,
          user: { select: { firstName: true, lastName: true } },
          profilePhotoUrl: true,
        },
      },
    },
  });

  return conversation;
}

export async function getStudentMessages(conversationId: string) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return [];

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "STUDENT") return [];

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      studentUserId: user.id,
    },
    select: { id: true },
  });
  if (!conversation) return [];

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: 50,
    select: {
      id: true,
      content: true,
      senderUserId: true,
      createdAt: true,
      readAt: true,
    },
  });

  return messages;
}

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<ConversationActionResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { success: false, error: "You must be signed in." };
  }

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true, firstName: true, lastName: true },
  });
  if (!user) {
    return { success: false, error: "User not found." };
  }

  const validated = messageSchema.safeParse({ content });
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Invalid message.",
    };
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { studentUserId: true, teacherProfileId: true },
  });
  if (!conversation) {
    return { success: false, error: "Conversation not found." };
  }

  // Only students can send messages through this action
  if (user.role !== "STUDENT") {
    return { success: false, error: "Only students can send messages through this action." };
  }

  if (conversation.studentUserId !== user.id) {
    return { success: false, error: "You are not authorized to access this conversation." };
  }

  // Check if teacher is still approved
  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { id: conversation.teacherProfileId },
    select: { status: true },
  });
  if (!teacherProfile || teacherProfile.status !== "APPROVED") {
    return { success: false, error: "This teacher is no longer available." };
  }

  await prisma.message.create({
    data: {
      conversationId,
      senderUserId: user.id,
      content: validated.data.content,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: new Date() },
  });

  const senderName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Someone";

  const teacherProfileForNotify = await prisma.teacherProfile.findUnique({
    where: { id: conversation.teacherProfileId },
    select: { userId: true },
  });
  if (teacherProfileForNotify) {
    const { notifyNewMessage } = await import("@/lib/notifications");
    await notifyNewMessage({
      recipientUserId: teacherProfileForNotify.userId,
      senderName,
      conversationId,
      recipientRole: "TEACHER",
    });
  }

  return { success: true };
}

export async function markConversationAsRead(conversationId: string) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return;

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user) return;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { studentUserId: true, teacherProfileId: true },
  });
  if (!conversation) return;

  // Only students can mark conversations as read through this action
  if (user.role !== "STUDENT") return;
  if (conversation.studentUserId !== user.id) return;

  await prisma.message.updateMany({
    where: {
      conversationId,
      senderUserId: { not: user.id },
      readAt: null,
    },
    data: { readAt: new Date() },
  });
}

export async function getUnreadCount(): Promise<number> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return 0;

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user) return 0;

  if (user.role === "STUDENT") {
    return prisma.message.count({
      where: {
        conversation: { studentUserId: user.id },
        senderUserId: { not: user.id },
        readAt: null,
      },
    });
  }

  if (user.role === "TEACHER") {
    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) return 0;

    return prisma.message.count({
      where: {
        conversation: { teacherProfileId: profile.id },
        senderUserId: { not: user.id },
        readAt: null,
      },
    });
  }

  return 0;
}
