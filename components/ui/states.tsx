import { Button } from "@/components/ui/button";

export function ErrorState({
  title = "Something went wrong.",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="rounded-xl border border-line bg-surface p-6 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-ink-soft">{message}</p>
      {onRetry && (
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-line p-8 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-ink-soft">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
