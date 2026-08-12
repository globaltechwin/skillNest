import { getActiveSession } from "@/lib/auth/custom";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function TeacherRegisterPage() {
  const session = await getActiveSession();

  if (!session) {
    redirect("/register");
  }

  const clerkUserId = session.userId;

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
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
