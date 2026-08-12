// Node.js-only crypto functions (password hashing, JWT signing)
// These use Node.js 'crypto' module and cannot run in Edge runtime

import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth/custom";

const JWT_SECRET = process.env.AUTH_SECRET || "skillnest-dev-secret-change-in-production";

// ─── Password Hashing ──────────────────────────────────────────────

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
}

// ─── JWT Signing (sync, Node.js only) ──────────────────────────────

function base64urlStr(data: string): string {
  return btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function signJwtServer(payload: SessionPayload): string {
  const header = base64urlStr(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64urlStr(JSON.stringify({ ...payload, iat: Date.now() }));
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${header}.${body}`)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${header}.${body}.${signature}`;
}

// ─── Login & Register ──────────────────────────────────────────────

export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; session?: SessionPayload; error?: string }> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, passwordHash: true },
  });

  if (!user) {
    return { success: false, error: "No account found with this email." };
  }

  if (!user.passwordHash) {
    return { success: false, error: "This account was created externally. Please contact support." };
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return { success: false, error: "Invalid password." };
  }

  const session: SessionPayload = {
    userId: user.id,
    email: user.email,
    role: user.role as "STUDENT" | "TEACHER" | "ADMIN",
    firstName: user.firstName,
    lastName: user.lastName,
  };

  const { createSession } = await import("@/lib/auth/custom");
  await createSession(session);

  return { success: true, session };
}

export async function registerUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string | null,
  role: "STUDENT" | "TEACHER" = "STUDENT"
): Promise<{ success: boolean; session?: SessionPayload; error?: string }> {
  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true },
  });

  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  const passwordHash = hashPassword(password);

  const user = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      clerkUserId: crypto.randomUUID(),
      firstName,
      lastName,
      role,
      passwordHash,
    },
  });

  if (role === "TEACHER") {
    await prisma.teacherProfile.create({
      data: {
        userId: user.id,
        status: "PENDING_VERIFICATION",
      },
    });
  }

  const session: SessionPayload = {
    userId: user.id,
    email: user.email,
    role: sessionRole(role),
    firstName: user.firstName,
    lastName: user.lastName,
  };

  const { createSession } = await import("@/lib/auth/custom");
  await createSession(session);

  return { success: true, session };
}

function sessionRole(role: string): "STUDENT" | "TEACHER" | "ADMIN" {
  if (role === "TEACHER") return "TEACHER";
  if (role === "ADMIN") return "ADMIN";
  return "STUDENT";
}
