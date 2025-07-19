import uuid
from typing import Optional
from sqlalchemy.orm import Session

from . import models
from . import schemas


def get_artist(db: Session, artist_id: uuid.UUID, user_id: str) -> Optional[models.Artist]:
    """Busca um único artista pelo seu ID e user_id. Retorna None se não for encontrado."""
    return db.query(models.Artist).filter(
        models.Artist.id == artist_id,
        models.Artist.user_id == user_id
    ).first()


def get_artists(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> list[models.Artist]:
    """Lista os artistas do usuário, com suporte para paginação (skip e limit)."""
    return db.query(models.Artist).filter(
        models.Artist.user_id == user_id
    ).offset(skip).limit(limit).all()


def create_artist(db: Session, artist: schemas.ArtistCreate, user_id: str) -> models.Artist:
    """
    Recebe um objeto do tipo schemas.ArtistCreate e user_id.
    Cria uma instância de models.Artist com os dados recebidos.
    Adiciona a instância à sessão, comita e atualiza a instância.
    Retorna a instância models.Artist recém-criada.
    """
    artist_data = artist.dict()
    artist_data["user_id"] = user_id
    db_artist = models.Artist(**artist_data)
    db.add(db_artist)
    db.commit()
    db.refresh(db_artist)
    return db_artist


def update_artist(db: Session, artist_id: uuid.UUID, artist_update: schemas.ArtistUpdate, user_id: str) -> Optional[models.Artist]:
    """
    Busca o artista existente pelo artist_id e user_id.
    Se encontrado, atualiza seus campos com os dados de artist_update.
    Apenas os campos fornecidos (não-nulos) devem ser atualizados.
    Comita a transação e retorna o objeto artista atualizado.
    """
    db_artist = db.query(models.Artist).filter(
        models.Artist.id == artist_id,
        models.Artist.user_id == user_id
    ).first()
    if db_artist:
        update_data = artist_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_artist, field, value)
        db.commit()
        db.refresh(db_artist)
    return db_artist


def delete_artist(db: Session, artist_id: uuid.UUID, user_id: str) -> Optional[models.Artist]:
    """
    Busca o artista existente pelo artist_id e user_id.
    Se encontrado, o remove da sessão, comita, e retorna o objeto que foi deletado.
    """
    db_artist = db.query(models.Artist).filter(
        models.Artist.id == artist_id,
        models.Artist.user_id == user_id
    ).first()
    if db_artist:
        db.delete(db_artist)
        db.commit()
    return db_artist 