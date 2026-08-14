"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import { getMyPayments } from "./actions";

type PaymentItem = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  createdAt: Date;
  courseTitle: string;
  courseSubject: string;
  courseId: string;
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  COMPLETED: { label: "Completed", color: "text-emerald-600 bg-emerald-50", icon: CheckCircle },
  PENDING: { label: "Pending", color: "text-amber-600 bg-amber-50", icon: Clock },
  FAILED: { label: "Failed", color: "text-red-600 bg-red-50", icon: XCircle },
  REFUNDED: { label: "Refunded", color: "text-blue-600 bg-blue-50", icon: CreditCard },
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyPayments().then((data) => {
      setPayments(data as PaymentItem[]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/student"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="size-4" />
          Back
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Payments</h1>
        <p className="text-sm text-gray-500 mt-1">View your payment history and status</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="size-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No payments yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            When you enroll in a paid course, your payment history will appear here.
          </p>
          <Link
            href="/student/courses"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => {
            const config = statusConfig[payment.status] || statusConfig.PENDING;
            const StatusIcon = config.icon;
            return (
              <div
                key={payment.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <CreditCard className="size-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/student/courses/${payment.courseId}`}
                      className="font-medium text-gray-900 hover:text-blue-600 truncate"
                    >
                      {payment.courseTitle}
                    </Link>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{payment.courseSubject}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {payment.currency} {payment.amount.toFixed(2)}
                  </p>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                    <StatusIcon className="size-3" />
                    {config.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
