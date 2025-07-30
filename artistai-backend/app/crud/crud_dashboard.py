import uuid
from datetime import date, datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_, extract
from sqlalchemy.exc import SQLAlchemyError
import logging

from ..models import (
    Artist, Contractor, Event, Conversation, FinancialTransaction,
    PipelineStage, FinancialAccount, Message, UserStats, Achievement, 
    UserAchievement, Challenge, UserChallenge, CommunicationStats
)
from ..schemas import (
    FinancialSummary, CategorySummary, MonthlyTrend
)

logger = logging.getLogger(__name__)


def get_kpis(db: Session, user_id: str) -> Dict[str, Any]:
    """
    Calcular e retornar KPIs principais do dashboard.
    """
    try:
        # Total de artistas ativos
        active_artists_count = db.query(Artist).filter(
            and_(
                Artist.user_id == user_id,
                Artist.status == 'active'
            )
        ).count()
        
        # Total de contratantes em estágios "ativos" do funil
        # Consideramos contratantes que têm stage_id (estão no pipeline)
        active_leads_count = db.query(Contractor).filter(
            and_(
                Contractor.user_id == user_id,
                Contractor.stage_id.isnot(None)
            )
        ).count()
        
        # Eventos confirmados para os próximos 30 dias
        today = date.today()
        next_30_days = today + timedelta(days=30)
        
        upcoming_events_count = db.query(Event).filter(
            and_(
                Event.user_id == user_id,
                Event.status.in_(['confirmed', 'pending_payment']),
                Event.event_date >= today,
                Event.event_date <= next_30_days
            )
        ).count()
        
        # Receita total do mês corrente (transações completadas)
        start_of_month = today.replace(day=1)
        
        monthly_revenue = db.query(func.sum(FinancialTransaction.amount)).filter(
            and_(
                FinancialTransaction.user_id == user_id,
                FinancialTransaction.transaction_type == 'income',
                FinancialTransaction.status == 'completed',
                FinancialTransaction.transaction_date >= start_of_month,
                FinancialTransaction.transaction_date <= today
            )
        ).scalar() or 0.0
        
        return {
            "active_artists_count": active_artists_count,
            "active_leads_count": active_leads_count,
            "upcoming_events_count": upcoming_events_count,
            "monthly_revenue": float(monthly_revenue)
        }
    except SQLAlchemyError as e:
        logger.error(f"Erro de banco de dados ao buscar KPIs para usuário {user_id}: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Erro inesperado ao buscar KPIs para usuário {user_id}: {str(e)}")
        raise


def get_pipeline_summary(db: Session, user_id: str) -> List[Dict[str, Any]]:
    """
    Retornar resumo do pipeline com número de contratantes por etapa.
    """
    try:
        # Buscar todas as etapas do usuário
        stages = db.query(PipelineStage).filter(
            PipelineStage.user_id == user_id
        ).order_by(PipelineStage.order).all()
        
        pipeline_summary = []
        
        # Adicionar contratantes não atribuídos
        unassigned_count = db.query(Contractor).filter(
            and_(
                Contractor.user_id == user_id,
                Contractor.stage_id.is_(None)
            )
        ).count()
        
        pipeline_summary.append({
            "stage_name": "Não Atribuídos",
            "contractor_count": unassigned_count,
            "stage_id": None
        })
        
        # Adicionar contratantes por etapa
        for stage in stages:
            contractor_count = db.query(Contractor).filter(
                and_(
                    Contractor.user_id == user_id,
                    Contractor.stage_id == stage.id
                )
            ).count()
            
            pipeline_summary.append({
                "stage_name": stage.name,
                "contractor_count": contractor_count,
                "stage_id": str(stage.id)
            })
        
        return pipeline_summary
    except SQLAlchemyError as e:
        logger.error(f"Erro de banco de dados ao buscar resumo do pipeline para usuário {user_id}: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Erro inesperado ao buscar resumo do pipeline para usuário {user_id}: {str(e)}")
        raise


