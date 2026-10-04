"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoUser } from "@/hooks/use-demo-user";
import { api } from "@/lib/api";
import type { CreateRequestInput, RequestBox } from "@/types";

export function useRequests(box: RequestBox = "all") {
  const { user } = useDemoUser();
  return useQuery({
    queryKey: ["requests", user.id, box],
    queryFn: () => api.getRequests(box),
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateRequestInput) => api.createRequest(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["requests"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
