import Link from "next/link";
import { ResetDemoButton } from "@/components/layout/reset-demo-button";
import { NAV_LINKS } from "@/lib/nav-links";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="font-semibold">SkillSwap</p>
          <p className="mt-1 text-sm text-ink-soft">
            A demo project. The people and requests are sample data, and everything you do is
            saved only in this browser.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-ink-soft hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <ResetDemoButton />
      </div>
    </footer>
  );
}
