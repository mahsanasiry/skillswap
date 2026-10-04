const STEPS = [
  {
    title: "List what you know and what you want",
    text: "Add the skills you can teach and the ones you want to learn. Two short lists are enough.",
  },
  {
    title: "Find people whose lists fit yours",
    text: "We rank people by how well your skills line up. A mutual match means you can teach each other.",
  },
  {
    title: "Send a request and trade lessons",
    text: "Pick what you will teach, pick what you will learn, and write a short message. They accept or decline.",
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-title" className="border-y border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <h2 id="how-title" className="text-3xl font-semibold tracking-tight">
          How SkillSwap works
        </h2>
        <ol className="mt-8 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink font-semibold text-paper"
              >
                {index + 1}
              </span>
              <div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-1 max-w-sm text-ink-soft">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
