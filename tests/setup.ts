import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { resetDb } from "@/lib/db";
import { server } from "@/mocks/server";
import { navigation } from "./navigation";

// The real router only exists inside a running Next.js app.
vi.mock("next/navigation", async () => {
  const { navigation, useMockSearchParams } = await import("./navigation");
  return {
    useRouter: () => ({
      push: navigation.push,
      replace: navigation.replace,
      prefetch: vi.fn(),
      back: vi.fn(),
    }),
    usePathname: () => navigation.pathname,
    useSearchParams: useMockSearchParams,
  };
});

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
  navigation.replace.mockClear();
  navigation.search = "";
  navigation.pathname = "/";
  resetDb();
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => server.close());
