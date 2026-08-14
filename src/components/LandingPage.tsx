"use client";

import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Users,
  Clock,
  Shield,
  Award,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Menu,
  X,
  User,
  CheckCircle,
  Calendar,
  Star,
  Search,
  Trophy,
  Target,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import FeaturedTeachersSection from "@/components/FeaturedTeachersSection";

const subjects = [
  { name: "English", icon: "A", color: "bg-blue-500", textColor: "text-white" },
  {
    name: "Tamil",
    icon: "\u0B87",
    color: "bg-green-600",
    textColor: "text-white",
  },
  {
    name: "Math",
    icon: "\u221A",
    color: "bg-emerald-500",
    textColor: "text-white",
  },
  {
    name: "Science",
    icon: "\u2697",
    color: "bg-teal-600",
    textColor: "text-white",
  },
  {
    name: "Yoga",
    icon: "\u2638",
    color: "bg-purple-400",
    textColor: "text-white",
  },
  {
    name: "Music",
    icon: "\u266B",
    color: "bg-pink-400",
    textColor: "text-white",
  },
  {
    name: "Classical Dance",
    icon: "\uD83D\uDC83",
    color: "bg-red-500",
    textColor: "text-white",
  },
];

const steps = [
  {
    num: 1,
    title: "Choose a Subject",
    desc: "Pick the subject or activity you want to learn",
    icon: BookOpen,
    color: "text-blue-600",
  },
  {
    num: 2,
    title: "Select a Tutor",
    desc: "View tutors and choose the best fit for you",
    icon: Users,
    color: "text-blue-600",
  },
  {
    num: 3,
    title: "Book a Class",
    desc: "Schedule your class at your convenience",
    icon: Calendar,
    color: "text-blue-600",
  },
  {
    num: 4,
    title: "Start Learning",
    desc: "Join live classes and achieve your goals",
    icon: Target,
    color: "text-blue-600",
  },
];

const benefits = [
  { icon: Users, label: "Live Interactive Classes", color: "text-blue-600" },
  {
    icon: Award,
    label: "Learn from Verified Tutors",
    color: "text-orange-500",
  },
  {
    icon: Clock,
    label: "Flexible Timings & Affordable Fees",
    color: "text-emerald-600",
  },
  {
    icon: Shield,
    label: "100% Safe & Secure Platform",
    color: "text-blue-500",
  },
  {
    icon: GraduationCap,
    label: "Quality Education, Better Future",
    color: "text-orange-600",
  },
];

