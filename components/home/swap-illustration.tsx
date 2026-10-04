import { Avatar } from "@/components/ui/avatar";
import { SwapIcon } from "@/components/ui/icons";
import { SkillChip } from "@/components/ui/skill-chip";

function Person({
  initials,
  hue,
  name,
  role,
  teaches,
  learns,
}: {
  initials: string;
  hue: number;
  name: string;
  role: string;
  teaches: string;
  learns: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-center gap-3">
        <Avatar avatar={{ initials, hue }} />
        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-ink-soft">{role}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
        <span>Teaches</span>
        <SkillChip kind="teach">{teaches}</SkillChip>
        <span className="ml-2">Wants</span>
        <SkillChip kind="learn">{learns}</SkillChip>
      </div>
    </div>
  );
}

/** The one memorable element of the home page: a swap, drawn with the product's own parts. */
export function SwapIllustration() {
  return (
    <div
      role="img"
      aria-label="Example: Mina teaches React and wants to learn UI/UX. Alex teaches UI/UX and wants to learn React."
      className="mx-auto flex w-full max-w-md flex-col items-stretch gap-2"
    >
      <div aria-hidden="true" className="flex flex-col items-stretch gap-2">
        <Person
          initials="MI"
          hue={172}
          name="Mina"
          role="Frontend developer"
          teaches="React"
          learns="UI/UX"
        />
        <div className="flex items-center justify-center gap-3 text-ink-soft">
          <span className="h-px flex-1 bg-line" />
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface">
            <SwapIcon />
          </span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <Person
          initials="AL"
          hue={268}
          name="Alex"
          role="Product designer"
          teaches="UI/UX"
          learns="React"
        />
      </div>
    </div>
  );
}
