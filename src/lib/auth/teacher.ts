import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/custom";

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
  const session = await auth();
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
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
