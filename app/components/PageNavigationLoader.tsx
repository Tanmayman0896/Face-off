"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoading } from "@/app/context/LoadingContext";

export default function PageNavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { hideLoading } = useLoading();

  // Hide loading whenever route or search parameters change
  useEffect(() => {
    hideLoading();
  }, [pathname, searchParams, hideLoading]);

  return null;
}

