import { authForRole } from "@/lib/auth/custom";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function TeacherApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId: clerkUserId } = await authForRole("TEACHER");

  if (!clerkUserId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });

  if (!user) {
    redirect("/register");
  }

  if (user.role !== "TEACHER") {
    redirect(user.role === "STUDENT" ? "/student" : "/admin");
  }

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    select: { status: true },
  });

  if (profile?.status === "APPROVED") {
    redirect("/teacher");
  }

  return <>{children}</>;
}
