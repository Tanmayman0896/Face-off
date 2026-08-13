"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import FaceoffPreloader from "@/app/components/FaceoffPreloader";

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  withLoading: <T>(asyncFn: () => Promise<T>, message?: string) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("LOADING FACE-OFF MATCH DATA...");

  const showLoading = useCallback((message?: string) => {
    if (message) {
      setLoadingMessage(message);
    } else {
      setLoadingMessage("LOADING FACE-OFF MATCH DATA...");
    }
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const withLoading = useCallback(
    async <T,>(asyncFn: () => Promise<T>, message?: string): Promise<T> => {
      showLoading(message);
      try {
        const result = await asyncFn();
        return result;
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading]
  );

  return (
    <LoadingContext.Provider
      value={{
        isLoading,
        loadingMessage,
        showLoading,
        hideLoading,
        withLoading,
      }}
    >
      {children}
      {isLoading && <FaceoffPreloader message={loadingMessage} variant="fullscreen" />}
    </LoadingContext.Provider>
  );
}

export function useLoading(): LoadingContextType {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
}
