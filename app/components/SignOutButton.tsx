"use client";

import { signOutAction } from "@/app/actions/auth";
import { useLoading } from "@/app/context/LoadingContext";

interface SignOutButtonProps {
  className?: string;
  label?: string;
}

export default function SignOutButton({
  className = "px-4 py-3 bg-[#ff4d4d] text-white font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer",
  label = "Sign Out",
}: SignOutButtonProps) {
  const { showLoading } = useLoading();

  return (
    <form
      action={async () => {
        showLoading("SIGNING OUT OF STADIUM...");
        await signOutAction();
      }}
    >
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
  );
}