export function LandingPage() {
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="SkillNest"
                width={56}
                height={56}
                className="rounded-full object-contain"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-blue-900 leading-tight">
                  SkillNest
                </span>
                <span className="text-[10px] text-gray-500 tracking-wider">
                  ACADEMY
                </span>
                <span className="text-[8px] text-orange-500 italic">
                  &bull; Explore &bull; Discover &bull; Achieve &bull;
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {[
                "Home",
                "About Us",
                "Courses",
                "How It Works",
                "Pricing",
                "Contact Us",
              ].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm font-medium text-gray-700 hover:text-blue-900 transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login?redirect_url=/teacher"
                className="inline-flex items-center gap-2 rounded-lg border border-blue-900 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50 transition-colors"
              >
                <User className="size-4" />
                Tutor Login
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </div>

            <button
              className="md:hidden size-10 flex items-center justify-center rounded-lg hover:bg-gray-100"
              onClick={() => setMobileNav(!mobileNav)}
            >
              {mobileNav ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </div>

        {mobileNav && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
            {[
              "Home",
              "About Us",
              "Courses",
              "How It Works",
              "Pricing",
              "Contact Us",
            ].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
                onClick={() => setMobileNav(false)}
              >
                {item}
              </a>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login?redirect_url=/teacher"
                className="text-center rounded-lg border border-blue-900 px-4 py-2 text-sm font-medium text-blue-900"
              >
                Tutor Login
              </Link>
              <Link
                href="/login"
                className="text-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Connect with Skilled Tutors for{" "}
                <span className="text-blue-600">Online</span> &{" "}
                <span className="text-orange-500">Offline</span> Learning
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Personalized Learning. Better Results.
              </p>
              <div className="mt-8 flex flex-wrap gap-8">
                {[
                  {
                    label: "Verified Tutors",
                    value: "7.5 Lakh+",
                    icon: Award,
                    iconColor: "text-blue-600",
                    bgColor: "bg-blue-50",
                  },
                  {
                    label: "Students",
                    value: "55 Lakh+",
                    icon: Users,
                    iconColor: "text-orange-500",
                    bgColor: "bg-orange-50",
                  },
                  {
                    label: "Reviews",
                    value: "4 Lakh+",
                    icon: Star,
                    iconColor: "text-emerald-600",
                    bgColor: "bg-emerald-50",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}
                    >
                      <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="relative w-full max-w-lg mx-auto">
                {/* Decorative circles */}
                <div className="absolute -top-4 left-1/4 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center z-10">
                  <Search className="w-7 h-7 text-orange-500" />
                </div>
                <div className="absolute top-1/3 -left-4 w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center z-10">
                  <div className="w-6 h-6 bg-blue-500 rounded-full" />
                </div>
                <div className="absolute bottom-1/4 -right-2 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center z-10">
                  <div className="w-5 h-5 bg-green-500 rounded-full" />
                </div>
                <div className="absolute top-0 right-1/4 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center z-10">
                  <div className="w-4 h-4 bg-purple-400 rounded-full" />
                </div>
                {/* Main image */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src="/hero.png"
                    alt="Student learning online"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section id="courses" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            Explore Top Subjects & Activities
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4">
            {subjects.map((subject) => (
              <div
                key={subject.name}
                className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
              >
                <div
                  className={`w-14 h-14 ${subject.color} rounded-xl flex items-center justify-center text-xl font-bold ${subject.textColor} group-hover:scale-110 transition-transform`}
                >
                  {subject.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 text-center">
                  {subject.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            How It Works
          </h2>
          <div className="flex flex-col md:flex-row items-start justify-center gap-4 md:gap-2">
            {steps.map((step, i) => (
              <div key={step.num} className="flex items-start gap-3 flex-1">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                      <step.icon className={`w-6 h-6 ${step.color}`} />
                    </div>
                    <span className="absolute -top-1 -left-1 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {step.num}
                    </span>
                  </div>
                </div>
                <div className="pt-2">
                  <h3 className="font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:flex items-center pt-4 ml-2">
                    <span className="text-gray-400 text-xl">&rarr;</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Teachers */}
      <FeaturedTeachersSection />

      {/* Information Box */}
      <section className="py-6 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xl">&#128172;</span>
            </div>
            <p className="text-sm text-gray-700">
              <strong>
                Students can browse subjects, view the list of expert tutors,
                check their profiles, ratings & experience, and select the best
                tutor to start learning.
              </strong>
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-8 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {benefits.map((benefit) => (
              <div key={benefit.label} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <benefit.icon className={`w-5 h-5 ${benefit.color}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {benefit.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact-us" className="bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-blue-900" />
                </div>
                <div>
                  <span className="text-xl font-bold">SkillNest</span>
                  <span className="text-[10px] text-blue-300 block -mt-1">
                    ACADEMY
                  </span>
                  <span className="text-[8px] text-orange-400 italic">
                    &bull; Explore &bull; Discover &bull; Achieve &bull;
                  </span>
                </div>
              </div>
              <p className="text-sm text-blue-300 leading-relaxed max-w-sm">
                SkillNest Academy connects students with expert tutors for
                online & offline learning across subjects and activities.
              </p>
              <div className="flex gap-3 mt-4">
                {[
                  {
                    label: "Facebook",
                    path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
                  },
                  {
                    label: "Instagram",
                    path: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z",
                  },
                  {
                    label: "Youtube",
                    path: "M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.46zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z",
                  },
                  {
                    label: "LinkedIn",
                    path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z",
                  },
                ].map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="size-9 rounded-full bg-blue-800 flex items-center justify-center text-blue-300 hover:bg-blue-700 hover:text-white transition-colors"
                    aria-label={social.label}
                  >
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-blue-300">
                {[
                  { label: "About Us", href: "#" },
                  { label: "How It Works", href: "#" },
                  { label: "Courses", href: "#" },
                  { label: "Find Tutors", href: "/login" },
                  { label: "Become a Tutor", href: "/register" },
                ].map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Subjects</h4>
              <ul className="space-y-2 text-sm text-blue-300">
                {[
                  "English",
                  "Tamil",
                  "Math",
                  "Science",
                  "Yoga",
                  "Music",
                  "Classical Dance",
                ].map((s) => (
                  <li key={s}>
                    <a href="#" className="hover:text-white transition-colors">
                      {s}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-blue-300">
                {[
                  "Help Center",
                  "Contact Us",
                  "Privacy Policy",
                  "Terms & Conditions",
                ].map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-white transition-colors">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
              <h4 className="font-semibold mt-6 mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm text-blue-300">
                <li className="flex items-center gap-2">
                  <Phone className="size-4" /> +91 12345 67890
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="size-4" /> support@skillnestacademy.com
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="size-4 mt-0.5" /> Chennai, Tamil Nadu,
                  India
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-blue-800 text-center py-4 text-sm text-blue-400">
          &copy; {new Date().getFullYear()} SkillNest Academy. All Rights
          Reserved.
        </div>
      </footer>
    </div>
  );
}
