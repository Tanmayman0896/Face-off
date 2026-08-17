"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  ReactNode,
} from "react";
import FaceoffPreloader from "@/app/components/FaceoffPreloader";

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  showLoading: (message?: string, maxTimeoutMs?: number) => void;
  hideLoading: () => void;
  withLoading: <T>(asyncFn: () => Promise<T>, message?: string, maxTimeoutMs?: number) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("LOADING FACE-OFF MATCH DATA...");
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearWatchdog = useCallback(() => {
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
  }, []);

  const hideLoading = useCallback(() => {
    clearWatchdog();
    setIsLoading(false);
  }, [clearWatchdog]);

  const showLoading = useCallback(
    (message?: string, maxTimeoutMs: number = 6000) => {
      clearWatchdog();
      if (message) {
        setLoadingMessage(message);
      } else {
        setLoadingMessage("LOADING FACE-OFF MATCH DATA...");
      }
      setIsLoading(true);

      // Fail-safe watchdog: automatically reset loading state if not dismissed within timeout
      watchdogTimerRef.current = setTimeout(() => {
        setIsLoading(false);
        watchdogTimerRef.current = null;
      }, maxTimeoutMs);
    },
    [clearWatchdog]
  );

  const withLoading = useCallback(
    async <T,>(
      asyncFn: () => Promise<T>,
      message?: string,
      maxTimeoutMs?: number
    ): Promise<T> => {
      showLoading(message, maxTimeoutMs);
      try {
        const result = await asyncFn();
        return result;
      } finally {
        hideLoading();
      }
    },
    [showLoading, hideLoading]
  );

  useEffect(() => {
    return () => {
      clearWatchdog();
    };
  }, [clearWatchdog]);

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
      {isLoading && (
        <FaceoffPreloader message={loadingMessage} variant="fullscreen" onDismiss={hideLoading} />
      )}
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

