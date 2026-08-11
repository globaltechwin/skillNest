import Link from "next/link";

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
    <footer className="bg-slate-900 text-slate-300">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="size-9 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">SN</span>
              </div>
              <div>
                <span className="text-white font-bold text-lg leading-tight">SkillNest</span>
                <span className="block text-[10px] text-slate-400 tracking-widest uppercase -mt-0.5">
                  Academy
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-4">
              SkillNest Academy connects students with expert tutors for online &amp; offline
              learning across subjects and activities.
            </p>
            <div className="flex gap-3">
              {["facebook", "instagram", "youtube", "linkedin"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="size-8 rounded-full bg-slate-800 hover:bg-primary/20 flex items-center justify-center transition-colors"
                >
                  <span className="text-xs text-slate-400 hover:text-primary capitalize">
                    {social[0].toUpperCase()}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Quick Links</h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Subjects */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Subjects</h3>
            <ul className="space-y-2">
              {SUBJECTS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Support</h3>
            <ul className="space-y-2">
              {SUPPORT.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <span className="text-slate-500 mt-0.5">📞</span>
                <span className="text-sm text-slate-400">+91 12345 67890</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-500 mt-0.5">✉️</span>
                <span className="text-sm text-slate-400">support@skillnestacademy.com</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-slate-500 mt-0.5">📍</span>
                <span className="text-sm text-slate-400">Chennai, Tamil Nadu, India</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-xs text-slate-500">
            © {new Date().getFullYear()} SkillNest Academy. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
