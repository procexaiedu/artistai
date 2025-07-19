import uuid
from typing import Optional
from sqlalchemy.orm import Session

from . import models
from . import schemas


def get_contractor(db: Session, contractor_id: uuid.UUID, user_id: str) -> Optional[models.Contractor]:
    """Busca um único contratante pelo seu ID e user_id. Retorna None se não for encontrado."""
    return db.query(models.Contractor).filter(
        models.Contractor.id == contractor_id,
        models.Contractor.user_id == user_id
    ).first()


def get_contractors(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> list[models.Contractor]:
    """Lista os contratantes do usuário, com suporte para paginação (skip e limit)."""
    return db.query(models.Contractor).filter(
        models.Contractor.user_id == user_id
    ).offset(skip).limit(limit).all()


def create_contractor(db: Session, contractor: schemas.ContractorCreate, user_id: str) -> models.Contractor:
    """
    Recebe um objeto do tipo schemas.ContractorCreate e user_id.
    Cria uma instância de models.Contractor com os dados recebidos.
    Adiciona a instância à sessão, comita e atualiza a instância.
    Retorna a instância models.Contractor recém-criada.
    """
    contractor_data = contractor.dict()
    contractor_data["user_id"] = user_id
    db_contractor = models.Contractor(**contractor_data)
    db.add(db_contractor)
    db.commit()
    db.refresh(db_contractor)
    return db_contractor


def update_contractor(db: Session, contractor_id: uuid.UUID, contractor_update: schemas.ContractorUpdate, user_id: str) -> Optional[models.Contractor]:
    """
    Busca o contratante existente pelo contractor_id e user_id.
    Se encontrado, atualiza seus campos com os dados de contractor_update.
    Apenas os campos fornecidos (não-nulos) devem ser atualizados.
    Comita a transação e retorna o objeto contratante atualizado.
    """
    db_contractor = db.query(models.Contractor).filter(
        models.Contractor.id == contractor_id,
        models.Contractor.user_id == user_id
    ).first()
    if db_contractor:
        update_data = contractor_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_contractor, field, value)
        db.commit()
        db.refresh(db_contractor)
    return db_contractor


def delete_contractor(db: Session, contractor_id: uuid.UUID, user_id: str) -> Optional[models.Contractor]:
    """
    Busca o contratante existente pelo contractor_id e user_id.
    Se encontrado, o remove da sessão, comita, e retorna o objeto que foi deletado.
    """
    db_contractor = db.query(models.Contractor).filter(
        models.Contractor.id == contractor_id,
        models.Contractor.user_id == user_id
    ).first()
    if db_contractor:
        db.delete(db_contractor)
        db.commit()
    return db_contractor 