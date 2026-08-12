import { NextRequest, NextResponse } from "next/server";
import { loginUser } from "@/lib/auth/crypto-server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const result = await loginUser(email, password);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    // Determine redirect path based on role
    const role = result.session!.role;
    const redirectPath =
      role === "ADMIN" ? "/admin" : role === "TEACHER" ? "/teacher" : "/student";

    return NextResponse.json({ success: true, redirect: redirectPath });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
