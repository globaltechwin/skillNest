import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/custom";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const maxDuration = 30;

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
      return NextResponse.json({ error: "Teacher profile not found." }, { status: 404 });
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

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `teacher-${profile.id}-${Date.now()}.${ext}`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadsDir, { recursive: true });
    await writeFile(path.join(uploadsDir, filename), buffer);

    const photoUrl = `/uploads/${filename}`;

    await prisma.teacherProfile.update({
      where: { id: profile.id },
      data: { profilePhotoUrl: photoUrl },
    });

    if (profile.profilePhotoUrl && profile.profilePhotoUrl.startsWith("/uploads/")) {
      const oldPath = path.join(process.cwd(), "public", profile.profilePhotoUrl);
      await unlink(oldPath).catch(() => {});
    }

    return NextResponse.json({ success: true, url: photoUrl });
  } catch (error) {
    console.error("Failed to upload photo:", error);
    return NextResponse.json({ error: "Failed to upload photo." }, { status: 500 });
  }
}
