"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin, Clock, BookOpen, Star } from "lucide-react";
import { Card } from "@/components/ui/card";

type Teacher = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profilePhotoUrl: string | null;
  subjects: { name: string }[];
  yearsOfExperience: number;
  location: string | null;
  teachingMode: string;
  averageRating: number | null;
  reviewCount: number;
};

type Props = {
  teachers: Teacher[];
};

const MODE_LABELS: Record<string, string> = {
  ONLINE: "Online",
  OFFLINE: "In-person",
  BOTH: "Online & In-person",
};

export function TeachersCarousel({ teachers }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstChild
      ? (scrollRef.current.firstChild as HTMLElement).offsetWidth + 24
      : 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative group">
      {/* Left Arrow */}
      <button
        onClick={() => scroll("left")}
        className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="size-5" />
      </button>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <div className="flex gap-6">
          {teachers.map((teacher) => {
            const initials =
              (teacher.firstName?.[0] || "") + (teacher.lastName?.[0] || "");
            const primarySubject = teacher.subjects[0]?.name || "Tutor";

            return (
              <Card
                key={teacher.id}
                className="overflow-hidden hover:shadow-lg transition-shadow snap-start shrink-0 w-[calc(33.333%-1rem)] min-w-[260px]"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                  {teacher.profilePhotoUrl ? (
                    <img
                      src={teacher.profilePhotoUrl}
                      alt={`${teacher.firstName} ${teacher.lastName}`}
                      className="size-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="size-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                      {initials || "?"}
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-medium text-gray-700 px-2 py-1 rounded-full">
                    {primarySubject}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">
                    {teacher.firstName} {teacher.lastName}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {teacher.yearsOfExperience} yrs
                    </span>
                    {teacher.location && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="size-3.5 shrink-0" />
                        {teacher.location}
                      </span>
                    )}
                  </div>
                  {teacher.subjects.length > 1 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {teacher.subjects.slice(0, 3).map((s) => (
                        <span
                          key={s.name}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-xs font-medium text-blue-700"
                        >
                          <BookOpen className="size-3" />
                          {s.name}
                        </span>
                      ))}
                      {teacher.subjects.length > 3 && (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs text-gray-500">
                          +{teacher.subjects.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  {teacher.reviewCount > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="flex">
                        {[1,2,3,4,5].map((s) => (
                          <Star key={s} className={`size-3.5 ${s <= Math.round(teacher.averageRating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{teacher.averageRating?.toFixed(1)}</span>
                      <span className="text-xs text-gray-400">({teacher.reviewCount})</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {MODE_LABELS[teacher.teachingMode] || teacher.teachingMode}
                  </p>
                  <Link
                    href={`/student/teachers/${teacher.id}`}
                    className="mt-3 block text-center rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scroll("right")}
        className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  );
}
