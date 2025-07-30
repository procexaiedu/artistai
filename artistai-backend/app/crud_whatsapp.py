import uuid
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from . import models, schemas


def get_whatsapp_instance_by_user_id(db: Session, user_id: uuid.UUID) -> Optional[models.WhatsAppInstance]:
    """Busca uma instância de WhatsApp pelo user_id."""
    return db.query(models.WhatsAppInstance).filter(
        models.WhatsAppInstance.user_id == user_id
    ).first()


def get_whatsapp_instance_by_instance_name(db: Session, instance_name: str) -> Optional[models.WhatsAppInstance]:
    """Busca uma instância de WhatsApp pelo nome da instância."""
    return db.query(models.WhatsAppInstance).filter(
        models.WhatsAppInstance.instance_name == instance_name
    ).first()


def create_whatsapp_instance(
    db: Session, 
    user_id: uuid.UUID, 
    instance_name: str,
    api_key: Optional[str] = None
) -> models.WhatsAppInstance:
    """Cria uma nova instância de WhatsApp."""
    db_instance = models.WhatsAppInstance(
        user_id=user_id,
        instance_name=instance_name,
        api_key=api_key,
        status='pending'
    )
    
    try:
        db.add(db_instance)
        db.commit()
        db.refresh(db_instance)
        return db_instance
    except IntegrityError:
        db.rollback()
        raise ValueError("Usuário já possui uma instância de WhatsApp ou nome da instância já existe")


def update_whatsapp_instance(
    db: Session, 
    instance_id: uuid.UUID, 
    update_data: schemas.WhatsAppInstanceUpdate
) -> Optional[models.WhatsAppInstance]:
    """Atualiza uma instância de WhatsApp existente."""
    db_instance = db.query(models.WhatsAppInstance).filter(
        models.WhatsAppInstance.id == instance_id
    ).first()
    
    if not db_instance:
        return None
    
    update_dict = update_data.dict(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(db_instance, field, value)
    
    db.commit()
    db.refresh(db_instance)
    return db_instance


def update_whatsapp_instance_by_user_id(
    db: Session, 
    user_id: uuid.UUID, 
    update_data: schemas.WhatsAppInstanceUpdate
) -> Optional[models.WhatsAppInstance]:
    """Atualiza uma instância de WhatsApp pelo user_id."""
    db_instance = db.query(models.WhatsAppInstance).filter(
        models.WhatsAppInstance.user_id == user_id
    ).first()
    
    if not db_instance:
        return None
    
    update_dict = update_data.dict(exclude_unset=True)
    for field, value in update_dict.items():
        setattr(db_instance, field, value)
    
    db.commit()
    db.refresh(db_instance)
    return db_instance


def delete_whatsapp_instance(db: Session, instance_id: uuid.UUID) -> bool:
    """Remove uma instância de WhatsApp."""
    db_instance = db.query(models.WhatsAppInstance).filter(
        models.WhatsAppInstance.id == instance_id
    ).first()
    
    if not db_instance:
        return False
    
    db.delete(db_instance)
    db.commit()
    return True


def delete_whatsapp_instance_by_user_id(db: Session, user_id: uuid.UUID) -> bool:
    """Remove uma instância de WhatsApp pelo user_id."""
    db_instance = db.query(models.WhatsAppInstance).filter(
        models.WhatsAppInstance.user_id == user_id
    ).first()
    
    if not db_instance:
        return False
    
    db.delete(db_instance)
    db.commit()
    return True