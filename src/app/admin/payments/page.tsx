"use client";

import { useEffect, useState } from "react";
import { CreditCard, CheckCircle, XCircle, Clock, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";

type PaymentItem = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  description: string | null;
  createdAt: Date;
  razorpayPaymentId: string | null;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
};

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  COMPLETED: { label: "Completed", color: "text-emerald-600 bg-emerald-50", icon: CheckCircle },
  PENDING: { label: "Pending", color: "text-amber-600 bg-amber-50", icon: Clock },
  FAILED: { label: "Failed", color: "text-red-600 bg-red-50", icon: XCircle },
  REFUNDED: { label: "Refunded", color: "text-blue-600 bg-blue-50", icon: CreditCard },
};

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((res) => res.json())
      .then((data) => {
        setPayments(data.payments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = payments.filter(
    (p) =>
      p.studentName.toLowerCase().includes(search.toLowerCase()) ||
      p.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
      p.studentEmail.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage and track all payment transactions
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-sm text-muted-foreground">Total Revenue</p>
          <p className="text-2xl font-bold text-foreground mt-1">INR {totalRevenue.toFixed(2)}</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-sm text-muted-foreground">Successful Payments</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {payments.filter((p) => p.status === "COMPLETED").length}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-sm text-muted-foreground">Pending Payments</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {payments.filter((p) => p.status === "PENDING").length}
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          placeholder="Search by student or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <CreditCard className="size-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No payments found</p>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Course</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((payment) => {
                const config = statusConfig[payment.status] || statusConfig.PENDING;
                const StatusIcon = config.icon;
                return (
                  <tr key={payment.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{payment.studentName}</p>
                      <p className="text-xs text-muted-foreground">{payment.studentEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-foreground">{payment.courseTitle}</td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {payment.currency} {payment.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                        <StatusIcon className="size-3" />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
