import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/custom";

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ success: true, redirect: "/login" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed." }, { status: 500 });
  }
}
