"use client";

import React, { useRef, useState } from "react";
import { TransitionRouter } from "next-transition-router";
import gsap from "gsap";
import FootballLogo from "./FootballLogo";

export default function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);

  return (
    <TransitionRouter
      auto={true}
      leave={(next, from, to) => {
        // Skip transition if navigating to identical path
        if (from === to && from) {
          next();
          return;
        }

        const overlay = overlayRef.current;
        const card = cardRef.current;
        const msgEl = messageRef.current;

        if (!overlay) {
          next();
          return;
        }

        // Dynamically update message based on destination
        if (msgEl) {
          if (to?.startsWith("/dashboard")) {
            msgEl.textContent = "LOADING DASHBOARD & TIERS...";
          } else if (to?.startsWith("/marketplace")) {
            msgEl.textContent = "OPENING PLAYER MARKETPLACE...";
          } else if (to?.startsWith("/tier")) {
            msgEl.textContent = "ENTERING CHALLENGE ARENA...";
          } else if (to === "/") {
            msgEl.textContent = "RETURNING TO STADIUM LOBBY...";
          } else {
            msgEl.textContent = "LOADING FACE-OFF MATCH DATA...";
          }
        }

        // Smoothly reveal preloader overlay (No curtain slide)
        gsap.set(overlay, { display: "flex", opacity: 0 });
        if (card) {
          gsap.set(card, { scale: 0.94, opacity: 0 });
        }

        const tl = gsap.timeline({
          onComplete: () => {
            next();
          },
        });

        tl.to(overlay, {
          opacity: 1,
          duration: 0.2,
          ease: "power2.out",
        });

        if (card) {
          tl.to(
            card,
            {
              scale: 1,
              opacity: 1,
              duration: 0.18,
              ease: "power2.out",
            },
            "-=0.1"
          );
        }

        // Safety fallback: if anything stalls, force next() after 1.5s
        const safetyTimer = setTimeout(() => {
          next();
        }, 1500);

        return () => {
          clearTimeout(safetyTimer);
          tl.kill();
        };
      }}
      enter={(next) => {
        const overlay = overlayRef.current;
        const card = cardRef.current;

        if (!overlay) {
          next();
          return;
        }

        const tl = gsap.timeline({
          onComplete: () => {
            gsap.set(overlay, { display: "none" });
            next();
          },
        });

        if (card) {
          tl.to(card, {
            scale: 0.96,
            opacity: 0,
            duration: 0.15,
            ease: "power2.in",
          });
        }

        tl.to(
          overlay,
          {
            opacity: 0,
            duration: 0.2,
            ease: "power2.in",
          },
          "-=0.08"
        );

        // Safety fallback
        const safetyTimer = setTimeout(() => {
          if (overlay) {
            gsap.set(overlay, { display: "none" });
          }
          next();
        }, 1500);

        return () => {
          clearTimeout(safetyTimer);
          tl.kill();
        };
      }}
    >
      {/* Stadium Preloader Overlay for Transitions */}
      <div
        ref={overlayRef}
        id="faceoff-transition-preloader"
        className="fixed inset-0 z-[9999] bg-[#f4f3ef]/95 backdrop-blur-sm flex-col items-center justify-center p-4 selection:bg-[#ffe600] selection:text-black hidden"
        style={{ pointerEvents: "none" }}
      >
        <div
          ref={cardRef}
          className="relative bg-white border-4 border-black p-8 sm:p-10 shadow-[12px_12px_0px_0px_#000] max-w-md w-full text-center space-y-6"
        >
          {/* Top Header Badge */}
          <div className="flex items-center justify-between border-b-3 border-black pb-4">
            <span className="px-3 py-1 bg-[#00f0ff] text-black border-2 border-black font-mono font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
              FACEOFF
            </span>
            <span className="px-3 py-1 bg-[#ccff00] text-black border-2 border-black font-mono font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
              STADIUM LOADING
            </span>
          </div>

          {/* Logo & Headline */}
          <div className="space-y-4 py-2">
            <div className="flex justify-center">
              <div className="animate-preloader-bounce shrink-0 p-1">
                <div className="animate-preloader-spin">
                  <FootballLogo size="lg" />
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-black uppercase tracking-tight text-black">
              FACE-OFF
            </h2>

            <p
              ref={messageRef}
              className="text-xs sm:text-sm font-mono font-extrabold text-slate-800 bg-[#ffe600] p-2.5 border-2 border-black shadow-[3px_3px_0px_0px_#000] leading-snug uppercase"
            >
              LOADING FACE-OFF MATCH DATA...
            </p>
          </div>

          {/* Progress Bar Container */}
          <div className="space-y-2 pt-2 border-t-3 border-black">
            <div className="w-full h-4 bg-slate-100 border-3 border-black p-0.5 shadow-[3px_3px_0px_0px_#000] overflow-hidden">
              <div className="animate-preloader-bar h-full bg-gradient-to-r from-[#00f0ff] via-[#ccff00] to-[#ffe600] border-r-2 border-black" />
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-600 uppercase tracking-tighter">
              <span>FACEOFF MATCH</span>
              <span className="animate-pulse text-black font-black">● PROCESSING...</span>
            </div>
          </div>
        </div>
      </div>

      {children}
    </TransitionRouter>
  );
}

