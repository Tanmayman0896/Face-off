import { redirect } from "next/navigation";
import { getAuthSession, getCurrentTeam } from "@/lib/auth";
import LandingHero from "@/app/components/LandingHero";
import OnboardingForm from "@/app/components/OnboardingForm";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getAuthSession();

  // 1. Unauthenticated view
  if (!session?.userId) {
    return <LandingHero />;
  }

  const team = await getCurrentTeam();

  // 3. Authenticated and onboarded view -> Auto-redirect to /dashboard
  if (team) {
    redirect("/dashboard");
  }

  // 2. Authenticated but non-onboarded view -> Onboarding form
  return <OnboardingForm userId={session.userId} email={session.email} />;
}
