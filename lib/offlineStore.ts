/**
 * lib/offlineStore.ts
 * Client-side localStorage cache for offline-first fallback.
 * Only import this in "use client" components or hooks.
 */

export interface CachedTeam {
  id: string;
  teamName: string;
  balance: number;
}

export interface CachedTier {
  id: string;
  tierId: string;
  tierNumber: number;
  name: string;
  description: string;
  status: "LOCKED" | "UNLOCKED" | "COMPLETED" | "FAILED";
  retriesRemaining: number;
  totalQuestions: number;
  solvedQuestions: number;
  totalReward: number;
  unlockRequirement?: string;
}

export type PendingOpType = "SUBMIT_ANSWER" | "BUY_PLAYER";

export interface PendingOperation {
  id: string; // uuid-ish
  type: PendingOpType;
  payload: Record<string, unknown>;
  createdAt: number;
  retries: number;
}

const KEYS = {
  team: "fo_team",
  tiers: "fo_tiers",
  queue: "fo_queue",
  players: "fo_mp_players",
} as const;

function safeGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage quota exceeded — silently ignore
  }
}

// ── Team ──────────────────────────────────────────────────────
export function getCachedTeam(): CachedTeam | null {
  return safeGet<CachedTeam>(KEYS.team);
}
export function setCachedTeam(team: CachedTeam) {
  safeSet(KEYS.team, team);
}

// ── Tiers ─────────────────────────────────────────────────────
export function getCachedTiers(): CachedTier[] {
  return safeGet<CachedTier[]>(KEYS.tiers) ?? [];
}
export function setCachedTiers(tiers: CachedTier[]) {
  safeSet(KEYS.tiers, tiers);
}

/** Optimistically apply a correct answer result to the tier cache */
export function applyAnswerToCache(
  tierId: string,
  result: {
    isCorrect: boolean;
    reward: number;
    tierCompleted: boolean;
    retriesRemaining: number;
    tierFailed: boolean;
    nextTierId?: string | null;
    nextTierUnlocked?: boolean;
  }
) {
  const tiers = getCachedTiers();
  const updated = tiers.map((t) => {
    if (t.tierId === tierId) {
      return {
        ...t,
        status: result.tierCompleted
          ? "COMPLETED"
          : result.tierFailed
          ? "FAILED"
          : t.status,
        retriesRemaining: result.retriesRemaining,
        solvedQuestions: result.isCorrect ? 1 : t.solvedQuestions,
      } as CachedTier;
    }
    // Unlock next tier if flagged
    if (result.nextTierId && t.tierId === result.nextTierId && result.nextTierUnlocked) {
      return { ...t, status: "UNLOCKED" as const };
    }
    return t;
  });
  setCachedTiers(updated);

  // Update balance
  if (result.isCorrect && result.reward > 0) {
    const team = getCachedTeam();
    if (team) setCachedTeam({ ...team, balance: team.balance + result.reward });
  }
}

/** Optimistically apply a player purchase to the balance cache */
export function applyPurchaseToCache(cost: number) {
  const team = getCachedTeam();
  if (team) setCachedTeam({ ...team, balance: Math.max(0, team.balance - cost) });
}

// ── Pending Queue ─────────────────────────────────────────────
export function getPendingQueue(): PendingOperation[] {
  return safeGet<PendingOperation[]>(KEYS.queue) ?? [];
}

export function enqueuePendingOp(op: Omit<PendingOperation, "id" | "createdAt" | "retries">) {
  const queue = getPendingQueue();
  const newOp: PendingOperation = {
    ...op,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdAt: Date.now(),
    retries: 0,
  };
  safeSet(KEYS.queue, [...queue, newOp]);
  return newOp;
}

export function removePendingOp(id: string) {
  const queue = getPendingQueue().filter((op) => op.id !== id);
  safeSet(KEYS.queue, queue);
}

export function incrementRetries(id: string) {
  const queue = getPendingQueue().map((op) =>
    op.id === id ? { ...op, retries: op.retries + 1 } : op
  );
  safeSet(KEYS.queue, queue);
}

export function clearQueue() {
  safeSet(KEYS.queue, []);
}
