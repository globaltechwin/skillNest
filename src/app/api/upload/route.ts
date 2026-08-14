import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/custom";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const maxDuration = 30;

const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: clerkUserId },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
      select: { id: true, profilePhotoUrl: true },
    });
    if (!profile) {
      return NextResponse.json({ error: "Tutor profile not found." }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("photo") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const mime = MIME_MAP[ext] || "image/jpeg";
    const base64 = buffer.toString("base64");
    const photoUrl = `data:${mime};base64,${base64}`;

    await prisma.teacherProfile.update({
      where: { id: profile.id },
      data: { profilePhotoUrl: photoUrl },
    });

    return NextResponse.json({ success: true, url: photoUrl });
  } catch (error) {
    console.error("Failed to upload photo:", error);
    return NextResponse.json({ error: "Failed to upload photo." }, { status: 500 });
  }
}
