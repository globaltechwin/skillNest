"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, Bell, User, Home, CreditCard } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const navLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Overview", href: "/student" },
  { label: "Courses", href: "/student/courses" },
  { label: "Tutors", href: "/student/teachers" },
  { label: "Payments", href: "/student/payments", icon: CreditCard },
];

type Props = {
  firstName: string | null;
};

export function StudentNavbar({ firstName }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/student") return pathname === "/student";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="SkillNest"
              width={56}
              height={56}
              className="rounded-full object-contain"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-blue-900 leading-tight">
                SkillNest
              </span>
              <span className="text-[10px] text-gray-500 tracking-wider">
                ACADEMY
              </span>
              <span className="text-[8px] text-orange-500 italic">
                &bull; Explore &bull; Discover &bull; Achieve &bull;
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  link.href === "/"
                    ? pathname === "/"
                      ? "text-blue-900 border-b-2 border-blue-900 pb-1"
                      : "text-gray-700 hover:text-blue-900"
                    : isActive(link.href)
                      ? "text-blue-900 border-b-2 border-blue-900 pb-1"
                      : "text-gray-700 hover:text-blue-900",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-2">
            <NotificationBell role="student" />
            <Link
              href="/student/profile"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                {(firstName || "U").charAt(0).toUpperCase()}
              </div>
              {firstName || "User"}
            </Link>
            <button
              onClick={handleSignOut}
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
            {mobileOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
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
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      link.href === "/"
                        ? pathname === "/"
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50"
                        : isActive(link.href)
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-600 hover:bg-gray-50",
                    )}
                  >
                    {Icon && <Icon className="size-4" />}
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/student/notifications"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === "/student/notifications" ||
                    pathname.startsWith("/student/notifications/")
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50",
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
                  pathname === "/student/profile" ||
                    pathname.startsWith("/student/profile/")
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50",
                )}
              >
                <User className="size-4" />
                Profile
              </Link>
            </nav>
            <div className="px-3 py-4 border-t border-gray-100">
              <button
                onClick={handleSignOut}
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
