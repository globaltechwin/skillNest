import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/custom";
import { hashPassword } from "@/lib/auth/crypto-server";
import { prisma } from "@/lib/prisma";

// POST /api/auth/set-password — Admin sets password for any user
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const passwordHash = hashPassword(password);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ success: true, email: user.email });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_AUTHENTICATED") {
      return NextResponse.json({ error: "Admin access required." }, { status: 401 });
    }
    console.error("Set password error:", error);
    return NextResponse.json({ error: "Failed to set password." }, { status: 500 });
  }
}
