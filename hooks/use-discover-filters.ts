"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { buildUsersSearchParams, parseUsersQuery } from "@/lib/users-query";
import type { UsersQuery } from "@/types";

/**
 * The address bar is the single source of truth for the Discover filters.
 * That makes every search shareable, and the back button just works.
 */
export function useDiscoverFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const raw = useSearchParams().toString();

  // Always holds the newest URL, so quick successive changes never overwrite each other.
  const latest = useRef(raw);
  useEffect(() => {
    latest.current = raw;
  }, [raw]);

  const query = useMemo(() => parseUsersQuery(new URLSearchParams(raw)), [raw]);

  const update = useCallback(
    (patch: Partial<UsersQuery>) => {
      const current = parseUsersQuery(new URLSearchParams(latest.current));
      const next: Partial<UsersQuery> = { ...current, ...patch };
      if (!("page" in patch)) next.page = 1; // any filter change goes back to page 1
      const search = buildUsersSearchParams(next).toString();
      latest.current = search;
      router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false });
    },
    [router, pathname],
  );

  const reset = useCallback(() => {
    latest.current = "";
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const activeCount = [query.q, query.skill, query.level, query.category, query.availability].filter(
    Boolean,
  ).length;

  return { query, update, reset, activeCount };
}
