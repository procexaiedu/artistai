from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user, User
from ..crud import crud_dashboard
from ..schemas import (
    MainDashboard, DashboardKPIs, PipelineSummaryItem,
    FinancialSummaryDashboard, RecentActivity, UpcomingEventSummary,
    ConversationsSummary
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/kpis", response_model=DashboardKPIs)
def get_dashboard_kpis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter KPIs principais do dashboard."""
    try:
        kpis_data = crud_dashboard.get_kpis(db=db, user_id=current_user.id)
        return DashboardKPIs(**kpis_data)
    except Exception as e:
        logger.error(f"Erro ao buscar KPIs para usuário {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor ao buscar KPIs do dashboard"
        )


@router.get("/pipeline-summary", response_model=List[PipelineSummaryItem])
def get_pipeline_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter resumo do pipeline de vendas."""
    try:
        pipeline_data = crud_dashboard.get_pipeline_summary(db=db, user_id=current_user.id)
        return [PipelineSummaryItem(**item) for item in pipeline_data]
    except Exception as e:
        logger.error(f"Erro ao buscar resumo do pipeline para usuário {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor ao buscar resumo do pipeline"
        )


@router.get("/financial-summary", response_model=FinancialSummaryDashboard)
def get_financial_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter resumo financeiro do mês."""
    try:
        financial_data = crud_dashboard.get_financial_summary(db=db, user_id=current_user.id)
        return FinancialSummaryDashboard(**financial_data)
    except Exception as e:
        logger.error(f"Erro ao buscar resumo financeiro para usuário {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor ao buscar resumo financeiro"
        )


@router.get("/recent-activities", response_model=list[RecentActivity])
def get_recent_activities(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Obter atividades recentes."""
    try:
        activities_data = crud_dashboard.get_recent_activities(db=db, user_id=current_user.id)
        return [RecentActivity(**activity) for activity in activities_data]
    except Exception as e:
        logger.error(f"Erro ao buscar atividades recentes para usuário {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor ao buscar atividades recentes"
        )


@router.get("/upcoming-events", response_model=list[UpcomingEventSummary])
def get_upcoming_events(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Obter próximos eventos."""
    try:
        events_data = crud_dashboard.get_upcoming_events(db=db, user_id=current_user.id)
        return [UpcomingEventSummary(**event) for event in events_data]
    except Exception as e:
        logger.error(f"Erro ao buscar eventos futuros para usuário {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor ao buscar eventos futuros"
        )


@router.get("/conversations-summary", response_model=ConversationsSummary)
def get_conversations_summary(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Obter resumo das conversas."""
    try:
        conversations_data = crud_dashboard.get_conversations_summary(db=db, user_id=current_user.id)
        return ConversationsSummary(**conversations_data)
    except Exception as e:
        logger.error(f"Erro ao buscar resumo de conversas para usuário {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor ao buscar resumo de conversas"
        )


@router.get("/", response_model=MainDashboard)
def get_main_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Obter todos os dados do dashboard principal."""
    try:
        user_id = current_user.id
        
        # Buscar todos os dados necessários
        kpis_data = crud_dashboard.get_kpis(db=db, user_id=user_id)
        pipeline_data = crud_dashboard.get_pipeline_summary(db=db, user_id=user_id)
        financial_data = crud_dashboard.get_financial_summary(db=db, user_id=user_id)
        activities_data = crud_dashboard.get_recent_activities(db=db, user_id=user_id)
        events_data = crud_dashboard.get_upcoming_events(db=db, user_id=user_id)
        conversations_data = crud_dashboard.get_conversations_summary(db=db, user_id=user_id)
        
        return MainDashboard(
            kpis=DashboardKPIs(**kpis_data),
            pipeline_summary=[PipelineSummaryItem(**item) for item in pipeline_data],
            financial_summary=FinancialSummaryDashboard(**financial_data),
            recent_activities=[RecentActivity(**activity) for activity in activities_data],
            upcoming_events=[UpcomingEventSummary(**event) for event in events_data],
            conversations_summary=ConversationsSummary(**conversations_data)
        )
    except Exception as e:
        logger.error(f"Erro ao buscar dashboard principal para usuário {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Erro interno do servidor ao carregar dashboard principal"
        )


@router.get("/conversation-summary")
def get_conversation_summary_endpoint(db: Session = Depends(get_db)):
    """
    Endpoint para obter resumo das conversas
    """
    try:
        summary = crud_dashboard.get_conversation_summary(db)
        return summary
    except Exception as e:
        logger.error(f"Erro no endpoint de resumo de conversas: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/gamification/user-stats/{user_id}")
def get_user_stats_endpoint(user_id: str, db: Session = Depends(get_db)):
    """
    Endpoint para obter estatísticas de gamificação do usuário
    """
    try:
        user_stats = crud_dashboard.get_user_stats(db, user_id)
        if not user_stats:
            # Criar estatísticas iniciais se não existirem
            user_stats = crud_dashboard.create_user_stats(db, user_id)
        
        if not user_stats:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        return {
            "level": user_stats.level,
            "experience_points": user_stats.experience_points,
            "total_points": user_stats.total_points,
            "current_streak": user_stats.current_streak,
            "best_streak": user_stats.best_streak,
            "ranking_position": user_stats.ranking_position
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no endpoint de estatísticas do usuário {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/gamification/achievements/{user_id}")
def get_user_achievements_endpoint(user_id: str, db: Session = Depends(get_db)):
    """
    Endpoint para obter conquistas do usuário
    """
    try:
        achievements = crud_dashboard.get_user_achievements(db, user_id)
        
        return {
            "achievements": [
                {
                    "id": str(ua.achievement.id),
                    "name": ua.achievement.name,
                    "description": ua.achievement.description,
                    "icon": ua.achievement.icon,
                    "rarity": ua.achievement.rarity,
                    "category": ua.achievement.category,
                    "points_reward": ua.achievement.points_reward,
                    "progress": ua.progress,
                    "unlocked_at": ua.unlocked_at.isoformat() if ua.unlocked_at else None,
                    "unlocked": ua.progress >= 100
                }
                for ua in achievements if ua.achievement
            ]
        }
    except Exception as e:
        logger.error(f"Erro no endpoint de conquistas do usuário {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/gamification/challenges/{user_id}")
def get_user_challenges_endpoint(user_id: str, db: Session = Depends(get_db)):
    """
    Endpoint para obter desafios do usuário
    """
    try:
        challenges = crud_dashboard.get_user_challenges(db, user_id)
        
        return {
            "challenges": [
                {
                    "id": str(uc.challenge.id),
                    "name": uc.challenge.name,
                    "description": uc.challenge.description,
                    "type": uc.challenge.challenge_type,
                    "target_value": uc.challenge.target_value,
                    "current_progress": uc.current_progress,
                    "points_reward": uc.challenge.points_reward,
                    "progress_percentage": min(100, (uc.current_progress / uc.challenge.target_value) * 100),
                    "is_completed": uc.is_completed,
                    "completed_at": uc.completed_at.isoformat() if uc.completed_at else None,
                    "end_date": uc.challenge.end_date.isoformat()
                }
                for uc in challenges if uc.challenge
            ]
        }
    except Exception as e:
        logger.error(f"Erro no endpoint de desafios do usuário {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/communication/stats/{user_id}")
def get_communication_stats_endpoint(user_id: str, db: Session = Depends(get_db)):
    """
    Endpoint para obter estatísticas de comunicação do usuário
    """
    try:
        comm_stats = crud_dashboard.get_communication_stats(db, user_id)
        
        if not comm_stats:
            # Criar estatísticas iniciais se não existirem
            comm_stats = crud_dashboard.update_communication_stats(db, user_id)
        
        if not comm_stats:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        
        return {
            "total_messages": comm_stats.total_messages,
            "messages_today": comm_stats.messages_today,
            "response_rate": float(comm_stats.response_rate),
            "avg_response_time": comm_stats.avg_response_time,
            "active_conversations": comm_stats.active_conversations,
            "last_activity": comm_stats.last_activity.isoformat() if comm_stats.last_activity else None
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro no endpoint de estatísticas de comunicação do usuário {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")


@router.get("/communication/messages/{user_id}")
def get_recent_messages_endpoint(user_id: str, limit: int = 20, db: Session = Depends(get_db)):
    """
    Endpoint para obter mensagens recentes do usuário para o CommunicationHub
    """
    try:
        messages = crud_dashboard.get_recent_messages(db, user_id, limit)
        return {"messages": messages}
    except Exception as e:
        logger.error(f"Erro no endpoint de mensagens recentes do usuário {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Erro interno do servidor")