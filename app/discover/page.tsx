import type { Metadata } from "next";
import { Suspense } from "react";
import { DiscoverView } from "@/components/discover/discover-view";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Discover" };

export default function DiscoverPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Discover people</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">
        Find people to swap skills with. The best matches come first. Teal tags are skills someone
        teaches; dashed violet tags are skills they want to learn.
      </p>
      <div className="mt-8">
        {/* useSearchParams needs a Suspense boundary in a static export */}
        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
          <DiscoverView />
        </Suspense>
      </div>
    </main>
  );
}
