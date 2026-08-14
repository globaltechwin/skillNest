import { redirect } from "next/navigation";
import { getSkillNestUser, getDashboardPath } from "@/lib/auth";
import { getActiveSession } from "@/lib/auth/custom";
import { LandingPage } from "@/components/LandingPage";

export default async function Home() {
  return <LandingPage />;
}
