"use client";

import Link from "next/link";
import { useState } from "react";
import { RequestForm } from "@/components/requests/request-form";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SkillChip } from "@/components/ui/skill-chip";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/states";
import { FavoriteButton } from "@/components/users/favorite-button";
import { useDemoUser } from "@/hooks/use-demo-user";
import { useRequests } from "@/hooks/use-requests";
import { useSkillName } from "@/hooks/use-skills";
import { useUser } from "@/hooks/use-users";
import { ApiError } from "@/lib/api";
import { capitalize, firstName, formatMonthYear } from "@/lib/format";
import type { UserWithMatch } from "@/types";

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-xl font-semibold">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function HowYouFit({ user }: { user: UserWithMatch }) {
  const skillName = useSkillName();
  const match = user.match;
  const name = firstName(user.name);

  if (!match || match.score === 0) {
    return <p className="text-ink-soft">You have no skills in common right now.</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      <p
        className={
          match.mutual
            ? "w-fit rounded-md bg-teach-soft px-2 py-1 text-sm font-medium text-teach"
            : "w-fit rounded-md bg-paper px-2 py-1 text-sm font-medium text-ink-soft"
        }
      >
        {match.mutual ? "Mutual match" : "Partial match"}, {match.score}%
      </p>
      {match.theyTeachMe.length > 0 && (
        <p>
          {name} can teach you: <strong>{match.theyTeachMe.map(skillName).join(", ")}</strong>
        </p>
      )}
      {match.iTeachThem.length > 0 && (
        <p>
          You can teach {name}: <strong>{match.iTeachThem.map(skillName).join(", ")}</strong>
        </p>
      )}
      <p className="text-ink-soft">
        Your schedules {match.availabilityFit ? "line up." : "may not line up."}
      </p>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <p role="status" className="sr-only">
        Loading profile...
      </p>
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function ProfileView({ id }: { id: string }) {
  const { user: me } = useDemoUser();
  const query = useUser(id);
  const requests = useRequests("all");
  const skillName = useSkillName();
  const [formOpen, setFormOpen] = useState(false);

  if (query.isPending) return <ProfileSkeleton />;

  if (query.isError) {
    const missing = query.error instanceof ApiError && query.error.status === 404;
    return (
      <ErrorState
        title={missing ? "We can't find this person." : "Something went wrong."}
        message={missing ? "This profile does not exist." : "We couldn't load this profile."}
        onRetry={missing ? undefined : () => void query.refetch()}
      />
    );
  }

  const user = query.data;
  const isMe = user.id === me.id;
  const pending = requests.data?.find(
    (r) => r.status === "pending" && (r.sender.id === user.id || r.receiver.id === user.id),
  );

  return (
    <div className="flex flex-col gap-8">
      <Link href="/discover" className="w-fit rounded-md text-sm font-medium text-ink-soft hover:text-ink">
        <span aria-hidden="true">&larr; </span>Back to Discover
      </Link>

      <header className="rounded-xl border border-line bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            <Avatar avatar={user.avatar} size="lg" />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">{user.name}</h1>
              <p className="text-lg text-ink-soft">{user.role}</p>
              <p className="text-ink-soft">{user.location}</p>
            </div>
          </div>

          {isMe ? (
            <p className="rounded-lg bg-paper px-3 py-2 text-ink-soft">This is your profile.</p>
          ) : (
            <div className="flex flex-wrap items-start gap-3">
              <FavoriteButton user={user} />
              <div className="flex flex-col gap-1">
                <Button
                  disabled={Boolean(pending)}
                  aria-expanded={formOpen}
                  aria-controls="request-section"
                  aria-describedby={pending ? "pending-note" : undefined}
                  onClick={() => setFormOpen((open) => !open)}
                >
                  Request skill swap
                </Button>
              </div>
            </div>
          )}
        </div>

        {pending && !isMe && (
          <p id="pending-note" className="mt-4 text-ink-soft">
            You have a pending request with {user.name}.{" "}
            <Link href="/requests" className="font-medium text-ink underline underline-offset-2">
              See your requests
            </Link>
          </p>
        )}

        <dl className="mt-6 grid gap-4 border-t border-line pt-4 sm:grid-cols-4">
          {[
            ["Level", capitalize(user.level)],
            ["Experience", `${user.yearsExperience} ${user.yearsExperience === 1 ? "year" : "years"}`],
            ["Availability", capitalize(user.availability)],
            ["Joined", formatMonthYear(user.joinedAt)],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-sm text-ink-soft">{label}</dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </header>

      {formOpen && !isMe && (
        <div id="request-section">
          <RequestForm receiver={user} onClose={() => setFormOpen(false)} />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="flex flex-col gap-8">
          <Section id="about-title" title="About">
            <p className="max-w-2xl">{user.bio}</p>
          </Section>

          <Section id="teaches-title" title="Skills I teach">
            <ul className="flex flex-wrap gap-2">
              {user.teaches.map((t) => (
                <li key={t.skillId}>
                  <SkillChip kind="teach">
                    {skillName(t.skillId)} · {capitalize(t.level)}
                  </SkillChip>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="wants-title" title="Skills I want to learn">
            <ul className="flex flex-wrap gap-2">
              {user.wantsToLearn.map((skillId) => (
                <li key={skillId}>
                  <SkillChip kind="learn">{skillName(skillId)}</SkillChip>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        {!isMe && (
          <aside className="h-fit rounded-xl border border-line bg-surface p-5">
            <Section id="fit-title" title="How you fit">
              <HowYouFit user={user} />
            </Section>
          </aside>
        )}
      </div>
    </div>
  );
}
