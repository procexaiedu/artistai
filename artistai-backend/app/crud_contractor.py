import uuid
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from . import models
from . import schemas


class ContractorError(Exception):
    """Exceções específicas para operações de contratante"""
    pass


class DuplicateContractorError(ContractorError):
    """Erro quando CPF/CNPJ ou telefone já existem para o usuário"""
    pass


def get_contractor(db: Session, contractor_id: uuid.UUID, user_id: str) -> Optional[models.Contractor]:
    """Busca um único contratante pelo seu ID e user_id. Retorna None se não for encontrado."""
    return db.query(models.Contractor).filter(
        models.Contractor.id == contractor_id,
        models.Contractor.user_id == user_id
    ).first()


def get_contractors(db: Session, user_id: str, skip: int = 0, limit: int = 100) -> list[models.Contractor]:
    """Lista os contratantes do usuário, com suporte para paginação (skip e limit)."""
    return db.query(models.Contractor).filter(
        models.Contractor.user_id == user_id
    ).offset(skip).limit(limit).all()


def check_contractor_duplicates(db: Session, contractor: schemas.ContractorCreate, user_id: str, exclude_id: Optional[uuid.UUID] = None) -> None:
    """
    Verifica se já existe um contratante com o mesmo CPF/CNPJ ou telefone para o usuário.
    Levanta DuplicateContractorError se encontrar duplicatas.
    """
    query = db.query(models.Contractor).filter(models.Contractor.user_id == user_id)
    
    # Excluir o próprio registro em caso de atualização
    if exclude_id:
        query = query.filter(models.Contractor.id != exclude_id)
    
    # Verificar CPF/CNPJ duplicado (apenas se fornecido)
    if contractor.cpf_cnpj:
        existing_cpf = query.filter(models.Contractor.cpf_cnpj == contractor.cpf_cnpj).first()
        if existing_cpf:
            raise DuplicateContractorError(f"Já existe um contratante cadastrado com o CPF/CNPJ '{contractor.cpf_cnpj}' em sua conta.")
    
    # Verificar telefone duplicado
    existing_phone = query.filter(models.Contractor.phone == contractor.phone).first()
    if existing_phone:
        raise DuplicateContractorError(f"Já existe um contratante cadastrado com o telefone '{contractor.phone}' em sua conta.")


def create_contractor(db: Session, contractor: schemas.ContractorCreate, user_id: str) -> models.Contractor:
    """
    Recebe um objeto do tipo schemas.ContractorCreate e user_id.
    Verifica duplicatas antes de criar.
    Cria uma instância de models.Contractor com os dados recebidos.
    Adiciona a instância à sessão, comita e atualiza a instância.
    Retorna a instância models.Contractor recém-criada.
    """
    # Verificar duplicatas no contexto do usuário
    check_contractor_duplicates(db, contractor, user_id)
    
    try:
        contractor_data = contractor.dict()
        contractor_data["user_id"] = user_id
        db_contractor = models.Contractor(**contractor_data)
        db.add(db_contractor)
        db.commit()
        db.refresh(db_contractor)
        return db_contractor
    except IntegrityError as e:
        db.rollback()
        # Tratar erros de constraint global (dados de outros usuários)
        if "cpf_cnpj" in str(e.orig):
            raise ContractorError("Este CPF/CNPJ já está sendo usado por outro usuário no sistema.")
        elif "phone" in str(e.orig):
            raise ContractorError("Este telefone já está sendo usado por outro usuário no sistema.")
        else:
            raise ContractorError("Erro ao criar contratante. Verifique os dados fornecidos.")


def update_contractor(db: Session, contractor_id: uuid.UUID, contractor_update: schemas.ContractorUpdate, user_id: str) -> Optional[models.Contractor]:
    """
    Busca o contratante existente pelo contractor_id e user_id.
    Se encontrado, verifica duplicatas e atualiza seus campos com os dados de contractor_update.
    Apenas os campos fornecidos (não-nulos) devem ser atualizados.
    Comita a transação e retorna o objeto contratante atualizado.
    """
    db_contractor = db.query(models.Contractor).filter(
        models.Contractor.id == contractor_id,
        models.Contractor.user_id == user_id
    ).first()
    
    if not db_contractor:
        return None
    
    # Verificar duplicatas apenas para campos que estão sendo atualizados
    update_data = contractor_update.dict(exclude_unset=True)
    if update_data:  # Se há dados para atualizar
        # Criar um objeto temporário para verificação
        temp_contractor = schemas.ContractorCreate(
            name=update_data.get('name', db_contractor.name),
            cpf_cnpj=update_data.get('cpf_cnpj', db_contractor.cpf_cnpj),
            email=update_data.get('email', db_contractor.email),
            phone=update_data.get('phone', db_contractor.phone)
        )
        check_contractor_duplicates(db, temp_contractor, user_id, exclude_id=contractor_id)
    
    try:
        for field, value in update_data.items():
            setattr(db_contractor, field, value)
        db.commit()
        db.refresh(db_contractor)
        return db_contractor
    except IntegrityError as e:
        db.rollback()
        if "cpf_cnpj" in str(e.orig):
            raise ContractorError("Este CPF/CNPJ já está sendo usado por outro usuário no sistema.")
        elif "phone" in str(e.orig):
            raise ContractorError("Este telefone já está sendo usado por outro usuário no sistema.")
        else:
            raise ContractorError("Erro ao atualizar contratante. Verifique os dados fornecidos.")


def delete_contractor(db: Session, contractor_id: uuid.UUID, user_id: str) -> Optional[models.Contractor]:
    """
    Busca o contratante existente pelo contractor_id e user_id.
    Se encontrado, o remove da sessão, comita, e retorna o objeto que foi deletado.
    """
    db_contractor = db.query(models.Contractor).filter(
        models.Contractor.id == contractor_id,
        models.Contractor.user_id == user_id
    ).first()
    if db_contractor:
        db.delete(db_contractor)
        db.commit()
    return db_contractor