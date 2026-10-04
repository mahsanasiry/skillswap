"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDemoUser } from "@/hooks/use-demo-user";
import { api } from "@/lib/api";
import type { CreateRequestInput, RequestBox, RequestStatus, SwapRequestView } from "@/types";

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

type UpdateInput = { id: string; status: Exclude<RequestStatus, "pending"> };

/**
 * Accept, reject or cancel a request. The list changes instantly (optimistic
 * update) so the page never needs a refresh. If the server says no, the list
 * goes back to how it was and the error is available to show.
 */
export function useUpdateRequest() {
  const { user } = useDemoUser();
  const queryClient = useQueryClient();
  const key = ["requests", user.id];

  return useMutation({
    mutationFn: ({ id, status }: UpdateInput) => api.updateRequest(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueriesData<SwapRequestView[]>({ queryKey: key });
      queryClient.setQueriesData<SwapRequestView[]>({ queryKey: key }, (old) =>
        old?.map((r) =>
          r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r,
        ),
      );
      return { previous };
    },
    onError: (_error, _input, context) => {
      context?.previous.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["requests"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
