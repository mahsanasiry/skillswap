import clsx from "clsx";

export const controlClass =
  "w-full rounded-lg border border-control bg-surface px-3 text-ink placeholder:text-ink-soft aria-[invalid=true]:border-red-600";

/** A label, the control, an optional hint and an error message, wired together. */
export function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={clsx("text-sm font-medium text-red-700 dark:text-red-400")}>
          {error}
        </p>
      )}
    </div>
  );
}

/** Builds the aria-describedby value for a field. */
export function describedBy(id: string, { hint, error }: { hint?: boolean; error?: boolean }) {
  return [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
}
