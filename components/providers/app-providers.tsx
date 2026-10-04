"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

let mockingPromise: Promise<void> | null = null;

/** Starts the mock API once (safe to call many times, e.g. React strict mode). */
function startMockApi(): Promise<void> {
  mockingPromise ??= import("@/mocks/browser").then(async ({ worker }) => {
    await worker.start({
      serviceWorker: { url: `${BASE_PATH}/mockServiceWorker.js` },
      onUnhandledRequest: "bypass",
      quiet: true,
    });
  });
  return mockingPromise;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );
  const [status, setStatus] = useState<"starting" | "ready" | "failed">("starting");

  useEffect(() => {
    startMockApi()
      .then(() => setStatus("ready"))
      .catch(() => setStatus("failed"));
  }, []);

  if (status === "starting") {
    return (
      <div role="status" className="flex flex-1 items-center justify-center p-8 text-ink-soft">
        Starting SkillSwap...
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div role="alert" className="mx-auto max-w-md flex-1 p-8">
        <h1 className="text-xl font-semibold">The demo data could not start</h1>
        <p className="mt-2 text-ink-soft">
          Your browser blocked the service worker. Allow it for this site and reload the page.
        </p>
      </div>
    );
  }

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
