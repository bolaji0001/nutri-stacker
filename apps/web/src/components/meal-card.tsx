import type { Meal } from "@/lib/api";

export function MealCard({ meal }: { meal: Meal }) {
  return (
    <article className="flex flex-col rounded-3xl border border-ink/10 bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-clay">{meal.slot}</p>
      <h3 className="mt-2 text-lg font-semibold">{meal.name}</h3>
      <p className="mt-1 text-sm text-ink/60">{meal.minutes ? `${meal.minutes} min` : "Time TBD"}</p>
      <ul className="mt-4 space-y-1 text-sm">
        {meal.items.map((item) => (
          <li key={item.id}>
            {item.ingredient_name} — {item.grams}g
          </li>
        ))}
      </ul>
      {meal.calories ? (
        <p className="mt-4 text-sm text-ink/70">
          ~{Math.round(meal.calories)} kcal · P {meal.protein_g ?? "–"} / C {meal.carbs_g ?? "–"} / F{" "}
          {meal.fat_g ?? "–"}
        </p>
      ) : null}
      <ol className="mt-4 list-decimal space-y-1 pl-4 text-sm text-ink/80">
        {meal.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </article>
  );
}
