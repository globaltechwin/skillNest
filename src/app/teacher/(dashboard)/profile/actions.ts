"use server";

import { auth } from "@/lib/auth/custom";
import { prisma } from "@/lib/prisma";
import {
  teacherProfileSchema,
} from "@/lib/validations/teacher";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

export type TeacherProfileState = {
  success: boolean;
  error: string | null;
  errors: Record<string, string[]> | null;
};

export async function uploadProfilePhoto(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) return { success: false, error: "Not authenticated." };

    const user = await prisma.user.findUnique({
      where: { id: clerkUserId },
      select: { id: true },
    });
    if (!user) return { success: false, error: "User not found." };

    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
      select: { id: true, profilePhotoUrl: true },
    });
    if (!profile) return { success: false, error: "Teacher profile not found." };

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

    return { success: true, url: photoUrl };
  } catch (error) {
    console.error("Failed to upload photo:", error);
    return { success: false, error: "Failed to upload photo." };
  }
}

/**
 * Get existing teacher profile for the current user, or null if none exists.
 */
export async function getTeacherProfile() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "TEACHER") {
    return null;
  }

  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    include: {
      subjects: {
        include: { subject: true },
      },
      availability: true,
      qualifications: true,
    },
  });

  return teacherProfile;
}

/**
 * Get all available subjects.
 */
export async function getSubjects() {
  return prisma.subject.findMany({
    orderBy: { name: "asc" },
  });
}

/**
 * Create or update a teacher profile.
 * This is the main server action for the multi-step profile form.
 */
export async function saveTeacherProfile(
  _prevState: TeacherProfileState,
  formData: FormData
): Promise<TeacherProfileState> {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return {
        success: false,
        error: "You must be signed in to create a profile.",
        errors: null,
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: clerkUserId },
      select: { id: true, role: true },
    });

    if (!user || user.role !== "TEACHER") {
      return {
        success: false,
        error: "Only teachers can create or edit teacher profiles.",
        errors: null,
      };
    }

    // Parse form data
    const rawData = {
      firstName: formData.get("firstName") as string,
      lastName: (formData.get("lastName") as string) || undefined,
      phone: formData.get("phone") as string,
      gender: (formData.get("gender") as string) || undefined,
      location: formData.get("location") as string,
      bio: formData.get("bio") as string,
      teachingApproach: (formData.get("teachingApproach") as string) || undefined,
      teachingMode: formData.get("teachingMode") as "ONLINE" | "OFFLINE" | "BOTH",
      offlineLocation: (formData.get("offlineLocation") as string) || undefined,
      yearsOfExperience: Number(formData.get("yearsOfExperience")),
      languages: (formData.get("languages") as string) || "",
      teachingLevels: (formData.get("teachingLevels") as string) || "",
      subjectIds: (() => { try { return JSON.parse(formData.get("subjectIds") as string || "[]") as string[]; } catch { return []; } })(),
      qualifications: (() => { try { return JSON.parse(formData.get("qualifications") as string || "[]") as Array<{ title: string; institution?: string; year?: number | null; }>; } catch { return []; } })(),
      availability: (() => { try { return JSON.parse(formData.get("availability") as string || "[]") as Array<{ day: string; enabled: boolean; startTime?: string; endTime?: string; }>; } catch { return []; } })(),
    };

    // Validate with Zod
    const result = teacherProfileSchema.safeParse(rawData);

    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      });

      return {
        success: false,
        error: "Please fix the errors below.",
        errors: fieldErrors,
      };
    }

    const data = result.data;

    // Validate subject IDs exist
    const validSubjects = await prisma.subject.findMany({
      where: { id: { in: data.subjectIds } },
    });

    if (validSubjects.length !== data.subjectIds.length) {
      return {
        success: false,
        error: "One or more selected subjects are invalid.",
        errors: null,
      };
    }

    // Check for existing profile
    const existingProfile = await prisma.teacherProfile.findUnique({
      where: { userId: user.id },
      select: { id: true, status: true },
    });

    // Block SUSPENDED teachers from editing
    if (existingProfile?.status === "SUSPENDED") {
      return {
        success: false,
        error: "Your account is suspended. Please contact support.",
        errors: null,
      };
    }

    // Preserve existing status — never let the client change it
    const preservedStatus = existingProfile?.status || "PENDING_VERIFICATION";

    // Update user name
    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName || null,
      },
    });

    // Create or update teacher profile
    const profile = existingProfile
      ? await prisma.teacherProfile.update({
          where: { id: existingProfile.id },
          data: {
            bio: data.bio,
            phone: data.phone,
            gender: data.gender || null,
            location: data.location,
            teachingMode: data.teachingMode,
            yearsOfExperience: data.yearsOfExperience,
            languages: data.languages || null,
            teachingLevels: data.teachingLevels || null,
            teachingApproach: data.teachingApproach || null,
            offlineLocation: data.offlineLocation || null,
            status: preservedStatus,
          },
        })
      : await prisma.teacherProfile.create({
          data: {
            userId: user.id,
            bio: data.bio,
            phone: data.phone,
            gender: data.gender || null,
            location: data.location,
            teachingMode: data.teachingMode,
            yearsOfExperience: data.yearsOfExperience,
            languages: data.languages || null,
            teachingLevels: data.teachingLevels || null,
            teachingApproach: data.teachingApproach || null,
            offlineLocation: data.offlineLocation || null,
            status: "PENDING_VERIFICATION",
          },
        });

    // Replace subjects
    await prisma.teacherSubject.deleteMany({
      where: { teacherProfileId: profile.id },
    });

    await prisma.teacherSubject.createMany({
      data: data.subjectIds.map((subjectId) => ({
        teacherProfileId: profile.id,
        subjectId,
      })),
    });

    // Replace availability
    await prisma.teacherAvailability.deleteMany({
      where: { teacherProfileId: profile.id },
    });

    const enabledAvailability = data.availability.filter(
      (a) => a.enabled && a.startTime && a.endTime
    );

    if (enabledAvailability.length > 0) {
      await prisma.teacherAvailability.createMany({
        data: enabledAvailability.map((a) => ({
          teacherProfileId: profile.id,
          day: a.day as "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY",
          startTime: a.startTime!,
          endTime: a.endTime!,
        })),
      });
    }

    // Replace qualifications
    await prisma.teacherQualification.deleteMany({
      where: { teacherProfileId: profile.id },
    });

    if (data.qualifications.length > 0) {
      await prisma.teacherQualification.createMany({
        data: data.qualifications.map((q) => ({
          teacherProfileId: profile.id,
          title: q.title,
          institution: q.institution || null,
          year: q.year || null,
        })),
      });
    }

    return {
      success: true,
      error: null,
      errors: null,
    };
  } catch (error) {
    console.error("Failed to save teacher profile:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
      errors: null,
    };
  }
}
