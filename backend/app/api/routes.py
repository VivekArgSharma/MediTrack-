from fastapi import APIRouter

from app.services.ai_analysis import generate_insight
from app.services.runtime import runtime

router = APIRouter()


@router.get("/vitals/history")
async def get_vitals_history(limit: int = 60):
    history = list(runtime.history)[-max(1, min(limit, len(runtime.history) or 1)) :]
    return history


@router.get("/alerts")
async def get_alerts(limit: int = 20):
    return list(runtime.alert_log)[: max(1, min(limit, len(runtime.alert_log) or 1))]


@router.get("/ai/latest")
async def get_latest_ai_summary():
    return runtime.latest_insight or generate_insight(runtime.history)


@router.post("/ai/analyze")
async def analyze_now():
    runtime.latest_insight = generate_insight(runtime.history)
    return runtime.latest_insight
