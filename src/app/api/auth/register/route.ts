import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth/crypto-server";

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, role } = await request.json();

    if (!email || !password || !firstName) {
      return NextResponse.json(
        { error: "Email, password, and first name are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const userRole = role === "TEACHER" ? "TEACHER" : "STUDENT";
    const result = await registerUser(email, password, firstName, lastName || null, userRole);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const redirectPath =
      userRole === "TEACHER" ? "/teacher/apply" : "/student";

    return NextResponse.json({ success: true, redirect: redirectPath });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
