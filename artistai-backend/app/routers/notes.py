import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, crud_notes
from ..dependencies import get_current_user, User

router = APIRouter()


@router.post("/notes/", response_model=schemas.Note, status_code=status.HTTP_201_CREATED)
def create_note(
    note: schemas.NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Criar uma nova anotação."""
    return crud_notes.create_note(db=db, note=note, user_id=current_user.id)


@router.get("/contractors/{contractor_id}/notes", response_model=List[schemas.Note])
def read_contractor_notes(
    contractor_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar anotações de um contratante específico."""
    notes = crud_notes.get_notes_by_contractor(
        db=db, 
        contractor_id=contractor_id, 
        user_id=current_user.id, 
        skip=skip, 
        limit=limit
    )
    return notes


@router.get("/notes/", response_model=List[schemas.Note])
def read_notes(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar todas as anotações do usuário."""
    notes = crud_notes.get_notes_by_user(
        db=db, 
        user_id=current_user.id, 
        skip=skip, 
        limit=limit
    )
    return notes


@router.get("/notes/{note_id}", response_model=schemas.Note)
def read_note(
    note_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Buscar uma anotação específica por ID."""
    db_note = crud_notes.get_note(db=db, note_id=note_id, user_id=current_user.id)
    if db_note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Anotação não encontrada"
        )
    return db_note


@router.patch("/notes/{note_id}", response_model=schemas.Note)
def update_note(
    note_id: uuid.UUID,
    note_update: schemas.NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Atualizar uma anotação."""
    db_note = crud_notes.update_note(
        db=db, 
        note_id=note_id, 
        note_update=note_update, 
        user_id=current_user.id
    )
    if db_note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Anotação não encontrada"
        )
    return db_note


@router.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletar uma anotação."""
    success = crud_notes.delete_note(db=db, note_id=note_id, user_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Anotação não encontrada"
        )