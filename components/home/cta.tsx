import { ButtonLink } from "@/components/ui/button";

export function Cta() {
  return (
    <section aria-labelledby="cta-title" className="mx-auto max-w-6xl px-4">
      <div className="rounded-2xl bg-ink px-6 py-12 text-paper md:px-12">
        <h2 id="cta-title" className="max-w-xl text-3xl font-semibold tracking-tight">
          You already know something someone else wants to learn.
        </h2>
        <p className="mt-3 max-w-xl opacity-80">
          Find your first match in a couple of minutes. It costs nothing.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <ButtonLink href="/discover" className="bg-paper text-ink hover:bg-paper hover:opacity-90">
            Find a match
          </ButtonLink>
          <ButtonLink
            href="/dashboard"
            className="border border-paper/40 text-paper hover:bg-paper/10"
          >
            Go to your dashboard
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
