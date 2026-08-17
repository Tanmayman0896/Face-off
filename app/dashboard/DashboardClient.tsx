"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FootballLogo from "@/app/components/FootballLogo";
import SignOutButton from "@/app/components/SignOutButton";
import {
  getCachedTeam,
  getCachedTiers,
  setCachedTeam,
  setCachedTiers,
  type CachedTeam,
  type CachedTier,
} from "@/lib/offlineStore";
import { type DashboardData } from "@/lib/queries";

export default function DashboardClient({
  serverData,
  isOffline: serverOffline,
}: {
  serverData: DashboardData | null;
  isOffline: boolean;
}) {
  const [team, setTeam] = useState<CachedTeam | null>(
    serverData ? { id: serverData.team.id, teamName: serverData.team.teamName, balance: serverData.team.balance } : null
  );
  const [tiers, setTiers] = useState<CachedTier[]>(serverData?.tiers ?? []);
  const [usingCache, setUsingCache] = useState(false);

  useEffect(() => {
    if (serverData) {
      // DB worked — update localStorage cache
      const cachedTeam: CachedTeam = {
        id: serverData.team.id,
        teamName: serverData.team.teamName,
        balance: serverData.team.balance,
      };
      setCachedTeam(cachedTeam);
      setCachedTiers(serverData.tiers as CachedTier[]);
    } else if (serverOffline) {
      // DB down — try localStorage
      const cachedTeam = getCachedTeam();
      const cachedTiers = getCachedTiers();
      if (cachedTeam) {
        setTeam(cachedTeam);
        setTiers(cachedTiers);
        setUsingCache(true);
      }
    }
  }, [serverData, serverOffline]);

  if (!team) {
    // Not authenticated or no cache — redirect to home
    if (typeof window !== "undefined") window.location.href = "/";
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-[#f4f3ef] text-black p-4 sm:p-8 font-sans selection:bg-[#ffe600] selection:text-black">
      <div className="max-w-6xl mx-auto space-y-8">
        {usingCache && (
          <div className="px-4 py-2.5 bg-[#ffe600] border-3 border-black shadow-[4px_4px_0px_0px_#000] flex items-center gap-3 font-black text-xs uppercase tracking-wider">
            <span>📦</span>
            <span>Showing cached data — DB unreachable. Your progress is saved locally and will sync when online.</span>
          </div>
        )}

        {/* Header / Team Overview Bar */}
        <header className="p-6 sm:p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <FootballLogo size="lg" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
                  {team.teamName}
                </h1>
                <span className="px-3 py-1 bg-[#ccff00] border-2 border-black text-black font-mono font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
                  ACTIVE TEAM
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 self-end md:self-auto">
            {/* Digital Money Balance Badge */}
            <div className="text-right">
              <span className="block text-[10px] sm:text-xs uppercase tracking-wider font-black text-slate-600 mb-0.5">
                DIGITAL CURRENCY
              </span>
              <div className="bg-[#ffe600] px-3 py-1.5 border-3 border-black shadow-[4px_4px_0px_0px_#000] text-xl sm:text-2xl font-black flex items-center gap-2">
                <span>🪙</span>
                <span>${team.balance.toLocaleString()}</span>
                <span className="text-xs font-bold text-slate-800 uppercase tracking-tight">Credits</span>
              </div>
            </div>

            <SignOutButton />
          </div>
        </header>

        {/* Dashboard Shell Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-4 border-black pb-4 gap-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">CHALLENGE TIERS</h2>
              <p className="text-sm font-bold text-slate-700">
                Solve questions in each tier to earn digital currency rewards and unlock higher tiers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-[#ffe600] text-black font-black uppercase text-xs sm:text-sm border-3 border-black shadow-[3px_3px_0px_0px_#000]">
                ⚡ Challenge Tiers
              </span>
              <Link
                href="/marketplace"
                className="px-4 py-2 bg-[#00f0ff] text-black font-black uppercase text-xs sm:text-sm border-3 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>⚽ Marketplace</span>
              </Link>
            </div>
          </div>

          {tiers.length === 0 && (
            <div className="p-8 border-4 border-dashed border-black text-center font-black text-slate-500 uppercase tracking-wider">
              {usingCache ? "No cached tier data available." : "Loading tiers..."}
            </div>
          )}

          {/* 3 Tier Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tt) => {
              const isUnlocked = tt.status === "UNLOCKED";
              const isCompleted = tt.status === "COMPLETED";
              const isFailed = tt.status === "FAILED";
              const isLocked = tt.status === "LOCKED";

              return (
                <div
                  key={tt.id}
                  className={`p-6 border-4 border-black shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between transition-all ${
                    isLocked
                      ? "bg-slate-100 border-slate-700 opacity-80"
                      : isFailed
                      ? "bg-red-50 border-black"
                      : isCompleted
                      ? "bg-emerald-50 border-black"
                      : "bg-white border-black"
                  }`}
                >
                  <div>
                    {/* Badge Row */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-black px-2.5 py-1 bg-[#ffe600] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                        TIER {tt.tierNumber}
                      </span>
                      <span
                        className={`text-xs font-black px-3 py-1 uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
                          isUnlocked
                            ? "bg-[#00f0ff] text-black"
                            : isCompleted
                            ? "bg-[#ccff00] text-black"
                            : isFailed
                            ? "bg-[#ff4d4d] text-white"
                            : "bg-slate-300 text-slate-700"
                        }`}
                      >
                        {tt.status}
                      </span>
                    </div>

                    {/* Card Title & Description */}
                    <h3 className="text-xl font-black uppercase tracking-tight mb-2">
                      {tt.name}
                      {tt.tierNumber === 1 ? " - Start Tier" : ""}
                    </h3>
                    <p className="text-xs font-bold text-slate-700 mb-6 leading-relaxed">
                      {tt.description}
                    </p>

                    {/* Stats Box */}
                    <div className="bg-slate-50 border-2 border-black p-3 mb-4 space-y-2 font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#000]">
                      <div className="flex justify-between items-center border-b border-slate-300 pb-1">
                        <span className="text-slate-600">QUESTIONS:</span>
                        <span className="font-black text-black">{tt.totalQuestions}</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-300 pb-1">
                        <span className="text-slate-600">SOLVED PROGRESS:</span>
                        <span className="font-black text-black">
                          {tt.solvedQuestions} / {tt.totalQuestions}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-300 pb-1">
                        <span className="text-slate-600">RETRIES REMAINING:</span>
                        <span
                          className={`px-1.5 py-0.5 border border-black font-black ${
                            tt.retriesRemaining > 0 ? "bg-[#ccff00]" : "bg-[#ff4d4d] text-white"
                          }`}
                        >
                          {tt.retriesRemaining} / 2
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="text-slate-600">POTENTIAL REWARD:</span>
                        <span className="font-black text-[#008800]">
                          +${tt.totalReward.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Lock Requirement Notice */}
                    {isLocked && tt.unlockRequirement && (
                      <div className="p-3 bg-slate-200 border-2 border-dashed border-slate-500 font-bold text-xs text-slate-700 text-center mb-4">
                        {tt.unlockRequirement}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="pt-4 border-t-3 border-black">
                    {isUnlocked ? (
                      <Link
                        href={`/tier/${tt.tierId}`}
                        className="block w-full text-center py-3 bg-[#00f0ff] text-black font-black uppercase text-sm border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                      >
                        [ {tt.solvedQuestions > 0 ? "Continue" : "Start Tier"} ]
                      </Link>
                    ) : isCompleted ? (
                      <button
                        disabled
                        className="w-full py-3 bg-[#ccff00] text-black font-black uppercase text-sm border-2 border-black shadow-[3px_3px_0px_0px_#000] opacity-90 cursor-not-allowed"
                      >
                        [ Completed ]
                      </button>
                    ) : isFailed ? (
                      <button
                        disabled
                        className="w-full py-3 bg-[#ff4d4d] text-white font-black uppercase text-sm border-2 border-black shadow-[3px_3px_0px_0px_#000] opacity-90 cursor-not-allowed"
                      >
                        [ Failed ]
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 bg-slate-300 text-slate-600 font-black uppercase text-sm border-2 border-black shadow-[3px_3px_0px_0px_#000] cursor-not-allowed opacity-75"
                      >
                        [ Locked ]
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
