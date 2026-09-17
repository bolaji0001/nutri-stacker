const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function apiFetch<T>(path: string, accessToken: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export type Profile = {
  id: string;
  goal: string | null;
  diet_type: string;
  allergies: string[];
  disliked_foods: string[];
  calorie_target: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  meals_per_day: number;
  cooking_time_minutes: number;
};

export type MealItem = {
  id: string;
  ingredient_name: string;
  grams: number;
};

export type Meal = {
  id: string;
  day_index: number;
  slot: string;
  name: string;
  minutes: number | null;
  steps: string[];
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  items: MealItem[];
};

export type MealPlan = {
  id: string;
  status: string;
  days: number;
  error_message: string | null;
  meals: Meal[];
};
