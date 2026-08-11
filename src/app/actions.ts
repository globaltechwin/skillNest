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

  console.log("SERVER: Found", profiles.length, "approved teacher profiles");
  for (const p of profiles) {
    console.log("SERVER:", p.user.firstName, p.user.lastName, p.status);
  }

  const teachers: PublicTeacher[] = await Promise.all(
    profiles.map(async (p) => {
      const stats = await prisma.review.aggregate({
        where: { teacherProfileId: p.id },
        _avg: { rating: true },
        _count: { rating: true },
      });
      return {
        id: p.id,
        firstName: p.user.firstName,
        lastName: p.user.lastName,
        profilePhotoUrl: p.profilePhotoUrl,
        yearsOfExperience: p.yearsOfExperience,
        subjects: p.subjects.map((s) => ({ name: s.subject.name })),
        averageRating: stats._avg.rating,
        reviewCount: stats._count.rating,
      };
    })
  );

  return teachers;
}
