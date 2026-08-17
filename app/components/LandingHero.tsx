"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import FootballLogo from "@/app/components/FootballLogo";

gsap.registerPlugin(useGSAP);

export default function LandingHero() {
  const containerRef = useRef<HTMLDivElement>(null);

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
              // TODO: wire up auth flow
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


    </div>
  );
}

