"use client";

import { Button } from "@/components/ui/button";
import { HeartIcon } from "@/components/ui/icons";
import { useToggleFavorite } from "@/hooks/use-favorites";
import type { User } from "@/types";

export function FavoriteButton({ user }: { user: User }) {
  const { isFavorite, isLoading, isPending, isError, toggle } = useToggleFavorite(user);
  return (
    <div className="flex flex-col gap-1">
      <Button variant="secondary" disabled={isLoading || isPending} onClick={toggle}>
        <HeartIcon filled={isFavorite} />
        {isLoading ? "Favorite" : isFavorite ? "Remove favorite" : "Add favorite"}
      </Button>
      {isError && (
        <p role="alert" className="text-sm font-medium text-red-700 dark:text-red-400">
          We couldn&apos;t update your favorites. Try again.
        </p>
      )}
    </div>
  );
}
