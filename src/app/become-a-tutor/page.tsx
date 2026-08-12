import { getActiveSession } from "@/lib/auth/custom";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GraduationCap, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { becomeTutor } from "./actions";

export default async function BecomeATutorPage() {
  const session = await getActiveSession();

  if (!session) {
    redirect("/login");
  }

  const clerkUserId = session.userId;

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { role: true },
  });

  if (!user) {
    redirect("/register");
  }

  // If already a teacher, redirect to profile
  if (user.role === "TEACHER") {
    redirect("/teacher/profile");
  }

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
        <div className="max-w-lg w-full space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
                <GraduationCap className="size-8 text-primary" strokeWidth={1.5} />
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Become a Tutor
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              Share your expertise with students. Switch your account to a teacher
              account and create your tutor profile.
            </p>
          </div>

          <Card className="p-6 space-y-5">
            <h2 className="font-semibold text-foreground">How it works</h2>
            <div className="space-y-4">
              {[
                {
                  icon: CheckCircle2,
                  title: "Switch to Teacher Account",
                  desc: "Your account will be changed from Student to Teacher",
                },
                {
                  icon: CheckCircle2,
                  title: "Complete your profile",
                  desc: "Share your qualifications, experience, and teaching style",
                },
                {
                  icon: Clock,
                  title: "Wait for verification",
                  desc: "Our team will review your application within 2-3 business days",
                },
                {
                  icon: ArrowRight,
                  title: "Start teaching",
                  desc: "Once approved, students can find and book your classes",
                },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 flex-shrink-0 mt-0.5">
                    <span className="text-sm font-bold text-primary">{i + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-3">
            <form action={becomeTutor}>
              <Button type="submit" size="lg" className="w-full">
                Apply as Teacher
                <ArrowRight className="size-4 ml-2" />
              </Button>
            </form>
            <Link href="/student">
              <Button variant="ghost" size="lg" className="w-full">
                Go Back
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
