import clsx from "clsx";
import type { User } from "@/types";

const sizes = { sm: "h-9 w-9 text-sm", md: "h-12 w-12 text-base", lg: "h-24 w-24 text-3xl" };

/** Initials on a colour. Decorative: the person's name is always shown next to it. */
export function Avatar({
  avatar,
  size = "md",
}: {
  avatar: User["avatar"];
  size?: keyof typeof sizes;
}) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white",
        sizes[size],
      )}
      style={{ backgroundColor: `hsl(${avatar.hue} 55% 38%)` }}
    >
      {avatar.initials}
    </span>
  );
}
