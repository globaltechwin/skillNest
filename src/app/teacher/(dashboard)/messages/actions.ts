"use server";

import { prisma } from "@/lib/prisma";
import { requireApprovedTeacher } from "@/lib/auth/teacher";
import { messageSchema } from "@/lib/validations/teacher";

export async function getTeacherConversations() {
  const authResult = await requireApprovedTeacher();
  const profile = authResult.profile;

  const conversations = await prisma.conversation.findMany({
    where: { teacherProfileId: profile.id },
    include: {
      studentUser: {
        select: { firstName: true, lastName: true, id: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true },
      },
      _count: {
        select: {
          messages: {
            where: {
              senderUserId: { not: authResult.dbUserId },
              readAt: null,
            },
          },
        },
      },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  return conversations.map((conv) => ({
    ...conv,
    unreadCount: conv._count.messages,
    _count: undefined,
  }));
}

export async function getTeacherConversation(conversationId: string) {
  const authResult = await requireApprovedTeacher();
  const profile = authResult.profile;

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      teacherProfileId: profile.id,
    },
    include: {
      studentUser: {
        select: { firstName: true, lastName: true, id: true },
      },
    },
  });

  return conversation;
}

export async function getTeacherMessages(conversationId: string) {
  const authResult = await requireApprovedTeacher();
  const profile = authResult.profile;

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      teacherProfileId: profile.id,
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

export async function markConversationAsRead(conversationId: string) {
  const authResult = await requireApprovedTeacher();
  const profile = authResult.profile;

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { teacherProfileId: true },
  });
  if (!conversation || conversation.teacherProfileId !== profile.id) return;

  await prisma.message.updateMany({
    where: {
      conversationId,
      senderUserId: { not: authResult.dbUserId },
      readAt: null,
    },
    data: { readAt: new Date() },
  });
}

export async function markAllConversationsAsRead() {
  const authResult = await requireApprovedTeacher();
  const profile = authResult.profile;

  const conversations = await prisma.conversation.findMany({
    where: { teacherProfileId: profile.id },
    select: { id: true },
  });

  await prisma.message.updateMany({
    where: {
      conversationId: { in: conversations.map((c) => c.id) },
      senderUserId: { not: authResult.dbUserId },
      readAt: null,
    },
    data: { readAt: new Date() },
  });
}

export type TeacherMessageResult = {
  success: boolean;
  error?: string;
};

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<TeacherMessageResult> {
  const authResult = await requireApprovedTeacher();
  const profile = authResult.profile;
  const user = await prisma.user.findUnique({
    where: { id: authResult.dbUserId },
    select: { id: true, firstName: true, lastName: true },
  });
  if (!user) return { success: false, error: "User not found." };

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
  if (!conversation || conversation.teacherProfileId !== profile.id) {
    return { success: false, error: "Conversation not found." };
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

  const { notifyNewMessage } = await import("@/lib/notifications");
  await notifyNewMessage({
    recipientUserId: conversation.studentUserId,
    senderName,
    conversationId,
    recipientRole: "STUDENT",
  });

  return { success: true };
}
