/** Which page buttons to show: first, last, and the pages around the current one. */
export function pageItems(page: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const wanted = [...new Set([1, total, page - 1, page, page + 1])]
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const items: (number | "ellipsis")[] = [];
  wanted.forEach((n, index) => {
    if (index > 0 && n - wanted[index - 1] > 1) items.push("ellipsis");
    items.push(n);
  });
  return items;
}
