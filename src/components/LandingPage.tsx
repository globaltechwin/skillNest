"use client";

import Link from "next/link";
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
} from "lucide-react";
import { useState } from "react";
import FeaturedTeachersSection from "@/components/FeaturedTeachersSection";

const subjects = [
  { name: "English", icon: "A", color: "bg-red-100 text-red-600" },
  { name: "Tamil", icon: "\u0B87", color: "bg-yellow-100 text-yellow-600" },
  { name: "Math", icon: "\u221Ax", color: "bg-green-100 text-green-600" },
  { name: "Science", icon: "E", color: "bg-purple-100 text-purple-600" },
  { name: "Yoga", icon: "\u2638", color: "bg-pink-100 text-pink-600" },
  { name: "Music", icon: "\u266B", color: "bg-rose-100 text-rose-600" },
  { name: "Classical Dance", icon: "\u2766", color: "bg-orange-100 text-orange-600" },
];

const steps = [
  { num: 1, title: "Choose a Subject", desc: "Pick the subject or activity you want to learn", icon: BookOpen },
  { num: 2, title: "Select a Tutor", desc: "View tutors and choose the best fit for you", icon: Users },
  { num: 3, title: "Book a Class", desc: "Schedule your class at your convenience", icon: Calendar },
  { num: 4, title: "Start Learning", desc: "Join live classes and achieve your goals", icon: CheckCircle },
];

export function LandingPage() {
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-blue-600">
                <GraduationCap className="size-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-blue-600">SkillNest</span>
                <span className="text-[10px] text-gray-400 block -mt-1">ACADEMY</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {["Home", "About Us", "Courses", "How It Works", "Pricing", "Contact Us"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login?redirect_url=/teacher"
                className="inline-flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <User className="size-4" />
                Tutor Login
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </div>

            <button
              className="md:hidden size-10 flex items-center justify-center rounded-lg hover:bg-gray-100"
              onClick={() => setMobileNav(!mobileNav)}
            >
              {mobileNav ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {mobileNav && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
            {["Home", "About Us", "Courses", "How It Works", "Pricing", "Contact Us"].map((item) => (
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
              <Link href="/login?redirect_url=/teacher" className="text-center rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600">
                Tutor Login
              </Link>
              <Link href="/register" className="text-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">
                Sign In
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Connect with Skilled Tutors for{" "}
                <span className="text-blue-600">Online</span> &{" "}
                <span className="text-orange-500">Offline</span> Learning
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Personalized Learning. Better Results.
              </p>
              <div className="mt-8 flex flex-wrap gap-8">
                {[
                  { label: "Verified Tutors", value: "7.5 Lakh+" },
                  { label: "Students", value: "55 Lakh+" },
                  { label: "Reviews", value: "4 Lakh+" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-orange-100 rounded-3xl transform rotate-3 scale-105" />
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-blue-200 to-orange-200 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Users className="size-16 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Live Learning Session</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section id="courses" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Explore Top Subjects & Activities
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {subjects.map((subject) => (
              <div
                key={subject.name}
                className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className={`size-14 rounded-xl flex items-center justify-center text-xl font-bold ${subject.color} group-hover:scale-110 transition-transform`}>
                  {subject.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">{subject.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-full h-0.5 bg-gray-200 -translate-x-1/2 z-0" />
                )}
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="size-20 rounded-full bg-blue-100 flex items-center justify-center">
                      <step.icon className="size-8 text-blue-600" />
                    </div>
                    <span className="absolute -top-2 -left-2 size-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">{step.title}</h3>
                  <p className="text-sm text-gray-500 max-w-[200px]">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Teachers */}
      <FeaturedTeachersSection />

      {/* Features Bar */}
      <section className="py-8 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center text-white">
            {[
              { icon: Users, label: "Live Interactive Classes" },
              { icon: Award, label: "Learn from Verified Tutors" },
              { icon: Clock, label: "Flexible Timings & Affordable Fees" },
              { icon: Shield, label: "100% Safe & Secure Platform" },
              { icon: GraduationCap, label: "Quality Education, Better Future" },
            ].map((feat) => (
              <div key={feat.label} className="flex flex-col items-center gap-2">
                <feat.icon className="size-6" />
                <span className="text-xs font-medium leading-tight">{feat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact-us" className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-600">
                  <GraduationCap className="size-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold">SkillNest</span>
                  <span className="text-[10px] text-gray-400 block -mt-1">ACADEMY</span>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                SkillNest Academy connects students with expert tutors for online & offline
                learning across subjects and activities.
              </p>
              <div className="flex gap-3 mt-4">
                {[
                  { label: "Facebook", path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
                  { label: "Instagram", path: "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" },
                  { label: "Youtube", path: "M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.46zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z" },
                  { label: "LinkedIn", path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" },
                ].map((social) => (
                  <a key={social.label} href="#" target="_blank" rel="noopener noreferrer" className="size-9 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-700 hover:text-white transition-colors" aria-label={social.label}>
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={social.path} /></svg>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {[
                  { label: "About Us", href: "#" },
                  { label: "How It Works", href: "#" },
                  { label: "Courses", href: "#" },
                  { label: "Find Tutors", href: "/login" },
                  { label: "Become a Tutor", href: "/register" },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="hover:text-white transition-colors">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Subjects</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {["English", "Tamil", "Math", "Science", "Yoga", "Music", "Classical Dance"].map((s) => (
                  <li key={s}>
                    <a href="#" className="hover:text-white transition-colors">{s}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {["Help Center", "Contact Us", "Privacy Policy", "Terms & Conditions"].map((link) => (
                  <li key={link}>
                    <a href="#" className="hover:text-white transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
              <h4 className="font-semibold mt-6 mb-3">Contact Us</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2"><Phone className="size-4" /> +91 12345 67890</li>
                <li className="flex items-center gap-2"><Mail className="size-4" /> support@skillnestacademy.com</li>
                <li className="flex items-center gap-2"><MapPin className="size-4" /> Chennai, Tamil Nadu, India</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 text-center py-4 text-sm text-gray-500">
          &copy; {new Date().getFullYear()} SkillNest Academy. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
