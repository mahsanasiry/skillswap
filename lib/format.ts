export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** "2026-03-12T09:00:00.000Z" becomes "March 2026". Uses UTC so it never shifts by time zone. */
export function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function firstName(name: string): string {
  return name.split(" ")[0];
}
