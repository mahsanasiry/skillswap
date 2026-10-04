"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { REQUEST_TABS, type RequestsTab } from "@/lib/requests";

/** The selected tab lives in the address (?tab=sent), so it survives a refresh. */
export function useRequestsTab() {
  const router = useRouter();
  const pathname = usePathname();
  const param = useSearchParams().get("tab");
  const tab: RequestsTab = REQUEST_TABS.find((t) => t === param) ?? "received";

  const setTab = useCallback(
    (next: RequestsTab) => {
      router.replace(next === "received" ? pathname : `${pathname}?tab=${next}`, { scroll: false });
    },
    [router, pathname],
  );

  return { tab, setTab };
}
