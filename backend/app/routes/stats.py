from fastapi import APIRouter
from ..models.schemas import StatsResponse
from ..services.stats_service import stats_service

router = APIRouter(prefix="/api/stats", tags=["Analytics & Dashboard"])

@router.get("/dashboard", response_model=StatsResponse)
def get_dashboard_statistics():
    return stats_service.get_system_stats()
