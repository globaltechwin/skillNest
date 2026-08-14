"use server";

import { auth } from "@/lib/auth/custom";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations/teacher";

// ─── Types ─────────────────────────────────────────────────────────

export type ReviewData = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  updatedAt: Date;
  studentFirstName: string | null;
  studentLastName: string | null;
};

export type ReviewWithStudent = ReviewData;

export type ReviewStats = {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
};

export type ReviewActionResult =
  | { success: true; reviewId?: string }
  | { success: false; error: string };

export type ReviewActionResultWithReview =
  | { success: true; review?: { id: string; rating: number; comment: string | null; createdAt: Date; updatedAt: Date } }
  | { success: false; error: string };

export type ReviewRow = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  studentName: string;
  studentEmail: string;
  teacherName: string;
  teacherProfileId: string;
};

export type PaginatedReviews = {
  data: ReviewRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// ─── Helper: Require Admin ─────────────────────────────────────────

async function requireAdmin(): Promise<string> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { role: true },
  });
  if (!user || user.role !== "ADMIN") redirect("/login");

  return clerkUserId;
}

// ─── Helper: Verify Teacher is Approved ────────────────────────────

async function verifyApprovedTeacher(teacherProfileId: string): Promise<boolean> {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { id: teacherProfileId },
    select: { status: true },
  });
  return teacher?.status === "APPROVED";
}

// ─── Helper: Get Rating Distribution ───────────────────────────────

async function getRatingDistribution(
  teacherProfileId: string
): Promise<{ 1: number; 2: number; 3: number; 4: number; 5: number }> {
  const reviews = await prisma.review.findMany({
    where: { teacherProfileId },
    select: { rating: true },
  });

  const dist: { 1: number; 2: number; 3: number; 4: number; 5: number } = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  for (const r of reviews) {
    dist[r.rating as 1 | 2 | 3 | 4 | 5]++;
  }
  return dist;
}

// ─── Public: Get Teacher Reviews ───────────────────────────────────

export async function getTeacherReviews(
  teacherProfileId: string
): Promise<{ reviews: ReviewData[]; stats: ReviewStats }> {
  const isApproved = await verifyApprovedTeacher(teacherProfileId);
  if (!isApproved) {
    return {
      reviews: [],
      stats: { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
    };
  }

  const reviews = await prisma.review.findMany({
    where: { teacherProfileId },
    include: {
      studentUser: {
        select: { firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

  const distribution = await getRatingDistribution(teacherProfileId);

  return {
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      studentFirstName: r.studentUser.firstName,
      studentLastName: r.studentUser.lastName,
    })),
    stats: { averageRating, totalReviews, distribution },
  };
}

// ─── Public: Get Teacher Review Stats ──────────────────────────────

export async function getTeacherReviewStats(
  teacherProfileId: string
): Promise<ReviewStats> {
  const isApproved = await verifyApprovedTeacher(teacherProfileId);
  if (!isApproved) {
    return { averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  }

  const totalReviews = await prisma.review.count({
    where: { teacherProfileId },
  });

  const averageResult = await prisma.review.aggregate({
    where: { teacherProfileId },
    _avg: { rating: true },
  });

  const distribution = await getRatingDistribution(teacherProfileId);

  return {
    averageRating: averageResult._avg.rating ?? 0,
    totalReviews,
    distribution,
  };
}

// ─── Student: Create Review ────────────────────────────────────────

export async function createReview(
  teacherProfileId: string,
  rating: number,
  comment?: string
): Promise<ReviewActionResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { success: false, error: "You must be signed in." };
  }

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "STUDENT") {
    return { success: false, error: "Only students can create reviews." };
  }

  const isApproved = await verifyApprovedTeacher(teacherProfileId);
  if (!isApproved) {
    return { success: false, error: "Tutor not found or not currently available." };
  }

  const enrollment = await prisma.courseEnrollment.findFirst({
    where: {
      studentUserId: user.id,
      status: "ACCEPTED",
      course: {
        teacherProfileId: teacherProfileId,
      },
    },
  });
  if (!enrollment) {
    return {
      success: false,
      error: "You can only review tutors whose courses you have completed.",
    };
  }

  const validated = reviewSchema.safeParse({ rating, comment });
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Invalid review data.",
    };
  }

  const existing = await prisma.review.findUnique({
    where: {
      teacherProfileId_studentUserId: {
        teacherProfileId,
        studentUserId: user.id,
      },
    },
  });
  if (existing) {
    return { success: false, error: "You have already reviewed this tutor." };
  }

  const review = await prisma.review.create({
    data: {
      teacherProfileId,
      studentUserId: user.id,
      rating: validated.data.rating,
      comment: validated.data.comment && validated.data.comment !== "" ? validated.data.comment : null,
    },
    select: { id: true },
  });

  return { success: true, reviewId: review.id };
}

