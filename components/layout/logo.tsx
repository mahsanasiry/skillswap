import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 rounded-md text-xl font-semibold tracking-tight">
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true" focusable="false">
        <circle cx="11" cy="16" r="9" fill="var(--teach)" />
        <circle
          cx="21"
          cy="16"
          r="8"
          fill="none"
          stroke="var(--learn)"
          strokeWidth="3"
          strokeDasharray="4 3"
        />
      </svg>
      SkillSwap
    </Link>
  );
}
