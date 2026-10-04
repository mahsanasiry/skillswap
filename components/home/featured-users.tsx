"use client";

import { UserCard, UserCardSkeleton } from "@/components/users/user-card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/ui/states";
import { useUsers } from "@/hooks/use-users";

export function FeaturedUsers() {
  const { data, isPending, isError, refetch } = useUsers({ sort: "relevant", pageSize: 3 });

  return (
    <section aria-labelledby="people-title" className="mx-auto max-w-6xl px-4 pb-14">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="people-title" className="text-3xl font-semibold tracking-tight">
          People who fit you best
        </h2>
        <ButtonLink href="/discover" variant="secondary" size="sm">
          See everyone
        </ButtonLink>
      </div>

      <div className="mt-6">
        {isError ? (
          <ErrorState message="We could not load the people." onRetry={() => void refetch()} />
        ) : isPending ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <UserCardSkeleton key={i} />
            ))}
          </div>
        ) : data.items.length === 0 ? (
          <EmptyState title="No matches yet." message="Add more skills to your profile to find people." />
        ) : (
          <ul className="grid gap-4 md:grid-cols-3">
            {data.items.map((user) => (
              <li key={user.id}>
                <UserCard user={user} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
