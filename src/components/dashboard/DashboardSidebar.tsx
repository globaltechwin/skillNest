"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileText,
  Users,
  User,
  Clock,
  MessageSquare,
  Bell,
  Home,
  LogOut,
  CreditCard,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/SignOutButton";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BookOpen,
  Calendar,
  FileText,
  Users,
  User,
  Clock,
  MessageSquare,
  Bell,
  Home,
  CreditCard,
  Star,
};

export type NavItem = {
  label: string;
  href: string;
  icon: string;
  badge?: number;
};

type Props = {
  navItems: NavItem[];
  firstName: string | null;
  roleLabel: string;
  roleColor: string;
};

export function DashboardSidebar({
  navItems,
  firstName,
  roleLabel,
  roleColor,
}: Props) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 border-r border-border bg-card z-50 flex flex-col">
      <Link
        href="/"
        className="h-16 flex items-center gap-3 px-5 border-b border-border hover:bg-muted/50 transition-colors"
      >
        <Image
          src="/logo.png"
          alt="SkillNest"
          width={56}
          height={56}
          className="rounded-lg object-contain"
        />
        <div>
          <span className="text-lg font-bold tracking-tight text-foreground block leading-tight">
            SkillNest
          </span>
          <span
            className={cn(
              "text-[10px] font-medium uppercase tracking-wider",
              roleColor,
            )}
          >
            {roleLabel}
          </span>
        </div>
      </Link>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          // Exact match for root dashboard routes, prefix match for sub-routes
          const isRootRoute =
            item.href === "/teacher" ||
            item.href === "/admin" ||
            item.href === "/student";
          const isActive = isRootRoute
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = iconMap[item.icon];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {Icon && <Icon className="size-4.5" />}
              {item.label}
              {item.badge && item.badge > 0 && (
                <span className="ml-auto size-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {(firstName || "U").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">
              {firstName || "User"}
            </p>
            <p className="text-[11px] text-muted-foreground">{roleLabel}</p>
          </div>
        </div>
        <SignOutButton className="w-full justify-start" />
      </div>
    </aside>
  );
}
