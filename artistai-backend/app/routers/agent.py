import uuid
import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import httpx

from ..database import get_db
from .. import schemas, crud_agent
from ..dependencies import get_current_user, User

router = APIRouter()


@router.get("/config", response_model=schemas.AgentConfig)
def get_agent_config(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna a configuração do agente para o usuário atual.
    Se não existir, cria uma configuração padrão.
    """
    config = crud_agent.get_or_create_agent_config(db=db, user_id=current_user.id)
    return config


@router.patch("/config", response_model=schemas.AgentConfig)
def update_agent_config(
    config_update: schemas.AgentConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualiza a configuração do agente.
    """
    config = crud_agent.update_agent_config(
        db=db, 
        user_id=current_user.id, 
        config_update=config_update
    )
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuração do agente não encontrada"
        )
    return config


@router.post("/deploy", response_model=schemas.PromptVersion)
def deploy_prompt(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Promove o system_prompt_laboratory para system_prompt_production
    e cria um novo registro em prompt_versions.
    """
    version = crud_agent.deploy_prompt(db=db, user_id=current_user.id)
    if not version:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não há prompt no laboratório para fazer deploy ou configuração não encontrada"
        )
    return version


@router.post("/revert", response_model=schemas.AgentConfig)
def revert_prompt(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Restaura o system_prompt_laboratory com o conteúdo de system_prompt_production.
    """
    config = crud_agent.revert_prompt(db=db, user_id=current_user.id)
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuração do agente não encontrada"
        )
    return config


@router.get("/versions", response_model=List[schemas.PromptVersion])
def get_prompt_versions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista o histórico de versões de prompts de produção para o usuário.
    """
    versions = crud_agent.get_prompt_versions(
        db=db, 
        user_id=current_user.id, 
        skip=skip, 
        limit=limit
    )
    return versions


@router.post("/rollback/{version_id}", response_model=schemas.AgentConfig)
def rollback_prompt(
    version_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Restaura um prompt de uma versão antiga para o campo system_prompt_laboratory.
    """
    config = crud_agent.rollback_prompt(
        db=db, 
        user_id=current_user.id, 
        version_id=version_id
    )
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Versão de prompt não encontrada ou configuração não encontrada"
        )
    return config


# Schemas para endpoints de proxy
class TestLabRequest(schemas.BaseModel):
    message: str


class PromptEngineerRequest(schemas.BaseModel):
    instruction: str


class WebhookResponse(schemas.BaseModel):
    success: bool
    response: dict
    error: str = None


@router.post("/test-lab", response_model=WebhookResponse)
async def test_lab(
    request: TestLabRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Endpoint de proxy para teste do laboratório.
    Encaminha a mensagem + system_prompt_laboratory para o webhook do n8n.
    """
    # Busca a configuração do agente
    config = crud_agent.get_agent_config(db=db, user_id=current_user.id)
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuração do agente não encontrada"
        )
    
    # Lê a URL do webhook do ambiente
    webhook_url = os.getenv("N8N_TEST_WEBHOOK_URL")
    if not webhook_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="URL do webhook de teste não configurada"
        )
    
    # Prepara os dados para envio
    payload = {
        "message": request.message,
        "system_prompt": config.system_prompt_laboratory,
        "user_id": current_user.id
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(webhook_url, json=payload, timeout=30.0)
            response.raise_for_status()
            
            return WebhookResponse(
                success=True,
                response=response.json()
            )
    except httpx.RequestError as e:
        return WebhookResponse(
            success=False,
            response={},
            error=f"Erro de conexão: {str(e)}"
        )
    except httpx.HTTPStatusError as e:
        return WebhookResponse(
            success=False,
            response={},
            error=f"Erro HTTP {e.response.status_code}: {e.response.text}"
        )
    except Exception as e:
        return WebhookResponse(
            success=False,
            response={},
            error=f"Erro inesperado: {str(e)}"
        )


@router.post("/prompt-engineer", response_model=WebhookResponse)
async def prompt_engineer(
    request: PromptEngineerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Endpoint de proxy para engenharia de prompt.
    Encaminha a instrução + system_prompt_laboratory para o webhook do n8n.
    """
    # Busca a configuração do agente
    config = crud_agent.get_agent_config(db=db, user_id=current_user.id)
    if not config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuração do agente não encontrada"
        )
    
    # Lê a URL do webhook do ambiente
    webhook_url = os.getenv("N8N_ENGINEER_WEBHOOK_URL")
    if not webhook_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="URL do webhook de engenharia não configurada"
        )
    
    # Prepara os dados para envio
    payload = {
        "instruction": request.instruction,
        "current_prompt": config.system_prompt_laboratory,
        "user_id": current_user.id
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(webhook_url, json=payload, timeout=30.0)
            response.raise_for_status()
            
            return WebhookResponse(
                success=True,
                response=response.json()
            )
    except httpx.RequestError as e:
        return WebhookResponse(
            success=False,
            response={},
            error=f"Erro de conexão: {str(e)}"
        )
    except httpx.HTTPStatusError as e:
        return WebhookResponse(
            success=False,
            response={},
            error=f"Erro HTTP {e.response.status_code}: {e.response.text}"
        )
    except Exception as e:
        return WebhookResponse(
            success=False,
            response={},
            error=f"Erro inesperado: {str(e)}"
        )