"use client";

import { useState } from "react";
import { UserCard, UserCardSkeleton } from "@/components/users/user-card";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { useFavorites, useRemoveFavorite } from "@/hooks/use-favorites";
import { ApiError } from "@/lib/api";
import type { FavoriteView } from "@/types";

export function FavoritesView() {
  const favorites = useFavorites();
  const remove = useRemoveFavorite();
  const [notice, setNotice] = useState("");

  // A failed refresh must not hide a list the person is already looking at.
  if (favorites.isError && !favorites.data) {
    return (
      <ErrorState
        message="We couldn't load your favorites."
        onRetry={() => void favorites.refetch()}
      />
    );
  }

  if (!favorites.data) {
    return (
      <div aria-busy="true">
        <p role="status" className="sr-only">
          Loading favorites...
        </p>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <li key={i}>
              <UserCardSkeleton />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const items = favorites.data;

  function handleRemove(favorite: FavoriteView) {
    setNotice(`Removed ${favorite.user.name} from favorites.`); // the card is already gone
    remove.mutate(favorite.id, { onError: () => setNotice("") });
  }

  const failed =
    remove.isError &&
    (remove.error instanceof ApiError
      ? remove.error.message
      : "We couldn't remove that person. Try again.");

  return (
    <div className="flex flex-col gap-4">
      <p role="status" aria-live="polite" className="min-h-6 font-medium">
        {notice ||
          (items.length > 0 ? `${items.length} ${items.length === 1 ? "person" : "people"} saved` : "")}
      </p>

      {failed && (
        <p
          role="alert"
          className="rounded-lg border border-red-600 p-3 text-sm font-medium text-red-700 dark:text-red-400"
        >
          We couldn&apos;t remove that person. {failed}
        </p>
      )}

      {items.length === 0 ? (
        <EmptyState
          title="No favorites yet."
          message="Use Add favorite on a profile to keep people here."
          action={<ButtonLink href="/discover">Find people</ButtonLink>}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((favorite) => (
            <li key={favorite.id}>
              <UserCard
                user={favorite.user}
                extraAction={
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Remove ${favorite.user.name} from favorites`}
                    onClick={() => handleRemove(favorite)}
                  >
                    Remove
                  </Button>
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
