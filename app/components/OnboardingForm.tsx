"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { completeOnboarding, signOutAction } from "@/app/actions/auth";
import FootballLogo from "@/app/components/FootballLogo";

gsap.registerPlugin(useGSAP);

interface OnboardingFormProps {
  userId: string;
  email?: string;
}

export default function OnboardingForm({ userId, email }: OnboardingFormProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-xs font-black uppercase tracking-wider bg-[#ff4d4d] text-white px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-black transition"
              >
                Sign Out
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

          <form
            action={async (formData) => {
              setIsSubmitting(true);
              await completeOnboarding(formData);
            }}
            className="space-y-5"
          >
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
                className="w-full px-4 py-3 bg-[#f4f3ef] border-3 border-black text-black font-bold placeholder-slate-400 focus:outline-none focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2">
                Team Leader Name <span className="text-[#ff4d4d]">*</span>
              </label>
              <input
                type="text"
                name="teamLeaderName"
                placeholder="e.g. ALEX MERCER"
                required
                minLength={2}
                maxLength={50}
                className="w-full px-4 py-3 bg-[#f4f3ef] border-3 border-black text-black font-bold placeholder-slate-400 focus:outline-none focus:bg-white transition"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#ffe600] text-black font-black text-base uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 transition-all"
              >
                {isSubmitting ? "CREATING TEAM..." : "REGISTER TEAM & START →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
