import { SignIn } from "@clerk/nextjs";
import {
  GraduationCap,
  BookOpen,
  Users,
  Award,
} from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Section - Branding */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] relative overflow-hidden bg-primary">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-[0.07]">
          <svg
            className="absolute top-0 left-0 h-full w-full"
            viewBox="0 0 800 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="120" cy="100" r="200" fill="currentColor" className="text-white" />
            <circle cx="650" cy="450" r="250" fill="currentColor" className="text-white" />
            <circle cx="400" cy="300" r="150" fill="currentColor" className="text-white" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-between w-full px-10 xl:px-16 py-12">
          {/* Top - Logo */}
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <GraduationCap className="size-6 text-white" strokeWidth={1.8} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              SkillNest
            </span>
          </div>

          {/* Center - Main content */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight text-white tracking-tight">
              Explore. Discover.{" "}
              <span className="text-white/80">Achieve.</span>
            </h1>
            <p className="mt-6 text-lg text-white/70 leading-relaxed">
              Connect with skilled tutors for personalized online and offline
              learning experiences. Your journey to mastery starts here.
            </p>

            {/* Feature cards */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FeatureCard
                icon={Users}
                title="Expert Tutors"
                description="Learn from verified professionals"
              />
              <FeatureCard
                icon={BookOpen}
                title="Flexible Learning"
                description="Online & offline sessions"
              />
              <FeatureCard
                icon={Award}
                title="Proven Results"
                description="Track your progress always"
              />
            </div>
          </div>

          {/* Bottom - Footer */}
          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} SkillNest. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Section - Clerk Sign In */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10 lg:px-12 xl:px-16">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <GraduationCap className="size-5 text-primary" strokeWidth={1.8} />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              SkillNest
            </span>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground">
              Sign in to continue your learning journey
            </p>
          </div>

          <SignIn
            routing="path"
            path="/login"
            signUpUrl="/register"
            fallbackRedirectUrl="/"
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof GraduationCap;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.07] backdrop-blur-sm p-4">
      <Icon className="size-5 text-white/80 mb-2.5" strokeWidth={1.5} />
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-xs text-white/50 leading-relaxed">{description}</p>
    </div>
  );
}
