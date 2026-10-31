from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Plan, User
from ..schemas import PlanCreate, PlanOut
from ..auth import require_role

router = APIRouter(prefix="/api/plans", tags=["Plans"])

@router.get("", response_model=list[PlanOut])
def list_plans(db: Session = Depends(get_db)):
    return db.query(Plan).all()

@router.post("", response_model=PlanOut)
def create_plan(
    plan_in: PlanCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["admin"]))
):
    plan = Plan(
        name=plan_in.name,
        cost=plan_in.cost,
        billing_frequency=plan_in.billing_frequency.lower(),
        min_quantity=plan_in.min_quantity,
        start_date=plan_in.start_date,
        end_date=plan_in.end_date,
        auto_close_on_end=plan_in.auto_close_on_end,
        allow_early_close=plan_in.allow_early_close,
        allow_pause=plan_in.allow_pause,
        allow_renew=plan_in.allow_renew
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan

@router.put("/{plan_id}", response_model=PlanOut)
def update_plan(
    plan_id: int,
    plan_in: PlanCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["admin"]))
):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    for field, value in plan_in.model_dump().items():
        setattr(plan, field, value)

    db.commit()
    db.refresh(plan)
    return plan
