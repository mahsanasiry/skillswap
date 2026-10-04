import type { Metadata } from "next";
import { FavoritesView } from "@/components/favorites/favorites-view";

export const metadata: Metadata = { title: "Favorites" };

export default function FavoritesPage() {
  return (
    <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">Your favorites</h1>
      <p className="mt-2 max-w-2xl text-ink-soft">People you saved to come back to later.</p>
      <div className="mt-8">
        <FavoritesView />
      </div>
    </main>
  );
}
