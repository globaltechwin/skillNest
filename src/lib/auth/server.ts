import { redirect } from "next/navigation";
import { getSkillNestUser, getDashboardPath, type UserRole } from "@/lib/auth";
import { auth } from "@/lib/auth/custom";

/**
 * Get the current authenticated user.
 * Redirects to login if not authenticated.
 */
export async function requireClerkAuth() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/**
 * Get the current authenticated user and their SkillNest profile.
 * Redirects to login if not authenticated.
 * Redirects to register if no SkillNest profile exists.
 */
export async function requireAuth() {
  const session = await requireClerkAuth();

  const skillnestUser = await getSkillNestUser(session.userId);

  if (!skillnestUser) {
    redirect("/register");
  }

  return { clerkUser: session, skillnestUser };
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
