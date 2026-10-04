import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-3 text-ink-soft">The page you are looking for does not exist or has moved.</p>
      <ButtonLink href="/" className="mt-6">
        Go to the home page
      </ButtonLink>
    </main>
  );
}
