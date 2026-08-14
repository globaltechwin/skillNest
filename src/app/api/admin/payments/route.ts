import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authForRole } from "@/lib/auth/custom";

export async function GET() {
  const { userId } = await authForRole("ADMIN");
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payments = await prisma.payment.findMany({
    include: {
      studentUser: {
        select: { firstName: true, lastName: true, email: true },
      },
      enrollment: {
        include: {
          course: {
            select: { title: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    payments: payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      description: p.description,
      createdAt: p.createdAt,
      razorpayPaymentId: p.razorpayPaymentId,
      studentName: `${p.studentUser.firstName || ""} ${p.studentUser.lastName || ""}`.trim() || "Unknown",
      studentEmail: p.studentUser.email,
      courseTitle: p.enrollment.course.title,
    })),
  });
}
