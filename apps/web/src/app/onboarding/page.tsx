"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, type Profile } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

const GOALS = [
  { value: "lose_weight", label: "Lose weight" },
  { value: "maintain", label: "Maintain" },
  { value: "build_muscle", label: "Build muscle" },
];

const DIETS = ["none", "vegetarian", "vegan", "pescatarian", "halal", "kosher"];
const ALLERGENS = ["peanuts", "tree nuts", "dairy", "gluten", "shellfish", "soy", "eggs", "fish", "sesame"];

export default function OnboardingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    goal: "maintain",
    diet_type: "none",
    allergies: [] as string[],
    calorie_target: 2200,
    protein_g: 150,
    carbs_g: 220,
    fat_g: 70,
    meals_per_day: 3,
    cooking_time_minutes: 30,
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      try {
        const profile = await apiFetch<Profile>("/me/profile", token);
        setForm((current) => ({
          ...current,
          goal: profile.goal ?? current.goal,
          diet_type: profile.diet_type,
          allergies: profile.allergies,
          calorie_target: profile.calorie_target ?? current.calorie_target,
          protein_g: profile.protein_g ?? current.protein_g,
          carbs_g: profile.carbs_g ?? current.carbs_g,
          fat_g: profile.fat_g ?? current.fat_g,
          meals_per_day: profile.meals_per_day,
          cooking_time_minutes: profile.cooking_time_minutes,
        }));
      } catch {
        // First-time profile is created on the API if missing.
      }
    }
    void load();
  }, []);

  function toggleAllergy(allergy: string) {
    setForm((current) => ({
      ...current,
      allergies: current.allergies.includes(allergy)
        ? current.allergies.filter((item) => item !== allergy)
        : [...current.allergies, allergy],
    }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setError("You need to sign in first.");
      setPending(false);
      return;
    }
    try {
      await apiFetch("/me/profile", token, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save profile");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Your stack profile</h1>
      <p className="mt-2 text-ink/70">Groq uses this. Allergies are also enforced in code.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <label className="block text-sm font-medium">
          Goal
          <select
            value={form.goal}
            onChange={(event) => setForm({ ...form, goal: event.target.value })}
            className="mt-1 w-full rounded-xl border border-ink/10 bg-card px-3 py-2"
          >
            {GOALS.map((goal) => (
              <option key={goal.value} value={goal.value}>
                {goal.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium">
          Diet
          <select
            value={form.diet_type}
            onChange={(event) => setForm({ ...form, diet_type: event.target.value })}
            className="mt-1 w-full rounded-xl border border-ink/10 bg-card px-3 py-2"
          >
            {DIETS.map((diet) => (
              <option key={diet} value={diet}>
                {diet}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend className="text-sm font-medium">Allergies</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {ALLERGENS.map((allergy) => (
              <button
                key={allergy}
                type="button"
                onClick={() => toggleAllergy(allergy)}
                className={`rounded-full px-3 py-1 text-sm ${
                  form.allergies.includes(allergy) ? "bg-brand text-white" : "bg-card border border-ink/10"
                }`}
              >
                {allergy}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid grid-cols-2 gap-4">
          <NumberField label="Calories" value={form.calorie_target} onChange={(value) => setForm({ ...form, calorie_target: value })} />
          <NumberField label="Protein (g)" value={form.protein_g} onChange={(value) => setForm({ ...form, protein_g: value })} />
          <NumberField label="Carbs (g)" value={form.carbs_g} onChange={(value) => setForm({ ...form, carbs_g: value })} />
          <NumberField label="Fat (g)" value={form.fat_g} onChange={(value) => setForm({ ...form, fat_g: value })} />
          <NumberField label="Meals / day" value={form.meals_per_day} onChange={(value) => setForm({ ...form, meals_per_day: value })} />
          <NumberField
            label="Max cook time"
            value={form.cooking_time_minutes}
            onChange={(value) => setForm({ ...form, cooking_time_minutes: value })}
          />
        </div>
        {error ? <p className="text-sm text-clay">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand px-6 py-3 font-medium text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save and go to dashboard"}
        </button>
      </form>
    </main>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1 w-full rounded-xl border border-ink/10 bg-card px-3 py-2"
      />
    </label>
  );
}
