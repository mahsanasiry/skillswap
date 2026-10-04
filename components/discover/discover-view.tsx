"use client";

import { useEffect, useRef, useState } from "react";
import { FilterBar } from "@/components/discover/filter-bar";
import { Pagination } from "@/components/discover/pagination";
import { UserCard, UserCardSkeleton } from "@/components/users/user-card";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { useDiscoverFilters } from "@/hooks/use-discover-filters";
import { useSkills } from "@/hooks/use-skills";
import { useUsers } from "@/hooks/use-users";
import type { UsersQuery } from "@/types";

const SEARCH_DELAY_MS = 300;

function statusText(total: number, page: number, pageSize: number, shown: number): string {
  if (total === 0) return "No people found";
  if (total === 1) return "Showing 1 person";
  const start = (page - 1) * pageSize + 1;
  return `Showing ${start} to ${start + shown - 1} of ${total} people`;
}

export function DiscoverView() {
  const { query, update, reset, activeCount } = useDiscoverFilters();
  const skills = useSkills();
  const users = useUsers(query);

  const [text, setText] = useState(query.q ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsTop = useRef<HTMLDivElement>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function cancelPendingSearch() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }

  // Typing waits a moment so we don't search on every key press.
  function handleTextChange(value: string) {
    setText(value);
    cancelPendingSearch();
    timer.current = setTimeout(() => update({ q: value.trim() || undefined }), SEARCH_DELAY_MS);
  }

  // Pressing Enter searches right away.
  function handleSubmit() {
    cancelPendingSearch();
    update({ q: text.trim() || undefined });
  }

  function handleReset() {
    cancelPendingSearch();
    setText("");
    reset();
  }

  function handlePageChange(page: number) {
    update({ page });
    resultsTop.current?.scrollIntoView?.({ block: "start" });
  }

  const { data, isPending, isError, isFetching, refetch } = users;

  return (
    <div className="flex flex-col gap-6">
      <FilterBar
        query={query}
        skills={skills.data ?? []}
        text={text}
        onTextChange={handleTextChange}
        onSubmit={handleSubmit}
        onChange={(patch: Partial<UsersQuery>) => update(patch)}
        onReset={handleReset}
        activeCount={activeCount}
        open={filtersOpen}
        onToggle={() => setFiltersOpen((open) => !open)}
      />

      <div ref={resultsTop} className="scroll-mt-24" aria-busy={isFetching}>
        <p role="status" aria-live="polite" className="mb-4 text-sm text-ink-soft">
          {isError
            ? ""
            : isPending
              ? "Loading people..."
              : statusText(data.total, data.page, data.pageSize, data.items.length)}
        </p>

        {isError ? (
          <ErrorState
            message="We couldn't load the people."
            onRetry={() => void refetch()}
          />
        ) : isPending ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i}>
                <UserCardSkeleton />
              </li>
            ))}
          </ul>
        ) : data.items.length === 0 ? (
          <EmptyState
            title="No matches found."
            message="Try another skill."
            action={
              activeCount > 0 ? (
                <Button variant="secondary" onClick={handleReset}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <ul
              className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${
                isFetching ? "opacity-60 transition-opacity" : ""
              }`}
            >
              {data.items.map((user) => (
                <li key={user.id}>
                  <UserCard user={user} />
                </li>
              ))}
            </ul>
            {data.totalPages > 1 && (
              <Pagination page={data.page} totalPages={data.totalPages} onChange={handlePageChange} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
