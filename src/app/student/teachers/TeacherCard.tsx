"use client";

import Link from "next/link";
import { MapPin, Clock, Globe, BookOpen, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { TeacherWithRating } from "./actions";

type Props = {
  teacher: TeacherWithRating;
};

const MODE_LABELS: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "In-person",
  BOTH: "Online & In-person",
};

export function TeacherCard({ teacher }: Props) {
  const initials =
    (teacher.firstName?.[0] || "") + (teacher.lastName?.[0] || "");

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0 overflow-hidden">
            {teacher.profilePhotoUrl ? (
              <img
                src={teacher.profilePhotoUrl}
                alt={`${teacher.firstName} ${teacher.lastName}`}
                className="size-full object-cover rounded-full"
              />
            ) : (
              initials || "?"
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate">
              {teacher.firstName} {teacher.lastName}
            </h3>
            {teacher.location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{teacher.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Subjects */}
        {teacher.subjects.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {teacher.subjects.slice(0, 4).map((s) => (
              <span
                key={s.name}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-xs font-medium text-primary"
              >
                <BookOpen className="size-3" />
                {s.name}
              </span>
            ))}
            {teacher.subjects.length > 4 && (
              <span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">
                +{teacher.subjects.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Rating */}
        {teacher.reviewCount > 0 && (
          <div className="flex items-center gap-1.5 mt-3">
            <div className="flex">
              {[1,2,3,4,5].map((s) => (
                <Star key={s} className={`size-3.5 ${s <= Math.round(teacher.averageRating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
              ))}
            </div>
            <span className="text-sm font-medium">{teacher.averageRating?.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({teacher.reviewCount})</span>
          </div>
        )}

        {/* Info */}
        <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0" />
            <span>{teacher.yearsOfExperience} years experience</span>
          </div>
          {teacher.languages && (
            <div className="flex items-center gap-1.5">
              <Globe className="size-3.5 shrink-0" />
              <span className="truncate">{teacher.languages}</span>
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            {MODE_LABELS[teacher.teachingMode] || teacher.teachingMode}
            {teacher.teachingLevels && (
              <> &middot; {teacher.teachingLevels.split(", ").slice(0, 2).join(", ")}</>
            )}
          </div>
        </div>

        {/* Bio preview */}
        {teacher.bio && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {teacher.bio}
          </p>
        )}

        {/* CTA */}
        <Link
          href={`/student/teachers/${teacher.id}`}
          className="mt-4 block text-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          View Profile
        </Link>
      </div>
    </Card>
  );
}
