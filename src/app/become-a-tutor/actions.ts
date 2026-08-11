"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

/**
 * Apply to become a tutor.
 * Changes the user's role from STUDENT to TEACHER and creates a TeacherProfile.
 * This is a one-way operation - the user becomes a teacher.
 */
export async function becomeTutor() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, role: true },
  });

  if (!user) {
    redirect("/register");
  }

  // If already a teacher, redirect to profile
  if (user.role === "TEACHER") {
    redirect("/teacher/profile");
  }

  // Change role to TEACHER and create teacher profile
  await prisma.user.update({
    where: { id: user.id },
    data: { role: "TEACHER" },
  });

  await prisma.teacherProfile.create({
    data: {
      userId: user.id,
      status: "PENDING_VERIFICATION",
    },
  });

  redirect("/teacher/profile");
}
