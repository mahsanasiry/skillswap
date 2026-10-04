import { DataCheck } from "@/components/dev/data-check";

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">SkillSwap</h1>
      <p className="text-lg text-ink-soft">
        The data layer is ready. The real pages arrive in the next steps.
      </p>
      <DataCheck />
    </main>
  );
}
