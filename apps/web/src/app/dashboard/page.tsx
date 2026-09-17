"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, type MealPlan } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";
import { MealCard } from "@/components/meal-card";

export default function DashboardPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [active, setActive] = useState<MealPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function token() {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }

  async function refresh() {
    const accessToken = await token();
    if (!accessToken) return;
    const listed = await apiFetch<MealPlan[]>("/plans", accessToken);
    setPlans(listed);
    if (listed[0]) {
      const full = await apiFetch<MealPlan>(`/plans/${listed[0].id}`, accessToken);
      setActive(full);
    }
  }

  useEffect(() => {
    refresh().catch((err) => setError(err instanceof Error ? err.message : "Failed to load plans"));
  }, []);

  async function generate() {
    setPending(true);
    setError(null);
    try {
      const accessToken = await token();
      if (!accessToken) throw new Error("Sign in required");
      const plan = await apiFetch<MealPlan>("/plans", accessToken, {
        method: "POST",
        body: JSON.stringify({ days: 1 }),
      });
      setActive(plan);
      setPlans((current) => [plan, ...current]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setPending(false);
    }
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">Dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold">Your meal stack</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/onboarding" className="rounded-full border border-ink/15 px-4 py-2 no-underline">
            Profile
          </Link>
          <button onClick={signOut} className="rounded-full border border-ink/15 px-4 py-2">
            Sign out
          </button>
        </div>
      </header>

      <section className="mt-8 rounded-3xl bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-xl text-ink/75">
            Generate one day first (3 meals). Groq drafts them; the API rejects allergen hits
            before save. Without a Groq key, mock meals are used.
          </p>
          <button
            onClick={generate}
            disabled={pending}
            className="rounded-full bg-brand px-5 py-3 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {pending ? "Stacking meals..." : "Generate today"}
          </button>
        </div>
        {error ? <p className="mt-4 text-sm text-clay">{error}</p> : null}
      </section>

      {active ? (
        <section className="mt-10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Latest plan</h2>
            <span className="rounded-full bg-brand/10 px-3 py-1 text-sm text-brand">{active.status}</span>
          </div>
          {active.meals.length === 0 ? (
            <p className="text-ink/70">No meals yet. Generate a stack to see cards here.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {active.meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <p className="mt-10 text-ink/70">No plans yet. Generate your first stack.</p>
      )}

      {plans.length > 1 ? (
        <p className="mt-8 text-sm text-ink/60">{plans.length} plans saved in Supabase.</p>
      ) : null}
    </main>
  );
}
