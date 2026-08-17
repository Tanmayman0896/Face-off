"use client";

import { useState } from "react";
import { signOutAction } from "@/app/actions/auth";
import { useTransitionRouter } from "next-transition-router";

interface SignOutButtonProps {
  className?: string;
  label?: string;
}

export default function SignOutButton({
  className = "px-4 py-3 bg-[#ff4d4d] text-white font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer disabled:opacity-50",
  label = "Sign Out",
}: SignOutButtonProps) {
  const router = useTransitionRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

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
    <form onSubmit={handleSignOut}>
      <button type="submit" disabled={isSigningOut} className={className}>
        {isSigningOut ? "Signing Out..." : label}
      </button>
    </form>
  );
}

