from fastapi import APIRouter, HTTPException
from ..models.schemas import ChecklistRequest, ChecklistResponse
from ..services.checklist_engine import checklist_engine

router = APIRouter(prefix="/api/checklist", tags=["Document Checklist"])

@router.post("/generate", response_model=ChecklistResponse)
def generate_document_checklist(req: ChecklistRequest):
    try:
        return checklist_engine.generate_checklist(req.scheme_id, req.user_profile)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
