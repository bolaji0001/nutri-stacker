from app.schemas.meal import IngredientProposal, MealProposal

ALLERGEN_KEYWORDS: dict[str, tuple[str, ...]] = {
    "peanuts": ("peanut", "peanuts"),
    "tree nuts": ("almond", "walnut", "cashew", "pecan", "hazelnut", "pistachio", "macadamia", "brazil nut"),
    "dairy": ("milk", "cheese", "butter", "yogurt", "cream", "whey", "casein"),
    "gluten": ("wheat", "barley", "rye", "seitan", "couscous", "farro"),
    "shellfish": ("shrimp", "prawn", "crab", "lobster", "crawfish", "scallop"),
    "soy": ("soy", "soya", "tofu", "edamame", "tempeh"),
    "eggs": ("egg", "eggs", "mayonnaise"),
    "fish": ("salmon", "tuna", "cod", "tilapia", "trout", "anchovy"),
    "sesame": ("sesame", "tahini"),
}


def allergen_hits(allergies: list[str], ingredients: list[IngredientProposal]) -> list[str]:
    hits: list[str] = []
    names = " ".join(item.name.lower() for item in ingredients)
    for allergy in allergies:
        key = allergy.strip().lower()
        keywords = ALLERGEN_KEYWORDS.get(key, (key,))
        if any(keyword in names for keyword in keywords):
            hits.append(allergy)
    return hits


def validate_meal(proposal: MealProposal, allergies: list[str], disliked: list[str]) -> list[str]:
    errors: list[str] = []
    hits = allergen_hits(allergies, proposal.ingredients)
    if hits:
        errors.append(f"Contains allergens: {', '.join(hits)}")
    disliked_lower = [item.lower() for item in disliked]
    for ingredient in proposal.ingredients:
        if any(item and item in ingredient.name.lower() for item in disliked_lower):
            errors.append(f"Contains disliked food: {ingredient.name}")
    return errors
