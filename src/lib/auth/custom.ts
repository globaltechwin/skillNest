// Custom multi-session auth system using JWT + cookies
// Supports 3 simultaneous sessions (one per role) in a single browser
//
// This module is split into two parts:
//   - This file: Edge-compatible (JWT verify, session management)
//   - crypto-server.ts: Node.js-only (password hashing, JWT sign)

import { cookies } from "next/headers";

const JWT_SECRET = process.env.AUTH_SECRET || "skillnest-dev-secret-change-in-production";
const SESSION_PREFIX = "sn_session_";
const ACTIVE_SESSION_KEY = "sn_active_role";

export type SessionPayload = {
  userId: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  firstName: string | null;
  lastName: string | null;
};

// ─── Edge-compatible JWT Helpers ───────────────────────────────────

function base64urlStr(data: string): string {
  return btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str: string): string {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function signJwt(payload: SessionPayload): string {
  const header = base64urlStr(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64urlStr(JSON.stringify({ ...payload, iat: Date.now() }));
  // Use Web Crypto API (Edge-compatible) for HMAC signing
  // signJwt is sync but we need async for crypto.subtle — use a pre-computed approach
  // Actually, for signJwt we need Node.js crypto. Keep it in crypto-server.ts
  // This function is re-exported from crypto-server.ts for server-side callers.
  throw new Error("Use signJwt from @/lib/auth/crypto-server for signing");
}

export async function verifyJwt(token: string): Promise<SessionPayload | null> {
  try {
    const [header, body, signature] = token.split(".");
    if (!header || !body || !signature) return null;

    const expected = await hmacSign(`${header}.${body}`);
    if (signature !== expected) return null;

    const payload = JSON.parse(base64urlDecode(body));
    // Token expires after 7 days
    if (Date.now() - payload.iat > 7 * 24 * 60 * 60 * 1000) return null;

    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
  } catch {
    return null;
  }
}

async function hmacSign(data: string): Promise<string> {
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await globalThis.crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return arrayBufferToBase64(sig).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ─── Session Management ────────────────────────────────────────────

function sessionCookieName(role: string): string {
  return `${SESSION_PREFIX}${role.toLowerCase()}`;
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const { signJwtServer } = await import("@/lib/auth/crypto-server");
  const store = await cookies();
  const token = signJwtServer(payload);
  store.set(sessionCookieName(payload.role), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  store.set(ACTIVE_SESSION_KEY, payload.role.toLowerCase(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function getActiveSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const activeRole = store.get(ACTIVE_SESSION_KEY)?.value;
  if (!activeRole) return null;

  const token = store.get(sessionCookieName(activeRole))?.value;
  if (!token) return null;

  return await verifyJwt(token);
}

export async function getSessionsByRole(): Promise<Record<string, SessionPayload | null>> {
  const store = await cookies();
  const roles = ["student", "teacher", "admin"];
  const sessions: Record<string, SessionPayload | null> = {};

  for (const role of roles) {
    const token = store.get(sessionCookieName(role))?.value;
    sessions[role] = token ? await verifyJwt(token) : null;
  }

  return sessions;
}

export async function switchSession(role: "student" | "teacher" | "admin"): Promise<boolean> {
  const store = await cookies();
  const token = store.get(sessionCookieName(role))?.value;
  if (!token || !(await verifyJwt(token))) return false;

  store.set(ACTIVE_SESSION_KEY, role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return true;
}

export async function destroySession(role?: string): Promise<void> {
  const store = await cookies();
  if (role) {
    store.delete(sessionCookieName(role));
    const activeRole = store.get(ACTIVE_SESSION_KEY)?.value;
    if (activeRole === role) {
      store.delete(ACTIVE_SESSION_KEY);
    }
  } else {
    for (const r of ["student", "teacher", "admin"]) {
      store.delete(sessionCookieName(r));
    }
    store.delete(ACTIVE_SESSION_KEY);
  }
}

export async function destroyAllSessions(): Promise<void> {
  const store = await cookies();
  for (const r of ["student", "teacher", "admin"]) {
    store.delete(sessionCookieName(r));
  }
  store.delete(ACTIVE_SESSION_KEY);
}

// ─── Auth Helpers ──────────────────────────────────────────────────

export async function auth(): Promise<SessionPayload> {
  const session = await getActiveSession();
  if (!session) {
    throw new Error("NOT_AUTHENTICATED");
  }
  return session;
}

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getActiveSession();
  if (!session) {
    throw new Error("NOT_AUTHENTICATED");
  }
  return session;
}

export async function requireRole(
  ...roles: Array<"STUDENT" | "TEACHER" | "ADMIN">
): Promise<SessionPayload> {
  const session = await requireAuth();
  if (!roles.includes(session.role)) {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export async function requireAdmin(): Promise<SessionPayload> {
  return requireRole("ADMIN");
}

export async function requireApprovedTeacher(): Promise<SessionPayload & { profileId: string }> {
  const { prisma } = await import("@/lib/prisma");
  const session = await requireRole("TEACHER");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true },
  });
  if (!user) throw new Error("NOT_FOUND");

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true },
  });
  if (!profile || profile.status !== "APPROVED") {
    throw new Error("TEACHER_NOT_APPROVED");
  }

  return { ...session, profileId: profile.id };
}
