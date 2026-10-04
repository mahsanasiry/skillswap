import { useMemo, useSyncExternalStore } from "react";
import { vi } from "vitest";

type Navigation = {
  push: ReturnType<typeof vi.fn>;
  replace: ReturnType<typeof vi.fn>;
  pathname: string;
  search: string;
  setSearch: (value: string) => void;
};

const listeners = new Set<() => void>();

/**
 * A tiny fake router. Changing the URL (router.replace) updates the search
 * parameters and re-renders components, like the real app does.
 */
export const navigation: Navigation = {
  push: vi.fn(),
  replace: vi.fn((url: string) => {
    const at = url.indexOf("?");
    navigation.setSearch(at === -1 ? "" : url.slice(at + 1));
  }),
  pathname: "/",
  search: "",
  setSearch(value: string) {
    navigation.search = value;
    listeners.forEach((listener) => listener());
  },
};

export function useMockSearchParams() {
  const search = useSyncExternalStore(
    (callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    () => navigation.search,
    () => navigation.search,
  );
  return useMemo(() => new URLSearchParams(search), [search]);
}
