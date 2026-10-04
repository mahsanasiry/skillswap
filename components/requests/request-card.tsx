import Link from "next/link";
import { StatusBadge } from "@/components/requests/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { describeRequest, statusLine, type RequestsTab } from "@/lib/requests";
import type { SwapRequestView, User } from "@/types";

type Props = {
  request: SwapRequestView;
  me: User;
  tab: RequestsTab;
  busy: boolean;
  error?: string;
  onUpdate: (status: "accepted" | "rejected" | "cancelled") => void;
};

export function RequestCard({ request, me, tab, busy, error, onUpdate }: Props) {
  const iAmReceiver = request.receiver.id === me.id;
  const other = iAmReceiver ? request.sender : request.receiver;
  const pending = request.status === "pending";

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar avatar={other.avatar} />
          <div>
            <h3 className="text-lg font-semibold">
              <Link href={`/profile/${other.id}`} className="hover:underline">
                {other.name}
              </Link>
            </h3>
            <p className="text-sm text-ink-soft">{other.role}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusBadge status={request.status} />
          <p className="text-sm text-ink-soft">{statusLine(request)}</p>
        </div>
      </header>

      <p>{describeRequest(request, me.id, tab)}</p>

      <blockquote className="border-l-4 border-line pl-4 text-ink-soft">{request.message}</blockquote>

      {pending && iAmReceiver && (
        <div className="flex flex-wrap gap-3">
          <Button
            aria-label={`Accept request from ${other.name}`}
            disabled={busy}
            onClick={() => onUpdate("accepted")}
          >
            Accept
          </Button>
          <Button
            variant="secondary"
            aria-label={`Reject request from ${other.name}`}
            disabled={busy}
            onClick={() => onUpdate("rejected")}
          >
            Reject
          </Button>
        </div>
      )}

      {pending && !iAmReceiver && (
        <div>
          <Button
            variant="secondary"
            aria-label={`Cancel request to ${other.name}`}
            disabled={busy}
            onClick={() => onUpdate("cancelled")}
          >
            Cancel request
          </Button>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-600 p-3 text-sm font-medium text-red-700 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </article>
  );
}
