import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/register(.*)",
  "/teachers(.*)",
  "/api(.*)",
]);

const isStudentRoute = createRouteMatcher(["/student(.*)"]);
const isTeacherRoute = createRouteMatcher(["/teacher(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  const response = NextResponse.next();
  response.headers.set("x-url", req.nextUrl.pathname);

  // Allow public routes through
  if (isPublicRoute(req)) {
    return response;
  }

  // If not authenticated and trying to access protected route, redirect to login
  if (!userId) {
    const signInUrl = new URL("/login", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // Look up the user's role in the database
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { role: true },
  });

  // If no user record exists, redirect to register to create one
  if (!user) {
    return NextResponse.redirect(new URL("/register", req.url));
  }

  const role = user.role;

  // Role-based route protection
  if (isStudentRoute(req) && role !== "STUDENT") {
    const redirectUrl =
      role === "TEACHER" ? "/teacher" : role === "ADMIN" ? "/admin" : "/login";
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  if (isTeacherRoute(req) && role !== "TEACHER") {
    const redirectUrl =
      role === "STUDENT" ? "/student" : role === "ADMIN" ? "/admin" : "/login";
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  if (isAdminRoute(req) && role !== "ADMIN") {
    const redirectUrl =
      role === "STUDENT" ? "/student" : role === "TEACHER" ? "/teacher" : "/login";
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
