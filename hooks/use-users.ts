"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDemoUser } from "@/hooks/use-demo-user";
import { api } from "@/lib/api";
import type { UsersQuery } from "@/types";

export function useUsers(query: Partial<UsersQuery> = {}) {
  const { user } = useDemoUser();
  return useQuery({
    queryKey: ["users", user.id, query],
    queryFn: () => api.getUsers(query),
    placeholderData: keepPreviousData, // keeps old results visible while new ones load
  });
}

export function useUser(id: string) {
  const { user } = useDemoUser();
  return useQuery({
    queryKey: ["user", user.id, id],
    queryFn: () => api.getUser(id),
  });
}
