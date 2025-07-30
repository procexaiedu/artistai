import uuid
from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel


class ArtistBase(BaseModel):
    name: str
    photo_url: Optional[str] = None
    base_fee: float
    min_fee: float
    down_payment_percentage: int
    base_city: Optional[str] = None
    status: Optional[str] = 'active'


class ArtistCreate(ArtistBase):
    pass


class ArtistUpdate(ArtistBase):
    name: Optional[str] = None
    photo_url: Optional[str] = None
    base_fee: Optional[float] = None
    min_fee: Optional[float] = None
    down_payment_percentage: Optional[int] = None
    base_city: Optional[str] = None
    status: Optional[str] = None


class Artist(ArtistBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Schemas para Contratantes
class ContractorBase(BaseModel):
    name: str
    cpf_cnpj: Optional[str] = None
    email: Optional[str] = None
    phone: str


class ContractorCreate(ContractorBase):
    pass


class ContractorUpdate(ContractorBase):
    name: Optional[str] = None
    cpf_cnpj: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    stage_id: Optional[uuid.UUID] = None


class Contractor(ContractorBase):
    id: uuid.UUID
    stage_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Schemas para Eventos
class EventBase(BaseModel):
    title: str
    event_date: date
    event_location: Optional[str] = None
    agreed_fee: float
    status: str = "pending_payment"


class EventCreate(EventBase):
    artist_id: uuid.UUID
    contractor_id: uuid.UUID


class EventUpdate(EventBase):
    title: Optional[str] = None
    event_date: Optional[date] = None
    event_location: Optional[str] = None
    agreed_fee: Optional[float] = None
    status: Optional[str] = None
    artist_id: Optional[uuid.UUID] = None
    contractor_id: Optional[uuid.UUID] = None


class Event(EventBase):
    id: uuid.UUID
    artist_id: uuid.UUID
    contractor_id: uuid.UUID
    created_at: datetime
    artist: Artist
    contractor: Contractor
    
    class Config:
        from_attributes = True


# Schemas para Conversas
class ConversationBase(BaseModel):
    channel: str
    status: str = "open"


class ConversationCreate(ConversationBase):
    contractor_id: uuid.UUID


class ConversationUpdate(ConversationBase):
    channel: Optional[str] = None
    status: Optional[str] = None
    contractor_id: Optional[uuid.UUID] = None


class Conversation(ConversationBase):
    id: uuid.UUID
    user_id: str
    contractor_id: uuid.UUID
    last_message_at: Optional[datetime] = None
    created_at: datetime
    contractor: Contractor
    
    class Config:
        from_attributes = True


# Schemas para Mensagens
class MessageBase(BaseModel):
    sender_type: str
    content_type: str = "text"
    content: str


class MessageCreate(MessageBase):
    conversation_id: uuid.UUID
    timestamp: Optional[datetime] = None


class MessageUpdate(MessageBase):
    sender_type: Optional[str] = None
    content_type: Optional[str] = None
    content: Optional[str] = None


class Message(MessageBase):
    id: uuid.UUID
    user_id: str
    conversation_id: uuid.UUID
    whatsapp_message_id: Optional[str] = None
    timestamp: datetime
    
    class Config:
        from_attributes = True


# Esquemas para Gamificação
class UserStatsBase(BaseModel):
    user_id: str
    level: int = 1
    experience_points: int = 0
    total_points: int = 0
    current_streak: int = 0
    best_streak: int = 0
    ranking_position: int = 0

class UserStatsCreate(UserStatsBase):
    pass

class UserStatsUpdate(BaseModel):
    level: Optional[int] = None
    experience_points: Optional[int] = None
    total_points: Optional[int] = None
    current_streak: Optional[int] = None
    best_streak: Optional[int] = None
    ranking_position: Optional[int] = None

class UserStats(UserStatsBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AchievementBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    rarity: str = "common"
    category: str
    points_reward: int = 0
    requirements: Optional[str] = None
    is_active: bool = True

class AchievementCreate(AchievementBase):
    pass

class AchievementUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    rarity: Optional[str] = None
    category: Optional[str] = None
    points_reward: Optional[int] = None
    requirements: Optional[str] = None
    is_active: Optional[bool] = None

class Achievement(AchievementBase):
    id: uuid.UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserAchievementBase(BaseModel):
    user_stats_id: uuid.UUID
    achievement_id: uuid.UUID
    progress: int = 0

class UserAchievementCreate(UserAchievementBase):
    pass

class UserAchievementUpdate(BaseModel):
    progress: Optional[int] = None

class UserAchievement(UserAchievementBase):
    id: uuid.UUID
    unlocked_at: datetime
    achievement: Optional[Achievement] = None
    
    class Config:
        from_attributes = True


class ChallengeBase(BaseModel):
    name: str
    description: Optional[str] = None
    challenge_type: str
    target_value: int
    points_reward: int = 0
    start_date: datetime
    end_date: datetime
    is_active: bool = True

class ChallengeCreate(ChallengeBase):
    pass

class ChallengeUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    challenge_type: Optional[str] = None
    target_value: Optional[int] = None
    points_reward: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_active: Optional[bool] = None

class Challenge(ChallengeBase):
    id: uuid.UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserChallengeBase(BaseModel):
    user_stats_id: uuid.UUID
    challenge_id: uuid.UUID
    current_progress: int = 0
    is_completed: bool = False

class UserChallengeCreate(UserChallengeBase):
    pass

class UserChallengeUpdate(BaseModel):
    current_progress: Optional[int] = None
    is_completed: Optional[bool] = None
    completed_at: Optional[datetime] = None

class UserChallenge(UserChallengeBase):
    id: uuid.UUID
    completed_at: Optional[datetime] = None
    created_at: datetime
    challenge: Optional[Challenge] = None
    
    class Config:
        from_attributes = True


class CommunicationStatsBase(BaseModel):
    user_id: str
    total_messages: int = 0
    messages_today: int = 0
    response_rate: float = 0.0
    avg_response_time: int = 0
    active_conversations: int = 0
    last_activity: Optional[datetime] = None

class CommunicationStatsCreate(CommunicationStatsBase):
    pass

class CommunicationStatsUpdate(BaseModel):
    total_messages: Optional[int] = None
    messages_today: Optional[int] = None
    response_rate: Optional[float] = None
    avg_response_time: Optional[int] = None
    active_conversations: Optional[int] = None
    last_activity: Optional[datetime] = None

class CommunicationStats(CommunicationStatsBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Schema para endpoint de ingressão
class IngressMessage(BaseModel):
    from_phone: str
    to_phone: str
    content: str
    content_type: str = "text"
    channel: str = "whatsapp"
    whatsapp_message_id: Optional[str] = None
    timestamp: Optional[datetime] = None


# Schemas para WhatsApp Instances
class WhatsAppInstanceBase(BaseModel):
    instance_name: str
    status: str = "pending"


class WhatsAppInstanceCreate(WhatsAppInstanceBase):
    pass


class WhatsAppInstanceUpdate(BaseModel):
    api_key: Optional[str] = None
    status: Optional[str] = None


class WhatsAppInstance(WhatsAppInstanceBase):
    id: uuid.UUID
    user_id: uuid.UUID
    api_key: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Schema para resposta de conexão WhatsApp
class WhatsAppConnectionResponse(BaseModel):
    success: bool
    message: str
    qr_code: Optional[str] = None
    instance_name: Optional[str] = None
    already_connected: Optional[bool] = False


# Schema para status da instância WhatsApp
class WhatsAppStatusResponse(BaseModel):
    instance_name: str
    status: str
    connected: bool


# Schemas para Pipeline Stages
class PipelineStageBase(BaseModel):
    name: str
    order: int


class PipelineStageCreate(PipelineStageBase):
    pass


class PipelineStageUpdate(BaseModel):
    name: Optional[str] = None
    order: Optional[int] = None


class PipelineStage(PipelineStageBase):
    id: uuid.UUID
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Schemas para Notes
class NoteBase(BaseModel):
    content: str


class NoteCreate(NoteBase):
    contractor_id: uuid.UUID


class NoteUpdate(BaseModel):
    content: Optional[str] = None


class Note(NoteBase):
    id: uuid.UUID
    user_id: str
    contractor_id: uuid.UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


# Schema para Contractor com stage e notes
class ContractorWithDetails(Contractor):
    stage: Optional[PipelineStage] = None
    notes: Optional[list[Note]] = None
    
    class Config:
        from_attributes = True


# Schemas para Financial Accounts
class FinancialAccountBase(BaseModel):
    name: str
    account_type: str
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    balance: float = 0.00
    is_active: bool = True


class FinancialAccountCreate(FinancialAccountBase):
    pass


class FinancialAccountUpdate(BaseModel):
    name: Optional[str] = None
    account_type: Optional[str] = None
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    balance: Optional[float] = None
    is_active: Optional[bool] = None


class FinancialAccount(FinancialAccountBase):
    id: uuid.UUID
    user_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Schemas para Financial Categories
class FinancialCategoryBase(BaseModel):
    name: str
    category_type: str
    color: str = '#3B82F6'
    icon: str = 'dollar-sign'
    is_active: bool = True


class FinancialCategoryCreate(FinancialCategoryBase):
    pass


class FinancialCategoryUpdate(BaseModel):
    name: Optional[str] = None
    category_type: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    is_active: Optional[bool] = None


class FinancialCategory(FinancialCategoryBase):
    id: uuid.UUID
    user_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Schemas para Financial Transactions
class FinancialTransactionBase(BaseModel):
    account_id: uuid.UUID
    category_id: Optional[uuid.UUID] = None
    event_id: Optional[uuid.UUID] = None
    contractor_id: Optional[uuid.UUID] = None
    transaction_type: str
    amount: float
    description: str
    reference_number: Optional[str] = None
    transaction_date: date
    due_date: Optional[date] = None
    status: str = 'completed'
    is_tax_deductible: bool = False
    tax_category: Optional[str] = None
    notes: Optional[str] = None


class FinancialTransactionCreate(FinancialTransactionBase):
    pass


class FinancialTransactionUpdate(BaseModel):
    account_id: Optional[uuid.UUID] = None
    category_id: Optional[uuid.UUID] = None
    event_id: Optional[uuid.UUID] = None
    contractor_id: Optional[uuid.UUID] = None
    transaction_type: Optional[str] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    reference_number: Optional[str] = None
    transaction_date: Optional[date] = None
    due_date: Optional[date] = None
    status: Optional[str] = None
    is_tax_deductible: Optional[bool] = None
    tax_category: Optional[str] = None
    notes: Optional[str] = None


class FinancialTransaction(FinancialTransactionBase):
    id: uuid.UUID
    user_id: str
    created_at: datetime
    updated_at: datetime
    account: Optional[FinancialAccount] = None
    category: Optional[FinancialCategory] = None
    event: Optional[Event] = None
    contractor: Optional[Contractor] = None
    
    class Config:
        from_attributes = True


# Schemas para Financial Goals
class FinancialGoalBase(BaseModel):
    name: str
    target_amount: float
    current_amount: float = 0.00
    target_date: Optional[date] = None
    category_id: Optional[uuid.UUID] = None
    is_active: bool = True


class FinancialGoalCreate(FinancialGoalBase):
    pass


class FinancialGoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    target_date: Optional[date] = None
    category_id: Optional[uuid.UUID] = None
    is_active: Optional[bool] = None


class FinancialGoal(FinancialGoalBase):
    id: uuid.UUID
    user_id: str
    created_at: datetime
    updated_at: datetime
    category: Optional[FinancialCategory] = None
    
    class Config:
        from_attributes = True


# Schemas para Financial Budgets
class FinancialBudgetBase(BaseModel):
    category_id: uuid.UUID
    name: str
    budget_amount: float
    spent_amount: float = 0.00
    period_start: date
    period_end: date
    alert_threshold: int = 80
    is_active: bool = True


class FinancialBudgetCreate(FinancialBudgetBase):
    pass


class FinancialBudgetUpdate(BaseModel):
    category_id: Optional[uuid.UUID] = None
    name: Optional[str] = None
    budget_amount: Optional[float] = None
    spent_amount: Optional[float] = None
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    alert_threshold: Optional[int] = None
    is_active: Optional[bool] = None


class FinancialBudget(FinancialBudgetBase):
    id: uuid.UUID
    user_id: str
    created_at: datetime
    updated_at: datetime
    category: FinancialCategory
    
    class Config:
        from_attributes = True


# Schemas para Analytics e Relatórios
class FinancialSummary(BaseModel):
    total_income: float
    total_expenses: float
    net_income: float
    pending_income: float
    pending_expenses: float
    period_start: date
    period_end: date


class CategorySummary(BaseModel):
    category_id: uuid.UUID
    category_name: str
    category_type: str
    total_amount: float
    transaction_count: int
    percentage_of_total: float


class MonthlyTrend(BaseModel):
    month: str
    year: int
    income: float
    expenses: float
    net: float


class FinancialAnalytics(BaseModel):
    summary: FinancialSummary
    categories: List[CategorySummary]
    monthly_trends: List[MonthlyTrend]
    top_expenses: List[FinancialTransaction]
    recent_transactions: List[FinancialTransaction]


# Schema para Dashboard Financeiro
class FinancialDashboard(BaseModel):
    accounts: List[FinancialAccount]
    recent_transactions: List[FinancialTransaction]
    monthly_summary: FinancialSummary
    active_goals: List[FinancialGoal]
    budget_alerts: List[FinancialBudget]
    cash_flow_prediction: List[MonthlyTrend]


# Schemas para Dashboard Principal
class DashboardKPIs(BaseModel):
    active_artists_count: int
    active_leads_count: int
    upcoming_events_count: int
    monthly_revenue: float


class PipelineSummaryItem(BaseModel):
    stage_name: str
    contractor_count: int
    stage_id: Optional[str] = None


class FinancialSummaryDashboard(BaseModel):
    monthly_income: float
    monthly_expenses: float
    net_income: float


class RecentActivity(BaseModel):
    type: str
    title: str
    description: str
    timestamp: datetime
    icon: str


class UpcomingEventSummary(BaseModel):
    id: str
    title: str
    event_date: str
    event_location: Optional[str] = None
    agreed_fee: float
    status: str
    days_until: int
    artist_name: Optional[str] = None
    contractor_name: Optional[str] = None


class ConversationsSummary(BaseModel):
    open_conversations: int
    needs_attention: int
    total_active: int


class MainDashboard(BaseModel):
    kpis: DashboardKPIs
    pipeline_summary: List[PipelineSummaryItem]
    financial_summary: FinancialSummaryDashboard
    recent_activities: List[RecentActivity]
    upcoming_events: List[UpcomingEventSummary]
    conversations_summary: ConversationsSummary