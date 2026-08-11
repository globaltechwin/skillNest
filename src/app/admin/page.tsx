import Link from "next/link";
import {
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  Calendar,
  User,
  ExternalLink,
  Activity,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { getDashboardCounts, getPlatformStats, getRecentActivity, getTeachers } from "./actions";

export default async function AdminDashboardPage() {
  const [counts, stats, recentActivity, pendingResult] = await Promise.all([
    getDashboardCounts(),
    getPlatformStats(),
    getRecentActivity(),
    getTeachers(undefined, "PENDING_VERIFICATION", 1),
  ]);

  const recentPending = pendingResult.data.slice(0, 5);

  const activityIcon = (type: string) => {
    switch (type) {
      case "NEW_TEACHER":
        return <Users className="size-4 text-blue-600" />;
      case "NEW_COURSE":
        return <BookOpen className="size-4 text-violet-600" />;
      case "NEW_ENROLLMENT":
        return <FileText className="size-4 text-emerald-600" />;
      default:
        return <Activity className="size-4 text-muted-foreground" />;
    }
  };

  const activityBg = (type: string) => {
    switch (type) {
      case "NEW_TEACHER":
        return "bg-blue-100";
      case "NEW_COURSE":
        return "bg-violet-100";
      case "NEW_ENROLLMENT":
        return "bg-emerald-100";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Students"
          value={counts.totalStudents}
          icon={User}
          color="text-blue-600"
          bg="bg-blue-100"
          subtitle="Registered"
        />
        <SummaryCard
          label="Total Teachers"
          value={counts.totalTeachers}
          icon={Users}
          color="text-primary"
          bg="bg-primary/10"
          subtitle={`${counts.approvedTeachers} approved`}
        />
        <SummaryCard
          label="Total Courses"
          value={stats.totalCourses}
          icon={BookOpen}
          color="text-violet-600"
          bg="bg-violet-100"
          subtitle={`${stats.publishedCourses} published`}
        />
        <SummaryCard
          label="Total Enrollments"
          value={stats.totalEnrollments}
          icon={FileText}
          color="text-emerald-600"
          bg="bg-emerald-100"
          subtitle={`${stats.acceptedEnrollments} accepted`}
        />
        <SummaryCard
          label="Pending Enrollments"
          value={stats.pendingEnrollments}
          icon={Clock}
          color="text-amber-600"
          bg="bg-amber-100"
          subtitle="Awaiting review"
        />
        <SummaryCard
          label="Total Assignments"
          value={stats.totalAssignments}
          icon={FileText}
          color="text-rose-600"
          bg="bg-rose-100"
          subtitle={`${stats.totalSubmissions} submissions`}
        />
        <SummaryCard
          label="Total Classes"
          value={stats.totalClasses}
          icon={Calendar}
          color="text-teal-600"
          bg="bg-teal-100"
          subtitle={`${stats.upcomingClasses} upcoming`}
        />
        <SummaryCard
          label="Pending Teachers"
          value={counts.pendingTeachers}
          icon={Clock}
          color="text-orange-600"
          bg="bg-orange-100"
          subtitle="Awaiting approval"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Activity className="size-5 text-primary" />
            Recent Activity
          </h2>
        </div>

        {recentActivity.length === 0 ? (
          <Card className="p-8 text-center">
            <Activity className="size-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-foreground">No recent activity</p>
            <p className="text-sm text-muted-foreground mt-1">
              Platform events will appear here as they happen.
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="divide-y divide-border">
              {recentActivity.map((event, i) => (
                <div
                  key={`${event.type}-${i}`}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div
                    className={`flex size-9 items-center justify-center rounded-lg ${activityBg(event.type)}`}
                  >
                    {activityIcon(event.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {event.description}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="size-5 text-primary" />
            Quick Actions
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            href="/admin/teachers"
            icon={Users}
            title="Manage Teachers"
            description="Review applications, approve or suspend teachers"
            color="text-blue-600"
            bg="bg-blue-100"
          />
          <QuickAction
            href="/admin/students"
            icon={User}
            title="Manage Students"
            description="View students, enrollments, and submissions"
            color="text-emerald-600"
            bg="bg-emerald-100"
          />
          <QuickAction
            href="/admin/courses"
            icon={BookOpen}
            title="Manage Courses"
            description="Browse courses, archive or review course details"
            color="text-violet-600"
            bg="bg-violet-100"
          />
          <QuickAction
            href="/admin/enrollments"
            icon={FileText}
            title="Manage Enrollments"
            description="Review enrollment requests and status"
            color="text-amber-600"
            bg="bg-amber-100"
          />
          <QuickAction
            href="/admin/assignments"
            icon={FileText}
            title="Manage Assignments"
            description="View assignments, submissions, and grades"
            color="text-rose-600"
            bg="bg-rose-100"
          />
          <QuickAction
            href="/admin/classes"
            icon={Calendar}
            title="Manage Classes"
            description="Schedule and review class sessions"
            color="text-teal-600"
            bg="bg-teal-100"
          />
          <QuickAction
            href="/admin/audit-log"
            icon={Activity}
            title="Audit Log"
            description="Review all admin actions and changes"
            color="text-orange-600"
            bg="bg-orange-100"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Pending Teacher Applications
          </h2>
          <Link
            href="/admin/teachers"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View All
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {recentPending.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle2 className="size-10 text-emerald-500 mx-auto mb-3" />
            <p className="font-medium text-foreground">No pending applications</p>
            <p className="text-sm text-muted-foreground mt-1">
              All teacher applications have been reviewed.
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Teacher
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Joined
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentPending.map((teacher) => (
                    <tr
                      key={teacher.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {teacher.firstName || teacher.lastName
                          ? `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim()
                          : "Unnamed Teacher"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {teacher.email}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(teacher.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          <Clock className="size-3" />
                          Pending
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href="/admin/teachers"
                          className="text-primary hover:underline text-sm font-medium"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  subtitle,
}: {
  label: string;
  value: number;
  icon: typeof BookOpen;
  color: string;
  bg: string;
  subtitle?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-4">
        <div
          className={`flex size-11 items-center justify-center rounded-xl ${bg}`}
        >
          <Icon className={`size-5 ${color}`} strokeWidth={1.8} />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
    </Card>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
  color,
  bg,
}: {
  href: string;
  icon: typeof BookOpen;
  title: string;
  description: string;
  color: string;
  bg: string;
}) {
  return (
    <Link href={href}>
      <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="flex items-start gap-4">
          <div
            className={`flex size-11 items-center justify-center rounded-xl ${bg} shrink-0`}
          >
            <Icon className={`size-5 ${color}`} strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground flex items-center gap-1.5">
              {title}
              <ExternalLink className="size-3.5 text-muted-foreground" />
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}
