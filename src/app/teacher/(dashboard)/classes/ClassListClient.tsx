"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Globe,
  MapPin,
  Users,
  XCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { getTeacherClasses, cancelClass, type ClassListItem } from "./actions";

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const MODE_LABELS: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "In-person",
  BOTH: "Both",
};

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isToday(date: Date): boolean {
  const today = new Date();
  const d = new Date(date);
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

function isPast(date: Date): boolean {
  return new Date(date) < new Date();
}

export function ClassListClient() {
  const [classes, setClasses] = useState<ClassListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null);

  useEffect(() => {
    getTeacherClasses().then((data) => {
      setClasses(data);
      setLoading(false);
    });
  }, []);

  const handleCancel = (classId: string) => {
    startTransition(async () => {
      const result = await cancelClass(classId);
      if (result.success) {
        setClasses((prev) =>
          prev.map((c) =>
            c.id === classId ? { ...c, status: "CANCELLED" } : c
          )
        );
        setConfirmCancel(null);
      }
    });
  };

  const upcoming = classes.filter(
    (c) => c.status === "SCHEDULED" && !isPast(c.startTime)
  );
  const today = classes.filter(
    (c) => c.status === "SCHEDULED" && isToday(c.startTime)
  );
  const past = classes.filter(
    (c) =>
      c.status === "COMPLETED" ||
      c.status === "CANCELLED" ||
      (c.status === "SCHEDULED" && isPast(c.startTime))
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="space-y-3">
              <div className="h-5 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/4" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="No classes yet"
        description="Create a class for one of your published courses."
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Today */}
      {today.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Clock className="size-4 text-blue-500" />
            Today ({today.length})
          </h3>
          <div className="space-y-3">
            {today.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                confirmCancel={confirmCancel}
                setConfirmCancel={setConfirmCancel}
                handleCancel={handleCancel}
                isPending={isPending}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Calendar className="size-4 text-emerald-500" />
            Upcoming ({upcoming.length})
          </h3>
          <div className="space-y-3">
            {upcoming.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                confirmCancel={confirmCancel}
                setConfirmCancel={setConfirmCancel}
                handleCancel={handleCancel}
                isPending={isPending}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle className="size-4 text-muted-foreground" />
            Past ({past.length})
          </h3>
          <div className="space-y-3">
            {past.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                confirmCancel={confirmCancel}
                setConfirmCancel={setConfirmCancel}
                handleCancel={handleCancel}
                isPending={isPending}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ClassCard({
  cls,
  confirmCancel,
  setConfirmCancel,
  handleCancel,
  isPending,
}: {
  cls: ClassListItem;
  confirmCancel: string | null;
  setConfirmCancel: (id: string | null) => void;
  handleCancel: (id: string) => void;
  isPending: boolean;
}) {
  return (
    <Card className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-foreground truncate">{cls.title}</h4>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[cls.status]}`}
            >
              {cls.status}
            </span>
          </div>

          <div className="text-sm text-muted-foreground">
            {cls.course.title}
          </div>

          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="size-3" />
              {formatDateTime(cls.startTime)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
            </span>
            <span className="flex items-center gap-1">
              {cls.mode === "ONLINE" ? (
                <Globe className="size-3" />
              ) : (
                <MapPin className="size-3" />
              )}
              {MODE_LABELS[cls.mode]}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              {cls._count.enrollments} student{cls._count.enrollments !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href={`/teacher/classes/${cls.id}`}>
            <Button variant="outline" size="sm">
              View
            </Button>
          </Link>
          {cls.status === "SCHEDULED" && (
            <>
              <Link href={`/teacher/classes/${cls.id}/edit`}>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </Link>
              {confirmCancel === cls.id ? (
                <div className="flex items-center gap-1">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancel(cls.id)}
                    disabled={isPending}
                  >
                    {isPending ? <Loader2 className="size-3.5 animate-spin" /> : "Confirm"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmCancel(null)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => setConfirmCancel(cls.id)}
                >
                  <XCircle className="size-3.5" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
