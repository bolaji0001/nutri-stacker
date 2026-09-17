from datetime import date, timedelta

from app.config import settings
from app.schemas.meal import MealProposal
from app.services.groq import generate_meal, mock_meal
from app.services.validate import validate_meal
from app.supabase_client import get_supabase

SLOTS_BY_COUNT = {
    1: ["dinner"],
    2: ["lunch", "dinner"],
    3: ["breakfast", "lunch", "dinner"],
    4: ["breakfast", "lunch", "dinner", "snack"],
    5: ["breakfast", "snack", "lunch", "dinner", "snack"],
    6: ["breakfast", "snack", "lunch", "snack", "dinner", "snack"],
}


def _slots(meals_per_day: int) -> list[str]:
    return SLOTS_BY_COUNT.get(meals_per_day, SLOTS_BY_COUNT[3])


def create_plan(user_id: str, days: int) -> dict:
    supabase = get_supabase()
    profile_res = supabase.table("profiles").select("*").eq("id", user_id).execute()
    if profile_res.data:
        profile = profile_res.data[0]
    else:
        created = supabase.table("profiles").insert({"id": user_id}).execute()
        profile = created.data[0]
    week_start = date.today() - timedelta(days=date.today().weekday())

    plan_res = (
        supabase.table("meal_plans")
        .insert(
            {
                "user_id": user_id,
                "week_start": week_start.isoformat(),
                "days": days,
                "status": "generating",
            }
        )
        .execute()
    )
    plan = plan_res.data[0]
    plan_id = plan["id"]
    previous_names: list[str] = []
    slots = _slots(int(profile.get("meals_per_day") or 3))

    try:
        for day_index in range(days):
            for slot in slots:
                proposal = _generate_valid_meal(profile, slot, day_index, previous_names)
                previous_names.append(proposal.name)
                meal_res = (
                    supabase.table("meals")
                    .insert(
                        {
                            "plan_id": plan_id,
                            "day_index": day_index,
                            "slot": slot,
                            "name": proposal.name,
                            "minutes": proposal.minutes,
                            "steps": proposal.steps,
                            "calories": proposal.calories,
                            "protein_g": proposal.protein_g,
                            "carbs_g": proposal.carbs_g,
                            "fat_g": proposal.fat_g,
                        }
                    )
                    .execute()
                )
                meal_id = meal_res.data[0]["id"]
                supabase.table("meal_items").insert(
                    [
                        {
                            "meal_id": meal_id,
                            "ingredient_name": item.name,
                            "grams": item.grams,
                        }
                        for item in proposal.ingredients
                    ]
                ).execute()

        supabase.table("meal_plans").update({"status": "ready", "error_message": None}).eq("id", plan_id).execute()
    except Exception as exc:
        supabase.table("meal_plans").update(
            {"status": "failed", "error_message": str(exc)[:500]}
        ).eq("id", plan_id).execute()
        raise

    return get_plan(user_id, plan_id)


def _generate_valid_meal(profile: dict, slot: str, day_index: int, previous_meals: list[str]) -> MealProposal:
    allergies = profile.get("allergies") or []
    disliked = profile.get("disliked_foods") or []
    extra = ""
    last_error = "Unknown generation error"
    for _ in range(3):
        if settings.groq_api_key:
            proposal = generate_meal(
                profile=profile,
                slot=slot,
                day_index=day_index,
                previous_meals=previous_meals,
                extra_instructions=extra,
            )
        else:
            proposal = mock_meal(slot, day_index)
        errors = validate_meal(proposal, allergies, disliked)
        if not errors:
            return proposal
        last_error = "; ".join(errors)
        extra = f"Previous attempt failed validation: {last_error}. Fix this and try again."
        if not settings.groq_api_key:
            break
    raise ValueError(f"Could not generate a valid {slot}: {last_error}")


def list_plans(user_id: str) -> list[dict]:
    supabase = get_supabase()
    result = (
        supabase.table("meal_plans")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


def get_plan(user_id: str, plan_id: str) -> dict:
    supabase = get_supabase()
    plan_res = (
        supabase.table("meal_plans")
        .select("*")
        .eq("id", plan_id)
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    plan = plan_res.data
    if not plan:
        raise ValueError("Plan not found")
    meals_res = (
        supabase.table("meals")
        .select("*")
        .eq("plan_id", plan_id)
        .order("day_index")
        .execute()
    )
    meals = meals_res.data or []
    meal_ids = [meal["id"] for meal in meals]
    items_by_meal: dict[str, list] = {meal_id: [] for meal_id in meal_ids}
    if meal_ids:
        items_res = supabase.table("meal_items").select("*").in_("meal_id", meal_ids).execute()
        for item in items_res.data or []:
            items_by_meal.setdefault(item["meal_id"], []).append(
                {
                    "id": item["id"],
                    "ingredient_name": item["ingredient_name"],
                    "grams": item["grams"],
                }
            )
    plan["meals"] = [
        {
            **meal,
            "items": items_by_meal.get(meal["id"], []),
        }
        for meal in meals
    ]
    return plan
