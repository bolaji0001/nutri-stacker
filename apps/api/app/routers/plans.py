from fastapi import APIRouter, HTTPException, status

from app.deps import CurrentUserId
from app.schemas.meal import CreatePlanRequest, MealPlanOut
from app.services import planner

router = APIRouter(prefix="/plans", tags=["plans"])


@router.get("", response_model=list[MealPlanOut])
def list_plans(user_id: CurrentUserId) -> list[dict]:
    return planner.list_plans(user_id)


@router.post("", response_model=MealPlanOut)
def create_plan(user_id: CurrentUserId, body: CreatePlanRequest) -> dict:
    try:
        return planner.create_plan(user_id, body.days)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Plan generation failed: {exc}",
        ) from exc


@router.get("/{plan_id}", response_model=MealPlanOut)
def get_plan(plan_id: str, user_id: CurrentUserId) -> dict:
    try:
        return planner.get_plan(user_id, plan_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
