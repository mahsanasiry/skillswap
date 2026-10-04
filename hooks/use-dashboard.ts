"use client";

import { useQuery } from "@tanstack/react-query";
import { useDemoUser } from "@/hooks/use-demo-user";
import { api } from "@/lib/api";

export function useDashboard() {
  const { user } = useDemoUser();
  return useQuery({ queryKey: ["dashboard", user.id], queryFn: api.getDashboard });
}
