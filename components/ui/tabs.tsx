"use client";

import clsx from "clsx";
import { useRef } from "react";

export type TabItem<T extends string> = { id: T; label: string; count?: number };

/**
 * An accessible tab list (WAI-ARIA tabs pattern): arrow keys, Home and End move
 * between tabs, and only the selected tab is in the Tab key order.
 * The parent renders the panel with id `${idPrefix}-panel`.
 */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  idPrefix,
  label,
}: {
  tabs: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  idPrefix: string;
  label: string;
}) {
  const buttons = useRef<Record<string, HTMLButtonElement | null>>({});

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const last = tabs.length - 1;
    const target =
      event.key === "ArrowRight"
        ? index === last ? 0 : index + 1
        : event.key === "ArrowLeft"
          ? index === 0 ? last : index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (target === null) return;
    event.preventDefault();
    const next = tabs[target];
    buttons.current[next.id]?.focus();
    onChange(next.id);
  }

  return (
    <div role="tablist" aria-label={label} className="flex gap-1 border-b border-line">
      {tabs.map((tab, index) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={(element) => {
              buttons.current[tab.id] = element;
            }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
            className={clsx(
              "-mb-px inline-flex min-h-11 items-center gap-2 border-b-2 px-4 font-medium",
              selected
                ? "border-teach text-ink"
                : "border-transparent text-ink-soft hover:text-ink",
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="rounded-full bg-paper px-2 text-sm text-ink-soft">{tab.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
