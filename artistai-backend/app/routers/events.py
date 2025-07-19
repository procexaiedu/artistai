import uuid
from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, crud_event
from ..dependencies import get_current_user, User

router = APIRouter()


@router.post("/events/", response_model=schemas.Event, status_code=status.HTTP_201_CREATED)
def create_event(
    event: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Criar um novo evento.
    Valida se o artista e contratante pertencem ao usuário logado.
    """
    try:
        return crud_event.create_event(db=db, event=event, user_id=current_user.id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/events/", response_model=List[schemas.Event])
def read_events(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[date] = Query(None, description="Data de início para filtrar eventos (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Data de fim para filtrar eventos (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Listar eventos com paginação e filtros de data.
    Inclui objetos aninhados de Artist e Contractor.
    """
    events = crud_event.get_events(
        db=db, 
        user_id=current_user.id, 
        skip=skip, 
        limit=limit,
        start_date=start_date,
        end_date=end_date
    )
    return events


@router.get("/events/{event_id}", response_model=schemas.Event)
def read_event(
    event_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Buscar um evento específico por ID.
    """
    db_event = crud_event.get_event(db=db, event_id=event_id, user_id=current_user.id)
    if db_event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento não encontrado"
        )
    return db_event


@router.patch("/events/{event_id}", response_model=schemas.Event)
def update_event(
    event_id: uuid.UUID,
    event_update: schemas.EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualizar um evento existente.
    Valida permissões para artista e contratante se fornecidos.
    """
    try:
        db_event = crud_event.update_event(
            db=db, 
            event_id=event_id, 
            event_update=event_update, 
            user_id=current_user.id
        )
        if db_event is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Evento não encontrado"
            )
        return db_event
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/events/{event_id}", response_model=schemas.Event)
def delete_event(
    event_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Deletar um evento.
    """
    db_event = crud_event.delete_event(db=db, event_id=event_id, user_id=current_user.id)
    if db_event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evento não encontrado"
        )
    return db_event


@router.get("/events/by-artist/{artist_id}", response_model=List[schemas.Event])
def read_events_by_artist(
    artist_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Listar todos os eventos de um artista específico.
    """
    events = crud_event.get_events_by_artist(db=db, artist_id=artist_id, user_id=current_user.id)
    return events


@router.get("/events/by-contractor/{contractor_id}", response_model=List[schemas.Event])
def read_events_by_contractor(
    contractor_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Listar todos os eventos de um contratante específico.
    """
    events = crud_event.get_events_by_contractor(db=db, contractor_id=contractor_id, user_id=current_user.id)
    return events 