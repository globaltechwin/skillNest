import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(body)
    .digest("hex");

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    const enrollmentId = payment.notes?.enrollmentId;

    if (enrollmentId) {
      await prisma.payment.updateMany({
        where: {
          razorpayOrderId: payment.order_id,
          status: "PENDING",
        },
        data: {
          status: "COMPLETED",
          razorpayPaymentId: payment.id,
        },
      });

      await prisma.courseEnrollment.update({
        where: { id: enrollmentId },
        data: { status: "ACCEPTED", respondedAt: new Date() },
      });
    }
  }

  if (event.event === "payment.failed") {
    const payment = event.payload.payment.entity;
    await prisma.payment.updateMany({
      where: {
        razorpayOrderId: payment.order_id,
      },
      data: {
        status: "FAILED",
      },
    });
  }

  return NextResponse.json({ received: true });
}
