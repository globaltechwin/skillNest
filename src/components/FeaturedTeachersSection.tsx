"use client";

import { useState, useEffect, useRef } from "react";
import { Star, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getPublicFeaturedTeachers } from "@/app/actions";

type Teacher = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  profilePhotoUrl: string | null;
  yearsOfExperience: number;
  subjects: { name: string }[];
  averageRating: number | null;
  reviewCount: number;
};

const subjectBadgeColors: Record<string, string> = {
  English: "bg-blue-100 text-blue-700",
  Tamil: "bg-green-100 text-green-700",
  Math: "bg-emerald-100 text-emerald-700",
  Science: "bg-teal-100 text-teal-700",
  Yoga: "bg-purple-100 text-purple-700",
  Music: "bg-pink-100 text-pink-700",
  "Classical Dance": "bg-red-100 text-red-700",
  Dance: "bg-red-100 text-red-700",
  Physics: "bg-indigo-100 text-indigo-700",
  Chemistry: "bg-amber-100 text-amber-700",
  Biology: "bg-lime-100 text-lime-700",
  History: "bg-orange-100 text-orange-700",
  Geography: "bg-cyan-100 text-cyan-700",
  "Computer Science": "bg-violet-100 text-violet-700",
  Art: "bg-fuchsia-100 text-fuchsia-700",
  French: "bg-rose-100 text-rose-700",
  Spanish: "bg-yellow-100 text-yellow-700",
  Hindi: "bg-red-100 text-red-700",
};

const fallbackColors = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-rose-500",
];

export default function FeaturedTeachersSection() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getPublicFeaturedTeachers()
      .then((data) => setTeachers(data))
      .catch(() => {});
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = 220 + 20;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  if (teachers.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Featured Tutors
            </h2>
            <p className="text-gray-500 mt-1">
              Learn from the Best. Achieve Your Best.
            </p>
          </div>
          <Link
            href="/student/teachers"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
          >
            View All Tutors <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative group">
          {/* Left Arrow */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-opacity"
          >
            <ChevronLeft className="size-5" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <div className="flex gap-5">
              {teachers.map((teacher, i) => {
                const primarySubject = teacher.subjects[0]?.name || "Tutor";
                const badgeColor =
                  subjectBadgeColors[primarySubject] || "bg-gray-100 text-gray-700";
                const fullName = `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim();

                return (
                  <div
                    key={teacher.id}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col snap-start shrink-0 w-[220px]"
                  >
                    {/* Photo */}
                    <div className="relative w-full aspect-[3/4] bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden">
                      {teacher.profilePhotoUrl ? (
                        <img
                          src={teacher.profilePhotoUrl}
                          alt={fullName}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div
                          className={`w-full h-full ${fallbackColors[i % fallbackColors.length]} flex items-center justify-center`}
                        >
                          <span className="text-5xl font-bold text-white/80">
                            {(teacher.firstName?.[0] || "") + (teacher.lastName?.[0] || "") || "?"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 text-center flex flex-col flex-1">
                      <span
                        className={`inline-block self-center text-xs font-semibold px-3 py-1 rounded-full mb-2 ${badgeColor}`}
                      >
                        {primarySubject}
                      </span>

                      <h3 className="font-bold text-gray-900 text-sm leading-tight">
                        {fullName || "Unnamed Tutor"}
                      </h3>

                      <p className="text-xs text-gray-500 mt-1">
                        {teacher.yearsOfExperience} Years Experience
                      </p>

                      <div className="flex items-center justify-center gap-0.5 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`size-3.5 ${
                              star <= Math.round(teacher.averageRating || 0)
                                ? "fill-orange-400 text-orange-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-xs font-semibold text-gray-700 ml-1">
                          {teacher.averageRating?.toFixed(1) ?? "N/A"}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({teacher.reviewCount})
                        </span>
                      </div>

                      <Link
                        href={`/student/teachers/${teacher.id}`}
                        className="mt-auto pt-3 block text-center rounded-lg border-2 border-blue-600 px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => scroll("right")}
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-white border border-gray-200 shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-opacity"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link
            href="/student/teachers"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
          >
            View All Tutors <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
