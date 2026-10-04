import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { pageItems } from "@/lib/pagination";

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  return (
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </Button>
      <ul className="flex items-center gap-1">
        {pageItems(page, totalPages).map((item, index) =>
          item === "ellipsis" ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-ink-soft">
              ...
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => onChange(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={clsx(
                  "h-9 min-w-9 rounded-lg px-2 text-sm font-medium",
                  item === page ? "bg-ink text-paper" : "text-ink hover:bg-line/50",
                )}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>
      <Button
        variant="secondary"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </Button>
    </nav>
  );
}
