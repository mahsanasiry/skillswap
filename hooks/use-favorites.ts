"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoUser } from "@/hooks/use-demo-user";
import { api } from "@/lib/api";
import type { FavoriteView, User } from "@/types";

export function useFavorites() {
  const { user } = useDemoUser();
  return useQuery({ queryKey: ["favorites", user.id], queryFn: api.getFavorites });
}

/**
 * Add or remove one person from the favorites. The heart changes instantly
 * (optimistic update) and goes back if the server says no.
 */
export function useToggleFavorite(target: User) {
  const { user: me } = useDemoUser();
  const queryClient = useQueryClient();
  const key = ["favorites", me.id];
  const favorites = useFavorites();
  const favorite = favorites.data?.find((f) => f.targetUserId === target.id);

  async function optimistic(change: (old: FavoriteView[]) => FavoriteView[]) {
    await queryClient.cancelQueries({ queryKey: key });
    const previous = queryClient.getQueryData<FavoriteView[]>(key);
    queryClient.setQueryData<FavoriteView[]>(key, (old = []) => change(old));
    return { previous };
  }

  function rollback(context?: { previous?: FavoriteView[] }) {
    if (context?.previous) queryClient.setQueryData(key, context.previous);
  }

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["favorites"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  }

  const add = useMutation({
    mutationFn: () => api.addFavorite({ targetUserId: target.id }),
    onMutate: () =>
      optimistic((old) => [
        ...old,
        { id: `temp_${target.id}`, userId: me.id, targetUserId: target.id, user: target },
      ]),
    onError: (_error, _vars, context) => rollback(context),
    onSettled: refresh,
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.removeFavorite(id),
    onMutate: (id) => optimistic((old) => old.filter((f) => f.id !== id)),
    onError: (_error, _vars, context) => rollback(context),
    onSettled: refresh,
  });

  return {
    isFavorite: Boolean(favorite),
    isLoading: favorites.isPending,
    isPending: add.isPending || remove.isPending,
    isError: add.isError || remove.isError,
    toggle: () => (favorite ? remove.mutate(favorite.id) : add.mutate()),
  };
}
