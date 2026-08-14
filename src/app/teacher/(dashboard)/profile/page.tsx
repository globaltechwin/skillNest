import { auth } from "@/lib/auth/custom";
import { prisma } from "@/lib/prisma";
import { TeacherProfileForm } from "./TeacherProfileForm";

export default async function TeacherProfilePage() {
  const session = await auth();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, firstName: true, lastName: true },
  });
  if (!user) return null;

  const [subjects, existingProfile] = await Promise.all([
    prisma.subject.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.teacherProfile.findUnique({
      where: { userId: user.id },
      include: {
        subjects: {
          include: { subject: true },
        },
        availability: true,
        qualifications: true,
      },
    }),
  ]);

  const profileImageUrl = existingProfile?.profilePhotoUrl || null;

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
