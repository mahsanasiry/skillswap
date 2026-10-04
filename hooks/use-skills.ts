"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { api } from "@/lib/api";

export function useSkills() {
  return useQuery({ queryKey: ["skills"], queryFn: api.getSkills, staleTime: Infinity });
}

/** Returns a function that turns a skill id into its display name. */
export function useSkillName() {
  const { data } = useSkills();
  return useCallback(
    (id: string) => data?.find((skill) => skill.id === id)?.name ?? id,
    [data],
  );
}
