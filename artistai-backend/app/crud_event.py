import uuid
from typing import Optional, List
from datetime import date
from sqlalchemy.orm import Session, joinedload

from . import models
from . import schemas


def get_event(db: Session, event_id: uuid.UUID, user_id: str) -> Optional[models.Event]:
    """Busca um único evento pelo seu ID e user_id. Retorna None se não for encontrado."""
    return db.query(models.Event).options(
        joinedload(models.Event.artist),
        joinedload(models.Event.contractor)
    ).filter(
        models.Event.id == event_id,
        models.Event.user_id == user_id
    ).first()


def get_events(db: Session, user_id: str, skip: int = 0, limit: int = 100, 
               start_date: Optional[date] = None, end_date: Optional[date] = None) -> List[models.Event]:
    """
    Lista os eventos do usuário, com suporte para paginação e filtros de data.
    Inclui os objetos Artist e Contractor aninhados.
    """
    query = db.query(models.Event).options(
        joinedload(models.Event.artist),
        joinedload(models.Event.contractor)
    ).filter(models.Event.user_id == user_id)
    
    # Aplicar filtros de data se fornecidos
    if start_date:
        query = query.filter(models.Event.event_date >= start_date)
    if end_date:
        query = query.filter(models.Event.event_date <= end_date)
    
    return query.offset(skip).limit(limit).all()


def create_event(db: Session, event: schemas.EventCreate, user_id: str) -> models.Event:
    """
    Cria um novo evento após validar se o artist_id e contractor_id pertencem ao user_id.
    """
    # Validar se o artista pertence ao usuário
    artist = db.query(models.Artist).filter(
        models.Artist.id == event.artist_id,
        models.Artist.user_id == user_id
    ).first()
    if not artist:
        raise ValueError("Artista não encontrado ou não pertence ao usuário")
    
    # Validar se o contratante pertence ao usuário
    contractor = db.query(models.Contractor).filter(
        models.Contractor.id == event.contractor_id,
        models.Contractor.user_id == user_id
    ).first()
    if not contractor:
        raise ValueError("Contratante não encontrado ou não pertence ao usuário")
    
    # Criar o evento
    event_data = event.dict()
    event_data["user_id"] = user_id
    db_event = models.Event(**event_data)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    
    # Carregar os relacionamentos antes de retornar
    return db.query(models.Event).options(
        joinedload(models.Event.artist),
        joinedload(models.Event.contractor)
    ).filter(models.Event.id == db_event.id).first()


def update_event(db: Session, event_id: uuid.UUID, event_update: schemas.EventUpdate, user_id: str) -> Optional[models.Event]:
    """
    Atualiza um evento existente após validar permissões e relacionamentos.
    """
    db_event = db.query(models.Event).filter(
        models.Event.id == event_id,
        models.Event.user_id == user_id
    ).first()
    
    if not db_event:
        return None
    
    update_data = event_update.dict(exclude_unset=True)
    
    # Se artist_id ou contractor_id estão sendo atualizados, validar permissões
    if "artist_id" in update_data:
        artist = db.query(models.Artist).filter(
            models.Artist.id == update_data["artist_id"],
            models.Artist.user_id == user_id
        ).first()
        if not artist:
            raise ValueError("Artista não encontrado ou não pertence ao usuário")
    
    if "contractor_id" in update_data:
        contractor = db.query(models.Contractor).filter(
            models.Contractor.id == update_data["contractor_id"],
            models.Contractor.user_id == user_id
        ).first()
        if not contractor:
            raise ValueError("Contratante não encontrado ou não pertence ao usuário")
    
    # Aplicar atualizações
    for field, value in update_data.items():
        setattr(db_event, field, value)
    
    db.commit()
    db.refresh(db_event)
    
    # Carregar os relacionamentos antes de retornar
    return db.query(models.Event).options(
        joinedload(models.Event.artist),
        joinedload(models.Event.contractor)
    ).filter(models.Event.id == db_event.id).first()


def delete_event(db: Session, event_id: uuid.UUID, user_id: str) -> Optional[models.Event]:
    """
    Deleta um evento após validar permissões.
    """
    db_event = db.query(models.Event).options(
        joinedload(models.Event.artist),
        joinedload(models.Event.contractor)
    ).filter(
        models.Event.id == event_id,
        models.Event.user_id == user_id
    ).first()
    
    if db_event:
        db.delete(db_event)
        db.commit()
    
    return db_event


def get_events_by_artist(db: Session, artist_id: uuid.UUID, user_id: str) -> List[models.Event]:
    """
    Busca todos os eventos de um artista específico.
    """
    return db.query(models.Event).options(
        joinedload(models.Event.artist),
        joinedload(models.Event.contractor)
    ).filter(
        models.Event.artist_id == artist_id,
        models.Event.user_id == user_id
    ).all()


def get_events_by_contractor(db: Session, contractor_id: uuid.UUID, user_id: str) -> List[models.Event]:
    """
    Busca todos os eventos de um contratante específico.
    """
    return db.query(models.Event).options(
        joinedload(models.Event.artist),
        joinedload(models.Event.contractor)
    ).filter(
        models.Event.contractor_id == contractor_id,
        models.Event.user_id == user_id
    ).all() 