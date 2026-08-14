"use client";

import { useState } from "react";
import { CreditCard, Loader2, CheckCircle } from "lucide-react";
import { createPaymentOrder, verifyPayment, getPaymentStatus } from "@/app/student/payments/actions";
import { useEffect } from "react";

type Props = {
  enrollmentId: string;
  courseTitle: string;
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PaymentButton({ enrollmentId, courseTitle }: Props) {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getPaymentStatus(enrollmentId).then((status) => {
      setPaymentStatus(status.status);
      setChecking(false);
    });
  }, [enrollmentId]);

  const handlePayment = async () => {
    setLoading(true);
    const result = await createPaymentOrder(enrollmentId);

    if (!result.success) {
      alert(result.error);
      setLoading(false);
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: result.amount * 100,
      currency: result.currency,
      name: "SkillNest Academy",
      description: `Payment for ${courseTitle}`,
      order_id: result.orderId,
      handler: async (response: any) => {
        const verifyResult = await verifyPayment(
          enrollmentId,
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature
        );

        if (verifyResult.success) {
          setPaymentStatus("COMPLETED");
        } else {
          alert(verifyResult.error || "Payment verification failed");
        }
        setLoading(false);
      },
      prefill: {
        name: "",
        email: "",
        contact: "",
      },
      theme: {
        color: "#2563eb",
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response: any) => {
      setPaymentStatus("FAILED");
      setLoading(false);
    });
    rzp.open();
  };

  if (checking) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="size-4 animate-spin" />
        Checking payment status...
      </div>
    );
  }

  if (paymentStatus === "COMPLETED") {
    return (
      <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
        <CheckCircle className="size-4" />
        Payment Completed
      </div>
    );
  }

  if (paymentStatus === "FAILED") {
    return (
      <button
        onClick={handlePayment}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-red-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
        Retry Payment
      </button>
    );
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
      Pay Now
    </button>
  );
}
