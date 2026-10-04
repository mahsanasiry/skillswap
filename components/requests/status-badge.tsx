import clsx from "clsx";
import { STATUS_LABEL } from "@/lib/requests";
import type { RequestStatus } from "@/types";

const styles: Record<RequestStatus, string> = {
  pending: "border border-line bg-paper text-ink-soft",
  accepted: "bg-teach-soft text-teach",
  rejected: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  cancelled: "border border-line bg-paper text-ink-soft line-through",
};

/** The word is always written out, so colour is never the only signal. */
export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span className={clsx("inline-flex rounded-md px-2 py-1 text-sm font-medium", styles[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}
