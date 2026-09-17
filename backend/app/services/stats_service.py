from typing import Dict, List
from collections import defaultdict
from .data_loader import data_loader
from ..models.schemas import StatsResponse, CategoryStat
from ..database.mongodb import mongodb_manager

class StatsService:
    def get_system_stats(self) -> StatsResponse:
        schemes = data_loader.get_all_schemes()
        
        central_count = sum(1 for s in schemes if s.level.lower() == "central")
        state_count = sum(1 for s in schemes if s.level.lower() == "state")
        
        cat_map = defaultdict(lambda: {"count": 0, "total_benefit": 0.0})
        total_benefit = 0.0
        total_proc_days = 0

        for s in schemes:
            cat_map[s.category]["count"] += 1
            cat_map[s.category]["total_benefit"] += s.benefit_amount
            total_benefit += s.benefit_amount
            total_proc_days += s.processing_time_days

        categories = [
            CategoryStat(
                category=cat,
                count=data["count"],
                total_benefit_potential=data["total_benefit"]
            )
            for cat, data in sorted(cat_map.items(), key=lambda x: x[1]["count"], reverse=True)
        ]

        avg_days = round(total_proc_days / len(schemes), 1) if schemes else 0.0

        return StatsResponse(
            total_schemes=len(schemes),
            central_schemes_count=central_count,
            state_schemes_count=state_count,
            total_categories=len(categories),
            categories=categories,
            average_processing_days=avg_days,
            total_benefit_pool=total_benefit,
            mongodb_storage_active=mongodb_manager.is_connected,
            database_engine="MongoDB Atlas",
            cloudinary_storage_active=False
        )

stats_service = StatsService()

