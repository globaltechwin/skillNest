import { auth } from "@/lib/auth/custom";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/EmptyState";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDayHeader(date: Date): string {
  const today = new Date();
  const d = new Date(date);
  if (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  ) {
    return "Today";
  }
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  ) {
    return "Tomorrow";
  }
  return `${DAY_NAMES[d.getDay()]}, ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
}

export default async function TeacherSchedulePage() {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: clerkUserId },
    select: { id: true, role: true },
  });
  if (!user || user.role !== "TEACHER") redirect("/login");

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true },
  });
  if (!profile || profile.status !== "APPROVED") redirect("/login");

  const now = new Date();

  const classes = await prisma.classSession.findMany({
    where: {
      course: { teacherProfileId: profile.id },
      status: "SCHEDULED",
      startTime: { gte: now },
    },
    include: {
      course: { select: { title: true } },
    },
    orderBy: { startTime: "asc" },
    take: 20,
  });

  if (classes.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Schedule
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your teaching schedule
          </p>
        </div>
        <EmptyState
          icon={Clock}
          title="No scheduled classes"
          description="Your class schedule will appear here."
        />
      </div>
    );
  }

  const groupedByDay: Record<string, typeof classes> = {};
  for (const cls of classes) {
    const dayKey = formatDayHeader(cls.startTime);
    if (!groupedByDay[dayKey]) groupedByDay[dayKey] = [];
    groupedByDay[dayKey].push(cls);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Schedule
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your teaching schedule
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedByDay).map(([day, dayClasses]) => (
          <div key={day}>
            <h3 className="font-semibold text-foreground mb-3">{day}</h3>
            <div className="space-y-2">
              {dayClasses.map((cls) => (
                <Card key={cls.id} className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {cls.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {cls.course.title}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground shrink-0">
                      {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
