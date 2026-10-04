import { seedFavorites, seedRequests } from "@/data/seed";
import { dbStateSchema } from "@/lib/schemas";
import type { Favorite, SwapRequest } from "@/types";

/**
 * A tiny "database" that lives in the browser (localStorage) so requests and
 * favorites survive a refresh. The mock API is the only code that touches it.
 */
export type DbState = { requests: SwapRequest[]; favorites: Favorite[] };

const KEY = "skillswap:db:v1";
const ERROR_FLAG_KEY = "skillswap:simulate-error";

let fallback: DbState | null = null; // used only if localStorage is unavailable

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

function seedState(): DbState {
  return structuredClone({ requests: seedRequests, favorites: seedFavorites });
}

export function readDb(): DbState {
  const store = storage();
  if (!store) {
    fallback ??= seedState();
    return fallback;
  }
  const raw = store.getItem(KEY);
  if (raw) {
    try {
      const parsed = dbStateSchema.safeParse(JSON.parse(raw));
      if (parsed.success) return parsed.data;
    } catch {
      // corrupted JSON: fall through and re-seed
    }
  }
  const fresh = seedState();
  store.setItem(KEY, JSON.stringify(fresh));
  return fresh;
}

export function writeDb(state: DbState): void {
  const store = storage();
  if (!store) {
    fallback = state;
    return;
  }
  store.setItem(KEY, JSON.stringify(state));
}

export function resetDb(): void {
  const fresh = seedState();
  fallback = null;
  storage()?.setItem(KEY, JSON.stringify(fresh));
}

export function newId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

/** Lets us demo the error state: localStorage["skillswap:simulate-error"] = "1". */
export function isErrorSimulated(): boolean {
  return storage()?.getItem(ERROR_FLAG_KEY) === "1";
}
