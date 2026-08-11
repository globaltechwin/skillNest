"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export type StudentClassListItem = {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date;
  mode: string;
  location: string | null;
  meetingUrl: string | null;
  status: string;
  course: { id: string; title: string };
  teacher: { firstName: string | null; lastName: string | null };
};

export async function getStudentClasses(): Promise<StudentClassListItem[]> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return [];

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "STUDENT") return [];

  const classes = await prisma.classSession.findMany({
    where: {
      course: {
        enrollments: {
          some: { studentUserId: user.id, status: "ACCEPTED" },
        },
      },
      status: "SCHEDULED",
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          teacherProfile: {
            select: {
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
    },
    orderBy: { startTime: "asc" },
  });

  return classes.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    startTime: c.startTime,
    endTime: c.endTime,
    mode: c.mode,
    location: c.location,
    meetingUrl: c.meetingUrl,
    status: c.status,
    course: { id: c.course.id, title: c.course.title },
    teacher: {
      firstName: c.course.teacherProfile.user.firstName,
      lastName: c.course.teacherProfile.user.lastName,
    },
  }));
}
