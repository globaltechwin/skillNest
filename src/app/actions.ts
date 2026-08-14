"use server";

import { prisma } from "@/lib/prisma";

export type PublicTeacher = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profilePhotoUrl: string | null;
  yearsOfExperience: number;
  subjects: { name: string }[];
  averageRating: number | null;
  reviewCount: number;
};

export async function getPublicFeaturedTeachers(): Promise<PublicTeacher[]> {
  const profiles = await prisma.teacherProfile.findMany({
    where: { status: "APPROVED" },
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
      subjects: {
        include: { subject: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const teacherIds = profiles.map((p) => p.id);

  const reviewStats = await prisma.review.groupBy({
    by: ["teacherProfileId"],
    where: { teacherProfileId: { in: teacherIds } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const statsMap = new Map(
    reviewStats.map((s) => [
      s.teacherProfileId,
      { averageRating: s._avg.rating, reviewCount: s._count.rating },
    ])
  );

  return profiles.map((p) => ({
    id: p.id,
    firstName: p.user.firstName,
    lastName: p.user.lastName,
    profilePhotoUrl: p.profilePhotoUrl,
    yearsOfExperience: p.yearsOfExperience,
    subjects: p.subjects.map((s) => ({ name: s.subject.name })),
    averageRating: statsMap.get(p.id)?.averageRating ?? null,
    reviewCount: statsMap.get(p.id)?.reviewCount ?? 0,
  }));
}
