import Link from "next/link";

import { MealCard } from "@/components/meal-card";
import type { Meal } from "@/lib/api";

const demoMeals = [
  {
    id: "demo-breakfast",
    day_index: 0,
    slot: "breakfast",
    name: "Cinnamon berry protein oats",
    minutes: 10,
    steps: [
      "Simmer the oats with the milk until creamy.",
      "Stir in protein powder after removing from heat.",
      "Top with berries and cinnamon.",
    ],
    calories: 430,
    protein_g: 31,
    carbs_g: 57,
    fat_g: 9,
    items: [
      { id: "demo-oats", ingredient_name: "rolled oats", grams: 60 },
      { id: "demo-milk", ingredient_name: "oat milk", grams: 220 },
      { id: "demo-protein", ingredient_name: "pea protein", grams: 30 },
      { id: "demo-berries", ingredient_name: "mixed berries", grams: 100 },
    ],
  },
  {
    id: "demo-lunch",
    day_index: 0,
    slot: "lunch",
    name: "Smoky chickpea quinoa bowl",
    minutes: 25,
    steps: [
      "Warm the chickpeas with paprika and cumin.",
      "Layer quinoa, spinach and roasted peppers.",
      "Add chickpeas and finish with lemon.",
    ],
    calories: 590,
    protein_g: 27,
    carbs_g: 86,
    fat_g: 16,
    items: [
      { id: "demo-chickpeas", ingredient_name: "cooked chickpeas", grams: 180 },
      { id: "demo-quinoa", ingredient_name: "cooked quinoa", grams: 180 },
      { id: "demo-spinach", ingredient_name: "baby spinach", grams: 80 },
      { id: "demo-peppers", ingredient_name: "roasted peppers", grams: 100 },
    ],
  },
  {
    id: "demo-dinner",
    day_index: 0,
    slot: "dinner",
    name: "Herb chicken sweet potato plate",
    minutes: 30,
    steps: [
      "Season and pan-sear the chicken until cooked through.",
      "Roast the sweet potato and broccoli.",
      "Plate with lemon and fresh herbs.",
    ],
    calories: 650,
    protein_g: 55,
    carbs_g: 62,
    fat_g: 19,
    items: [
      { id: "demo-chicken", ingredient_name: "chicken breast", grams: 180 },
      { id: "demo-potato", ingredient_name: "sweet potato", grams: 240 },
      { id: "demo-broccoli", ingredient_name: "broccoli", grams: 140 },
      { id: "demo-oil", ingredient_name: "olive oil", grams: 12 },
    ],
  },
] satisfies Meal[];

export default function DemoPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand">
            Public demo
          </p>
          <h1 className="mt-1 text-3xl font-semibold">A sample meal stack</h1>
        </div>
        <div className="flex gap-3">
          <Link href="/" className="rounded-full border border-ink/15 px-4 py-2 no-underline">
            Home
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-brand px-4 py-2 font-medium text-white no-underline hover:bg-brand-dark"
          >
            Create my plan
          </Link>
        </div>
      </header>

      <section className="mt-8 rounded-3xl border border-brand/20 bg-card p-6 shadow-sm">
        <p className="font-medium text-brand">Sample data — no account required</p>
        <p className="mt-2 max-w-2xl text-sm text-ink/70">
          This preview uses a fixed sample profile and does not call Groq or save personal data.
          Create an account to set allergies, goals and macro targets.
        </p>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Demo day</h2>
            <p className="mt-1 text-sm text-ink/60">
              Approximately 1,670 kcal · 113g protein · 205g carbs · 44g fat
            </p>
          </div>
          <span className="rounded-full bg-brand/10 px-3 py-1 text-sm text-brand">
            preview
          </span>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {demoMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      </section>
    </main>
  );
}
