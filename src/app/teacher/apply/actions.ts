"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { type DayOfWeek } from "@prisma/client";
import { teacherApplicationSchema } from "@/lib/validations/teacher";

export type ApplicationData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  location: string;
  languages: string[];
  bio: string;
  yearsOfExperience: number;
  teachingMode: "ONLINE" | "OFFLINE" | "BOTH";
  teachingLevels: string[];
  subjectIds: string[];
  qualifications: { title: string; field: string; institution: string; year: number }[];
  availability: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
};

export type SubmitApplicationResult =
  | { success: true }
  | { success: false; error: string };

export async function submitTeacherApplication(
  data: ApplicationData
): Promise<SubmitApplicationResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { success: false, error: "Authentication required." };
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "TEACHER") {
    return { success: false, error: "Teacher account required." };
  }

  const existingProfile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    select: { status: true },
  });

  if (existingProfile) {
    if (existingProfile.status === "APPROVED") {
      return {
        success: false,
        error: "Your profile is already approved. Please contact support to make changes.",
      };
    }
    if (existingProfile.status === "SUSPENDED") {
      return {
        success: false,
        error: "Your account is suspended. Please contact support.",
      };
    }
  }

  // Validate with Zod
  const validated = teacherApplicationSchema.safeParse(data);
  if (!validated.success) {
    const firstError = validated.error.issues[0]?.message || "Invalid application data.";
    return { success: false, error: firstError };
  }

  const v = validated.data;

  // Validate subject IDs exist in database
  const validSubjects = await prisma.subject.findMany({
    where: { id: { in: v.subjectIds } },
  });

  if (validSubjects.length !== v.subjectIds.length) {
    return { success: false, error: "One or more selected subjects are invalid." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Create or update teacher profile
      const existingProfile = await tx.teacherProfile.findUnique({
        where: { userId: user.id },
      });

      const profileData = {
        bio: v.bio || null,
        phone: v.phone,
        gender: v.gender || null,
        location: v.location,
        teachingMode: v.teachingMode || "BOTH",
        yearsOfExperience: v.yearsOfExperience || 0,
        teachingApproach: null,
        languages: (v.languages || []).join(", "),
        teachingLevels: (v.teachingLevels || []).join(", "),
        status: "PENDING_VERIFICATION" as const,
      };

      let profile;
      if (existingProfile) {
        profile = await tx.teacherProfile.update({
          where: { id: existingProfile.id },
          data: profileData,
        });
        // Clear existing data
        await tx.teacherSubject.deleteMany({ where: { teacherProfileId: profile.id } });
        await tx.teacherQualification.deleteMany({ where: { teacherProfileId: profile.id } });
        await tx.teacherAvailability.deleteMany({ where: { teacherProfileId: profile.id } });
      } else {
        profile = await tx.teacherProfile.create({
          data: { userId: user.id, ...profileData },
        });
      }

      // Create subjects using validated IDs
      for (const subjectId of v.subjectIds) {
        await tx.teacherSubject.create({
          data: { teacherProfileId: profile.id, subjectId },
        });
      }

      // Create qualifications
      for (const qual of v.qualifications || []) {
        if (qual.title) {
          await tx.teacherQualification.create({
            data: {
              teacherProfileId: profile.id,
              title: qual.title,
              field: qual.field || null,
              institution: qual.institution || null,
              year: qual.year || null,
            },
          });
        }
      }

      // Create availability
      for (const avail of v.availability) {
        await tx.teacherAvailability.create({
          data: {
            teacherProfileId: profile.id,
            day: avail.day as DayOfWeek,
            startTime: avail.startTime,
            endTime: avail.endTime,
          },
        });
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Submit application error:", error);
    return {
      success: false,
      error: "Failed to submit application. Please try again.",
    };
  }
}

export async function getExistingApplication(): Promise<ApplicationData | null> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "TEACHER") return null;

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    include: {
      subjects: { include: { subject: true } },
      qualifications: true,
      availability: true,
    },
  });
  if (!profile) return null;

  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: profile.phone || "",
    gender: profile.gender || "",
    location: profile.location || "",
    languages: profile.languages ? profile.languages.split(", ").filter(Boolean) : [],
    bio: profile.bio || "",
    yearsOfExperience: profile.yearsOfExperience,
    teachingMode: profile.teachingMode,
    teachingLevels: profile.teachingLevels ? profile.teachingLevels.split(", ").filter(Boolean) : [],
    subjectIds: profile.subjects.map((ts) => ts.subjectId),
    qualifications: profile.qualifications.map((q) => ({
      title: q.title,
      field: q.field || "",
      institution: q.institution || "",
      year: q.year || 0,
    })),
    availability: profile.availability.map((a) => ({
      day: a.day,
      startTime: a.startTime,
      endTime: a.endTime,
    })),
  };
}

export async function getSubjects(): Promise<{ id: string; name: string }[]> {
  return prisma.subject.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}
