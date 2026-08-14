"use server";

import { auth } from "@/lib/auth/custom";
import { prisma } from "@/lib/prisma";

export type StudentProfileData = {
  firstName: string;
  lastName: string;
  email: string;
};

export async function getStudentProfile(): Promise<StudentProfileData | null> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  if (!user) return null;

  return {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email,
  };
}

export async function updateStudentProfile(data: {
  firstName: string;
  lastName?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { success: false, error: "Not authenticated." };
  }

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "STUDENT") {
    return { success: false, error: "Unauthorized." };
  }

  if (!data.firstName || data.firstName.trim().length < 1) {
    return { success: false, error: "First name is required." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      firstName: data.firstName.trim(),
      lastName: data.lastName?.trim() || null,
    },
  });

  return { success: true };
}
