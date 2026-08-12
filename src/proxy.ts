import { NextRequest, NextResponse } from "next/server";

type SessionPayload = {
  userId: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  firstName: string | null;
  lastName: string | null;
};

function decodeSession(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    let bodyStr = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (bodyStr.length % 4) bodyStr += "=";
    const payload = JSON.parse(atob(bodyStr));

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

function getSessionForPath(req: NextRequest, pathname: string): SessionPayload | null {
  let cookieRole: string | null = null;
  if (pathname.startsWith("/student")) cookieRole = "student";
  else if (pathname.startsWith("/teacher")) cookieRole = "teacher";
  else if (pathname.startsWith("/admin")) cookieRole = "admin";

  if (cookieRole) {
    const token = req.cookies.get(`sn_session_${cookieRole}`)?.value;
    if (token) return decodeSession(token);
    return null;
  }

  const activeRole = req.cookies.get("sn_active_role")?.value;
  if (!activeRole) return null;

  const token = req.cookies.get(`sn_session_${activeRole}`)?.value;
  if (!token) return null;

  return decodeSession(token);
}

function getSessionFromActiveRole(req: NextRequest): SessionPayload | null {
  const activeRole = req.cookies.get("sn_active_role")?.value;
  if (!activeRole) return null;

  const token = req.cookies.get(`sn_session_${activeRole}`)?.value;
  if (!token) return null;

  return decodeSession(token);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const PUBLIC_PATHS = ["/", "/login", "/register", "/become-a-tutor", "/api/auth"];
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (isPublic) {
    if (pathname === "/login" || pathname === "/register") {
      const session = getSessionFromActiveRole(req);
      const hasRedirectParam = req.nextUrl.searchParams.has("redirect");
      if (session && !hasRedirectParam) {
        const dashPath =
          session.role === "ADMIN" ? "/admin" : session.role === "TEACHER" ? "/teacher" : "/student";
        return NextResponse.redirect(new URL(dashPath, req.url));
      }
    }
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const session = getSessionForPath(req, pathname);

  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isStudent = pathname.startsWith("/student");
  const isTeacher = pathname.startsWith("/teacher");
  const isAdmin = pathname.startsWith("/admin");

  if (isStudent && session.role !== "STUDENT") {
    const dashPath = session.role === "TEACHER" ? "/teacher" : "/admin";
    return NextResponse.redirect(new URL(dashPath, req.url));
  }

  if (isTeacher && session.role !== "TEACHER") {
    const dashPath = session.role === "STUDENT" ? "/student" : "/admin";
    return NextResponse.redirect(new URL(dashPath, req.url));
  }

  if (isAdmin && session.role !== "ADMIN") {
    const dashPath = session.role === "STUDENT" ? "/student" : "/teacher";
    return NextResponse.redirect(new URL(dashPath, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
