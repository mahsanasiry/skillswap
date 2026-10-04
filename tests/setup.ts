import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { resetDb } from "@/lib/db";
import { server } from "@/mocks/server";
import { navigation } from "./navigation";

// The real router only exists inside a running Next.js app.
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: navigation.push,
    replace: navigation.push,
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => navigation.pathname,
  useSearchParams: () => new URLSearchParams(),
}));

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
  // jsdom cannot navigate; stop link clicks after React has handled them.
  document.addEventListener("click", (event) => {
    if ((event.target as Element).closest("a")) event.preventDefault();
  });
});

beforeEach(() => {
  window.localStorage.clear();
  delete document.documentElement.dataset.theme;
  navigation.push.mockClear();
  navigation.pathname = "/";
  resetDb();
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => server.close());
