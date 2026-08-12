"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const ALLOWED_ROLES = ["STUDENT", "TEACHER"] as const;
const COOKIE_NAME = "skillnest_signup_role";
const COOKIE_MAX_AGE = 300; // 5 minutes

/**
 * Select a role for signup and redirect to Clerk signup.
 * Sets an httpOnly cookie AND passes role as URL param for reliability.
 */
export async function selectRole(role: string) {
  if (!ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])) {
    redirect("/register");
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  redirect(`/register/account?role=${role.toLowerCase()}`);
}

/**
 * Delete the signup role cookie.
 */
export async function deleteSignupCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Complete signup: create SkillNest user + optional TeacherProfile.
 */
export async function completeSignup(
  clerkUserId: string,
  email: string,
  firstName: string | null,
  lastName: string | null,
  role: "STUDENT" | "TEACHER"
) {
  let newUser = await prisma.user.findUnique({ where: { id: clerkUserId } });

  if (newUser) {
    newUser = await prisma.user.update({
      where: { id: clerkUserId },
      data: { email, firstName, lastName, role },
    });
  } else {
    // Check if email already taken by another user
    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingByEmail) {
      // Link this Clerk account to the existing user
      newUser = await prisma.user.update({
        where: { email },
        data: { clerkUserId, firstName: firstName || existingByEmail.firstName, lastName: lastName || existingByEmail.lastName, role },
      });
    } else {
      newUser = await prisma.user.create({
        data: { clerkUserId, email, firstName, lastName, role },
      });
    }
  }

  if (role === "TEACHER") {
    const existingProfile = await prisma.teacherProfile.findUnique({
      where: { userId: newUser.id },
    });
    if (!existingProfile) {
      await prisma.teacherProfile.create({
        data: { userId: newUser.id, status: "PENDING_VERIFICATION" },
      });
    }
  }
}
