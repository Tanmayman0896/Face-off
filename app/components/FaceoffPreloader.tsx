"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import FootballLogo from "./FootballLogo";

gsap.registerPlugin(useGSAP);

interface FaceoffPreloaderProps {
  message?: string;
  variant?: "fullscreen" | "section" | "inline";
  className?: string;
}

export default function FaceoffPreloader({
  message = "LOADING FACE-OFF MATCH DATA...",
  variant = "fullscreen",
  className = "",
}: FaceoffPreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Continuous energetic rotation animation on Football logo
      gsap.fromTo(
        ".preloader-ball-spin",
        { rotation: 0 },
        {
          rotation: 360,
          duration: 2.5,
          repeat: -1,
          ease: "none",
        }
      );

      // Vertical bounce animation on outer logo container
      gsap.fromTo(
        ".preloader-ball-bounce",
        { y: 0 },
        {
          y: -8,
          duration: 0.6,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        }
      );

      // Pulsing progress fill animation
      gsap.fromTo(
        ".preloader-bar-fill",
        { width: "15%" },
        {
          width: "92%",
          duration: 1.4,
          repeat: -1,
          yoyo: true,
          ease: "power2.inOut",
        }
      );
    },
    { scope: containerRef }
  );

  if (variant === "inline") {
    return (
      <span
        ref={containerRef as unknown as React.RefObject<HTMLSpanElement>}
        className={`inline-flex items-center gap-2 font-mono text-xs font-black uppercase ${className}`}
      >
        <div className="preloader-ball-bounce animate-preloader-bounce inline-block shrink-0">
          <div className="preloader-ball-spin animate-preloader-spin">
            <FootballLogo size="sm" />
          </div>
        </div>
        <span className="tracking-wider">{message}</span>
      </span>
    );
  }

  if (variant === "section") {
    return (
      <div
        ref={containerRef}
        className={`w-full p-8 bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] flex flex-col items-center justify-center text-center space-y-4 my-4 ${className}`}
      >
        <div className="preloader-ball-bounce animate-preloader-bounce shrink-0">
          <div className="preloader-ball-spin animate-preloader-spin">
            <FootballLogo size="lg" />
          </div>
        </div>
        <div>
          <div className="inline-block px-3 py-1 bg-[#ffe600] text-black border-2 border-black font-black text-xs uppercase tracking-widest shadow-[2px_2px_0px_0px_#000] mb-2">
            FACE-OFF
          </div>
          <p className="font-mono text-sm font-black text-black uppercase tracking-tight">
            {message}
          </p>
        </div>
        {/* Loader bar */}
        <div className="w-48 sm:w-64 h-3 bg-slate-100 border-2 border-black p-0.5 overflow-hidden shadow-[2px_2px_0px_0px_#000]">
          <div className="preloader-bar-fill animate-preloader-bar h-full bg-[#00f0ff] border-r border-black" />
        </div>
      </div>
    );
  }

  // Fullscreen variant
  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[9999] bg-[#f4f3ef]/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 selection:bg-[#ffe600] selection:text-black ${className}`}
    >
      <div className="relative bg-white border-4 border-black p-8 sm:p-10 shadow-[12px_12px_0px_0px_#000] max-w-md w-full text-center space-y-6">
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
            <div className="preloader-ball-bounce animate-preloader-bounce shrink-0 p-1">
              <div className="preloader-ball-spin animate-preloader-spin">
                <FootballLogo size="lg" />
              </div>
            </div>
          </div>

          <h2 className="text-3xl font-black uppercase tracking-tight text-black">
            FACE-OFF
          </h2>

          <p className="text-xs sm:text-sm font-mono font-extrabold text-slate-800 bg-[#ffe600] p-2.5 border-2 border-black shadow-[3px_3px_0px_0px_#000] leading-snug">
            {message}
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="space-y-2 pt-2 border-t-3 border-black">
          <div className="w-full h-4 bg-slate-100 border-3 border-black p-0.5 shadow-[3px_3px_0px_0px_#000] overflow-hidden">
            <div className="preloader-bar-fill animate-preloader-bar h-full bg-gradient-to-r from-[#00f0ff] via-[#ccff00] to-[#ffe600] border-r-2 border-black" />
          </div>

          <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-600 uppercase tracking-tighter">
            <span>FACEOFF MATCH</span>
            <span className="animate-pulse text-black font-black">● PROCESSING...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

