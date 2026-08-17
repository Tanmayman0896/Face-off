"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import FootballLogo from "./FootballLogo";
import SignOutButton from "./SignOutButton";
import FaceoffPreloader from "./FaceoffPreloader";
import { useLoading } from "@/app/context/LoadingContext";
import { buyPlayerAction } from "@/app/actions/marketplace";
import { signOutAction } from "@/app/actions/auth";

export interface PlayerData {
  id: string;
  tierNumber: number;
  position: "Striker" | "Midfielder" | "Defender" | "Goalkeeper";
  playerName: string;
  price: number;
  speed: number;
  physical: number;
  technique: number;
  stamina: number;
  precision: number;
  defense: number;
  pros: string;
  cons: string;
  overallScore: number;
  isOwned: boolean;
}

interface MarketplaceViewProps {
  initialTeam: {
    id: string;
    teamName: string;
    teamLeaderName: string;
    balance: number;
  };
  initialPlayers: PlayerData[];
  initialOwnedCount: number;
}

export default function MarketplaceView({
  initialTeam,
  initialPlayers,
  initialOwnedCount,
}: MarketplaceViewProps) {
  const [team, setTeam] = useState(initialTeam);
  const [players, setPlayers] = useState(initialPlayers);
  const [ownedCount, setOwnedCount] = useState(initialOwnedCount);
  const { showLoading, hideLoading } = useLoading();

  // Filters
  const [viewMode, setViewMode] = useState<"catalog" | "squad">("catalog");
  const [selectedTier, setSelectedTier] = useState<number | 0>(0); // 0 = All
  const [selectedPosition, setSelectedPosition] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Animation Refs
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const successBadgeRef = useRef<HTMLDivElement>(null);

  // Filtered Players Calculation
  const filteredPlayers = players.filter((p) => {
    if (viewMode === "squad" && !p.isOwned) return false;
    if (selectedTier !== 0 && p.tierNumber !== selectedTier) return false;
    if (selectedPosition !== "ALL" && p.position !== selectedPosition) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchName = p.playerName.toLowerCase().includes(q);
      const matchPros = p.pros.toLowerCase().includes(q);
      const matchCons = p.cons.toLowerCase().includes(q);
      if (!matchName && !matchPros && !matchCons) return false;
    }
    return true;
  });

  // GSAP animation for grid refresh on filter change
  useGSAP(
    () => {
      if (!gridContainerRef.current) return;
      const cards = gridContainerRef.current.querySelectorAll(".player-card");
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 25, scale: 0.96 },
          { opacity: 1, y: 0, scale: 1, stagger: 0.03, duration: 0.35, ease: "power2.out" }
        );
      }
    },
    { dependencies: [viewMode, selectedTier, selectedPosition, searchQuery], scope: gridContainerRef }
  );

  // GSAP animation when modal opens
  useGSAP(
    () => {
      if (selectedPlayer && modalRef.current) {
        gsap.fromTo(
          modalRef.current,
          { scale: 0.85, opacity: 0, y: -20 },
          { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: "back.out(1.7)" }
        );
      }
    },
    { dependencies: [selectedPlayer] }
  );

  const handleBuyPlayer = async (player: PlayerData) => {
    setIsSubmitting(true);
    setFeedback(null);
    showLoading(`SIGNING ${player.playerName.toUpperCase()} TO ${team.teamName.toUpperCase()}...`);

    try {
      const res = await buyPlayerAction(player.id);

      if (res.success && res.newBalance !== undefined) {
        // Update local state database reflection
        setTeam((prev) => ({ ...prev, balance: res.newBalance! }));
        setPlayers((prev) =>
          prev.map((p) => (p.id === player.id ? { ...p, isOwned: true } : p))
        );
        setOwnedCount((prev) => prev + 1);

        setFeedback({
          type: "success",
          message: `🎉 SUCCESS! ${player.playerName} has signed for ${team.teamName}!`,
        });

        // Animate purchase success
        if (successBadgeRef.current) {
          gsap.fromTo(
            successBadgeRef.current,
            { scale: 0.5, opacity: 0, rotation: -10 },
            { scale: 1, opacity: 1, rotation: 0, duration: 0.4, ease: "elastic.out(1, 0.5)" }
          );
        }

        setTimeout(async () => {
          if (ownedCount + 1 >= 7) {
            await signOutAction();
            window.location.href = "/";
          } else {
            setSelectedPlayer(null);
            setFeedback(null);
            setIsSubmitting(false);
          }
        }, 1500);
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Failed to purchase player.",
        });
        setIsSubmitting(false);
      }
    } finally {
      hideLoading();
    }
  };

  const getPositionBadgeColor = (pos: string) => {
    switch (pos) {
      case "Striker":
        return "bg-[#ff4d4d] text-white";
      case "Midfielder":
        return "bg-[#00f0ff] text-black";
      case "Defender":
        return "bg-[#ccff00] text-black";
      case "Goalkeeper":
        return "bg-[#ffe600] text-black";
      default:
        return "bg-slate-200 text-black";
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f3ef] text-black p-4 sm:p-8 font-sans selection:bg-[#ffe600] selection:text-black">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Header */}
        <header className="p-6 sm:p-8 bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <FootballLogo size="lg" />
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-tight">
                  {team.teamName}
                </h1>
                <span className="px-3 py-1 bg-[#00f0ff] border-2 border-black text-black font-mono font-bold text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
                  FOOTBALL MARKETPLACE
                </span>
              </div>
              <p className="text-sm font-bold text-slate-700 mt-1">
                LEADER: <span className="text-black underline">{team.teamLeaderName}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 self-end md:self-auto">
            {/* Squad Count Badge */}
            <div className="text-right">
              <span className="block text-[10px] sm:text-xs uppercase tracking-wider font-black text-slate-600 mb-0.5">
                SQUAD PLAYERS
              </span>
              <div className={`px-3 py-1.5 border-3 border-black shadow-[4px_4px_0px_0px_#000] text-lg sm:text-xl font-black flex items-center justify-center gap-1.5 ${ownedCount >= 7 ? 'bg-[#ff4d4d] text-white' : 'bg-[#ccff00] text-black'}`}>
                <span>⚽</span>
                <span>{ownedCount} / 7</span>
              </div>
            </div>

            {/* Balance Badge */}
            <div className="text-right">
              <span className="block text-[10px] sm:text-xs uppercase tracking-wider font-black text-slate-600 mb-0.5">
                DIGITAL BALANCE
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

        {/* View Mode & Links Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-white text-black font-black uppercase text-xs sm:text-sm border-3 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#ffe600] transition cursor-pointer flex items-center gap-2"
            >
              <span>←</span>
              <span>Challenge Tiers</span>
            </Link>

            <button
              onClick={() => setViewMode("catalog")}
              className={`px-4 py-2 font-black uppercase text-xs sm:text-sm border-3 border-black shadow-[3px_3px_0px_0px_#000] transition cursor-pointer ${
                viewMode === "catalog"
                  ? "bg-[#00f0ff] text-black"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              ⚽ All Players ({players.length})
            </button>

            <button
              onClick={() => setViewMode("squad")}
              className={`px-4 py-2 font-black uppercase text-xs sm:text-sm border-3 border-black shadow-[3px_3px_0px_0px_#000] transition cursor-pointer ${
                viewMode === "squad"
                  ? "bg-[#ccff00] text-black"
                  : "bg-white text-slate-700 hover:bg-slate-100"
              }`}
            >
              🏆 My Squad ({ownedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search players, pros, cons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 px-3 py-2 bg-white border-3 border-black text-xs sm:text-sm font-bold shadow-[3px_3px_0px_0px_#000] focus:outline-none focus:bg-[#ffe600]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-2 text-xs font-black text-slate-500 hover:text-black"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tier Filters */}
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-black uppercase text-slate-600 block">
              FILTER BY TIER:
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTier(0)}
                className={`px-3 py-1 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer transition ${
                  selectedTier === 0 ? "bg-black text-white" : "bg-slate-100 hover:bg-slate-200 text-black"
                }`}
              >
                All Tiers
              </button>
              <button
                onClick={() => setSelectedTier(1)}
                className={`px-3 py-1 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer transition ${
                  selectedTier === 1 ? "bg-[#ffe600] text-black" : "bg-slate-100 hover:bg-slate-200 text-black"
                }`}
              >
                Tier 1 (Elite)
              </button>
              <button
                onClick={() => setSelectedTier(2)}
                className={`px-3 py-1 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer transition ${
                  selectedTier === 2 ? "bg-[#00f0ff] text-black" : "bg-slate-100 hover:bg-slate-200 text-black"
                }`}
              >
                Tier 2 (Pro)
              </button>
              <button
                onClick={() => setSelectedTier(3)}
                className={`px-3 py-1 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer transition ${
                  selectedTier === 3 ? "bg-[#ccff00] text-black" : "bg-slate-100 hover:bg-slate-200 text-black"
                }`}
              >
                Tier 3 (Novice)
              </button>
            </div>
          </div>

          {/* Position Filters */}
          <div className="space-y-1">
            <span className="text-[11px] font-mono font-black uppercase text-slate-600 block">
              FILTER BY POSITION:
            </span>
            <div className="flex flex-wrap gap-2">
              {["ALL", "Striker", "Midfielder", "Defender", "Goalkeeper"].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setSelectedPosition(pos)}
                  className={`px-3 py-1 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer transition ${
                    selectedPosition === pos ? "bg-black text-white" : "bg-slate-100 hover:bg-slate-200 text-black"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Players Cards Grid */}
        {filteredPlayers.length === 0 ? (
          <div className="p-12 bg-white border-4 border-black shadow-[6px_6px_0px_0px_#000] text-center space-y-3">
            <div className="text-4xl">⚽</div>
            <h3 className="text-xl font-black uppercase">NO PLAYERS FOUND</h3>
            <p className="text-xs font-bold text-slate-600">
              {viewMode === "squad"
                ? "You haven't purchased any players matching these filters yet. Switch to Marketplace Catalog to buy players!"
                : "No players match your active search filters."}
            </p>
          </div>
        ) : (
          <div
            ref={gridContainerRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredPlayers.map((player) => {
              const canAfford = team.balance >= player.price;

              return (
                <div
                  key={player.id}
                  className={`player-card p-5 border-4 border-black shadow-[6px_6px_0px_0px_#000] flex flex-col justify-between transition-all bg-white hover:-translate-y-1 relative ${
                    player.isOwned ? "ring-4 ring-[#ccff00]" : ""
                  }`}
                >
                  <div>
                    {/* Top Row: Overall Rating & Badges */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        {/* Overall Rating Badge */}
                        <div className="w-12 h-12 bg-black text-[#ffe600] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex flex-col items-center justify-center font-black leading-none">
                          <span className="text-lg">{player.overallScore}</span>
                          <span className="text-[8px] uppercase tracking-tighter text-slate-300">OVR</span>
                        </div>

                        <div>
                          <span
                            className={`px-2 py-0.5 border border-black font-black text-[10px] uppercase tracking-wider block mb-1 shadow-[1px_1px_0px_0px_#000] ${getPositionBadgeColor(
                              player.position
                            )}`}
                          >
                            {player.position}
                          </span>
                          <span className="text-[10px] font-mono font-black px-2 py-0.5 bg-[#ffe600] border border-black shadow-[1px_1px_0px_0px_#000]">
                            TIER {player.tierNumber}
                          </span>
                        </div>
                      </div>

                      {/* Price Badge */}
                      <div className="text-right">
                        <div className="bg-[#ccff00] px-3 py-1 border-2 border-black shadow-[2px_2px_0px_0px_#000] font-black text-sm text-black">
                          ${player.price}
                        </div>
                      </div>
                    </div>

                    {/* Player Name */}
                    <h3 className="text-xl font-black uppercase tracking-tight mb-3 text-black border-b-2 border-black pb-2">
                      {player.playerName}
                    </h3>

                    {/* Stats Grid */}
                    <div className="bg-slate-50 border-2 border-black p-3 mb-4 space-y-1.5 font-mono text-[11px] font-bold shadow-[2px_2px_0px_0px_#000]">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                        <div className="flex justify-between items-center border-b border-slate-300 pb-0.5">
                          <span className="text-slate-600">⚡ SPEED:</span>
                          <span className="font-black text-black">{player.speed}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-300 pb-0.5">
                          <span className="text-slate-600">💪 PHYS:</span>
                          <span className="font-black text-black">{player.physical}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-300 pb-0.5">
                          <span className="text-slate-600">🎨 TECH:</span>
                          <span className="font-black text-black">{player.technique}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-300 pb-0.5">
                          <span className="text-slate-600">🔋 STAM:</span>
                          <span className="font-black text-black">{player.stamina}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-300 pb-0.5">
                          <span className="text-slate-600">🎯 PREC:</span>
                          <span className="font-black text-black">{player.precision}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-300 pb-0.5">
                          <span className="text-slate-600">🛡️ DEF:</span>
                          <span className="font-black text-black">{player.defense}</span>
                        </div>
                      </div>
                    </div>

                    {/* Pros & Cons Box */}
                    <div className="space-y-1.5 mb-4 text-xs">
                      <div className="flex items-center gap-2 p-1.5 bg-emerald-50 border border-emerald-700 text-emerald-900 font-bold">
                        <span className="text-emerald-600 font-black">PRO:</span>
                        <span>{player.pros}</span>
                      </div>
                      <div className="flex items-center gap-2 p-1.5 bg-red-50 border border-red-700 text-red-900 font-bold">
                        <span className="text-red-600 font-black">CON:</span>
                        <span>{player.cons}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer / Action Button */}
                  <div className="pt-3 border-t-2 border-black">
                    {player.isOwned ? (
                      <div className="w-full py-2.5 bg-[#ccff00] text-black font-black uppercase text-xs text-center border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center gap-1.5">
                        <span>✓ IN YOUR SQUAD</span>
                      </div>
                    ) : ownedCount >= 7 ? (
                      <button
                        disabled
                        className="w-full py-2.5 bg-slate-200 text-slate-500 font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-not-allowed opacity-80"
                      >
                        [ Squad Complete (7/7) ]
                      </button>
                    ) : canAfford ? (
                      <button
                        onClick={() => setSelectedPlayer(player)}
                        className="w-full py-2.5 bg-[#00f0ff] hover:bg-black hover:text-white text-black font-black uppercase text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000] transition cursor-pointer"
                      >
                        [ Buy Player - ${player.price.toLocaleString()} ]
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2.5 bg-slate-200 text-slate-500 font-black uppercase text-xs border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-not-allowed opacity-80"
                      >
                        [ Need ${(player.price - team.balance).toLocaleString()} More ]
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Buy Confirmation Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div
            ref={modalRef}
            className="bg-white border-4 border-black shadow-[10px_10px_0px_0px_#000] p-6 max-w-md w-full space-y-5 relative"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-4 border-black pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚽</span>
                <h3 className="text-xl font-black uppercase tracking-tight">CONFIRM TRANSFER</h3>
              </div>
              <button
                onClick={() => setSelectedPlayer(null)}
                className="w-8 h-8 bg-black text-white font-black text-sm flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#ff4d4d] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <div className="p-4 bg-[#ffe600] border-3 border-black shadow-[3px_3px_0px_0px_#000] text-center">
                <div className="text-xs font-mono font-black text-slate-700 uppercase">
                  TIER {selectedPlayer.tierNumber} • {selectedPlayer.position}
                </div>
                <div className="text-2xl font-black uppercase text-black">
                  {selectedPlayer.playerName}
                </div>
                <div className="text-sm font-black text-slate-900 mt-1">
                  Overall Score: <span className="bg-black text-[#ffe600] px-2 py-0.5 font-mono">{selectedPlayer.overallScore}</span>
                </div>
              </div>

              {/* Price vs Balance calculation */}
              <div className="bg-slate-50 border-2 border-black p-3 space-y-2 font-mono text-xs font-bold shadow-[2px_2px_0px_0px_#000]">
                <div className="flex justify-between items-center border-b border-slate-300 pb-1">
                  <span className="text-slate-600">CURRENT BALANCE:</span>
                  <span className="font-black text-black">${team.balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-300 pb-1">
                  <span className="text-slate-600">PLAYER PRICE:</span>
                  <span className="font-black text-[#ff4d4d]">-${selectedPlayer.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-1 text-sm">
                  <span className="text-black">REMAINING BALANCE:</span>
                  <span className="font-black text-[#008800]">
                    ${(team.balance - selectedPlayer.price).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Feedback messages */}
              {feedback && (
                <div
                  ref={feedback.type === "success" ? successBadgeRef : undefined}
                  className={`p-3 border-2 border-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000] text-center ${
                    feedback.type === "success"
                      ? "bg-[#ccff00] text-black"
                      : "bg-[#ff4d4d] text-white"
                  }`}
                >
                  {feedback.message}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setSelectedPlayer(null)}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-slate-200 text-black font-black uppercase text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-slate-300 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBuyPlayer(selectedPlayer)}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-[#00f0ff] text-black font-black uppercase text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-black hover:text-white transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "SIGNING..." : `CONFIRM SIGNING ($${selectedPlayer.price})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
