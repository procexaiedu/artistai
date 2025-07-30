import uuid
from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import desc

from . import models, schemas
from . import crud_conversation


def get_message(db: Session, message_id: uuid.UUID, user_id: str) -> Optional[models.Message]:
    """Busca uma mensagem pelo ID e user_id."""
    return db.query(models.Message).filter(
        models.Message.id == message_id,
        models.Message.user_id == user_id
    ).first()


def get_messages_by_conversation(db: Session, conversation_id: uuid.UUID, user_id: str, skip: int = 0, limit: int = 100) -> List[models.Message]:
    """Lista todas as mensagens de uma conversa específica."""
    # Verificar se a conversa pertence ao usuário
    conversation = crud_conversation.get_conversation(db, conversation_id, user_id)
    if not conversation:
        raise ValueError("Conversa não encontrada ou não pertence ao usuário")
    
    return db.query(models.Message).filter(
        models.Message.conversation_id == conversation_id,
        models.Message.user_id == user_id
    ).order_by(
        models.Message.timestamp
    ).offset(skip).limit(limit).all()


def create_message(db: Session, message: schemas.MessageCreate, user_id: str) -> models.Message:
    """Cria uma nova mensagem."""
    # Verificar se a conversa pertence ao usuário
    conversation = crud_conversation.get_conversation(db, message.conversation_id, user_id)
    if not conversation:
        raise ValueError("Conversa não encontrada ou não pertence ao usuário")
    
    message_data = message.dict()
    message_data["user_id"] = user_id
    
    # Se timestamp não foi fornecido, usar o atual
    if not message_data.get("timestamp"):
        message_data["timestamp"] = datetime.utcnow()
    
    db_message = models.Message(**message_data)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    # Atualizar o timestamp da última mensagem na conversa
    crud_conversation.update_conversation_last_message(
        db, message.conversation_id, db_message.timestamp
    )
    
    return db_message


def create_ingress_message(db: Session, ingress_data: schemas.IngressMessage, user_id: str) -> models.Message:
    """Cria uma mensagem a partir de dados externos (endpoint de ingressão)."""
    # Encontrar ou criar a conversa
    conversation = crud_conversation.get_or_create_conversation(
        db, user_id, ingress_data.from_phone, ingress_data.channel
    )
    
    # Criar a mensagem
    message_data = schemas.MessageCreate(
        conversation_id=conversation.id,
        sender_type="user",  # Mensagem vem do contratante
        content_type=ingress_data.content_type,
        content=ingress_data.content,
        timestamp=ingress_data.timestamp or datetime.utcnow()
    )
    
    message = create_message(db, message_data, user_id)
    
    # Se há whatsapp_message_id, atualizar
    if ingress_data.whatsapp_message_id:
        message.whatsapp_message_id = ingress_data.whatsapp_message_id
        db.commit()
        db.refresh(message)
    
    return message