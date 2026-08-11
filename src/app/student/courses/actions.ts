"use server";

import { prisma } from "@/lib/prisma";

export type AllCourseItem = {
  courseId: string;
  title: string;
  description: string | null;
  subject: { name: string };
  teacher: {
    firstName: string | null;
    lastName: string | null;
    profilePhotoUrl: string | null;
  };
  teachingMode: string | null;
  location: string | null;
  maxStudents: number | null;
  enrollmentCount: number;
  createdAt: Date;
};

export async function getAllCourses(): Promise<AllCourseItem[]> {
  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    include: {
      subject: { select: { name: true } },
      teacherProfile: {
        select: {
          user: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          profilePhotoUrl: true,
        },
      },
      enrollments: {
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return courses.map((course) => ({
    courseId: course.id,
    title: course.title,
    description: course.description,
    subject: course.subject,
    teacher: {
      firstName: course.teacherProfile.user.firstName,
      lastName: course.teacherProfile.user.lastName,
      profilePhotoUrl: course.teacherProfile.profilePhotoUrl,
    },
    teachingMode: course.teachingMode,
    location: course.location,
    maxStudents: course.maxStudents,
    enrollmentCount: course.enrollments.length,
    createdAt: course.createdAt,
  }));
}
