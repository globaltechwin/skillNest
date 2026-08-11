import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@/components/SignOutButton";

export default async function StudentProfilePage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  });
  if (!user || user.role !== "STUDENT") redirect("/login");

  return (
    <div className="space-y-6">
      <Link
        href="/student"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Profile
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your account information
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
              {(user.firstName || "S").charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {user.firstName} {user.lastName || ""}
              </h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="border-t border-border pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Role</p>
              <p className="text-sm text-muted-foreground mt-0.5">Student</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Email</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Account Actions
        </h3>
        <SignOutButton variant="outline" />
      </Card>
    </div>
  );
}
