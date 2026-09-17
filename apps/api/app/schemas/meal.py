from pydantic import BaseModel, ConfigDict, Field


class Profile(BaseModel):
    id: str
    goal: str | None = None
    diet_type: str = "none"
    allergies: list[str] = Field(default_factory=list)
    disliked_foods: list[str] = Field(default_factory=list)
    calorie_target: int | None = None
    protein_g: int | None = None
    carbs_g: int | None = None
    fat_g: int | None = None
    meals_per_day: int = 3
    cooking_time_minutes: int = 30


class ProfileUpdate(BaseModel):
    goal: str | None = None
    diet_type: str | None = None
    allergies: list[str] | None = None
    disliked_foods: list[str] | None = None
    calorie_target: int | None = None
    protein_g: int | None = None
    carbs_g: int | None = None
    fat_g: int | None = None
    meals_per_day: int | None = Field(default=None, ge=1, le=6)
    cooking_time_minutes: int | None = Field(default=None, ge=5, le=180)


class IngredientProposal(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    grams: float = Field(ge=1)


class MealProposal(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    minutes: int = Field(ge=5, le=180)
    ingredients: list[IngredientProposal] = Field(min_length=1)
    steps: list[str] = Field(min_length=1)
    calories: float | None
    protein_g: float | None
    carbs_g: float | None
    fat_g: float | None


class MealItemOut(BaseModel):
    id: str
    ingredient_name: str
    grams: float


class MealOut(BaseModel):
    id: str
    day_index: int
    slot: str
    name: str
    minutes: int | None = None
    steps: list[str] = Field(default_factory=list)
    calories: float | None = None
    protein_g: float | None = None
    carbs_g: float | None = None
    fat_g: float | None = None
    items: list[MealItemOut] = Field(default_factory=list)


class MealPlanOut(BaseModel):
    id: str
    user_id: str
    week_start: str | None = None
    days: int
    status: str
    error_message: str | None = None
    meals: list[MealOut] = Field(default_factory=list)


class CreatePlanRequest(BaseModel):
    days: int = Field(default=1, ge=1, le=7)
