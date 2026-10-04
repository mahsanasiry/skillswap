"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ErrorState } from "@/components/ui/states";
import { Skeleton } from "@/components/ui/skeleton";
import { useSkills } from "@/hooks/use-skills";
import { useUsers } from "@/hooks/use-users";

const HOW_MANY = 8;

export function FeaturedSkills() {
  const skills = useSkills();
  const users = useUsers({ pageSize: 50 });

  const featured = useMemo(() => {
    if (!skills.data || !users.data) return [];
    const counts = new Map<string, number>();
    for (const user of users.data.items) {
      for (const { skillId } of user.teaches) counts.set(skillId, (counts.get(skillId) ?? 0) + 1);
    }
    return skills.data
      .map((skill) => ({ ...skill, teachers: counts.get(skill.id) ?? 0 }))
      .filter((skill) => skill.teachers > 0)
      .sort((a, b) => b.teachers - a.teachers || a.name.localeCompare(b.name))
      .slice(0, HOW_MANY);
  }, [skills.data, users.data]);

  return (
    <section aria-labelledby="skills-title" className="mx-auto max-w-6xl px-4 py-14">
      <h2 id="skills-title" className="text-3xl font-semibold tracking-tight">
        Skills people are teaching
      </h2>

      <div className="mt-6">
        {skills.isError || users.isError ? (
          <ErrorState
            message="We could not load the skills."
            onRetry={() => {
              void skills.refetch();
              void users.refetch();
            }}
          />
        ) : !skills.data || !users.data ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: HOW_MANY }, (_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((skill) => (
              <li key={skill.id}>
                <Link
                  href={`/discover?skill=${skill.id}`}
                  className="block rounded-xl border border-line bg-surface p-4 hover:border-teach"
                >
                  <span className="block font-semibold">{skill.name}</span>
                  <span className="block text-sm text-ink-soft">
                    {skill.teachers} {skill.teachers === 1 ? "teacher" : "teachers"} in {skill.category}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
