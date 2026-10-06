"use client";

import { Button } from "@/components/ui/button";
import { SearchIcon } from "@/components/ui/icons";
import { SelectField } from "@/components/ui/select-field";
import { capitalize } from "@/lib/format";
import { AVAILABILITIES, CATEGORIES, LEVELS } from "@/lib/schemas";
import type { Availability, Category, Level, Skill, UserSort, UsersQuery } from "@/types";

const SORT_OPTIONS: { value: UserSort; label: string }[] = [
  { value: "relevant", label: "Most relevant" },
  { value: "experienced", label: "Most experienced" },
  { value: "recent", label: "Recently joined" },
];

type Props = {
  query: UsersQuery;
  skills: Skill[];
  text: string;
  onTextChange: (value: string) => void;
  onSubmit: () => void;
  onChange: (patch: Partial<UsersQuery>) => void;
  onReset: () => void;
  activeCount: number;
  open: boolean;
  onToggle: () => void;
};

export function FilterBar({
  query,
  skills,
  text,
  onTextChange,
  onSubmit,
  onChange,
  onReset,
  activeCount,
  open,
  onToggle,
}: Props) {
  const skillOptions = [...skills]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((skill) => ({ value: skill.id, label: skill.name }));

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
        className="flex flex-col gap-1"
      >
        <label htmlFor="discover-search" className="text-sm font-medium">
          Search people or skills
        </label>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            id="discover-search"
            type="search"
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            placeholder="Try React, Spanish, designer or Madrid"
            className="h-11 w-full rounded-lg border border-control bg-paper pl-10 pr-3 text-ink placeholder:text-ink-soft"
          />
        </div>
      </form>

      <div className="mt-4 flex items-center justify-between gap-3 md:hidden">
        <Button
          variant="secondary"
          size="sm"
          aria-expanded={open}
          aria-controls="filters-panel"
          onClick={onToggle}
        >
          {open ? "Hide filters" : "Show filters"}
        </Button>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Clear filters ({activeCount})
          </Button>
        )}
      </div>

      <div
        id="filters-panel"
        className={`mt-4 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 ${open ? "grid" : "hidden md:grid"}`}
      >
        <SelectField
          id="filter-skill"
          label="Skill they teach"
          value={query.skill ?? ""}
          onChange={(value) => onChange({ skill: value || undefined })}
          options={skillOptions}
          placeholder="Any skill"
        />
        <SelectField
          id="filter-level"
          label="Level"
          value={query.level ?? ""}
          onChange={(value) => onChange({ level: (value || undefined) as Level | undefined })}
          options={LEVELS.map((level) => ({ value: level, label: capitalize(level) }))}
          placeholder="Any level"
        />
        <SelectField
          id="filter-category"
          label="Category"
          value={query.category ?? ""}
          onChange={(value) => onChange({ category: (value || undefined) as Category | undefined })}
          options={CATEGORIES.map((category) => ({ value: category, label: category }))}
          placeholder="Any category"
        />
        <SelectField
          id="filter-availability"
          label="Availability"
          value={query.availability ?? ""}
          onChange={(value) =>
            onChange({ availability: (value || undefined) as Availability | undefined })
          }
          options={AVAILABILITIES.map((item) => ({ value: item, label: capitalize(item) }))}
          placeholder="Any time"
        />
        <SelectField
          id="sort"
          label="Sort by"
          value={query.sort}
          onChange={(value) => onChange({ sort: value as UserSort })}
          options={SORT_OPTIONS}
        />
      </div>

      {activeCount > 0 && (
        <div className="mt-4 hidden md:block">
          <Button variant="ghost" size="sm" onClick={onReset}>
            Clear filters ({activeCount})
          </Button>
        </div>
      )}
    </div>
  );
}
