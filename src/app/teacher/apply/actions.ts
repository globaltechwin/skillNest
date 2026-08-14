"use server";

import { auth } from "@/lib/auth/custom";
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
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "TEACHER") {
    return { success: false, error: "Tutor account required." };
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

  // Merge same-day availability slots (schema allows only one slot per day)
  const daySlots = new Map<string, { startTime: string; endTime: string }>();
  for (const slot of v.availability) {
    const existing = daySlots.get(slot.day);
    if (existing) {
      existing.startTime =
        existing.startTime < slot.startTime ? existing.startTime : slot.startTime;
      existing.endTime =
        existing.endTime > slot.endTime ? existing.endTime : slot.endTime;
    } else {
      daySlots.set(slot.day, { startTime: slot.startTime, endTime: slot.endTime });
    }
  }
  const mergedAvailability = Array.from(daySlots, ([day, times]) => ({
    day: day as DayOfWeek,
    ...times,
  }));

  try {
    await prisma.$transaction(
      async (tx) => {
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
        if (v.subjectIds.length > 0) {
          await tx.teacherSubject.createMany({
            data: v.subjectIds.map((subjectId) => ({
              teacherProfileId: profile.id,
              subjectId,
            })),
          });
        }

        // Create qualifications
        const quals = (v.qualifications || []).filter((q) => q.title);
        if (quals.length > 0) {
          await tx.teacherQualification.createMany({
            data: quals.map((q) => ({
              teacherProfileId: profile.id,
              title: q.title,
              field: q.field || null,
              institution: q.institution || null,
              year: q.year || null,
            })),
          });
        }

        // Create availability
        if (mergedAvailability.length > 0) {
          await tx.teacherAvailability.createMany({
            data: mergedAvailability.map((slot) => ({
              teacherProfileId: profile.id,
              day: slot.day,
              startTime: slot.startTime,
              endTime: slot.endTime,
            })),
          });
        }
      },
      { timeout: 30000 }
    );

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
    where: { id: clerkUserId },
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
