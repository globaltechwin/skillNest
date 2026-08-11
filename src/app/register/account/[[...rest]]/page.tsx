import { SignUp } from "@clerk/nextjs";
import { GraduationCap } from "lucide-react";

type Props = {
  searchParams: Promise<{ role?: string }>;
};

export default async function AccountSignupPage({ searchParams }: Props) {
  const params = await searchParams;
  const role = params.role === "teacher" ? "teacher" : "student";

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Branding */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] relative overflow-hidden bg-primary">
        <div className="absolute inset-0 opacity-[0.07]">
          <svg
            className="absolute top-0 left-0 h-full w-full"
            viewBox="0 0 800 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="650" cy="80" r="180" fill="currentColor" className="text-white" />
            <circle cx="100" cy="500" r="220" fill="currentColor" className="text-white" />
            <circle cx="500" cy="350" r="160" fill="currentColor" className="text-white" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-between w-full px-10 xl:px-16 py-12">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <GraduationCap className="size-6 text-white" strokeWidth={1.8} />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              SkillNest
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight text-white tracking-tight">
              Start your journey.{" "}
              <span className="text-white/80">Unlock your potential.</span>
            </h1>
            <p className="mt-6 text-lg text-white/70 leading-relaxed">
              Create your account and get access to expert tutors, personalized
              learning plans, and a community that supports your growth.
            </p>
          </div>

          <p className="text-sm text-white/40">
            &copy; {new Date().getFullYear()} SkillNest. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Section - Clerk Sign Up */}
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
              Create your account
            </h2>
            <p className="text-sm text-muted-foreground">
              Join SkillNest and start your journey
            </p>
          </div>

          <SignUp
            routing="path"
            path="/register/account"
            signInUrl="/login"
            fallbackRedirectUrl="/"
            unsafeMetadata={{ signupRole: role }}
          />
        </div>
      </div>
    </div>
  );
}
