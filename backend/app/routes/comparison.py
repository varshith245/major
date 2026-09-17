from fastapi import APIRouter, HTTPException, Response, Query
from typing import List, Optional
from ..models.schemas import ComparisonRequest, ComparisonResponse
from ..services.comparison_engine import comparison_engine
from ..services.pdf_export_service import pdf_export_service

router = APIRouter(prefix="/api/comparison", tags=["Scheme Comparison"])

@router.post("/compare", response_model=ComparisonResponse)
def compare_selected_schemes(req: ComparisonRequest):
    try:
        return comparison_engine.compare_schemes(req.scheme_ids)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/export-pdf")
def export_comparison_pdf_post(req: ComparisonRequest):
    """
    Generates and downloads a printable comparison matrix PDF based on existing scheme data.
    """
    if not req.scheme_ids or len(req.scheme_ids) == 0:
        raise HTTPException(status_code=400, detail="At least one valid scheme ID must be provided for comparison.")
    try:
        comp_res = comparison_engine.compare_schemes(req.scheme_ids)
        pdf_bytes = pdf_export_service.generate_scheme_comparison_pdf(
            schemes=comp_res.schemes,
            comparison_fields=comp_res.comparison_fields
        )
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": 'attachment; filename="SEVA-Scheme-Comparison-Matrix.pdf"'
            }
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/export-pdf")
def export_comparison_pdf_get(scheme_ids: str = Query(..., description="Comma-separated scheme IDs to compare")):
    """
    GET endpoint for direct browser download of comparison PDF.
    """
    ids = [sid.strip() for sid in scheme_ids.split(",") if sid.strip()]
    if not ids:
        raise HTTPException(status_code=400, detail="At least one valid scheme ID must be provided for comparison.")
    try:
        comp_res = comparison_engine.compare_schemes(ids)
        pdf_bytes = pdf_export_service.generate_scheme_comparison_pdf(
            schemes=comp_res.schemes,
            comparison_fields=comp_res.comparison_fields
        )
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": 'attachment; filename="SEVA-Scheme-Comparison-Matrix.pdf"'
            }
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
