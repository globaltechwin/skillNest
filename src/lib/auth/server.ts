import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSkillNestUser, getDashboardPath, type UserRole } from "@/lib/auth";

/**
 * Get the current authenticated Clerk user.
 * Redirects to login if not authenticated.
 */
export async function requireClerkAuth() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    redirect("/login");
  }
  return clerkUser;
}

/**
 * Get the current authenticated user and their SkillNest profile.
 * Redirects to login if not authenticated.
 * Redirects to register if no SkillNest profile exists.
 */
export async function requireAuth() {
  const clerkUser = await requireClerkAuth();

  const skillnestUser = await getSkillNestUser(clerkUser.id);

  if (!skillnestUser) {
    redirect("/register");
  }

  return { clerkUser, skillnestUser };
}

/**
 * Require the user to have a specific role.
 * Redirects to the appropriate dashboard if the role doesn't match.
 */
export async function requireRole(requiredRole: UserRole) {
  const { clerkUser, skillnestUser } = await requireAuth();

  if (skillnestUser.role !== requiredRole) {
    redirect(getDashboardPath(skillnestUser.role));
  }

  return { clerkUser, skillnestUser };
}

/**
 * Redirect to the appropriate dashboard based on user role.
 */
export function redirectToDashboard(role: UserRole) {
  redirect(getDashboardPath(role));
}
