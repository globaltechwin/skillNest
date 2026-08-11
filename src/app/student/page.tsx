import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  FileText,
  Users,
  Clock,
  Award,
  Shield,
  GraduationCap,
  ArrowRight,
  Play,
  CheckCircle,
  CalendarDays,
  MessageSquare,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { TeachersCarousel } from "@/components/TeachersCarousel";
import { getFeaturedTeachersWithRatings } from "@/app/student/teachers/actions";
import Image from "next/image";

const subjects = [
  { name: "English", color: "bg-red-100 text-red-600", icon: "A" },
  { name: "Tamil", color: "bg-yellow-100 text-yellow-600", icon: "\u0B87" },
  { name: "Math", color: "bg-green-100 text-green-600", icon: "\u221Ax" },
  { name: "Science", color: "bg-purple-100 text-purple-600", icon: "E" },
  { name: "Yoga", color: "bg-pink-100 text-pink-600", icon: "\u2638" },
  { name: "Music", color: "bg-rose-100 text-rose-600", icon: "\u266B" },
  { name: "Dance", color: "bg-orange-100 text-orange-600", icon: "\u2766" },
];

const steps = [
  {
    num: 1,
    title: "Choose a Subject",
    desc: "Pick the subject you want to learn",
    icon: BookOpen,
  },
  {
    num: 2,
    title: "Select a Tutor",
    desc: "View tutors and choose the best fit",
    icon: Users,
  },
  {
    num: 3,
    title: "Book a Class",
    desc: "Schedule your class at your convenience",
    icon: CalendarDays,
  },
  {
    num: 4,
    title: "Start Learning",
    desc: "Join live classes and achieve your goals",
    icon: CheckCircle,
  },
];

export default async function StudentOverviewPage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, firstName: true, role: true },
  });
  if (!user || user.role !== "STUDENT") redirect("/login");

  const [
    enrolledCount,
    pendingCount,
    assignmentCount,
    upcomingClasses,
    recentConversations,
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
    prisma.classSession.findMany({
      where: {
        course: {
          enrollments: {
            some: { studentUserId: user.id, status: "ACCEPTED" },
          },
        },
        status: "SCHEDULED",
        startTime: { gte: new Date() },
      },
      include: {
        course: { select: { title: true } },
      },
      orderBy: { startTime: "asc" },
      take: 5,
    }),
    prisma.conversation.findMany({
      where: { studentUserId: user.id },
      include: {
        teacherProfile: {
          select: {
            user: { select: { firstName: true, lastName: true } },
            profilePhotoUrl: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { content: true, createdAt: true },
        },
      },
      orderBy: { lastMessageAt: "desc" },
      take: 3,
    }),
  ]);

  const featuredTeachers = await getFeaturedTeachersWithRatings();

  return (
    <div className="space-y-10">
      {/* Hero Section — matching landing page style */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-white to-orange-50 border border-border">
        <div className="grid lg:grid-cols-2 gap-8 items-center p-8 lg:p-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600">
                <GraduationCap className="size-6 text-white" />
              </div>
              <span className="text-sm font-medium text-blue-600">
                SkillNest Academy
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-3">
              Welcome back, {user.firstName || "Student"} 👋
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
                { label: "My Courses", value: String(enrolledCount) },
                { label: "Assignments", value: String(assignmentCount) },
                { label: "Pending Requests", value: String(pendingCount) },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-orange-100 rounded-3xl transform rotate-3 scale-105" />
            <div className="relative bg-white rounded-2xl shadow-xl p-6 overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-blue-200 to-orange-200 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Image
                    src="/hero.png"
                    alt="Student Dashboard"
                    width={1000}
                    height={1000}
                  />
                </div>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {subjects.map((subject) => (
            <Link
              key={subject.name}
              href="/student/courses"
              className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group"
            >
              <div
                className={`size-14 rounded-xl flex items-center justify-center text-xl font-bold ${subject.color} group-hover:scale-110 transition-transform`}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.num} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gray-200 -translate-x-1/2 z-0" />
              )}
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="size-20 rounded-full bg-blue-100 flex items-center justify-center">
                    <step.icon className="size-8 text-blue-600" />
                  </div>
                  <span className="absolute -top-2 -left-2 size-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 max-w-[200px]">
                  {step.desc}
                </p>
              </div>
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
                <div
                  className={`flex size-11 items-center justify-center rounded-xl bg-purple-100 group-hover:scale-110 transition-transform`}
                >
                  <Users
                    className={`size-5 text-purple-600`}
                    strokeWidth={1.8}
                  />
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
      <section>
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Teachers
            </h2>
            <p className="text-gray-500 mt-1">
              Learn from the Best. Achieve Your Best.
            </p>
          </div>
          <Link
            href="/student/teachers"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
          >
            View All Teachers <ArrowRight className="size-4" />
          </Link>
        </div>
        {featuredTeachers.length > 0 ? (
          <TeachersCarousel teachers={featuredTeachers} />
        ) : (
          <Card className="p-8 text-center">
            <div className="size-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <Users className="size-7 text-blue-600" />
            </div>
            <p className="text-gray-900 font-medium">
              No featured teachers yet
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Approved teachers will appear here soon.
            </p>
          </Card>
        )}
        <div className="sm:hidden mt-6 text-center">
          <Link
            href="/student/teachers"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
          >
            View All Teachers <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* Upcoming Classes & Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="size-5 text-emerald-600" />
            Upcoming Classes
          </h2>
          {upcomingClasses.length > 0 ? (
            <div className="space-y-3">
              {upcomingClasses.map((cls) => (
                <Link
                  key={cls.id}
                  href={`/student/classes/${cls.id}`}
                  className="block p-3 rounded-lg border border-border hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors"
                >
                  <p className="font-medium text-foreground">{cls.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {cls.course.title}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    {new Date(cls.startTime).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                    {" · "}
                    {new Date(cls.startTime).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </Link>
              ))}
              <Link
                href="/student/classes"
                className="block text-center text-sm text-emerald-600 hover:underline pt-1"
              >
                View all classes
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="size-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <Calendar className="size-7 text-emerald-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                No upcoming classes. Your scheduled classes will appear here.
              </p>
            </div>
          )}
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MessageSquare className="size-5 text-blue-600" />
            Recent Messages
          </h2>
          {recentConversations.length > 0 ? (
            <div className="space-y-3">
              {recentConversations.map((conv) => {
                const name =
                  `${conv.teacherProfile.user.firstName || ""} ${conv.teacherProfile.user.lastName || ""}`.trim() ||
                  "Teacher";
                const lastMsg = conv.messages[0]?.content || "No messages";
                return (
                  <Link
                    key={conv.id}
                    href={`/student/messages/${conv.id}`}
                    className="block p-3 rounded-lg border border-border hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
                  >
                    <p className="font-medium text-foreground">{name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {lastMsg}
                    </p>
                  </Link>
                );
              })}
              <Link
                href="/student/messages"
                className="block text-center text-sm text-blue-600 hover:underline pt-1"
              >
                View all messages
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="size-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="size-7 text-blue-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                No messages yet. Contact a teacher to start a conversation.
              </p>
            </div>
          )}
        </Card>
      </section>

      {/* Features Bar — matching landing page */}
      <section className="rounded-xl bg-blue-600 p-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center text-white">
          {[
            { icon: Users, label: "Live Interactive Classes" },
            { icon: Award, label: "Learn from Verified Tutors" },
            { icon: Clock, label: "Flexible Timings & Affordable Fees" },
            { icon: Shield, label: "100% Safe & Secure Platform" },
            { icon: GraduationCap, label: "Quality Education, Better Future" },
          ].map((feat) => (
            <div key={feat.label} className="flex flex-col items-center gap-2">
              <feat.icon className="size-6" />
              <span className="text-xs font-medium leading-tight">
                {feat.label}
              </span>
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
