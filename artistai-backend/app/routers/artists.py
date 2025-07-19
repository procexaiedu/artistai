import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, crud_artist
from ..dependencies import get_current_user, User

router = APIRouter()


@router.post("/artists/", response_model=schemas.Artist, status_code=status.HTTP_201_CREATED)
def create_artist(
    artist: schemas.ArtistCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Criar um novo artista.
    """
    return crud_artist.create_artist(db=db, artist=artist, user_id=current_user.id)


@router.get("/artists/", response_model=List[schemas.Artist])
def read_artists(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Listar artistas com paginação.
    """
    artists = crud_artist.get_artists(db=db, user_id=current_user.id, skip=skip, limit=limit)
    return artists


@router.get("/artists/{artist_id}", response_model=schemas.Artist)
def read_artist(
    artist_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Buscar um artista específico por ID.
    """
    db_artist = crud_artist.get_artist(db=db, artist_id=artist_id, user_id=current_user.id)
    if db_artist is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artista não encontrado"
        )
    return db_artist


@router.patch("/artists/{artist_id}", response_model=schemas.Artist)
def update_artist(
    artist_id: uuid.UUID,
    artist_update: schemas.ArtistUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualizar um artista existente.
    """
    db_artist = crud_artist.update_artist(db=db, artist_id=artist_id, artist_update=artist_update, user_id=current_user.id)
    if db_artist is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artista não encontrado"
        )
    return db_artist


@router.delete("/artists/{artist_id}", response_model=schemas.Artist)
def delete_artist(
    artist_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Deletar um artista.
    """
    db_artist = crud_artist.delete_artist(db=db, artist_id=artist_id, user_id=current_user.id)
    if db_artist is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artista não encontrado"
        )
    return db_artist 