def get_financial_summary(db: Session, user_id: str) -> Dict[str, float]:
    """
    Retornar resumo financeiro do mês corrente.
    """
    try:
        today = date.today()
        start_of_month = today.replace(day=1)
        
        # Receitas do mês
        monthly_income = db.query(func.sum(FinancialTransaction.amount)).filter(
            and_(
                FinancialTransaction.user_id == user_id,
                FinancialTransaction.transaction_type == 'income',
                FinancialTransaction.status == 'completed',
                FinancialTransaction.transaction_date >= start_of_month,
                FinancialTransaction.transaction_date <= today
            )
        ).scalar() or 0.0
        
        # Despesas do mês
        monthly_expenses = db.query(func.sum(FinancialTransaction.amount)).filter(
            and_(
                FinancialTransaction.user_id == user_id,
                FinancialTransaction.transaction_type == 'expense',
                FinancialTransaction.status == 'completed',
                FinancialTransaction.transaction_date >= start_of_month,
                FinancialTransaction.transaction_date <= today
            )
        ).scalar() or 0.0
        
        return {
            "monthly_income": float(monthly_income),
            "monthly_expenses": float(monthly_expenses),
            "net_income": float(monthly_income - monthly_expenses)
        }
    except SQLAlchemyError as e:
        logger.error(f"Erro de banco de dados ao buscar resumo financeiro para usuário {user_id}: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Erro inesperado ao buscar resumo financeiro para usuário {user_id}: {str(e)}")
        raise


