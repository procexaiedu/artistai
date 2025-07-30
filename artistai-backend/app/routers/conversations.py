import uuid
import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from ..database import get_db
from .. import schemas, crud_conversation, crud_message
from ..dependencies import get_current_user, User

router = APIRouter()

# Chave de API para o endpoint de ingressão
API_KEY = os.getenv("INGRESS_API_KEY", "your-secret-api-key-here")


@router.get("/conversations/", response_model=List[schemas.Conversation])
def read_conversations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lista todas as conversas do usuário logado."""
    conversations = crud_conversation.get_conversations(
        db=db, user_id=current_user.id, skip=skip, limit=limit
    )
    return conversations


@router.get("/conversations/{conversation_id}/messages", response_model=List[schemas.Message])
def read_conversation_messages(
    conversation_id: uuid.UUID,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lista todas as mensagens de uma conversa específica."""
    try:
        messages = crud_message.get_messages_by_conversation(
            db=db, conversation_id=conversation_id, user_id=current_user.id, skip=skip, limit=limit
        )
        return messages
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.post("/conversations/ingress", response_model=schemas.Message)
def ingress_message(
    ingress_data: schemas.IngressMessage,
    x_api_key: str = Header(..., alias="X-API-Key"),
    db: Session = Depends(get_db)
):
    """Endpoint de ingressão para mensagens externas (n8n)."""
    # Verificar a chave de API
    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Chave de API inválida"
        )
    
    # Por enquanto, usar um user_id padrão ou extrair de algum campo
    # Em produção, você pode mapear o telefone para um usuário específico
    user_id = "default-user-id"  # AJUSTAR CONFORME SUA LÓGICA
    
    try:
        message = crud_message.create_ingress_message(
            db=db, ingress_data=ingress_data, user_id=user_id
        )
        return message
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/conversations/{conversation_id}/messages", response_model=schemas.Message)
def create_message(
    conversation_id: uuid.UUID,
    message_data: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cria uma nova mensagem em uma conversa (para respostas manuais)."""
    # Forçar o conversation_id da URL
    message_data.conversation_id = conversation_id
    
    try:
        message = crud_message.create_message(
            db=db, message=message_data, user_id=current_user.id
        )
        return message
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )