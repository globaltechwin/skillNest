import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, BookOpen, Calendar, FileText, Clock, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function TeacherOverviewPage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, firstName: true, role: true },
  });
  if (!user || user.role !== "TEACHER") redirect("/login");

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      status: true,
      subjects: { include: { subject: true } },
    },
  });
  if (!profile || profile.status !== "APPROVED") redirect("/login");

  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const [totalStudents, totalCourses, todayClasses, pendingSubmissions, reviewStats, recentReviews] = await Promise.all([
    prisma.courseEnrollment.count({
      where: {
        course: { teacherProfileId: profile.id },
        status: "ACCEPTED",
      },
    }),
    prisma.course.count({
      where: { teacherProfileId: profile.id },
    }),
    prisma.classSession.findMany({
      where: {
        course: { teacherProfileId: profile.id },
        status: "SCHEDULED",
        startTime: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        course: { select: { title: true } },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.assignmentSubmission.count({
      where: {
        assignment: {
          course: { teacherProfileId: profile.id },
        },
        status: "SUBMITTED",
      },
    }),
    prisma.review.aggregate({
      where: { teacherProfileId: profile.id },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.review.findMany({
      where: { teacherProfileId: profile.id },
      include: { studentUser: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
  ]);

  const greeting = (() => {
    const hour = today.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {greeting}, {user.firstName || "Teacher"} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s what&apos;s happening with your classes today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="My Students" value={totalStudents} icon={Users} color="text-blue-600" bg="bg-blue-100" href="/teacher/students" />
        <SummaryCard label="My Courses" value={totalCourses} icon={BookOpen} color="text-orange-600" bg="bg-orange-100" href="/teacher/courses" />
        <SummaryCard label="Today's Classes" value={todayClasses.length} icon={Calendar} color="text-emerald-600" bg="bg-emerald-100" href="/teacher/classes" />
        <SummaryCard label="Pending Submissions" value={pendingSubmissions} icon={FileText} color="text-amber-600" bg="bg-amber-100" href="/teacher/assignments" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex size-11 items-center justify-center rounded-xl bg-yellow-100">
              <Star className="size-5 text-yellow-600" strokeWidth={1.8} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <p className="text-2xl font-bold text-foreground">
                  {reviewStats._avg.rating ? reviewStats._avg.rating.toFixed(1) : "—"}
                </p>
                <Star className="size-4 text-yellow-400 fill-yellow-400" />
              </div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="flex size-11 items-center justify-center rounded-xl bg-purple-100">
              <Star className="size-5 text-purple-600" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{reviewStats._count.rating}</p>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="size-5 text-emerald-600" />
          Today&apos;s Classes
        </h2>
        {todayClasses.length > 0 ? (
          <div className="space-y-3">
            {todayClasses.map((cls) => (
              <Link
                key={cls.id}
                href={`/teacher/classes/${cls.id}`}
                className="block p-3 rounded-lg border border-border hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors"
              >
                <p className="font-medium text-foreground">{cls.title}</p>
                <p className="text-sm text-muted-foreground">{cls.course.title}</p>
                <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                  {cls.meetingUrl && cls.mode !== "OFFLINE" && (
                    <span className="text-muted-foreground ml-2">· Online</span>
                  )}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No classes scheduled for today.
          </p>
        )}
      </Card>

      {recentReviews.length > 0 && (
        <Card className="p-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Star className="size-5 text-yellow-500" />
            Recent Reviews
          </h2>
          <div className="space-y-3">
            {recentReviews.map((review) => {
              const name =
                `${review.studentUser.firstName || ""} ${review.studentUser.lastName || ""}`.trim() ||
                "Student";
              return (
                <div key={review.id} className="p-3 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-foreground">{name}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
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
  value: number;
  icon: typeof Users;
  color: string;
  bg: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="p-5 hover:shadow-md transition-shadow hover:border-blue-200 group cursor-pointer">
        <div className="flex items-center gap-4">
          <div className={`flex size-11 items-center justify-center rounded-xl ${bg} group-hover:scale-110 transition-transform`}>
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
