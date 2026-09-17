import json
from functools import lru_cache

from groq import Groq

from app.config import settings
from app.schemas.meal import MealProposal

SLOT_LABELS = {
    "breakfast": "breakfast",
    "lunch": "lunch",
    "dinner": "dinner",
    "snack": "snack",
}


@lru_cache(maxsize=1)
def _client() -> Groq:
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not set")
    return Groq(api_key=settings.groq_api_key)


def generate_meal(
    *,
    profile: dict,
    slot: str,
    day_index: int,
    previous_meals: list[str],
    extra_instructions: str = "",
) -> MealProposal:
    allergies = ", ".join(profile.get("allergies") or []) or "none"
    disliked = ", ".join(profile.get("disliked_foods") or []) or "none"
    previous = ", ".join(previous_meals) or "none"
    prompt = f"""Create ONE {SLOT_LABELS.get(slot, slot)} for day {day_index + 1}.

Hard constraints (never violate):
- Diet type: {profile.get("diet_type") or "none"}
- Allergies (must exclude completely): {allergies}
- Disliked foods: {disliked}
- Cooking time max: {profile.get("cooking_time_minutes") or 30} minutes
- Goal: {profile.get("goal") or "maintain"}
- Daily calorie target: {profile.get("calorie_target") or "unspecified"}
- Daily macros (protein/carbs/fat grams): {profile.get("protein_g")}/{profile.get("carbs_g")}/{profile.get("fat_g")}
- This meal is one of {profile.get("meals_per_day") or 3} meals today, so size it accordingly.

Already planned this week (avoid repeating): {previous}
{extra_instructions}

Use ingredient amounts in grams. Keep steps short (3-6).
Nutrition numbers are estimates only, but all nutrition fields must be included.
"""
    completion = _client().chat.completions.create(
        model=settings.groq_model,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are Nutri-Stacker's meal planner. Follow every dietary "
                    "constraint and return only the requested structured meal."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {
                "name": "meal_proposal",
                "strict": True,
                "schema": MealProposal.model_json_schema(),
            },
        },
        temperature=0.4,
    )
    raw = completion.choices[0].message.content
    if not raw:
        raise ValueError("Groq returned an empty response")
    return MealProposal.model_validate(json.loads(raw))


def mock_meal(slot: str, day_index: int) -> MealProposal:
    samples = {
        "breakfast": MealProposal(
            name="Oat banana berry bowl",
            minutes=10,
            ingredients=[
                {"name": "rolled oats", "grams": 60},
                {"name": "banana", "grams": 120},
                {"name": "blueberries", "grams": 80},
            ],
            steps=["Cook oats.", "Slice banana on top.", "Add blueberries and serve."],
            calories=390,
            protein_g=10,
            carbs_g=78,
            fat_g=5,
        ),
        "lunch": MealProposal(
            name="Chickpea rice bowl",
            minutes=25,
            ingredients=[
                {"name": "cooked chickpeas", "grams": 180},
                {"name": "cooked brown rice", "grams": 200},
                {"name": "broccoli", "grams": 120},
            ],
            steps=["Warm chickpeas with herbs.", "Steam broccoli.", "Serve over rice."],
            calories=540,
            protein_g=24,
            carbs_g=86,
            fat_g=8,
        ),
        "dinner": MealProposal(
            name="Lentil potato skillet",
            minutes=30,
            ingredients=[
                {"name": "cooked lentils", "grams": 180},
                {"name": "baby potatoes", "grams": 200},
                {"name": "spinach", "grams": 80},
            ],
            steps=["Roast potatoes.", "Warm lentils.", "Wilt spinach and plate."],
            calories=520,
            protein_g=26,
            carbs_g=82,
            fat_g=6,
        ),
        "snack": MealProposal(
            name="Apple and carrot sticks",
            minutes=5,
            ingredients=[
                {"name": "apple", "grams": 150},
                {"name": "carrot", "grams": 80},
            ],
            steps=["Slice apple.", "Cut carrot sticks.", "Serve."],
            calories=140,
            protein_g=2,
            carbs_g=34,
            fat_g=0,
        ),
    }
    meal = samples.get(slot, samples["lunch"]).model_copy()
    meal.name = f"{meal.name} (day {day_index + 1} mock)"
    return meal
