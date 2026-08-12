import { NextRequest, NextResponse } from "next/server";
import { switchSession } from "@/lib/auth/custom";

export async function POST(request: NextRequest) {
  try {
    const { role } = await request.json();

    if (!role || !["student", "teacher", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 });
    }

    const success = await switchSession(role);

    if (!success) {
      return NextResponse.json(
        { error: `No active session for ${role}. Please log in first.` },
        { status: 400 }
      );
    }

    const redirectPath =
      role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/student";

    return NextResponse.json({ success: true, redirect: redirectPath });
  } catch (error) {
    console.error("Switch session error:", error);
    return NextResponse.json({ error: "Failed to switch session." }, { status: 500 });
  }
}
