"use server";

import { auth } from "@/lib/auth/custom";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

/**
 * Ensure the current user has a SkillNest user record.
 * Creates it if it doesn't exist.
 */
export async function ensureStudentUser(): Promise<{ userId: string }> {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
  });

  if (!user) {
    redirect("/register");
  }

  return { userId: user.id };
}
