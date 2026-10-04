import Link from "next/link";
import { StatusBadge } from "@/components/requests/status-badge";
import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { statusLine } from "@/lib/requests";
import type { SwapRequestView, User } from "@/types";

export function RecentRequests({ requests, me }: { requests: SwapRequestView[]; me: User }) {
  return (
    <section aria-labelledby="recent-title">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="recent-title" className="text-2xl font-semibold tracking-tight">
          Recent requests
        </h2>
        <ButtonLink href="/requests" variant="secondary" size="sm">
          View all requests
        </ButtonLink>
      </div>

      <div className="mt-4">
        {requests.length === 0 ? (
          <EmptyState
            title="No requests yet."
            message="Send your first request from someone's profile."
            action={<ButtonLink href="/discover">Find people</ButtonLink>}
          />
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
            {requests.map((request) => {
              const received = request.receiver.id === me.id;
              const other = received ? request.sender : request.receiver;
              return (
                <li key={request.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar avatar={other.avatar} size="sm" />
                    <div>
                      <p className="font-medium">
                        <Link href={`/profile/${other.id}`} className="hover:underline">
                          {other.name}
                        </Link>
                      </p>
                      <p className="text-sm text-ink-soft">
                        {received ? "Received from them" : "Sent to them"} · {statusLine(request)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={request.status} />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
