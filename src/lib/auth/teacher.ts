import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export type TeacherAuthResult = {
  userId: string;
  dbUserId: string;
  clerkUserId: string;
  profile: {
    id: string;
    status: string;
  };
};

export async function requireApprovedTeacher(): Promise<TeacherAuthResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, role: true, clerkUserId: true },
  });

  if (!user || user.role !== "TEACHER") redirect("/login");

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true },
  });

  if (!profile) redirect("/teacher/apply");

  if (profile.status === "SUSPENDED") {
    redirect("/teacher/application-status");
  }

  if (profile.status !== "APPROVED") {
    redirect("/teacher/application-status");
  }

  return { userId: user.id, dbUserId: user.id, clerkUserId: user.clerkUserId, profile };
}