"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Menu, X, LogOut, Bell, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const navLinks = [
  { label: "Overview", href: "/student" },
  { label: "My Courses", href: "/student/courses" },
  { label: "Classes", href: "/student/classes" },
  { label: "Assignments", href: "/student/assignments" },
  { label: "Teachers", href: "/student/teachers" },
  { label: "Messages", href: "/student/messages" },
];

type Props = {
  firstName: string | null;
};

export function StudentNavbar({ firstName }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { signOut } = useClerk();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/student" className="flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-600">
              <GraduationCap className="size-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-blue-600">SkillNest</span>
              <span className="text-[10px] text-gray-400 block -mt-1">STUDENT</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/student"
                  ? pathname === "/student"
                  : pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-2">
            <NotificationBell role="student" />
            <Link
              href="/student/profile"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                {(firstName || "U").charAt(0).toUpperCase()}
              </div>
              {firstName || "User"}
            </Link>
            <button
              onClick={() => signOut(() => router.push("/login"))}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden size-10 flex items-center justify-center rounded-lg hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 flex flex-col md:hidden">
            <div className="h-16 flex items-center gap-3 px-5 border-b border-gray-100">
              <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                {(firstName || "U").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {firstName || "User"}
                </p>
                <p className="text-[11px] text-gray-400">Student</p>
              </div>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/student"
                    ? pathname === "/student"
                    : pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/student/notifications"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === "/student/notifications" || pathname.startsWith("/student/notifications/")
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <Bell className="size-4" />
                Notifications
              </Link>
              <Link
                href="/student/profile"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === "/student/profile" || pathname.startsWith("/student/profile/")
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <User className="size-4" />
                Profile
              </Link>
            </nav>
            <div className="px-3 py-4 border-t border-gray-100">
              <button
                onClick={() => signOut(() => router.push("/login"))}
                className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                <LogOut className="size-4" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
