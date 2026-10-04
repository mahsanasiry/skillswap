"use client";

import { FeaturedUsers } from "@/components/home/featured-users";
import { RecentRequests } from "@/components/dashboard/recent-requests";
import { StatCard } from "@/components/dashboard/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { useDashboard } from "@/hooks/use-dashboard";
import { firstName } from "@/lib/format";

export function DashboardView() {
  const { data, isError, refetch } = useDashboard();

  if (isError && !data) {
    return (
      <ErrorState message="We couldn't load your dashboard." onRetry={() => void refetch()} />
    );
  }

  if (!data) {
    return (
      <div aria-busy="true" className="flex flex-col gap-8">
        <p role="status" className="sr-only">
          Loading dashboard...
        </p>
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome back, {firstName(data.user.name)}
        </h1>
        <p className="mt-2 text-ink-soft">Here is what is happening with your swaps.</p>
      </div>

      <section aria-label="Your numbers">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <li>
            <StatCard value={data.skillsCount} label="Your skills" href={`/profile/${data.user.id}`} />
          </li>
          <li>
            <StatCard value={data.potentialMatches} label="Potential matches" href="/discover" />
          </li>
          <li>
            <StatCard value={data.pendingRequests} label="Pending requests" href="/requests" />
          </li>
          <li>
            <StatCard value={data.favorites} label="Favorites" href="/favorites" />
          </li>
        </ul>
      </section>

      <RecentRequests requests={data.recentRequests} me={data.user} />

      <FeaturedUsers title="Best matches for you" embedded />
    </div>
  );
}
