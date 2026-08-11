import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getSkillNestUser, getDashboardPath } from "@/lib/auth";
import { completeSignup, deleteSignupCookie } from "@/app/register/actions";
import { LandingPage } from "@/components/LandingPage";

export default async function Home() {
  const clerkUser = await currentUser();

  if (clerkUser) {
    const user = await getSkillNestUser(clerkUser.id);

    if (!user) {
      // Read role from Clerk metadata (set during SignUp via unsafeMetadata)
      const signupRole = clerkUser.unsafeMetadata?.signupRole;
      const role = signupRole === "teacher" ? "TEACHER" : "STUDENT";

      // Create user
      await completeSignup(
        clerkUser.id,
        clerkUser.emailAddresses[0]?.emailAddress || "",
        clerkUser.firstName || null,
        clerkUser.lastName || null,
        role,
      );

      // Clean up cookie (best-effort, non-critical)
      await deleteSignupCookie().catch(() => {});

      // Redirect based on role
      if (role === "TEACHER") {
        redirect("/teacher/application-status");
      } else {
        redirect("/student");
      }
    }

    redirect(getDashboardPath(user.role));
  }

  return <LandingPage />;
}
