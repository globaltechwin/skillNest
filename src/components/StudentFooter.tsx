import Link from "next/link";
import { GraduationCap, Phone, Mail, MapPin } from "lucide-react";

const QUICK_LINKS = [
  { label: "About Us", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Courses", href: "/student/courses" },
  { label: "Find Tutors", href: "/student/teachers" },
  { label: "Become a Tutor", href: "/register?role=teacher" },
];

const SUBJECTS = [
  { label: "English", href: "/student/teachers?subject=English" },
  { label: "Tamil", href: "/student/teachers?subject=Tamil" },
  { label: "Math", href: "/student/teachers?subject=Math" },
  { label: "Science", href: "/student/teachers?subject=Science" },
  { label: "Yoga", href: "/student/teachers?subject=Yoga" },
  { label: "Music", href: "/student/teachers?subject=Music" },
  { label: "Classical Dance", href: "/student/teachers?subject=Classical Dance" },
];

const SUPPORT = [
  { label: "Help Center", href: "/help" },
  { label: "Contact Us", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
];

export function StudentFooter() {
  return (
    <footer className="bg-blue-900 text-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
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
                <span className="text-[10px] text-blue-300 block -mt-1">ACADEMY</span>
                <span className="text-[8px] text-orange-400 italic">&bull; Explore &bull; Discover &bull; Achieve &bull;</span>
              </div>
            </div>
            <p className="text-sm text-blue-300 leading-relaxed max-w-sm mb-4">
              SkillNest Academy connects students with expert tutors for online & offline
              learning across subjects and activities.
            </p>
            <div className="flex gap-3">
              {["facebook", "instagram", "youtube", "linkedin"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 bg-blue-800 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                  aria-label={social}
                >
                  <span className="text-xs text-blue-300 hover:text-white capitalize">
                    {social[0].toUpperCase()}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-blue-300 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Subjects */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Subjects</h3>
            <ul className="space-y-2">
              {SUBJECTS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-blue-300 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Support</h3>
            <ul className="space-y-2">
              {SUPPORT.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-blue-300 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h3 className="text-white font-semibold text-sm mt-6 mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-300">+91 12345 67890</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-300">support@skillnestacademy.com</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 mt-0.5" />
                <span className="text-sm text-blue-300">Chennai, Tamil Nadu, India</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-blue-800">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-blue-400">
            &copy; {new Date().getFullYear()} SkillNest Academy. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
