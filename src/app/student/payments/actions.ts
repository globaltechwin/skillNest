"use server";

import { auth } from "@/lib/auth/custom";
import { prisma } from "@/lib/prisma";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export type PaymentResult =
  | { success: true; orderId: string; amount: number; currency: string }
  | { success: false; error: string };

export type PaymentStatusResult = {
  status: "NONE" | "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
  paymentId?: string;
  amount?: number;
  currency?: string;
  createdAt?: Date;
};

export async function createPaymentOrder(
  enrollmentId: string
): Promise<PaymentResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { success: false, error: "You must be logged in." };
  }

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "STUDENT") {
    return { success: false, error: "Only students can make payments." };
  }

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          teacherProfile: {
            select: { hourlyRate: true, currency: true },
          },
        },
      },
    },
  });

  if (!enrollment) {
    return { success: false, error: "Enrollment not found." };
  }

  if (enrollment.studentUserId !== user.id) {
    return { success: false, error: "Unauthorized." };
  }

  const existingPayment = await prisma.payment.findFirst({
    where: {
      enrollmentId,
      status: "COMPLETED",
    },
  });

  if (existingPayment) {
    return { success: false, error: "Payment already completed for this enrollment." };
  }

  const amount = enrollment.course.teacherProfile?.hourlyRate || 500;
  const currency = enrollment.course.teacherProfile?.currency || "INR";

  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt: `enrollment_${enrollmentId}`,
      notes: {
        enrollmentId,
        courseId: enrollment.courseId,
        studentId: user.id,
      },
    });

    await prisma.payment.create({
      data: {
        enrollmentId,
        studentUserId: user.id,
        amount,
        currency,
        status: "PENDING",
        razorpayOrderId: order.id,
        description: `Payment for course: ${enrollment.course.title}`,
      },
    });

    return {
      success: true,
      orderId: order.id,
      amount,
      currency,
    };
  } catch (error) {
    console.error("Razorpay order creation failed:", error);
    return { success: false, error: "Failed to create payment order. Please try again." };
  }
}

export async function verifyPayment(
  enrollmentId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<{ success: boolean; error?: string }> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return { success: false, error: "You must be logged in." };
  }

  const crypto = await import("crypto");
  const expectedSignature = crypto.default
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    return { success: false, error: "Invalid payment signature." };
  }

  const payment = await prisma.payment.findFirst({
    where: {
      enrollmentId,
      razorpayOrderId,
    },
  });

  if (!payment) {
    return { success: false, error: "Payment record not found." };
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "COMPLETED",
      razorpayPaymentId,
      razorpaySignature,
    },
  });

  await prisma.courseEnrollment.update({
    where: { id: enrollmentId },
    data: { status: "ACCEPTED", respondedAt: new Date() },
  });

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: {
        select: {
          title: true,
          teacherProfile: { select: { userId: true } },
        },
      },
    },
  });

  if (enrollment) {
    const { notifyEnrollmentAccepted } = await import("@/lib/notifications");
    await notifyEnrollmentAccepted({
      studentUserId: enrollment.studentUserId,
      courseTitle: enrollment.course.title,
      courseId: enrollment.courseId,
    });
  }

  return { success: true };
}

export async function getPaymentStatus(
  enrollmentId: string
): Promise<PaymentStatusResult> {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return { status: "NONE" };

  const payment = await prisma.payment.findFirst({
    where: { enrollmentId },
    orderBy: { createdAt: "desc" },
  });

  if (!payment) return { status: "NONE" };

  return {
    status: payment.status,
    paymentId: payment.razorpayPaymentId || undefined,
    amount: payment.amount,
    currency: payment.currency,
    createdAt: payment.createdAt,
  };
}

export async function getMyPayments() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) return [];

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "STUDENT") return [];

  const payments = await prisma.payment.findMany({
    where: { studentUserId: user.id },
    include: {
      enrollment: {
        include: {
          course: {
            select: {
              id: true,
              title: true,
              subject: { select: { name: true } },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return payments.map((p) => ({
    id: p.id,
    amount: p.amount,
    currency: p.currency,
    status: p.status,
    description: p.description,
    createdAt: p.createdAt,
    courseTitle: p.enrollment.course.title,
    courseSubject: p.enrollment.course.subject.name,
    courseId: p.enrollment.courseId,
  }));
}
