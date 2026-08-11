import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function TeacherRegisterPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/register");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, role: true },
  });

  if (!user) {
    redirect("/register");
  }

  // If already a teacher, go to profile
  if (user.role === "TEACHER") {
    redirect("/teacher/profile");
  }

  // If student, go to become-a-tutor
  redirect("/become-a-tutor");
}
