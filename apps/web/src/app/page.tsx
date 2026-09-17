import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Nutri-Stacker</p>
      <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight">
        Stack meals that hit your macros — without hardcoded diet rules.
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-ink/80">
        Tell us your goal, allergies, and targets. Groq drafts the meals. The API checks
        allergens before anything is saved.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/demo"
          className="rounded-full bg-brand px-6 py-3 font-medium text-white no-underline hover:bg-brand-dark"
        >
          Try demo
        </Link>
        <Link href="/login" className="rounded-full border border-ink/15 px-6 py-3 font-medium no-underline">
          Create account or sign in
        </Link>
      </div>
    </main>
  );
}
