import type { Metadata } from "next";
import { Suspense } from "react";
import { RequestsView } from "@/components/requests/requests-view";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Requests" };

export default function RequestsPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Requests</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Answer the requests people sent you, and follow the ones you sent.
      </p>
      <div className="mt-8">
        {/* useSearchParams needs a Suspense boundary in a static export */}
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <RequestsView />
        </Suspense>
      </div>
    </main>
  );
}
