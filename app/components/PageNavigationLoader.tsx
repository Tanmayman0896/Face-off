"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoading } from "@/app/context/LoadingContext";

export default function PageNavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { hideLoading, showLoading } = useLoading();

  // Hide loading whenever the route/pathname changes
  useEffect(() => {
    hideLoading();
  }, [pathname, searchParams, hideLoading]);

  // Intercept click on internal navigation links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        target.target !== "_blank" &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey
      ) {
        // Only trigger preloader if navigating to a different pathname
        if (href !== window.location.pathname) {
          let message = "NAVIGATING TO FACE-OFF...";
          if (href.startsWith("/dashboard")) {
            message = "LOADING DASHBOARD & TIERS...";
          } else if (href.startsWith("/marketplace")) {
            message = "OPENING PLAYER MARKETPLACE...";
          } else if (href.startsWith("/tier/")) {
            message = "INITIALIZING TIER QUESTION CHALLENGE...";
          }
          showLoading(message);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => {
      document.removeEventListener("click", handleAnchorClick);
    };
  }, [showLoading]);

  return null;
}
