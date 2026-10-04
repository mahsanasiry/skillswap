"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { DemoUserSwitcher } from "@/components/layout/demo-user-switcher";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { NAV_LINKS } from "@/lib/nav-links";

function isCurrent(pathname: string, href: string) {
  const clean = pathname.replace(/\/$/, "");
  return clean === href || clean.startsWith(`${href}/`);
}

export function Navbar() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
        <Logo />

        <button
          type="button"
          className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-lg border border-line md:hidden"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <CloseIcon /> : <MenuIcon />}
        </button>

        <div
          id="site-menu"
          className={clsx(
            "w-full flex-col gap-4 md:flex md:w-auto md:flex-1 md:flex-row md:items-center",
            open ? "flex" : "hidden",
          )}
        >
          <nav aria-label="Main">
            <ul className="flex flex-col gap-1 md:flex-row md:gap-2">
              {NAV_LINKS.map((link) => {
                const current = isCurrent(pathname, link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={current ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={clsx(
                        "inline-flex min-h-11 w-full items-center rounded-lg px-3 font-medium md:w-auto",
                        current
                          ? "bg-teach-soft text-teach"
                          : "text-ink-soft hover:bg-paper hover:text-ink",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex flex-wrap items-center gap-3 md:ml-auto">
            <DemoUserSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
