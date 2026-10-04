"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SwapIllustration } from "@/components/home/swap-illustration";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "@/components/ui/icons";

const POPULAR = [
  { id: "react", label: "React" },
  { id: "uiux", label: "UI/UX" },
  { id: "spanish", label: "Spanish" },
  { id: "photography", label: "Photography" },
];

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/discover?q=${encodeURIComponent(trimmed)}` : "/discover");
  }

  return (
    <section aria-labelledby="hero-title" className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 md:grid-cols-2 md:py-20">
      <div>
        <h1 id="hero-title" className="text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
          Learn together.{" "}
          <span className="block">Share what you know.</span>
        </h1>
        <p className="mt-5 max-w-lg text-lg text-ink-soft">
          Tell us what you can teach and what you want to learn. We find people whose lists fit
          yours, so you can trade lessons instead of paying for them.
        </p>

        <form role="search" onSubmit={submit} className="mt-8 flex max-w-lg gap-2">
          <label htmlFor="hero-search" className="sr-only">
            Search skills
          </label>
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
            <input
              id="hero-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try React, Spanish or Figma"
              className="h-11 w-full rounded-lg border border-line bg-surface pl-10 pr-3 text-ink placeholder:text-ink-soft"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <p className="mt-4 text-sm text-ink-soft">
          Popular:{" "}
          {POPULAR.map((skill, index) => (
            <span key={skill.id}>
              <Link href={`/discover?skill=${skill.id}`} className="font-medium text-ink underline underline-offset-2">
                {skill.label}
              </Link>
              {index < POPULAR.length - 1 ? ", " : ""}
            </span>
          ))}
        </p>
      </div>

      <SwapIllustration />
    </section>
  );
}
