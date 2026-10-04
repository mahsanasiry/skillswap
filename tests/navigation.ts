import { vi } from "vitest";

/** Shared state for the fake next/navigation used in tests. */
export const navigation = {
  push: vi.fn(),
  pathname: "/",
};
