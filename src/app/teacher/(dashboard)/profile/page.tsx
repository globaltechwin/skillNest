import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TeacherProfileForm } from "./TeacherProfileForm";

export default async function TeacherProfilePage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, firstName: true, lastName: true, role: true },
  });

  if (!user || user.role !== "TEACHER") {
    redirect("/login");
  }

  // Get Clerk user profile image
  const client = await clerkClient();
  const clerkUser = await client.users.getUser(clerkUserId);
  const profileImageUrl = clerkUser.imageUrl || null;

  const subjects = await prisma.subject.findMany({
    orderBy: { name: "asc" },
  });

  // Get existing profile if editing
  const existingProfile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    include: {
      subjects: {
        include: { subject: true },
      },
      availability: true,
      qualifications: true,
    },
  });

  const initialData = existingProfile
    ? {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: existingProfile.phone || "",
        gender: existingProfile.gender || "",
        location: existingProfile.location || "",
        bio: existingProfile.bio || "",
        teachingApproach: existingProfile.teachingApproach || "",
        teachingMode: existingProfile.teachingMode,
        offlineLocation: existingProfile.offlineLocation || "",
        yearsOfExperience: existingProfile.yearsOfExperience,
        languages: existingProfile.languages || "",
        teachingLevels: existingProfile.teachingLevels || "",
        subjectIds: existingProfile.subjects.map((s) => s.subjectId),
        qualifications: existingProfile.qualifications.map((q) => ({
          title: q.title,
          institution: q.institution || "",
          year: q.year,
        })),
        availability: [
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
          "SUNDAY",
        ].map((day) => {
          const existing = existingProfile.availability.find(
            (a) => a.day === day
          );
          return {
            day,
            enabled: !!existing,
            startTime: existing?.startTime || "09:00",
            endTime: existing?.endTime || "17:00",
          };
        }),
      }
    : undefined;

  return (
    <TeacherProfileForm
      subjects={subjects}
      initialData={initialData}
      isEditing={!!existingProfile}
      profileImageUrl={profileImageUrl}
      profilePhotoUrl={existingProfile?.profilePhotoUrl || null}
    />
  );
}
