import { auth } from "@/lib/auth/custom";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  Users,
  Clock,
  Award,
  Shield,
  GraduationCap,
  ArrowRight,
  Play,
  Search,
  Target,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import FeaturedTeachersSection from "@/components/FeaturedTeachersSection";
import Image from "next/image";

const subjects = [
  { name: "English", color: "bg-blue-500", textColor: "text-white", icon: "A" },
  { name: "Tamil", color: "bg-green-600", textColor: "text-white", icon: "\u0B87" },
  { name: "Math", color: "bg-emerald-500", textColor: "text-white", icon: "\u221A" },
  { name: "Science", color: "bg-teal-600", textColor: "text-white", icon: "\u2697" },
  { name: "Yoga", color: "bg-purple-400", textColor: "text-white", icon: "\u2638" },
  { name: "Music", color: "bg-pink-400", textColor: "text-white", icon: "\u266B" },
  { name: "Dance", color: "bg-red-500", textColor: "text-white", icon: "\uD83D\uDC83" },
];

const steps = [
  { num: 1, title: "Choose a Subject", desc: "Pick the subject you want to learn", icon: BookOpen, color: "text-blue-600" },
  { num: 2, title: "Select a Tutor", desc: "View tutors and choose the best fit", icon: Users, color: "text-blue-600" },
  { num: 3, title: "Book a Class", desc: "Schedule your class at your convenience", icon: FileText, color: "text-blue-600" },
  { num: 4, title: "Start Learning", desc: "Join live classes and achieve your goals", icon: Target, color: "text-blue-600" },
];

const benefits = [
  { icon: Users, label: "Live Interactive Classes" },
  { icon: Award, label: "Learn from Verified Tutors" },
  { icon: Clock, label: "Flexible Timings & Affordable Fees" },
  { icon: Shield, label: "100% Safe & Secure Platform" },
  { icon: GraduationCap, label: "Quality Education, Better Future" },
];

export default async function StudentOverviewPage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, firstName: true, role: true },
  });
  if (!user || user.role !== "STUDENT") redirect("/login");

  const [
    enrolledCount,
    pendingCount,
    assignmentCount,
  ] = await Promise.all([
    prisma.courseEnrollment.count({
      where: { studentUserId: user.id, status: "ACCEPTED" },
    }),
    prisma.courseEnrollment.count({
      where: { studentUserId: user.id, status: "PENDING" },
    }),
    prisma.assignment.count({
      where: {
        status: "PUBLISHED",
        course: {
          enrollments: {
            some: { studentUserId: user.id, status: "ACCEPTED" },
          },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-white to-orange-50 border border-border">
        <div className="grid lg:grid-cols-2 gap-8 items-center p-8 lg:p-12">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-3">
              Welcome back, {user.firstName || "Student"}
            </h1>
            <p className="text-gray-600 text-lg mb-6 max-w-md">
              Continue your learning journey. Explore courses, join classes, and
              track your progress.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/student/courses"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-6 py-3 text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <Play className="size-4" />
                Browse Courses
              </Link>
              <Link
                href="/student/classes"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                View My Classes
                <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="flex flex-wrap gap-8 mt-8">
              {[
                { label: "My Courses", value: String(enrolledCount), icon: Award, iconColor: "text-blue-600", bgColor: "bg-blue-50" },
                { label: "Assignments", value: String(assignmentCount), icon: FileText, iconColor: "text-orange-500", bgColor: "bg-orange-50" },
                { label: "Pending Requests", value: String(pendingCount), icon: Clock, iconColor: "text-emerald-600", bgColor: "bg-emerald-50" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="relative w-full max-w-lg mx-auto">
              <div className="absolute -top-4 left-1/4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center z-10">
                <Search className="w-7 h-7 text-orange-500" />
              </div>
              <div className="absolute top-1/3 -left-4 w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center z-10">
                <div className="w-6 h-6 bg-blue-500 rounded-full" />
              </div>
              <div className="absolute bottom-1/4 -right-2 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center z-10">
                <div className="w-5 h-5 bg-green-500 rounded-full" />
              </div>
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/hero.png"
                  alt="Student Dashboard"
                  width={1000}
                  height={1000}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Top Subjects */}
      <section>
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Explore Top Subjects & Activities
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4">
          {subjects.map((subject) => (
            <Link
              key={subject.name}
              href="/student/courses"
              className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
            >
              <div
                className={`w-14 h-14 ${subject.color} rounded-xl flex items-center justify-center text-xl font-bold ${subject.textColor} group-hover:scale-110 transition-transform`}
              >
                {subject.icon}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {subject.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 rounded-2xl p-8 lg:p-10">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          How It Works
        </h2>
        <div className="flex flex-col md:flex-row items-start justify-center gap-4 md:gap-2">
          {steps.map((step, i) => (
            <div key={step.num} className="flex items-start gap-3 flex-1">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  <span className="absolute -top-1 -left-1 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {step.num}
                  </span>
                </div>
              </div>
              <div className="pt-2">
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:flex items-center pt-4 ml-2">
                  <span className="text-gray-400 text-xl">&rarr;</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Stats Cards */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="My Courses"
            value={enrolledCount}
            icon={BookOpen}
            color="text-blue-600"
            bg="bg-blue-100"
            href="/student/courses"
          />
          <SummaryCard
            label="Assignments"
            value={assignmentCount}
            icon={FileText}
            color="text-amber-600"
            bg="bg-amber-100"
            href="/student/assignments"
          />
          <SummaryCard
            label="Pending Requests"
            value={pendingCount}
            icon={Clock}
            color="text-emerald-600"
            bg="bg-emerald-100"
            href="/student/courses"
          />
          <Link href="/student/teachers">
            <Card className="p-5 hover:shadow-md transition-shadow hover:border-blue-200 group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="flex size-11 items-center justify-center rounded-xl bg-purple-100 group-hover:scale-110 transition-transform">
                  <Users className="size-5 text-purple-600" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">Browse</p>
                  <p className="text-sm text-muted-foreground">Teachers</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* Featured Teachers */}
      <FeaturedTeachersSection />

      {/* Information Box */}
      <section className="py-2">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl">&#128172;</span>
          </div>
          <p className="text-sm text-gray-700">
            <strong>Students can browse subjects, view the list of expert tutors, check their profiles,
            ratings &amp; experience, and select the best tutor to start learning.</strong>
          </p>
        </div>
      </section>

      {/* Benefits Bar */}
      <section className="py-6 border-t border-gray-100">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {benefits.map((benefit) => (
            <div key={benefit.label} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                <benefit.icon className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{benefit.label}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  href,
}: {
  label: string;
  value: number | string;
  icon: typeof BookOpen;
  color: string;
  bg: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="p-5 hover:shadow-md transition-shadow hover:border-blue-200 group cursor-pointer">
        <div className="flex items-center gap-4">
          <div
            className={`flex size-11 items-center justify-center rounded-xl ${bg} group-hover:scale-110 transition-transform`}
          >
            <Icon className={`size-5 ${color}`} strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
