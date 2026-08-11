"use client";

import {
  MapPin,
  Phone,
  Globe,
  Clock,
  BookOpen,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";

interface ProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  location: string;
  bio: string;
  teachingApproach: string;
  teachingMode: string;
  offlineLocation: string;
  yearsOfExperience: number;
  languages: string;
  teachingLevels: string;
  subjectIds: string[];
  qualifications: Array<{
    title: string;
    institution: string;
    year: number | null;
  }>;
  availability: Array<{
    day: string;
    enabled: boolean;
    startTime: string;
    endTime: string;
  }>;
}

interface Subject {
  id: string;
  name: string;
}

interface ReviewStepProps {
  data: ProfileData;
  subjects: Subject[];
  isEditing?: boolean;
}

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

export function ReviewStep({ data, subjects, isEditing }: ReviewStepProps) {
  const selectedSubjects = subjects.filter((s) =>
    data.subjectIds.includes(s.id)
  );

  const enabledDays = data.availability.filter((d) => d.enabled);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">
          Review & Submit
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review your profile before submitting for verification.
        </p>
      </div>

      {/* Basic Info */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">1</span>
          </div>
          Basic Information
        </h3>
        <div className="ml-8 space-y-2 text-sm">
          <p className="font-medium text-foreground">
            {data.firstName} {data.lastName}
          </p>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="size-3.5" />
            {data.phone}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="size-3.5" />
            {data.location}
          </div>
          {data.gender && (
            <p className="text-muted-foreground capitalize">{data.gender}</p>
          )}
        </div>
      </div>

      {/* Teaching Info */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">2</span>
          </div>
          Teaching Details
        </h3>
        <div className="ml-8 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="size-3.5" />
            {data.teachingMode === "BOTH"
              ? "Online & Offline"
              : data.teachingMode === "ONLINE"
                ? "Online Only"
                : "Offline Only"}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-3.5" />
            {data.yearsOfExperience} years experience
          </div>
          {data.offlineLocation && (
            <p className="text-muted-foreground">
              Offline location: {data.offlineLocation}
            </p>
          )}
          {data.languages && (
            <p className="text-muted-foreground">
              Languages: {data.languages}
            </p>
          )}
          {data.teachingLevels && (
            <p className="text-muted-foreground">
              Teaching levels: {data.teachingLevels}
            </p>
          )}
          <p className="text-muted-foreground line-clamp-2">{data.bio}</p>
        </div>
      </div>

      {/* Subjects */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">3</span>
          </div>
          Subjects
        </h3>
        <div className="ml-8 flex flex-wrap gap-2">
          {selectedSubjects.map((subject) => (
            <span
              key={subject.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary"
            >
              <BookOpen className="size-3" />
              {subject.name}
            </span>
          ))}
        </div>
      </div>

      {/* Qualifications */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">4</span>
          </div>
          Qualifications
        </h3>
        <div className="ml-8 space-y-2">
          {data.qualifications
            .filter((q) => q.title)
            .map((qual, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <GraduationCap className="size-3.5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">{qual.title}</p>
                  {qual.institution && (
                    <p className="text-muted-foreground">
                      {qual.institution}
                      {qual.year ? ` (${qual.year})` : ""}
                    </p>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className="size-6 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">5</span>
          </div>
          Availability
        </h3>
        <div className="ml-8 flex flex-wrap gap-2">
          {enabledDays.map((daySlot) => (
            <div
              key={daySlot.day}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs"
            >
              <span className="font-medium">{DAY_LABELS[daySlot.day]}</span>
              <span className="text-muted-foreground">
                {daySlot.startTime}-{daySlot.endTime}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Verification notice */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
        <CheckCircle2 className="size-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-amber-800">
            {isEditing ? "Review your changes" : "Profile under verification"}
          </p>
          <p className="text-amber-700 mt-1">
            {isEditing
              ? "After saving, your updated profile will be visible to students."
              : "After submission, your profile will be reviewed by our team. Once approved, it will be visible to students on the platform."}
          </p>
        </div>
      </div>
    </div>
  );
}
