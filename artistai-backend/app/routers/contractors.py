import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, crud_contractor
from ..dependencies import get_current_user, User

router = APIRouter()


@router.post("/contractors/", response_model=schemas.Contractor, status_code=status.HTTP_201_CREATED)
def create_contractor(
    contractor: schemas.ContractorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Criar um novo contratante.
    """
    return crud_contractor.create_contractor(db=db, contractor=contractor, user_id=current_user.id)


@router.get("/contractors/", response_model=List[schemas.Contractor])
def read_contractors(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Listar contratantes com paginação.
    """
    contractors = crud_contractor.get_contractors(db=db, user_id=current_user.id, skip=skip, limit=limit)
    return contractors


@router.get("/contractors/{contractor_id}", response_model=schemas.Contractor)
def read_contractor(
    contractor_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Buscar um contratante específico por ID.
    """
    db_contractor = crud_contractor.get_contractor(db=db, contractor_id=contractor_id, user_id=current_user.id)
    if db_contractor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contratante não encontrado"
        )
    return db_contractor


@router.patch("/contractors/{contractor_id}", response_model=schemas.Contractor)
def update_contractor(
    contractor_id: uuid.UUID,
    contractor_update: schemas.ContractorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualizar um contratante existente.
    """
    db_contractor = crud_contractor.update_contractor(db=db, contractor_id=contractor_id, contractor_update=contractor_update, user_id=current_user.id)
    if db_contractor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contratante não encontrado"
        )
    return db_contractor


@router.delete("/contractors/{contractor_id}", response_model=schemas.Contractor)
def delete_contractor(
    contractor_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Deletar um contratante.
    """
    db_contractor = crud_contractor.delete_contractor(db=db, contractor_id=contractor_id, user_id=current_user.id)
    if db_contractor is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contratante não encontrado"
        )
    return db_contractor 