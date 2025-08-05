import uuid
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc

from . import models
from . import schemas


def get_agent_config(db: Session, user_id: str) -> Optional[models.AgentConfiguration]:
    """Busca a configuração do agente para um usuário específico."""
    return db.query(models.AgentConfiguration).filter(
        models.AgentConfiguration.user_id == user_id
    ).first()


def create_agent_config(db: Session, user_id: str) -> models.AgentConfiguration:
    """Cria uma configuração padrão do agente para um usuário."""
    db_config = models.AgentConfiguration(
        user_id=user_id,
        is_active=True,
        system_prompt_production=None,
        system_prompt_laboratory=None,
        wait_time_buffer=2
    )
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    return db_config


def get_or_create_agent_config(db: Session, user_id: str) -> models.AgentConfiguration:
    """Busca a configuração do agente ou cria uma nova se não existir."""
    config = get_agent_config(db, user_id)
    if not config:
        config = create_agent_config(db, user_id)
    return config


def update_agent_config(db: Session, user_id: str, config_update: schemas.AgentConfigUpdate) -> Optional[models.AgentConfiguration]:
    """Atualiza a configuração do agente para um usuário."""
    db_config = get_agent_config(db, user_id)
    if db_config:
        update_data = config_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_config, field, value)
        db.commit()
        db.refresh(db_config)
    return db_config


def create_prompt_version(db: Session, user_id: str, prompt_content: str) -> Optional[models.PromptVersion]:
    """Cria uma nova versão de prompt para o usuário."""
    # Busca a configuração do agente
    config = get_agent_config(db, user_id)
    if not config:
        return None
    
    # Calcula o próximo número de versão
    last_version = db.query(models.PromptVersion).filter(
        models.PromptVersion.agent_config_id == config.id
    ).order_by(desc(models.PromptVersion.version)).first()
    
    next_version = 1 if not last_version else last_version.version + 1
    
    # Cria a nova versão
    db_version = models.PromptVersion(
        agent_config_id=config.id,
        prompt_content=prompt_content,
        version=next_version
    )
    db.add(db_version)
    db.commit()
    db.refresh(db_version)
    return db_version


def get_prompt_versions(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> List[models.PromptVersion]:
    """Lista as versões de prompt para um usuário."""
    config = get_agent_config(db, user_id)
    if not config:
        return []
    
    return db.query(models.PromptVersion).filter(
        models.PromptVersion.agent_config_id == config.id
    ).order_by(desc(models.PromptVersion.version)).offset(skip).limit(limit).all()


def get_prompt_version_by_id(db: Session, user_id: str, version_id: uuid.UUID) -> Optional[models.PromptVersion]:
    """Busca uma versão específica de prompt por ID."""
    config = get_agent_config(db, user_id)
    if not config:
        return None
    
    return db.query(models.PromptVersion).filter(
        models.PromptVersion.id == version_id,
        models.PromptVersion.agent_config_id == config.id
    ).first()


def deploy_prompt(db: Session, user_id: str) -> Optional[models.PromptVersion]:
    """Promove o prompt do laboratório para produção e cria uma nova versão."""
    config = get_agent_config(db, user_id)
    if not config or not config.system_prompt_laboratory:
        return None
    
    # Atualiza o prompt de produção
    config.system_prompt_production = config.system_prompt_laboratory
    
    # Cria uma nova versão
    version = create_prompt_version(db, user_id, config.system_prompt_laboratory)
    
    db.commit()
    db.refresh(config)
    return version


def revert_prompt(db: Session, user_id: str) -> Optional[models.AgentConfiguration]:
    """Restaura o prompt do laboratório com o conteúdo de produção."""
    config = get_agent_config(db, user_id)
    if not config:
        return None
    
    config.system_prompt_laboratory = config.system_prompt_production
    db.commit()
    db.refresh(config)
    return config


def rollback_prompt(db: Session, user_id: str, version_id: uuid.UUID) -> Optional[models.AgentConfiguration]:
    """Restaura um prompt de uma versão antiga para o laboratório."""
    version = get_prompt_version_by_id(db, user_id, version_id)
    if not version:
        return None
    
    config = get_agent_config(db, user_id)
    if not config:
        return None
    
    config.system_prompt_laboratory = version.prompt_content
    db.commit()
    db.refresh(config)
    return config