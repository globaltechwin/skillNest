import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  DashboardSidebar,
  type NavItem,
} from "@/components/dashboard/DashboardSidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";

const navItems: NavItem[] = [
  { label: "Overview", href: "/teacher", icon: "LayoutDashboard" },
  { label: "My Classes", href: "/teacher/classes", icon: "Calendar" },
  { label: "My Students", href: "/teacher/students", icon: "Users" },
  { label: "Courses", href: "/teacher/courses", icon: "BookOpen" },
  { label: "Notifications", href: "/teacher/notifications", icon: "Bell" },
  { label: "Profile", href: "/teacher/profile", icon: "User" },
];

export default async function TeacherDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, role: true, firstName: true },
  });
  if (!user) redirect("/register");
  if (user.role !== "TEACHER") {
    redirect(user.role === "STUDENT" ? "/student" : "/admin");
  }

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true },
  });

  if (!profile) redirect("/teacher/apply");
  if (profile.status !== "APPROVED") redirect("/teacher/application-status");

  let notificationCount = 0;
  if (profile.status === "APPROVED") {
    notificationCount = await prisma.notification.count({
      where: { userId: user.id, readAt: null },
    });
  }

  const navItemsWithBadge = navItems.map((item) => {
    if (item.href === "/teacher/notifications") {
      return { ...item, badge: notificationCount > 0 ? notificationCount : undefined };
    }
    return item;
  });

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        navItems={navItemsWithBadge}
        firstName={user.firstName}
        roleLabel="Teacher"
        roleColor="text-orange-600"
      />
      <MobileNav
        navItems={navItemsWithBadge}
        firstName={user.firstName}
        roleLabel="Teacher"
      />
      <main className="lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
