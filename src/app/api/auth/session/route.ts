import { NextResponse } from "next/server";
import { getActiveSession, getSessionsByRole } from "@/lib/auth/custom";

export async function GET() {
  try {
    const active = await getActiveSession();
    const all = await getSessionsByRole();

    return NextResponse.json({
      active,
      sessions: {
        student: !!all.student,
        teacher: !!all.teacher,
        admin: !!all.admin,
      },
    });
  } catch (error) {
    console.error("Session check error:", error);
    return NextResponse.json({ active: null, sessions: {} });
  }
}
