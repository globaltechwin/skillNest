"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 20;

export type TeacherListItem = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profilePhotoUrl: string | null;
  location: string | null;
  bio: string | null;
  teachingMode: string;
  yearsOfExperience: number;
  languages: string | null;
  teachingLevels: string | null;
  subjects: { name: string }[];
};

export type TeacherWithRating = TeacherListItem & {
  averageRating: number | null;
  reviewCount: number;
};

export type TeacherFilters = {
  search?: string;
  subject?: string;
  teachingLevel?: string;
  teachingMode?: string;
  location?: string;
  page?: number;
};

export type TeachersResult = {
  teachers: TeacherListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getTeachers(
  filters: TeacherFilters
): Promise<TeachersResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { teachers: [], total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 0 };
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true },
  });
  if (!user || user.role !== "STUDENT") {
    return { teachers: [], total: 0, page: 1, pageSize: PAGE_SIZE, totalPages: 0 };
  }

  const page = filters.page || 1;
  const skip = (page - 1) * PAGE_SIZE;

  const where: Prisma.TeacherProfileWhereInput = {
    status: "APPROVED",
  };

  if (filters.search) {
    const searchTerm = filters.search.trim();
    where.OR = [
      {
        user: {
          firstName: { contains: searchTerm },
        },
      },
      {
        user: {
          lastName: { contains: searchTerm },
        },
      },
      {
        subjects: {
          some: {
            subject: { name: { contains: searchTerm } },
          },
        },
      },
      {
        location: { contains: searchTerm },
      },
    ];
  }

  if (filters.subject) {
    where.subjects = {
      some: {
        subject: { name: filters.subject },
      },
    };
  }

  if (filters.teachingLevel) {
    where.teachingLevels = { contains: filters.teachingLevel };
  }

  if (filters.teachingMode) {
    where.teachingMode = filters.teachingMode as "ONLINE" | "OFFLINE" | "BOTH";
  }

  if (filters.location) {
    where.location = { contains: filters.location };
  }

  const [profiles, total] = await Promise.all([
    prisma.teacherProfile.findMany({
      where,
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
      orderBy: { updatedAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.teacherProfile.count({ where }),
  ]);

  const teachers: TeacherListItem[] = profiles.map((p) => ({
    id: p.id,
    firstName: p.user.firstName,
    lastName: p.user.lastName,
    profilePhotoUrl: p.profilePhotoUrl,
    location: p.location,
    bio: p.bio,
    teachingMode: p.teachingMode,
    yearsOfExperience: p.yearsOfExperience,
    languages: p.languages,
    teachingLevels: p.teachingLevels,
    subjects: p.subjects.map((s) => ({ name: s.subject.name })),
  }));

  return {
    teachers,
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

export async function getTeachersWithRatings(
  filters: TeacherFilters
): Promise<{ teachers: TeacherWithRating[]; total: number; page: number; pageSize: number; totalPages: number }> {
  const result = await getTeachers(filters);

  const teacherIds = result.teachers.map(t => t.id);

  const reviewStats = await prisma.review.groupBy({
    by: ['teacherProfileId'],
    where: { teacherProfileId: { in: teacherIds } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const statsMap = new Map(reviewStats.map(s => [s.teacherProfileId, {
    averageRating: s._avg.rating,
    reviewCount: s._count.rating,
  }]));

  const teachersWithRatings = result.teachers.map(teacher => ({
    ...teacher,
    averageRating: statsMap.get(teacher.id)?.averageRating ?? null,
    reviewCount: statsMap.get(teacher.id)?.reviewCount ?? 0,
  }));

  return {
    ...result,
    teachers: teachersWithRatings,
  };
}

export async function getSubjects(): Promise<{ name: string }[]> {
  return prisma.subject.findMany({
    orderBy: { name: "asc" },
    select: { name: true },
  });
}

export async function getTeacherProfile(teacherId: string) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { role: true },
  });
  if (!user || user.role !== "STUDENT") return null;

  const profile = await prisma.teacherProfile.findUnique({
    where: { id: teacherId, status: "APPROVED" },
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
      qualifications: true,
      availability: true,
    },
  });

  if (!profile) return null;

  return {
    id: profile.id,
    firstName: profile.user.firstName,
    lastName: profile.user.lastName,
    profilePhotoUrl: profile.profilePhotoUrl,
    bio: profile.bio,
    phone: profile.phone,
    location: profile.location,
    teachingMode: profile.teachingMode,
    yearsOfExperience: profile.yearsOfExperience,
    languages: profile.languages,
    teachingLevels: profile.teachingLevels,
    teachingApproach: profile.teachingApproach,
    subjects: profile.subjects.map((s) => ({ name: s.subject.name })),
    qualifications: profile.qualifications.map((q) => ({
      title: q.title,
      institution: q.institution,
      year: q.year,
    })),
    availability: profile.availability.map((a) => ({
      day: a.day,
      startTime: a.startTime,
      endTime: a.endTime,
    })),
  };
}

export async function getFeaturedTeachers(): Promise<TeacherListItem[]> {
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
    take: 6,
  });

  return profiles.map((p) => ({
    id: p.id,
    firstName: p.user.firstName,
    lastName: p.user.lastName,
    profilePhotoUrl: p.profilePhotoUrl,
    location: p.location,
    bio: p.bio,
    teachingMode: p.teachingMode,
    yearsOfExperience: p.yearsOfExperience,
    languages: p.languages,
    teachingLevels: p.teachingLevels,
    subjects: p.subjects.map((s) => ({ name: s.subject.name })),
  }));
}

export async function getFeaturedTeachersWithRatings(): Promise<TeacherWithRating[]> {
  const teachers = await getFeaturedTeachers();

  const teacherIds = teachers.map(t => t.id);

  const reviewStats = await prisma.review.groupBy({
    by: ['teacherProfileId'],
    where: { teacherProfileId: { in: teacherIds } },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const statsMap = new Map(reviewStats.map(s => [s.teacherProfileId, {
    averageRating: s._avg.rating,
    reviewCount: s._count.rating,
  }]));

  return teachers.map(teacher => ({
    ...teacher,
    averageRating: statsMap.get(teacher.id)?.averageRating ?? null,
    reviewCount: statsMap.get(teacher.id)?.reviewCount ?? 0,
  }));
}

export async function getTeacherPhone(teacherId: string): Promise<string | null> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "STUDENT") return null;

  // Only return phone if student has an accepted enrollment with this teacher
  const enrollment = await prisma.courseEnrollment.findFirst({
    where: {
      studentUserId: user.id,
      status: "ACCEPTED",
      course: { teacherProfileId: teacherId },
    },
    select: { id: true },
  });
  if (!enrollment) return null;

  const profile = await prisma.teacherProfile.findUnique({
    where: { id: teacherId, status: "APPROVED" },
    select: { phone: true },
  });

  return profile?.phone || null;
}