// ─── Student: Update Review ────────────────────────────────────────

export async function updateReview(
  reviewId: string,
  rating: number,
  comment?: string
): Promise<ReviewActionResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { success: false, error: "You must be signed in." };
  }

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "STUDENT") {
    return { success: false, error: "Only students can update reviews." };
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, studentUserId: true },
  });
  if (!review) {
    return { success: false, error: "Review not found." };
  }
  if (review.studentUserId !== user.id) {
    return { success: false, error: "You can only update your own reviews." };
  }

  const validated = reviewSchema.safeParse({ rating, comment });
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.issues[0]?.message || "Invalid review data.",
    };
  }

  await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating: validated.data.rating,
      comment: validated.data.comment && validated.data.comment !== "" ? validated.data.comment : null,
    },
  });

  return { success: true };
}

// ─── Student: Delete Review ────────────────────────────────────────

export async function deleteReview(
  reviewId: string
): Promise<ReviewActionResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { success: false, error: "You must be signed in." };
  }

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "STUDENT") {
    return { success: false, error: "Only students can delete reviews." };
  }

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true, studentUserId: true },
  });
  if (!review) {
    return { success: false, error: "Review not found." };
  }
  if (review.studentUserId !== user.id) {
    return { success: false, error: "You can only delete your own reviews." };
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  return { success: true };
}

// ─── Student: Get My Review ────────────────────────────────────────

export async function getMyReview(
  teacherProfileId: string
): Promise<ReviewActionResultWithReview> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { success: false, error: "You must be signed in." };
  }

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "STUDENT") {
    return { success: false, error: "Only students can access this." };
  }

  const review = await prisma.review.findUnique({
    where: {
      teacherProfileId_studentUserId: {
        teacherProfileId,
        studentUserId: user.id,
      },
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return { success: true, review: review ?? undefined };
}

// ─── Admin: Get Reviews ────────────────────────────────────────────

const PAGE_SIZE = 20;

export async function getAdminReviews(
  search?: string,
  rating?: number,
  page: number = 1
): Promise<PaginatedReviews> {
  await requireAdmin();

  const where: Record<string, unknown> = {};

  if (rating !== undefined && rating !== null) {
    where.rating = rating;
  }

  if (search) {
    const q = search.toLowerCase();
    where.OR = [
      { studentUser: { firstName: { contains: q } } },
      { studentUser: { lastName: { contains: q } } },
      { teacherProfile: { user: { firstName: { contains: q } } } },
      { teacherProfile: { user: { lastName: { contains: q } } } },
    ];
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        studentUser: { select: { firstName: true, lastName: true, email: true } },
        teacherProfile: {
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    data: reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      studentName:
        [r.studentUser.firstName, r.studentUser.lastName].filter(Boolean).join(" ") || "Unknown",
      studentEmail: r.studentUser.email,
      teacherName:
        [r.teacherProfile.user.firstName, r.teacherProfile.user.lastName]
          .filter(Boolean)
          .join(" ") || "Unknown",
      teacherProfileId: r.teacherProfileId,
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

// ─── Admin: Delete Review ──────────────────────────────────────────

export async function deleteAdminReview(
  reviewId: string
): Promise<ReviewActionResult> {
  const adminId = await requireAdmin();

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    select: { id: true },
  });
  if (!review) {
    return { success: false, error: "Review not found." };
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  await prisma.adminAuditLog.create({
    data: {
      adminUserId: adminId,
      action: "REVIEW_DELETED",
      targetType: "Review",
      targetId: reviewId,
      reason: null,
    },
  });

  return { success: true };
}
