"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { completeOnboarding, signOutAction } from "@/app/actions/auth";
import FootballLogo from "@/app/components/FootballLogo";
import { useTransitionRouter } from "next-transition-router";

gsap.registerPlugin(useGSAP);

interface OnboardingFormProps {
  userId: string;
  email?: string;
}

export default function OnboardingForm({ userId, email }: OnboardingFormProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useTransitionRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useGSAP(
    () => {
      gsap.from(".brutalist-card", {
        opacity: 0,
        y: 15,
        duration: 0.35,
        ease: "power2.out",
      });
    },
    { scope: containerRef }
  );

  async function handleOnboardingSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await completeOnboarding(formData);

    if (result.success) {
      router.push(result.redirectUrl || "/dashboard");
    } else {
      setErrorMessage(result.error || "Failed to create team. Please try again.");
      setIsSubmitting(false);
    }
  }

  async function handleSignOut(e: React.FormEvent) {
    e.preventDefault();
    if (isSigningOut) return;

    setIsSigningOut(true);
    const result = await signOutAction();

    if (result.success) {
      if (window.location.pathname === "/") {
        router.refresh();
      } else {
        router.push("/");
      }
    } else {
      setIsSigningOut(false);
    }
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full bg-[#f4f3ef] text-black flex flex-col items-center justify-center p-4 sm:p-8 font-sans selection:bg-[#ffe600] selection:text-black"
    >
      <div className="w-full max-w-lg">
        {/* Onboarding Card */}
        <div className="brutalist-card p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000]">
          <div className="flex items-center justify-between mb-6 pb-4 border-b-3 border-black">
            <div className="flex items-center gap-3">
              <FootballLogo size="md" />
              <div>
                <h1 className="text-xl font-black uppercase tracking-tight">TEAM SETUP</h1>
                <p className="text-xs font-mono font-bold text-slate-600">STEP 2: AUTH CONNECTED</p>
              </div>
            </div>
            <form onSubmit={handleSignOut}>
              <button
                type="submit"
                disabled={isSigningOut || isSubmitting}
                className="text-xs font-black uppercase tracking-wider bg-[#ff4d4d] text-white px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-black transition cursor-pointer disabled:opacity-50"
              >
                {isSigningOut ? "..." : "Sign Out"}
              </button>
            </form>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">
              REGISTER YOUR TEAM
            </h2>
            <p className="text-sm font-bold text-slate-700 leading-snug">
              Enter your team details. Onboarding automatically unlocks{" "}
              <span className="bg-[#ccff00] px-1 border border-black font-mono">TIER 1</span> with 2 retries in PostgreSQL.
            </p>
            {email && (
              <div className="mt-3 inline-block px-3 py-1 bg-[#00f0ff] border-2 border-black text-xs font-mono font-bold shadow-[2px_2px_0px_0px_#000]">
                AUTHENTICATED: {email}
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="mb-5 p-3 bg-red-100 border-2 border-red-500 text-red-900 font-bold text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleOnboardingSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2">
                Team Name <span className="text-[#ff4d4d]">*</span>
              </label>
              <input
                type="text"
                name="teamName"
                placeholder="e.g. CYBER KNIGHTS"
                required
                minLength={2}
                maxLength={50}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-[#f4f3ef] border-3 border-black text-black font-bold placeholder-slate-400 focus:outline-none focus:bg-white transition disabled:opacity-50"
              />
            </div>


            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || isSigningOut}
                className="w-full py-4 bg-[#ffe600] text-black font-black text-base uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 transition-all cursor-pointer"
              >
                {isSubmitting ? "CREATING TEAM & STARTING..." : "REGISTER TEAM & START →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

