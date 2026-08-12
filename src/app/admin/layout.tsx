import { auth } from "@/lib/auth/custom";
import { redirect } from "next/navigation";
import {
  DashboardSidebar,
  type NavItem,
} from "@/components/dashboard/DashboardSidebar";
import { MobileNav } from "@/components/dashboard/MobileNav";
import { prisma } from "@/lib/prisma";

const navItems: NavItem[] = [
  { label: "Overview", href: "/admin", icon: "LayoutDashboard" },
  { label: "Teachers", href: "/admin/teachers", icon: "Users" },
  { label: "Students", href: "/admin/students", icon: "User" },
  { label: "Courses", href: "/admin/courses", icon: "BookOpen" },
  { label: "Reviews", href: "/admin/reviews", icon: "Star" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { role: true, firstName: true },
  });

  if (!user || user.role !== "ADMIN") {
    redirect(user?.role === "TEACHER" ? "/teacher" : "/student");
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar
        navItems={navItems}
        firstName={user.firstName}
        roleLabel="Admin"
        roleColor="text-primary"
      />
      <MobileNav
        navItems={navItems}
        firstName={user.firstName}
        roleLabel="Admin"
      />
      <main className="lg:ml-64">
        <header className="border-b border-border bg-card sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Manage teachers, students, courses and platform
              </p>
            </div>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
