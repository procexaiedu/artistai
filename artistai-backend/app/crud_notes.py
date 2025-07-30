from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
import uuid

from . import models, schemas


def get_notes_by_contractor(db: Session, contractor_id: uuid.UUID, user_id: str, skip: int = 0, limit: int = 100) -> List[models.Note]:
    """Buscar todas as anotações de um contratante, ordenadas por data de criação (mais recentes primeiro)."""
    return (
        db.query(models.Note)
        .filter(
            and_(
                models.Note.contractor_id == contractor_id,
                models.Note.user_id == user_id
            )
        )
        .order_by(desc(models.Note.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_note(db: Session, note_id: uuid.UUID, user_id: str) -> Optional[models.Note]:
    """Buscar uma anotação específica por ID e user_id."""
    return (
        db.query(models.Note)
        .filter(
            and_(
                models.Note.id == note_id,
                models.Note.user_id == user_id
            )
        )
        .first()
    )


def create_note(db: Session, note: schemas.NoteCreate, user_id: str) -> models.Note:
    """Criar uma nova anotação."""
    db_note = models.Note(
        user_id=user_id,
        contractor_id=note.contractor_id,
        content=note.content
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


def update_note(db: Session, note_id: uuid.UUID, note_update: schemas.NoteUpdate, user_id: str) -> Optional[models.Note]:
    """Atualizar uma anotação."""
    db_note = get_note(db, note_id, user_id)
    if not db_note:
        return None
    
    update_data = note_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_note, field, value)
    
    db.commit()
    db.refresh(db_note)
    return db_note


def delete_note(db: Session, note_id: uuid.UUID, user_id: str) -> bool:
    """Deletar uma anotação."""
    db_note = get_note(db, note_id, user_id)
    if not db_note:
        return False
    
    db.delete(db_note)
    db.commit()
    return True


def get_notes_by_user(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[models.Note]:
    """Buscar todas as anotações de um usuário, ordenadas por data de criação (mais recentes primeiro)."""
    return (
        db.query(models.Note)
        .filter(models.Note.user_id == user_id)
        .order_by(desc(models.Note.created_at))
        .offset(skip)
        .limit(limit)
        .all()
    )