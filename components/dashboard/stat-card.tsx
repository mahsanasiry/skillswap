import Link from "next/link";

/** One big number that is also a link to where you can act on it. */
export function StatCard({ value, label, href }: { value: number; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col rounded-xl border border-line bg-surface p-5 hover:border-teach"
    >
      <span className="text-4xl font-semibold tracking-tight">{value}</span>
      <span className="mt-1 text-ink-soft">{label}</span>
    </Link>
  );
}
