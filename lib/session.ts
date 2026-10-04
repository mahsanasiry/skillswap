import { DEFAULT_DEMO_USER_ID, DEMO_USER_IDS } from "@/data/users";

const KEY = "skillswap:demo-user";

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null; // storage blocked (private mode, etc.)
  }
}

/** The demo user who is "logged in". Real authentication is out of scope. */
export function getDemoUserId(): string {
  const stored = storage()?.getItem(KEY);
  return stored && (DEMO_USER_IDS as readonly string[]).includes(stored)
    ? stored
    : DEFAULT_DEMO_USER_ID;
}

export function setDemoUserId(id: string): void {
  storage()?.setItem(KEY, id);
}
