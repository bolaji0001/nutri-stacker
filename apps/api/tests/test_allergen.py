from app.services.validate import allergen_hits
from app.schemas.meal import IngredientProposal
  # change to your real names


def test_rejects_meal_containing_allergen():
    ingredients = [IngredientProposal(name="Peanut butter", grams=20)]
    assert allergen_hits(["peanuts"], ingredients) == ["peanuts"]
    
def test_allows_meal_without_allergen():
    ingredients = [IngredientProposal(name="Grilled chicken salad", grams=200)]
    assert allergen_hits(["peanuts"], ingredients) == []

def test_matches_regardless_of_capitals():
    ingredients = [IngredientProposal(name="PEANUT BUTTER", grams=20)]
    assert allergen_hits(["peanuts"], ingredients) == ["peanuts"]


def test_only_reports_allergens_that_are_present():
    ingredients = [IngredientProposal(name="Peanut butter", grams=20)]
    assert allergen_hits(["peanuts", "shellfish"], ingredients) == ["peanuts"]