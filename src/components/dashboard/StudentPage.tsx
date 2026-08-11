"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Menu,
  X,
  Users,
  Award,
  Star,
  Phone,
  Mail,
  MapPin,
  Headphones,
  Shield,
  Clock,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FeaturedTeachersSection from "@/components/FeaturedTeachersSection";

const subjects = [
  { name: "English", color: "bg-blue-500", letter: "A" },
  { name: "Tamil", color: "bg-green-500", letter: "\u0B95" },
  { name: "Math", color: "bg-gray-700", letter: "\u221Ax" },
  { name: "Science", color: "bg-indigo-400", letter: "\u2697" },
  { name: "Yoga", color: "bg-purple-300", letter: "\uD83E\uDDD8" },
  { name: "Music", color: "bg-pink-400", letter: "\u266A" },
  { name: "Classical Dance", color: "bg-red-500", letter: "\uD83D\uDC83" },
];

const howItWorks = [
  { step: 1, title: "Choose a Subject", description: "Pick the subject or activity you want to learn" },
  { step: 2, title: "Select a Tutor", description: "View tutors and choose the best fit for you" },
  { step: 3, title: "Book a Class", description: "Schedule your class at your convenience" },
  { step: 4, title: "Start Learning", description: "Join live classes and achieve your goals" },
];

const features = [
  { icon: Headphones, title: "Live Interactive Classes" },
  { icon: Award, title: "Learn from Verified Tutors" },
  { icon: Clock, title: "Flexible Timings & Affordable Fees" },
  { icon: Shield, title: "100% Safe & Secure Platform" },
  { icon: Trophy, title: "Quality Education, Better Future" },
];

export default function StudentDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <StudentHeader
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <main className="flex-1">
        <HeroSection />
        <SubjectsSection />
        <HowItWorksSection />
        <FeaturedTeachersSection />
        <InfoBanner />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}

function StudentHeader({
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
}) {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-orange-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-blue-900 leading-tight">SkillNest</span>
            <span className="text-[10px] text-gray-500 tracking-wider">ACADEMY</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {["Home", "About Us", "Courses", "How It Works", "Pricing", "Contact Us"].map((item) => (
            <Link
              key={item}
              href={item === "Home" ? "/student" : `/${item.toLowerCase().replace(/ /g, "-")}`}
              className={`text-sm font-medium ${
                item === "Home" ? "text-blue-900 border-b-2 border-blue-900 pb-1" : "text-gray-600 hover:text-blue-900"
              }`}
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/student/browse" className="hidden sm:flex">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-full px-5" size="sm">
              Find Tutors
            </Button>
          </Link>
          <button className="md:hidden p-2 text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          {["Home", "About Us", "Courses", "How It Works", "Pricing", "Contact Us"].map((item) => (
            <Link
              key={item}
              href={item === "Home" ? "/student" : `/${item.toLowerCase().replace(/ /g, "-")}`}
              className="block text-sm font-medium text-gray-600"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          <Link href="/student/browse" onClick={() => setMobileMenuOpen(false)}>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-full">
              Find Tutors
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Connect with Skilled Tutors for{" "}
              <span className="text-blue-600">Online</span> &{" "}
              <span className="text-orange-500">Offline</span> Learning
            </h1>
            <p className="text-lg text-gray-600">Personalized Learning. Better Results.</p>

            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">7.5 Lakh+</p>
                  <p className="text-xs text-gray-500">Verified Tutors</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">55 Lakh+</p>
                  <p className="text-xs text-gray-500">Students</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">4 Lakh+</p>
                  <p className="text-xs text-gray-500">Reviews</p>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <div className="w-24 h-24 mx-auto bg-white/50 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-12 h-12 text-blue-600" />
                </div>
                <p className="text-sm text-blue-700 font-medium">Online & Offline Learning</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SubjectsSection() {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
          Explore Top Subjects & Activities
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4">
          {subjects.map((subject) => (
            <div
              key={subject.name}
              className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div
                className={`w-14 h-14 ${subject.color} rounded-xl flex items-center justify-center text-white text-xl font-bold`}
              >
                {subject.letter}
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">{subject.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">How It Works</h2>
        <div className="flex flex-col md:flex-row items-start justify-center gap-6 md:gap-4">
          {howItWorks.map((step, i) => (
            <div key={step.step} className="flex items-start gap-4 flex-1">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-2xl">
                      {step.step === 1 ? "\uD83D\uDCCB" : step.step === 2 ? "\uD83D\uDC64" : step.step === 3 ? "\uD83D\uDCC5" : "\uD83C\uDFAF"}
                    </span>
                  </div>
                  <span className="absolute -top-1 -left-1 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {step.step}
                  </span>
                </div>
              </div>
              <div className="pt-2">
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{step.description}</p>
              </div>
              {i < howItWorks.length - 1 && (
                <div className="hidden md:flex items-center pt-4">
                  <span className="text-gray-400 text-xl">→</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function InfoBanner() {
  return (
    <section className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl">💬</span>
          </div>
          <p className="text-sm text-gray-700">
            <strong>Students can browse subjects, view the list of expert tutors, check their profiles,
            ratings & experience, and select the best tutor to start learning.</strong>
          </p>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="py-8 border-t border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {features.map((feature) => (
            <div key={feature.title} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <feature.icon className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{feature.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold">SkillNest</span>
                <span className="block text-[10px] tracking-wider text-blue-300">ACADEMY</span>
              </div>
            </div>
            <p className="text-sm text-blue-300 leading-relaxed">
              SkillNest Academy connects students with expert tutors for online & offline learning across subjects and activities.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-700" aria-label="Facebook">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-700" aria-label="Instagram">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
              </a>
              <a href="#" className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-700" aria-label="YouTube">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="#" className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-700" aria-label="LinkedIn">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-blue-300">
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white">How It Works</Link></li>
              <li><Link href="/courses" className="hover:text-white">Courses</Link></li>
              <li><Link href="/student/browse" className="hover:text-white">Find Tutors</Link></li>
              <li><Link href="/register" className="hover:text-white">Become a Tutor</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Subjects</h4>
            <ul className="space-y-2 text-sm text-blue-300">
              <li><Link href="/student/browse?subject=english" className="hover:text-white">English</Link></li>
              <li><Link href="/student/browse?subject=tamil" className="hover:text-white">Tamil</Link></li>
              <li><Link href="/student/browse?subject=math" className="hover:text-white">Math</Link></li>
              <li><Link href="/student/browse?subject=science" className="hover:text-white">Science</Link></li>
              <li><Link href="/student/browse?subject=yoga" className="hover:text-white">Yoga</Link></li>
              <li><Link href="/student/browse?subject=music" className="hover:text-white">Music</Link></li>
              <li><Link href="/student/browse?subject=dance" className="hover:text-white">Classical Dance</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-blue-300">
              <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-blue-300">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                +91 12345 67890
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                support@skillnestacademy.com
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                Chennai, Tamil Nadu, India
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-blue-800 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm text-blue-400">
          &copy; 2024 SkillNest Academy. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
