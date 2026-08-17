"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  getCachedTeam,
  getCachedTiers,
  getPendingQueue,
  removePendingOp,
  incrementRetries,
  type CachedTeam,
  type CachedTier,
  type PendingOperation,
} from "@/lib/offlineStore";
import { replaySyncQueue } from "@/app/actions/sync";

interface OfflineContextValue {
  isOffline: boolean;
  pendingCount: number;
  cachedTeam: CachedTeam | null;
  cachedTiers: CachedTier[];
  syncNow: () => void;
}

const OfflineContext = createContext<OfflineContextValue>({
  isOffline: false,
  pendingCount: 0,
  cachedTeam: null,
  cachedTiers: [],
  syncNow: () => {},
});

export function useOffline() {
  return useContext(OfflineContext);
}

const SYNC_INTERVAL_MS = 30_000; // retry queue every 30s
const MAX_RETRIES = 5;

export function OfflineSyncProvider({ children }: { children: ReactNode }) {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [cachedTeam, setCachedTeam] = useState<CachedTeam | null>(null);
  const [cachedTiers, setCachedTiers] = useState<CachedTier[]>([]);
  const syncingRef = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    setCachedTeam(getCachedTeam());
    setCachedTiers(getCachedTiers());
    setPendingCount(getPendingQueue().length);
  }, []);

  // Re-read cache whenever storage changes (other tabs, or after server action)
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key?.startsWith("fo_")) {
        setCachedTeam(getCachedTeam());
        setCachedTiers(getCachedTiers());
        setPendingCount(getPendingQueue().length);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const syncNow = useCallback(async () => {
    if (syncingRef.current) return;
    const queue = getPendingQueue();
    if (queue.length === 0) {
      setIsOffline(false);
      return;
    }
    syncingRef.current = true;
    try {
      // Filter out ops that exceeded max retries
      const retryable = queue.filter((op) => op.retries < MAX_RETRIES);
      if (retryable.length === 0) {
        syncingRef.current = false;
        return;
      }
      const results = await replaySyncQueue(retryable);
      results.forEach(({ id, success }: { id: string; success: boolean }) => {
        if (success) {
          removePendingOp(id);
        } else {
          incrementRetries(id);
        }
      });
      const remaining = getPendingQueue().length;
      setPendingCount(remaining);
      if (remaining === 0) setIsOffline(false);
    } catch {
      // Still offline
    } finally {
      syncingRef.current = false;
    }
  }, []);

  // Auto-sync on interval
  useEffect(() => {
    const id = setInterval(syncNow, SYNC_INTERVAL_MS);
    return () => clearInterval(id);
  }, [syncNow]);

  // Sync when browser goes back online
  useEffect(() => {
    window.addEventListener("online", syncNow);
    return () => window.removeEventListener("online", syncNow);
  }, [syncNow]);

  return (
    <OfflineContext.Provider value={{ isOffline, pendingCount, cachedTeam, cachedTiers, syncNow }}>
      {children}
      {(isOffline || pendingCount > 0) && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-2.5 bg-black border-3 border-[#ffe600] shadow-[4px_4px_0px_0px_#ffe600] font-black text-xs uppercase tracking-wider text-white">
          <span className="inline-block w-2 h-2 rounded-full bg-[#ff4d4d] animate-pulse" />
          {pendingCount > 0
            ? `${pendingCount} operation${pendingCount > 1 ? "s" : ""} queued — will sync when online`
            : "Offline — using cached data"}
          {pendingCount > 0 && (
            <button
              onClick={syncNow}
              className="ml-2 px-2 py-0.5 bg-[#ffe600] text-black border border-black cursor-pointer hover:bg-white transition-colors"
            >
              Sync Now
            </button>
          )}
        </div>
      )}
    </OfflineContext.Provider>
  );
}
