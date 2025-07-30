import uuid
from typing import Optional, List
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from . import models, schemas
from . import crud_contractor


def get_conversation(db: Session, conversation_id: uuid.UUID, user_id: str) -> Optional[models.Conversation]:
    """Busca uma conversa pelo ID e user_id."""
    return db.query(models.Conversation).options(
        joinedload(models.Conversation.contractor)
    ).filter(
        models.Conversation.id == conversation_id,
        models.Conversation.user_id == user_id
    ).first()


def get_conversations(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[models.Conversation]:
    """Lista todas as conversas do usuário, ordenadas pela última mensagem."""
    return db.query(models.Conversation).options(
        joinedload(models.Conversation.contractor)
    ).filter(
        models.Conversation.user_id == user_id
    ).order_by(
        desc(models.Conversation.last_message_at),
        desc(models.Conversation.created_at)
    ).offset(skip).limit(limit).all()


def create_conversation(db: Session, conversation: schemas.ConversationCreate, user_id: str) -> models.Conversation:
    """Cria uma nova conversa."""
    # Verificar se o contratante pertence ao usuário
    contractor = crud_contractor.get_contractor(db, conversation.contractor_id, user_id)
    if not contractor:
        raise ValueError("Contratante não encontrado ou não pertence ao usuário")
    
    conversation_data = conversation.dict()
    conversation_data["user_id"] = user_id
    db_conversation = models.Conversation(**conversation_data)
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    
    # Carregar o relacionamento antes de retornar
    return db.query(models.Conversation).options(
        joinedload(models.Conversation.contractor)
    ).filter(models.Conversation.id == db_conversation.id).first()


def get_or_create_conversation(db: Session, user_id: str, contractor_phone: str, channel: str = "whatsapp") -> models.Conversation:
    """Encontra uma conversa existente ou cria uma nova, incluindo o contratante se necessário."""
    # Primeiro, tentar encontrar o contratante pelo telefone
    contractor = db.query(models.Contractor).filter(
        models.Contractor.phone == contractor_phone,
        models.Contractor.user_id == user_id
    ).first()
    
    # Se o contratante não existir, criar um novo
    if not contractor:
        contractor_data = schemas.ContractorCreate(
            name=f"Contato {contractor_phone}",
            phone=contractor_phone
        )
        contractor = crud_contractor.create_contractor(db, contractor_data, user_id)
    
    # Verificar se já existe uma conversa para este contratante e canal
    conversation = db.query(models.Conversation).filter(
        models.Conversation.contractor_id == contractor.id,
        models.Conversation.channel == channel,
        models.Conversation.user_id == user_id
    ).first()
    
    # Se não existir, criar uma nova conversa
    if not conversation:
        conversation_data = schemas.ConversationCreate(
            contractor_id=contractor.id,
            channel=channel
        )
        conversation = create_conversation(db, conversation_data, user_id)
    
    return conversation


def update_conversation_last_message(db: Session, conversation_id: uuid.UUID, timestamp: datetime) -> None:
    """Atualiza o timestamp da última mensagem da conversa."""
    db.query(models.Conversation).filter(
        models.Conversation.id == conversation_id
    ).update({
        "last_message_at": timestamp
    })
    db.commit()