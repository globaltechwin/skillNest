import { prisma } from "@/lib/prisma";

export type UserRole = "student" | "teacher" | "admin";

export type TeacherProfileStatus =
  | "PENDING_VERIFICATION"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

export interface SkillNestUser {
  id: string;
  clerkUserId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
}

/**
 * Fetch the SkillNest user record by internal user ID.
 */
export async function getSkillNestUser(
  userId: string
): Promise<SkillNestUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) return null;

  return {
    id: user.id,
    clerkUserId: user.clerkUserId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role.toLowerCase() as UserRole,
  };
}

/**
 * Get the user's role from the database.
 */
export async function getUserRole(
  userId: string
): Promise<UserRole | null> {
  const user = await getSkillNestUser(userId);
  return user?.role ?? null;
}

/**
 * Get the dashboard path for a given role.
 */
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case "teacher":
      return "/teacher";
    case "admin":
      return "/admin";
    case "student":
    default:
      return "/student";
  }
}
