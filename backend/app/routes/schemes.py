from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from ..models.schemas import Scheme
from ..services.data_loader import data_loader
from ..services.vector_engine import vector_engine

router = APIRouter(prefix="/api/schemes", tags=["Schemes"])

@router.get("", response_model=List[Scheme])
def get_all_schemes(
    category: Optional[str] = None,
    state: Optional[str] = None,
    search: Optional[str] = None
):
    schemes = data_loader.get_all_schemes(include_inactive=False)
    
    if search and search.strip():
        search_results = vector_engine.search(search, top_k=30, min_threshold=0.01)
        schemes = [s for s, _ in search_results if getattr(s, "status", "Active") == "Active"]

    if category and category != "All":
        schemes = [s for s in schemes if category.lower() in s.category.lower()]

    if state and state != "All":
        schemes = [s for s in schemes if s.state == "All-India" or s.state.lower() == state.lower()]

    return schemes

@router.get("/categories", response_model=List[str])
def get_categories():
    categories = sorted(list(set(s.category for s in data_loader.get_all_schemes(include_inactive=False))))
    return categories

@router.get("/{scheme_id}", response_model=Scheme)
def get_scheme_detail(scheme_id: str):
    scheme = data_loader.get_scheme_by_id(scheme_id) or data_loader.find_scheme_by_name(scheme_id)
    if not scheme or getattr(scheme, "status", "Active") != "Active":
        raise HTTPException(status_code=404, detail="Scheme not found or is currently inactive")
    return scheme

