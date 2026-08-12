import { authForRole } from "@/lib/auth/custom";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId: clerkUserId } = await authForRole("TEACHER");
  if (!clerkUserId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { role: true },
  });

  if (!user || user.role !== "TEACHER") {
    redirect(user?.role === "ADMIN" ? "/admin" : "/student");
  }

  return <>{children}</>;
}
