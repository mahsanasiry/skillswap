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

// Count requests the mock server is still handling. A test can end while one is
// in flight (for example a click it did not wait for); without this, that request
// would finish during the NEXT test and change its data.
let inFlight = 0;
server.events.on("request:start", () => {
  inFlight += 1;
});
server.events.on("request:end", () => {
  inFlight = Math.max(0, inFlight - 1);
});

async function settleRequests(timeoutMs = 500) {
  const deadline = Date.now() + timeoutMs;
  while (inFlight > 0 && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  inFlight = 0; // a request that never ends (some tests do that on purpose) must not block later tests
}

beforeEach(() => {
  window.localStorage.clear();
  delete document.documentElement.dataset.theme;
  navigation.push.mockClear();
  navigation.replace.mockClear();
  navigation.search = "";
  navigation.pathname = "/";
  resetDb();
});

afterEach(async () => {
  cleanup();
  await settleRequests();
  server.resetHandlers();
});

afterAll(() => server.close());
