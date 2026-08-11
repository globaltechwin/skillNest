import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true },
  });

  if (!user || user.role !== "TEACHER") {
    redirect(user?.role === "ADMIN" ? "/admin" : "/student");
  }

  return <>{children}</>;
}
