"use client";

import { Avatar } from "@/components/ui/avatar";
import { ButtonLink } from "@/components/ui/button";
import { SkillChip } from "@/components/ui/skill-chip";
import { useSkillName } from "@/hooks/use-skills";
import type { UserWithMatch } from "@/types";

const MAX_CHIPS = 3;

function ChipGroup({
  label,
  kind,
  ids,
}: {
  label: string;
  kind: "teach" | "learn";
  ids: string[];
}) {
  const skillName = useSkillName();
  const shown = ids.slice(0, MAX_CHIPS);
  const hidden = ids.length - shown.length;
  return (
    <div>
      <p className="text-sm text-ink-soft">{label}</p>
      <ul className="mt-1 flex flex-wrap gap-1.5">
        {shown.map((id) => (
          <li key={id}>
            <SkillChip kind={kind}>{skillName(id)}</SkillChip>
          </li>
        ))}
        {hidden > 0 && <li className="self-center text-sm text-ink-soft">+{hidden} more</li>}
      </ul>
    </div>
  );
}

function matchLabel(user: UserWithMatch): string | null {
  if (!user.match || user.match.score === 0) return null;
  return user.match.mutual ? `Mutual match, ${user.match.score}%` : `Partial match, ${user.match.score}%`;
}

export function UserCard({
  user,
  extraAction,
}: {
  user: UserWithMatch;
  extraAction?: React.ReactNode;
}) {
  const label = matchLabel(user);
  return (
    <article className="flex h-full flex-col gap-4 rounded-xl border border-line bg-surface p-5">
      <div className="flex items-center gap-3">
        <Avatar avatar={user.avatar} />
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold">{user.name}</h3>
          <p className="truncate text-sm text-ink-soft">{user.role}</p>
        </div>
      </div>

      {label && (
        <p
          className={
            user.match?.mutual
              ? "w-fit rounded-md bg-teach-soft px-2 py-1 text-sm font-medium text-teach"
              : "w-fit rounded-md bg-paper px-2 py-1 text-sm font-medium text-ink-soft"
          }
        >
          {label}
        </p>
      )}

      <ChipGroup label="Teaches" kind="teach" ids={user.teaches.map((t) => t.skillId)} />
      <ChipGroup label="Wants to learn" kind="learn" ids={user.wantsToLearn} />

      <div className="mt-auto flex flex-wrap gap-2">
        <ButtonLink
          href={`/profile/${user.id}`}
          variant="secondary"
          size="sm"
          aria-label={`View ${user.name}'s profile`}
        >
          View profile
        </ButtonLink>
        {extraAction}
      </div>
    </article>
  );
}

export function UserCardSkeleton() {
  return (
    <div aria-hidden="true" className="h-64 animate-pulse rounded-xl border border-line bg-surface" />
  );
}
