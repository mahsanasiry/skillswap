"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoUser } from "@/hooks/use-demo-user";
import { api } from "@/lib/api";
import type { FavoriteView, UserWithMatch } from "@/types";

export function useFavorites() {
  const { user } = useDemoUser();
  return useQuery({ queryKey: ["favorites", user.id], queryFn: api.getFavorites });
}

/** Shared by every favorite action: change the list now, undo it if the server says no. */
function useFavoriteCache() {
  const { user: me } = useDemoUser();
  const queryClient = useQueryClient();
  const key = ["favorites", me.id];

  return {
    me,
    async change(update: (old: FavoriteView[]) => FavoriteView[]) {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<FavoriteView[]>(key);
      queryClient.setQueryData<FavoriteView[]>(key, (old = []) => update(old));
      return { previous };
    },
    rollback(context?: { previous?: FavoriteView[] }) {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    refresh() {
      void queryClient.invalidateQueries({ queryKey: ["favorites"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  };
}

/** Remove a favorite by its id. Used by the Favorites page and by the heart button. */
export function useRemoveFavorite() {
  const cache = useFavoriteCache();
  return useMutation({
    mutationFn: (id: string) => api.removeFavorite(id),
    onMutate: (id) => cache.change((old) => old.filter((f) => f.id !== id)),
    onError: (_error, _id, context) => cache.rollback(context),
    onSettled: cache.refresh,
  });
}

/**
 * Add or remove one person from the favorites. The heart changes instantly
 * (optimistic update) and goes back if the server says no.
 */
export function useToggleFavorite(target: UserWithMatch) {
  const cache = useFavoriteCache();
  const favorites = useFavorites();
  const favorite = favorites.data?.find((f) => f.targetUserId === target.id);
  const remove = useRemoveFavorite();

  const add = useMutation({
    mutationFn: () => api.addFavorite({ targetUserId: target.id }),
    onMutate: () =>
      cache.change((old) => [
        ...old,
        { id: `temp_${target.id}`, userId: cache.me.id, targetUserId: target.id, user: target },
      ]),
    onError: (_error, _vars, context) => cache.rollback(context),
    onSettled: cache.refresh,
  });

  return {
    isFavorite: Boolean(favorite),
    isLoading: favorites.isPending,
    isPending: add.isPending || remove.isPending,
    isError: add.isError || remove.isError,
    toggle: () => (favorite ? remove.mutate(favorite.id) : add.mutate()),
  };
}
