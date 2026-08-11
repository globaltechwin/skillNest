"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
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

const colorCycle = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-rose-500",
];

export default function FeaturedTeachersSection() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    getPublicFeaturedTeachers().then(setTeachers).catch(() => {});
  }, []);

  if (teachers.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Teachers
            </h2>
            <p className="text-gray-500 mt-1">
              Learn from the Best. Achieve Your Best.
            </p>
          </div>
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
          >
            View All Teachers <span className="text-lg">&rsaquo;</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher, i) => (
            <div
              key={teacher.id}
              className="border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                {teacher.profilePhotoUrl ? (
                  <img
                    src={teacher.profilePhotoUrl}
                    alt={`${teacher.firstName ?? ""} ${teacher.lastName ?? ""}`}
                    className="size-20 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className={`size-20 rounded-full ${colorCycle[i % colorCycle.length]} flex items-center justify-center text-white text-2xl font-bold`}
                  >
                    {(teacher.firstName ?? "?").charAt(0)}
                  </div>
                )}
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-medium text-gray-700 px-2 py-1 rounded-full">
                  {teacher.subjects[0]?.name ?? "N/A"}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900">
                  {teacher.firstName} {teacher.lastName}
                </h3>
                <p className="text-sm text-gray-500">
                  {teacher.yearsOfExperience} Years Experience
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="size-3.5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  <span className="text-sm font-medium text-gray-700 ml-1">
                    {teacher.averageRating?.toFixed(1) ?? "N/A"} (
                    {teacher.reviewCount})
                  </span>
                </div>
                <Link
                  href="/login"
                  className="mt-3 block text-center rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="sm:hidden mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
          >
            View All Teachers <span className="text-lg">&rsaquo;</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
