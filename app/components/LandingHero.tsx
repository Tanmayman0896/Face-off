"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { signInAction } from "@/app/actions/auth";
import FootballLogo from "@/app/components/FootballLogo";
import { useTransitionRouter } from "next-transition-router";

gsap.registerPlugin(useGSAP);

export default function LandingHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useTransitionRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useGSAP(
    () => {
      gsap.from(".brutalist-hero", {
        opacity: 0,
        y: 15,
        duration: 0.35,
        ease: "power2.out",
      });
      gsap.from(".brutalist-card", {
        opacity: 0,
        y: 20,
        stagger: 0.08,
        duration: 0.35,
        ease: "power2.out",
        delay: 0.1,
      });
    },
    { scope: containerRef }
  );

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await signInAction(formData);

    if (result.success) {
      setShowAuthModal(false);
      if (result.redirectUrl && result.redirectUrl !== "/") {
        router.push(result.redirectUrl);
      } else {
        // If remaining on root (e.g. going to OnboardingForm), refresh page view
        router.refresh();
      }
    } else {
      setErrorMessage(result.error || "Authentication failed. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full bg-[#f4f3ef] text-black flex flex-col items-center justify-between px-6 sm:px-8 py-6 sm:py-8 font-sans selection:bg-[#ffe600] selection:text-black"
    >
      {/* Top Header Navigation */}
      <header className="w-full flex items-center justify-between py-3 border-b-4 border-black mb-6">
        <div className="flex items-center gap-3">
          <FootballLogo size="md" />
          <span className="font-black text-2xl tracking-tighter uppercase">
            FACEOFF
          </span>
        </div>

        <button
          onClick={() => {
            setErrorMessage(null);
            setShowAuthModal(true);
          }}
          className="px-5 py-2 bg-[#00f0ff] text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider border-3 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
        >
          Sign In / Register
        </button>
      </header>

      {/* Hero Body */}
      <main className="brutalist-hero w-full flex flex-col items-center text-center my-auto py-4">
        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase leading-[0.98] max-w-5xl text-black">
          PROVE YOUR SKILL IN THE{" "}
          <span className="bg-[#ffe600] px-2 py-0.5 border-3 border-black inline-block shadow-[4px_4px_0px_0px_#000] rotate-[-1deg] my-1">
            TIER-BASED
          </span>{" "}
          FACE-OFF
        </h1>

        {/* Subtitle */}
        <p className="mt-5 sm:mt-6 text-sm sm:text-lg font-bold text-slate-800 max-w-2xl leading-snug">
          Form your team, unlock progressive challenge tiers, and earn balance rewards with strict server-side validation and retry tracking.
        </p>

        {/* CTA Action */}
        <div className="mt-7">
          <button
            onClick={() => {
              setErrorMessage(null);
              setShowAuthModal(true);
            }}
            className="px-8 py-3.5 bg-[#ffe600] text-black font-black text-base sm:text-lg uppercase tracking-wider border-4 border-black shadow-[5px_5px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
          >
            ENTER THE CHALLENGE &rarr;
          </button>
        </div>

        {/* Brutalist Game Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 w-full mt-10 sm:mt-12 text-left">
          <div className="brutalist-card p-5 bg-white border-4 border-black shadow-[5px_5px_0px_0px_#000]">
            <div className="w-11 h-11 bg-[#ffe600] border-3 border-black flex items-center justify-center font-mono font-black text-lg mb-3 shadow-[2px_2px_0px_0px_#000]">
              01
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight mb-1.5">
              Tiered Progression
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-700 leading-normal">
              Start at Tier 1 with 2 retries. Solve questions to earn cash rewards and unlock higher tiers.
            </p>
          </div>

          <div className="brutalist-card p-5 bg-white border-4 border-black shadow-[5px_5px_0px_0px_#000]">
            <div className="w-11 h-11 bg-[#00f0ff] border-3 border-black flex items-center justify-center font-mono font-black text-lg mb-3 shadow-[2px_2px_0px_0px_#000]">
              02
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight mb-1.5">
              Retry Management
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-700 leading-normal">
              Each tier allows 2 retries. Incorrect attempts decrement your count. Reach 0 and the tier locks as failed.
            </p>
          </div>

          <div className="brutalist-card p-5 bg-white border-4 border-black shadow-[5px_5px_0px_0px_#000]">
            <div className="w-11 h-11 bg-[#ccff00] border-3 border-black flex items-center justify-center font-mono font-black text-lg mb-3 shadow-[2px_2px_0px_0px_#000]">
              03
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight mb-1.5">
              Server Evaluated
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-700 leading-normal">
              Answers and team balance are strictly evaluated on the server with Neon PostgreSQL transaction integrity.
            </p>
          </div>
        </div>
      </main>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-md p-7 bg-white border-4 border-black shadow-[10px_10px_0px_0px_#000]">
            <button
              onClick={() => {
                if (!isSubmitting) setShowAuthModal(false);
              }}
              disabled={isSubmitting}
              className="absolute top-4 right-4 bg-[#ff4d4d] border-2 border-black font-black text-white w-8 h-8 flex items-center justify-center hover:bg-black hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer disabled:opacity-50"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <FootballLogo size="sm" />
              <h2 className="text-xl font-black uppercase tracking-tight">
                PLAYER SIGN IN
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-700 mb-6">
              Enter your email or player identifier to start onboarding.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 text-red-900 font-bold text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider mb-2">
                  Player Email / ID
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="leader@cyberknights.io"
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-[#f4f3ef] border-3 border-black text-black font-mono font-bold placeholder-slate-400 focus:outline-none focus:bg-white transition text-sm disabled:opacity-50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-[#ffe600] text-black font-black text-sm uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "AUTHENTICATING..." : "AUTHENTICATE →"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

