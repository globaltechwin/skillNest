import { redirect } from "next/navigation";
import { getSkillNestUser, getDashboardPath } from "@/lib/auth";
import { getActiveSession } from "@/lib/auth/custom";
import { LandingPage } from "@/components/LandingPage";

export default async function Home() {
  const session = await getActiveSession();

  if (session) {
    const user = await getSkillNestUser(session.userId);

    if (!user) {
      redirect("/login");
    }

    redirect(getDashboardPath(user.role));
  }

  return <LandingPage />;
}
