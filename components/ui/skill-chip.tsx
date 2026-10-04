import clsx from "clsx";

/**
 * Teal + solid border = something a person teaches.
 * Violet + dashed border = something a person wants to learn.
 * The border style means colour is never the only signal.
 */
export function SkillChip({ kind, children }: { kind: "teach" | "learn"; children: React.ReactNode }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-medium",
        kind === "teach"
          ? "border-teach/40 bg-teach-soft text-teach"
          : "border-dashed border-learn/60 bg-learn-soft text-learn",
      )}
    >
      {children}
    </span>
  );
}
