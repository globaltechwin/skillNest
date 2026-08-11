"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Globe,
  MapPin,
  User,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { getStudentClasses, type StudentClassListItem } from "./actions";

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

function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const d = new Date(date);
  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  );
}

function formatDateLabel(date: Date): string {
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return formatDateTime(date);
}

export function ClassListClient() {
  const [classes, setClasses] = useState<StudentClassListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentClasses().then((data) => {
      setClasses(data);
      setLoading(false);
    });
  }, []);

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
        title="No upcoming classes"
        description="Your scheduled classes will appear here."
      />
    );
  }

  const todayClasses = classes.filter((c) => isToday(c.startTime));
  const upcomingClasses = classes.filter(
    (c) => !isToday(c.startTime)
  );

  return (
    <div className="space-y-8">
      {todayClasses.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3">Today</h3>
          <div className="space-y-3">
            {todayClasses.map((cls) => (
              <ClassCard key={cls.id} cls={cls} />
            ))}
          </div>
        </div>
      )}

      {upcomingClasses.length > 0 && (
        <div>
          <h3 className="font-semibold text-foreground mb-3">Upcoming</h3>
          <div className="space-y-3">
            {upcomingClasses.map((cls) => (
              <ClassCard key={cls.id} cls={cls} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ClassCard({ cls }: { cls: StudentClassListItem }) {
  const isOnline = cls.mode === "ONLINE" || cls.mode === "BOTH";

  return (
    <Card className="p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground truncate">{cls.title}</h4>

          <div className="text-sm text-muted-foreground mt-0.5">
            {cls.course.title}
          </div>

          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span className="font-medium text-primary">
              {formatDateLabel(cls.startTime)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {formatTime(cls.startTime)} - {formatTime(cls.endTime)}
            </span>
            <span className="flex items-center gap-1">
              {isOnline ? <Globe className="size-3" /> : <MapPin className="size-3" />}
              {MODE_LABELS[cls.mode]}
            </span>
            <span className="flex items-center gap-1">
              <User className="size-3" />
              {cls.teacher.firstName} {cls.teacher.lastName}
            </span>
          </div>
        </div>

        <div className="shrink-0">
          {isOnline && cls.meetingUrl ? (
            <a href={cls.meetingUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="gap-1.5">
                <ExternalLink className="size-3.5" />
                Join Class
              </Button>
            </a>
          ) : (
            <Link href={`/student/classes/${cls.id}`}>
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
