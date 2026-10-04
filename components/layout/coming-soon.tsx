import { ButtonLink } from "@/components/ui/button";

/** Placeholder for pages that are built in a later step, so no link is ever broken. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-ink-soft">This page is not built yet. It arrives in a later step.</p>
      <ButtonLink href="/" variant="secondary" className="mt-6">
        Back to home
      </ButtonLink>
    </main>
  );
}
