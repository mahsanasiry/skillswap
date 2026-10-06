"use client";

import { useMemo, useState } from "react";
import { RequestCard } from "@/components/requests/request-card";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { Tabs, type TabItem } from "@/components/ui/tabs";
import { useDemoUser } from "@/hooks/use-demo-user";
import { useRequests, useUpdateRequest } from "@/hooks/use-requests";
import { useRequestsTab } from "@/hooks/use-requests-tab";
import { ApiError } from "@/lib/api";
import { splitRequests, type RequestsTab } from "@/lib/requests";
import type { SwapRequestView } from "@/types";

const EMPTY: Record<RequestsTab, { title: string; message: string; findPeople?: boolean }> = {
  received: {
    title: "No requests yet.",
    message: "When someone asks to swap skills with you, their request shows up here.",
  },
  sent: {
    title: "You haven't sent any requests.",
    message: "Find someone whose skills fit yours and ask to swap.",
    findPeople: true,
  },
  accepted: {
    title: "No accepted swaps yet.",
    message: "Accepted requests appear here, whether you sent them or received them.",
  },
};

function announce(status: "accepted" | "rejected" | "cancelled", name: string): string {
  if (status === "accepted") return `Accepted the request from ${name}.`;
  if (status === "rejected") return `Rejected the request from ${name}.`;
  return `Cancelled your request to ${name}.`;
}

function waitingText(count: number): string {
  if (count === 0) return "You have no requests waiting for an answer.";
  return `${count} ${count === 1 ? "request is" : "requests are"} waiting for your answer.`;
}

export function RequestsView() {
  const { user: me } = useDemoUser();
  const { tab, setTab } = useRequestsTab();
  const requests = useRequests("all");
  const update = useUpdateRequest();
  const [notice, setNotice] = useState("");

  const boxes = useMemo(
    () => (requests.data ? splitRequests(requests.data, me.id) : null),
    [requests.data, me.id],
  );

  // Only show the big error when there is nothing to show. If a refresh fails,
  // the people keep seeing the list they already have.
  if (requests.isError && !requests.data) {
    return (
      <ErrorState message="We couldn't load your requests." onRetry={() => void requests.refetch()} />
    );
  }

  if (!boxes) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <p role="status" className="sr-only">
          Loading requests...
        </p>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-44 w-full" />
        ))}
      </div>
    );
  }

  const tabs: TabItem<RequestsTab>[] = [
    { id: "received", label: "Received", count: boxes.received.length },
    { id: "sent", label: "Sent", count: boxes.sent.length },
    { id: "accepted", label: "Accepted", count: boxes.accepted.length },
  ];
  const visible = boxes[tab];
  const waiting = boxes.received.filter((r) => r.status === "pending").length;

  function changeTab(next: RequestsTab) {
    setNotice("");
    setTab(next);
  }

  function handleUpdate(request: SwapRequestView, status: "accepted" | "rejected" | "cancelled") {
    const other = request.receiver.id === me.id ? request.sender : request.receiver;
    setNotice(announce(status, other.name)); // the card already shows the new status
    update.mutate({ id: request.id, status }, { onError: () => setNotice("") });
  }

  function errorFor(request: SwapRequestView): string | undefined {
    if (!update.isError || update.variables?.id !== request.id) return undefined;
    return update.error instanceof ApiError
      ? update.error.message
      : "We couldn't update that request. Try again.";
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs tabs={tabs} value={tab} onChange={changeTab} idPrefix="requests" label="Requests" />

      <div id="requests-panel" role="tabpanel" aria-labelledby={`requests-tab-${tab}`} tabIndex={0}>
        <h2 className="sr-only">{tabs.find((t) => t.id === tab)?.label} requests</h2>
        <p role="status" aria-live="polite" className="mb-2 min-h-6 text-sm font-medium">
          {notice}
        </p>

        {tab === "received" && boxes.received.length > 0 && (
          <p className="mb-4 text-ink-soft">{waitingText(waiting)}</p>
        )}

        {visible.length === 0 ? (
          <EmptyState
            title={EMPTY[tab].title}
            message={EMPTY[tab].message}
            action={
              EMPTY[tab].findPeople ? <ButtonLink href="/discover">Find people</ButtonLink> : undefined
            }
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {visible.map((request) => (
              <li key={request.id}>
                <RequestCard
                  request={request}
                  me={me}
                  tab={tab}
                  busy={update.isPending && update.variables?.id === request.id}
                  error={errorFor(request)}
                  onUpdate={(status) => handleUpdate(request, status)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
