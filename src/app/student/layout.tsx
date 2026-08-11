import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StudentNavbar } from "@/components/StudentNavbar";
import { StudentFooter } from "@/components/StudentFooter";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true, firstName: true },
  });

  if (!user) {
    redirect("/register");
  }

  if (user.role !== "STUDENT") {
    redirect(user.role === "TEACHER" ? "/teacher" : "/admin");
  }

  return (
    <div className="min-h-screen bg-background">
      <StudentNavbar firstName={user.firstName} />
      <main>
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
      <StudentFooter />
    </div>
  );
}
