from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
import uuid

from . import models, schemas


def get_stages(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[models.PipelineStage]:
    """Buscar todas as etapas do pipeline de um usuário, ordenadas por order."""
    return (
        db.query(models.PipelineStage)
        .filter(models.PipelineStage.user_id == user_id)
        .order_by(models.PipelineStage.order)
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_stage(db: Session, stage_id: uuid.UUID, user_id: str) -> Optional[models.PipelineStage]:
    """Buscar uma etapa específica por ID e user_id."""
    return (
        db.query(models.PipelineStage)
        .filter(
            and_(
                models.PipelineStage.id == stage_id,
                models.PipelineStage.user_id == user_id
            )
        )
        .first()
    )


def create_stage(db: Session, stage: schemas.PipelineStageCreate, user_id: str) -> models.PipelineStage:
    """Criar uma nova etapa do pipeline."""
    db_stage = models.PipelineStage(
        user_id=user_id,
        name=stage.name,
        order=stage.order
    )
    db.add(db_stage)
    db.commit()
    db.refresh(db_stage)
    return db_stage


def update_stage(db: Session, stage_id: uuid.UUID, stage_update: schemas.PipelineStageUpdate, user_id: str) -> Optional[models.PipelineStage]:
    """Atualizar uma etapa do pipeline."""
    db_stage = get_stage(db, stage_id, user_id)
    if not db_stage:
        return None
    
    update_data = stage_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_stage, field, value)
    
    db.commit()
    db.refresh(db_stage)
    return db_stage


def delete_stage(db: Session, stage_id: uuid.UUID, user_id: str) -> bool:
    """Deletar uma etapa do pipeline."""
    db_stage = get_stage(db, stage_id, user_id)
    if not db_stage:
        return False
    
    # Verificar se há contratantes usando esta etapa
    contractors_count = (
        db.query(models.Contractor)
        .filter(
            and_(
                models.Contractor.stage_id == stage_id,
                models.Contractor.user_id == user_id
            )
        )
        .count()
    )
    
    if contractors_count > 0:
        # Se há contratantes, remover a referência antes de deletar
        db.query(models.Contractor).filter(
            and_(
                models.Contractor.stage_id == stage_id,
                models.Contractor.user_id == user_id
            )
        ).update({models.Contractor.stage_id: None})
    
    db.delete(db_stage)
    db.commit()
    return True


def reorder_stages(db: Session, stage_orders: List[dict], user_id: str) -> List[models.PipelineStage]:
    """Reordenar etapas do pipeline.
    
    Args:
        stage_orders: Lista de dicts com 'id' e 'order'
        user_id: ID do usuário
    
    Returns:
        Lista das etapas atualizadas
    """
    updated_stages = []
    
    for stage_order in stage_orders:
        stage_id = stage_order['id']
        new_order = stage_order['order']
        
        db_stage = get_stage(db, stage_id, user_id)
        if db_stage:
            db_stage.order = new_order
            updated_stages.append(db_stage)
    
    db.commit()
    
    # Refresh all updated stages
    for stage in updated_stages:
        db.refresh(stage)
    
    return updated_stages