def get_recent_activities(db: Session, user_id: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Retornar atividades recentes do usuário.
    Funciona mesmo quando WhatsApp não está conectado.
    """
    try:
        activities = []
        
        # Eventos recentes (últimos 7 dias)
        week_ago = date.today() - timedelta(days=7)
        recent_events = db.query(Event).filter(
            and_(
                Event.user_id == user_id,
                Event.created_at >= week_ago
            )
        ).order_by(Event.created_at.desc()).limit(3).all()
        
        for event in recent_events:
            activities.append({
                "type": "event",
                "title": f"Evento '{event.title}' criado",
                "description": f"Agendado para {event.event_date.strftime('%d/%m/%Y')}",
                "timestamp": event.created_at,
                "icon": "calendar"
            })
        
        # Contratantes recentes (últimos 7 dias)
        recent_contractors = db.query(Contractor).filter(
            and_(
                Contractor.user_id == user_id,
                Contractor.created_at >= week_ago
            )
        ).order_by(Contractor.created_at.desc()).limit(2).all()
        
        for contractor in recent_contractors:
            activities.append({
                "type": "contractor",
                "title": f"Novo contratante: {contractor.name}",
                "description": f"Telefone: {contractor.phone}",
                "timestamp": contractor.created_at,
                "icon": "user-plus"
            })
        
        # Transações financeiras recentes (últimos 7 dias)
        recent_transactions = db.query(FinancialTransaction).filter(
            and_(
                FinancialTransaction.user_id == user_id,
                FinancialTransaction.created_at >= week_ago
            )
        ).order_by(FinancialTransaction.created_at.desc()).limit(2).all()
        
        for transaction in recent_transactions:
            transaction_type = "Receita" if transaction.transaction_type == "income" else "Despesa"
            activities.append({
                "type": "transaction",
                "title": f"{transaction_type}: R$ {transaction.amount:.2f}",
                "description": transaction.description,
                "timestamp": transaction.created_at,
                "icon": "dollar-sign"
            })
        
        # Ordenar por timestamp e limitar
        activities.sort(key=lambda x: x["timestamp"], reverse=True)
        return activities[:limit]
    except SQLAlchemyError as e:
        logger.error(f"Erro de banco de dados ao buscar atividades recentes para usuário {user_id}: {str(e)}")
        # Em caso de erro, retornar lista vazia para não quebrar o dashboard
        return []
    except Exception as e:
        logger.error(f"Erro inesperado ao buscar atividades recentes para usuário {user_id}: {str(e)}")
        # Em caso de erro, retornar lista vazia para não quebrar o dashboard
        return []


def get_upcoming_events(db: Session, user_id: str, limit: int = 5) -> List[Dict[str, Any]]:
    """
    Retornar próximos eventos confirmados.
    """
    try:
        today = date.today()
        
        upcoming_events = db.query(Event).filter(
            and_(
                Event.user_id == user_id,
                Event.status.in_(['confirmed', 'pending_payment']),
                Event.event_date >= today
            )
        ).order_by(Event.event_date.asc()).limit(limit).all()
        
        events_data = []
        for event in upcoming_events:
            # Calcular dias até o evento
            days_until = (event.event_date - today).days
            
            events_data.append({
                "id": str(event.id),
                "title": event.title,
                "event_date": event.event_date.isoformat(),
                "event_location": event.event_location,
                "agreed_fee": float(event.agreed_fee),
                "status": event.status,
                "days_until": days_until,
                "artist_name": event.artist.name if event.artist else None,
                "contractor_name": event.contractor.name if event.contractor else None
            })
        
        return events_data
    except SQLAlchemyError as e:
        logger.error(f"Erro de banco de dados ao buscar eventos futuros para usuário {user_id}: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Erro inesperado ao buscar eventos futuros para usuário {user_id}: {str(e)}")
        raise


def get_conversations_summary(db: Session, user_id: str) -> Dict[str, int]:
    """
    Obter resumo das conversas ativas.
    Retorna valores zerados se não houver conversas (WhatsApp desconectado).
    """
    try:
        # Verificar se existem conversas para o usuário
        total_conversations = db.query(Conversation).filter(
            Conversation.user_id == user_id
        ).count()
        
        # Se não há conversas, retornar valores zerados
        if total_conversations == 0:
            return {
                "open_conversations": 0,
                "needs_attention": 0,
                "total_active": 0
            }
        
        # Conversas abertas
        open_conversations = db.query(Conversation).filter(
            and_(
                Conversation.user_id == user_id,
                Conversation.status == 'open'
            )
        ).count()
        
        # Conversas que precisam de atenção
        needs_attention = db.query(Conversation).filter(
            and_(
                Conversation.user_id == user_id,
                Conversation.status == 'needs_attention'
            )
        ).count()
        
        return {
            "open_conversations": open_conversations,
            "needs_attention": needs_attention,
            "total_active": open_conversations + needs_attention
        }
    except SQLAlchemyError as e:
        logger.error(f"Erro de banco de dados ao buscar resumo de conversas para usuário {user_id}: {str(e)}")
        # Em caso de erro, retornar valores zerados para não quebrar o dashboard
        return {
            "open_conversations": 0,
            "needs_attention": 0,
            "total_active": 0
        }


def get_conversation_summary(db: Session) -> Dict[str, Any]:
    """
    Obtém resumo das conversas
    """
    try:
        # Total de conversas
        total_conversations = db.query(Conversation).count()
        
        # Conversas ativas (com mensagens recentes)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        active_conversations = db.query(Conversation).filter(
            Conversation.updated_at >= thirty_days_ago
        ).count()
        
        # Total de mensagens
        total_messages = db.query(Message).count()
        
        # Mensagens hoje
        today = datetime.utcnow().date()
        messages_today = db.query(Message).filter(
            func.date(Message.created_at) == today
        ).count()
        
        return {
            "total_conversations": total_conversations,
            "active_conversations": active_conversations,
            "total_messages": total_messages,
            "messages_today": messages_today,
            "response_rate": 85.5,  # Placeholder - calcular baseado em dados reais
            "avg_response_time": 15   # Placeholder - em minutos
        }
    except Exception as e:
        logger.error(f"Erro ao obter resumo de conversas: {e}")
        return {
            "total_conversations": 0,
            "active_conversations": 0,
            "total_messages": 0,
            "messages_today": 0,
            "response_rate": 0,
            "avg_response_time": 0
        }


# Funções CRUD para Gamificação
def get_user_stats(db: Session, user_id: str) -> Optional[UserStats]:
    """
    Obtém estatísticas do usuário
    """
    try:
        return db.query(UserStats).filter(UserStats.user_id == user_id).first()
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas do usuário {user_id}: {e}")
        return None


def create_user_stats(db: Session, user_id: str) -> Optional[UserStats]:
    """
    Cria estatísticas iniciais para um usuário
    """
    try:
        user_stats = UserStats(
            user_id=user_id,
            level=1,
            experience_points=0,
            total_points=0,
            current_streak=0,
            best_streak=0,
            ranking_position=0
        )
        db.add(user_stats)
        db.commit()
        db.refresh(user_stats)
        return user_stats
    except Exception as e:
        logger.error(f"Erro ao criar estatísticas para usuário {user_id}: {e}")
        db.rollback()
        return None


def update_user_stats(db: Session, user_id: str, **kwargs) -> Optional[UserStats]:
    """
    Atualiza estatísticas do usuário
    """
    try:
        user_stats = get_user_stats(db, user_id)
        if not user_stats:
            user_stats = create_user_stats(db, user_id)
        
        if user_stats:
            for key, value in kwargs.items():
                if hasattr(user_stats, key):
                    setattr(user_stats, key, value)
            
            db.commit()
            db.refresh(user_stats)
        
        return user_stats
    except Exception as e:
        logger.error(f"Erro ao atualizar estatísticas do usuário {user_id}: {e}")
        db.rollback()
        return None


def get_user_achievements(db: Session, user_id: str) -> List[UserAchievement]:
    """
    Obtém conquistas do usuário
    """
    try:
        user_stats = get_user_stats(db, user_id)
        if not user_stats:
            return []
        
        return db.query(UserAchievement).filter(
            UserAchievement.user_stats_id == user_stats.id
        ).options(joinedload(UserAchievement.achievement)).all()
    except Exception as e:
        logger.error(f"Erro ao obter conquistas do usuário {user_id}: {e}")
        return []


def get_user_challenges(db: Session, user_id: str) -> List[UserChallenge]:
    """
    Obtém desafios do usuário
    """
    try:
        user_stats = get_user_stats(db, user_id)
        if not user_stats:
            return []
        
        return db.query(UserChallenge).filter(
            UserChallenge.user_stats_id == user_stats.id
        ).options(joinedload(UserChallenge.challenge)).all()
    except Exception as e:
        logger.error(f"Erro ao obter desafios do usuário {user_id}: {e}")
        return []


def get_communication_stats(db: Session, user_id: str) -> Optional[CommunicationStats]:
    """
    Obtém estatísticas de comunicação do usuário
    """
    try:
        return db.query(CommunicationStats).filter(
            CommunicationStats.user_id == user_id
        ).first()
    except Exception as e:
        logger.error(f"Erro ao obter estatísticas de comunicação do usuário {user_id}: {e}")
        return None


def update_communication_stats(db: Session, user_id: str, **kwargs) -> Optional[CommunicationStats]:
    """
    Atualiza estatísticas de comunicação do usuário
    """
    try:
        comm_stats = get_communication_stats(db, user_id)
        if not comm_stats:
            comm_stats = CommunicationStats(
                user_id=user_id,
                total_messages=0,
                messages_today=0,
                response_rate=0.0,
                avg_response_time=0,
                active_conversations=0
            )
            db.add(comm_stats)
        
        for key, value in kwargs.items():
            if hasattr(comm_stats, key):
                setattr(comm_stats, key, value)
        
        db.commit()
        db.refresh(comm_stats)
        return comm_stats
    except Exception as e:
        logger.error(f"Erro ao atualizar estatísticas de comunicação do usuário {user_id}: {e}")
        db.rollback()
        return None
    except Exception as e:
        logger.error(f"Erro inesperado ao buscar resumo de conversas para usuário {user_id}: {str(e)}")
        # Em caso de erro, retornar valores zerados para não quebrar o dashboard
        return {
            "open_conversations": 0,
            "needs_attention": 0,
            "total_active": 0
        }


def get_recent_messages(db: Session, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    """
    Busca mensagens recentes de todas as conversas do usuário para o CommunicationHub
    """
    try:
        # Buscar mensagens recentes com informações da conversa e contratante
        messages = db.query(Message).join(
            Conversation, Message.conversation_id == Conversation.id
        ).join(
            Contractor, Conversation.contractor_id == Contractor.id
        ).filter(
            Message.user_id == user_id
        ).order_by(
            Message.timestamp.desc()
        ).limit(limit).all()
        
        result = []
        for message in messages:
            # Determinar o tipo baseado no canal da conversa
            message_type = {
                'whatsapp': 'whatsapp',
                'email': 'email',
                'phone': 'call',
                'meeting': 'meeting'
            }.get(message.conversation.channel, 'whatsapp')
            
            # Determinar status baseado no sender_type
            status = 'read' if message.sender_type == 'contractor' else 'sent'
            
            # Determinar prioridade (placeholder - pode ser melhorado)
            priority = 'high' if message.sender_type == 'contractor' else 'medium'
            
            # Determinar se não foi lida (apenas mensagens do contratante)
            is_unread = message.sender_type == 'contractor'
            
            result.append({
                "id": str(message.id),
                "type": message_type,
                "contact": {
                    "name": message.conversation.contractor.name,
                    "type": "client"  # Placeholder - pode ser melhorado
                },
                "subject": None,  # WhatsApp não tem assunto
                "preview": message.content[:100] + "..." if len(message.content) > 100 else message.content,
                "timestamp": message.timestamp.isoformat(),
                "status": status,
                "priority": priority,
                "isUnread": is_unread,
                "hasAttachment": message.content_type != 'text',
                "conversation_id": str(message.conversation_id),
                "contractor_id": str(message.conversation.contractor_id)
            })
        
        return result
        
    except Exception as e:
        logger.error(f"Erro ao buscar mensagens recentes para usuário {user_id}: {e}")
        return []