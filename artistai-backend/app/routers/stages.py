import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from ..database import get_db
from .. import schemas, crud_stages
from ..dependencies import get_current_user, User

router = APIRouter()


class StageReorderRequest(BaseModel):
    """Schema para reordenação de etapas."""
    stages: List[dict]  # Lista de {'id': uuid, 'order': int}


@router.post("/stages/", response_model=schemas.PipelineStage, status_code=status.HTTP_201_CREATED)
def create_stage(
    stage: schemas.PipelineStageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar uma nova etapa do pipeline."""
    return crud_stages.create_stage(db=db, stage=stage, user_id=current_user.id)


@router.get("/stages/", response_model=List[schemas.PipelineStage])
def read_stages(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar etapas do pipeline com paginação, ordenadas por order."""
    stages = crud_stages.get_stages(db=db, user_id=current_user.id, skip=skip, limit=limit)
    return stages


@router.get("/stages/{stage_id}", response_model=schemas.PipelineStage)
def read_stage(
    stage_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Buscar uma etapa específica por ID."""
    db_stage = crud_stages.get_stage(db=db, stage_id=stage_id, user_id=current_user.id)
    if db_stage is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Etapa não encontrada"
        )
    return db_stage


@router.patch("/stages/{stage_id}", response_model=schemas.PipelineStage)
def update_stage(
    stage_id: uuid.UUID,
    stage_update: schemas.PipelineStageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar uma etapa do pipeline."""
    db_stage = crud_stages.update_stage(
        db=db, 
        stage_id=stage_id, 
        stage_update=stage_update, 
        user_id=current_user.id
    )
    if db_stage is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Etapa não encontrada"
        )
    return db_stage


@router.delete("/stages/{stage_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_stage(
    stage_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletar uma etapa do pipeline."""
    success = crud_stages.delete_stage(db=db, stage_id=stage_id, user_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Etapa não encontrada"
        )


@router.post("/stages/reorder", response_model=List[schemas.PipelineStage])
def reorder_stages(
    reorder_request: StageReorderRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reordenar etapas do pipeline.
    
    Recebe uma lista de objetos com 'id' e 'order' para reordenar as etapas.
    """
    try:
        updated_stages = crud_stages.reorder_stages(
            db=db, 
            stage_orders=reorder_request.stages, 
            user_id=current_user.id
        )
        return updated_stages
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Erro ao reordenar etapas: {str(e)}"
        )