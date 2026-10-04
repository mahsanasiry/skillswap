import { firstName } from "@/lib/format";
import type { RequestStatus, SwapRequestView } from "@/types";

export type RequestsTab = "received" | "sent" | "accepted";
export const REQUEST_TABS: RequestsTab[] = ["received", "sent", "accepted"];

export const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

/** Waiting requests first, then the rest. Newest first inside each group. */
export function sortRequests(requests: SwapRequestView[]): SwapRequestView[] {
  return [...requests].sort(
    (a, b) =>
      Number(b.status === "pending") - Number(a.status === "pending") ||
      b.updatedAt.localeCompare(a.updatedAt),
  );
}

/** One list from the server becomes the three tabs. */
export function splitRequests(requests: SwapRequestView[], meId: string) {
  const mine = requests.filter((r) => r.sender.id === meId || r.receiver.id === meId);
  return {
    received: sortRequests(mine.filter((r) => r.receiver.id === meId)),
    sent: sortRequests(mine.filter((r) => r.sender.id === meId)),
    accepted: sortRequests(mine.filter((r) => r.status === "accepted")),
  };
}

/** A plain sentence that explains the swap from the point of view of the person reading. */
export function describeRequest(request: SwapRequestView, meId: string, tab: RequestsTab): string {
  const iAmSender = request.sender.id === meId;
  const teach = request.teachSkill.name; // what the sender teaches
  const learn = request.learnSkill.name; // what the sender wants to learn

  if (tab === "accepted") {
    return iAmSender
      ? `You teach ${teach} and learn ${learn}.`
      : `You teach ${learn} and learn ${teach}.`;
  }
  if (iAmSender) {
    return `You want to learn ${learn} from ${firstName(request.receiver.name)} and can teach ${teach}.`;
  }
  return `${firstName(request.sender.name)} wants to learn ${learn} and can teach ${teach}.`;
}

/** "2026-09-28T10:00:00.000Z" becomes "Sep 28, 2026" (UTC, so it never shifts by time zone). */
export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function statusLine(request: SwapRequestView): string {
  return request.status === "pending"
    ? `Sent on ${formatShortDate(request.createdAt)}`
    : `${STATUS_LABEL[request.status]} on ${formatShortDate(request.updatedAt)}`;
}
