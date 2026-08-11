import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Clock, CheckCircle2, XCircle, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

const statusConfig = {
  PENDING_VERIFICATION: {
    icon: Clock,
    title: "Application Under Review",
    description:
      "Your tutor application is currently being reviewed by our team. This usually takes 2-3 business days.",
    color: "text-amber-600",
    bg: "bg-amber-100",
    borderColor: "border-amber-200",
  },
  REJECTED: {
    icon: XCircle,
    title: "Application Not Approved",
    description:
      "Your tutor application was not approved. Please review the feedback below and update your application.",
    color: "text-red-600",
    bg: "bg-red-100",
    borderColor: "border-red-200",
  },
  SUSPENDED: {
    icon: AlertCircle,
    title: "Account Suspended",
    description:
      "Your tutor account has been suspended. Please contact support for more information.",
    color: "text-red-600",
    bg: "bg-red-100",
    borderColor: "border-red-200",
  },
  APPROVED: {
    icon: CheckCircle2,
    title: "Application Approved",
    description: "Your tutor profile is approved!",
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    borderColor: "border-emerald-200",
  },
};

export default async function ApplicationStatusPage() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "TEACHER") {
    redirect("/login");
  }

  const teacherProfile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    select: { status: true, reviewNote: true, createdAt: true },
  });

  if (!teacherProfile) {
    redirect("/teacher/apply");
  }

  if (teacherProfile.status === "APPROVED") {
    redirect("/teacher");
  }

  const status = teacherProfile.status;
  const config = statusConfig[status] ?? statusConfig.PENDING_VERIFICATION;
  const StatusIcon = config.icon;

  const submittedAt = new Date(teacherProfile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <GraduationCap className="size-5 text-primary" strokeWidth={1.8} />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              SkillNest
            </span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full space-y-6">
          <Card className={`p-8 text-center space-y-6 border-2 ${config.borderColor}`}>
            <div className="flex justify-center">
              <div className={`flex size-16 items-center justify-center rounded-full ${config.bg}`}>
                <StatusIcon className={`size-8 ${config.color}`} />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {config.title}
              </h1>
              <p className="text-muted-foreground">{config.description}</p>
              <p className="text-xs text-muted-foreground/70">Submitted on {submittedAt}</p>
            </div>

            {/* Admin feedback */}
            {status === "REJECTED" && teacherProfile.reviewNote && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-left">
                <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">
                  Admin Feedback
                </p>
                <p className="text-sm text-red-800">{teacherProfile.reviewNote}</p>
              </div>
            )}

            {status === "PENDING_VERIFICATION" && (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-left">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
                  What happens next?
                </p>
                <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                  <li>Our team reviews your qualifications and experience</li>
                  <li>We verify your credentials</li>
                  <li>You&apos;ll be notified once approved</li>
                </ul>
              </div>
            )}
          </Card>

          <div className="space-y-3">
            {status === "REJECTED" && (
              <Link href="/teacher/apply">
                <Button className="w-full" size="lg">
                  <FileText className="size-4 mr-2" />
                  Update Application & Reapply
                </Button>
              </Link>
            )}
            {status === "PENDING_VERIFICATION" && (
              <Link href="/teacher/apply">
                <Button variant="outline" className="w-full" size="lg">
                  View My Application
                </Button>
              </Link>
            )}
            <Link href="/">
              <Button variant="ghost" className="w-full" size="lg">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
