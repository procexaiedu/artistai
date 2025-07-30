import uuid
from sqlalchemy import (
    Column,
    String,
    Integer,
    Numeric,
    Boolean,
    TIMESTAMP,
    ForeignKey,
    Text,
    Enum,
    Date
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base

# Definição dos ENUMs para uso nos modelos
# (Os nomes devem corresponder aos tipos criados no banco de dados)
artist_status_enum = Enum('active', 'inactive', name='artist_status')
document_type_enum = Enum('technical_rider', 'hospitality_rider', 'press_kit', name='document_type')
channel_type_enum = Enum('whatsapp', 'instagram_dm', 'telegram', name='channel_type')
conversation_status_enum = Enum('open', 'closed', 'needs_attention', name='conversation_status')
message_sender_type_enum = Enum('user', 'agent', name='message_sender_type')
message_content_type_enum = Enum('text', 'image', 'audio', 'document', name='message_content_type')
event_status_enum = Enum('pending_payment', 'confirmed', 'cancelled', name='event_status')
whatsapp_status_enum = Enum('pending', 'connected', 'disconnected', name='whatsapp_status')
transaction_type_enum = Enum('income', 'expense', name='transaction_type')
transaction_status_enum = Enum('pending', 'completed', 'cancelled', name='transaction_status')
financial_category_type_enum = Enum('income', 'expense', name='financial_category_type')
account_type_enum = Enum('checking', 'savings', 'credit_card', 'cash', name='account_type')
gamification_achievement_rarity_enum = Enum('common', 'rare', 'epic', 'legendary', name='achievement_rarity')
gamification_achievement_category_enum = Enum('sales', 'communication', 'events', 'growth', name='achievement_category')
gamification_challenge_type_enum = Enum('daily', 'weekly', 'monthly', name='challenge_type')
gamification_reward_type_enum = Enum('points', 'badge', 'feature', name='reward_type')


class Artist(Base):
    __tablename__ = "artists"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(255), nullable=False)  # ID do usuário do Supabase
    name = Column(String(255), nullable=False)
    photo_url = Column(Text)
    base_fee = Column(Numeric(10, 2), nullable=False, default=0.00)
    min_fee = Column(Numeric(10, 2), nullable=False, default=0.00)
    down_payment_percentage = Column(Integer, nullable=False, default=50)
    base_city = Column(String(255))
    status = Column(artist_status_enum, nullable=False, default='active')
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    
    documents = relationship("Document", back_populates="artist")
    events = relationship("Event", back_populates="artist")


class Document(Base):
    __tablename__ = "documents"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    artist_id = Column(UUID(as_uuid=True), ForeignKey("artists.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(document_type_enum, nullable=False)
    file_url = Column(Text, nullable=False)
    version = Column(Integer, nullable=False, default=1)
    uploaded_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    
    artist = relationship("Artist", back_populates="documents")


class Contractor(Base):
    __tablename__ = "contractors"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(255), nullable=False)  # ID do usuário do Supabase
    name = Column(String(255), nullable=False)
    cpf_cnpj = Column(String(18), unique=True)
    email = Column(String(255))
    phone = Column(String(20), nullable=False, unique=True)
    stage_id = Column(UUID(as_uuid=True), ForeignKey("pipeline_stages.id"), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    conversations = relationship("Conversation", back_populates="contractor")
    events = relationship("Event", back_populates="contractor")
    stage = relationship("PipelineStage", back_populates="contractors")
    notes = relationship("Note", back_populates="contractor")


class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(255), nullable=False)  # NOVA COLUNA
    contractor_id = Column(UUID(as_uuid=True), ForeignKey("contractors.id", ondelete="CASCADE"), nullable=False)
    channel = Column(channel_type_enum, nullable=False)
    status = Column(conversation_status_enum, nullable=False, default='open')
    last_message_at = Column(TIMESTAMP(timezone=True))
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    contractor = relationship("Contractor", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation")


class Message(Base):
    __tablename__ = "messages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(255), nullable=False)  # NOVA COLUNA
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    sender_type = Column(message_sender_type_enum, nullable=False)
    content_type = Column(message_content_type_enum, nullable=False)
    content = Column(Text, nullable=False)
    whatsapp_message_id = Column(String(255), unique=True)
    timestamp = Column(TIMESTAMP(timezone=True), nullable=False)

    conversation = relationship("Conversation", back_populates="messages")


class Event(Base):
    __tablename__ = "events"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(255), nullable=False)  # ID do usuário do Supabase
    artist_id = Column(UUID(as_uuid=True), ForeignKey("artists.id", ondelete="CASCADE"), nullable=False)
    contractor_id = Column(UUID(as_uuid=True), ForeignKey("contractors.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    event_date = Column(Date, nullable=False)
    event_location = Column(Text)
    agreed_fee = Column(Numeric(10, 2), nullable=False)
    status = Column(event_status_enum, nullable=False, default='pending_payment')
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    artist = relationship("Artist", back_populates="events")
    contractor = relationship("Contractor", back_populates="events")


class WhatsAppInstance(Base):
    __tablename__ = "whatsapp_instances"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, unique=True)  # One instance per user
    instance_name = Column(String(255), nullable=False, unique=True)
    api_key = Column(String(500), nullable=True)
    status = Column(whatsapp_status_enum, nullable=False, default='pending')
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())


class AgentSettings(Base):
    __tablename__ = "agent_settings"
    id = Column(Integer, primary_key=True, default=1)
    is_active = Column(Boolean, nullable=False, default=True)
    buffer_seconds = Column(Integer, nullable=False, default=5)
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())


class PipelineStage(Base):
    __tablename__ = "pipeline_stages"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    order = Column(Integer, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    
    contractors = relationship("Contractor", back_populates="stage")


class Note(Base):
    __tablename__ = "notes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(255), nullable=False)
    contractor_id = Column(UUID(as_uuid=True), ForeignKey("contractors.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    
    contractor = relationship("Contractor", back_populates="notes")


class FinancialAccount(Base):
    __tablename__ = "financial_accounts"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    account_type = Column(account_type_enum, nullable=False)
    bank_name = Column(String(255))
    account_number = Column(String(50))
    balance = Column(Numeric(15, 2), nullable=False, default=0.00)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    
    transactions = relationship("FinancialTransaction", back_populates="account")


class FinancialCategory(Base):
    __tablename__ = "financial_categories"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    category_type = Column(financial_category_type_enum, nullable=False)
    color = Column(String(7), default='#3B82F6')  # Hex color
    icon = Column(String(50), default='dollar-sign')
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    
    transactions = relationship("FinancialTransaction", back_populates="category")


class FinancialTransaction(Base):
    __tablename__ = "financial_transactions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(255), nullable=False)
    account_id = Column(UUID(as_uuid=True), ForeignKey("financial_accounts.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("financial_categories.id"), nullable=True)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=True)  # Link to events
    contractor_id = Column(UUID(as_uuid=True), ForeignKey("contractors.id"), nullable=True)  # Link to contractors
    
    transaction_type = Column(transaction_type_enum, nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    description = Column(Text, nullable=False)
    reference_number = Column(String(100))  # Invoice number, receipt, etc.
    transaction_date = Column(Date, nullable=False)
    due_date = Column(Date)  # For pending transactions
    status = Column(transaction_status_enum, nullable=False, default='completed')
    
    # Tax and business info
    is_tax_deductible = Column(Boolean, default=False)
    tax_category = Column(String(100))  # For tax reporting
    notes = Column(Text)
    
    # Metadata
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    account = relationship("FinancialAccount", back_populates="transactions")
    category = relationship("FinancialCategory", back_populates="transactions")
    event = relationship("Event")
    contractor = relationship("Contractor")


class FinancialGoal(Base):
    __tablename__ = "financial_goals"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    target_amount = Column(Numeric(15, 2), nullable=False)
    current_amount = Column(Numeric(15, 2), nullable=False, default=0.00)
    target_date = Column(Date)
    category_id = Column(UUID(as_uuid=True), ForeignKey("financial_categories.id"), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    
    category = relationship("FinancialCategory")


class FinancialBudget(Base):
    __tablename__ = "financial_budgets"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(255), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("financial_categories.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    budget_amount = Column(Numeric(15, 2), nullable=False)
    spent_amount = Column(Numeric(15, 2), nullable=False, default=0.00)
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    alert_threshold = Column(Integer, default=80)  # Alert when 80% spent
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    
    category = relationship("FinancialCategory")


# Modelos de Gamificação
class UserStats(Base):
    __tablename__ = "user_stats"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(255), nullable=False, unique=True)
    level = Column(Integer, default=1)
    experience_points = Column(Integer, default=0)
    total_points = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    ranking_position = Column(Integer, default=0)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    achievements = relationship("UserAchievement", back_populates="user_stats")
    challenges = relationship("UserChallenge", back_populates="user_stats")


class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    icon = Column(String(255))
    rarity = Column(gamification_achievement_rarity_enum, default='common')
    category = Column(gamification_achievement_category_enum, nullable=False)
    points_reward = Column(Integer, default=0)
    requirements = Column(Text)  # JSON string for requirements
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    user_achievements = relationship("UserAchievement", back_populates="achievement")


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_stats_id = Column(UUID(as_uuid=True), ForeignKey("user_stats.id"), nullable=False)
    achievement_id = Column(UUID(as_uuid=True), ForeignKey("achievements.id"), nullable=False)
    unlocked_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    progress = Column(Integer, default=0)

    user_stats = relationship("UserStats", back_populates="achievements")
    achievement = relationship("Achievement", back_populates="user_achievements")


class Challenge(Base):
    __tablename__ = "challenges"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    challenge_type = Column(gamification_challenge_type_enum, nullable=False)
    target_value = Column(Integer, nullable=False)
    points_reward = Column(Integer, default=0)
    start_date = Column(TIMESTAMP(timezone=True), nullable=False)
    end_date = Column(TIMESTAMP(timezone=True), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    user_challenges = relationship("UserChallenge", back_populates="challenge")


class UserChallenge(Base):
    __tablename__ = "user_challenges"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_stats_id = Column(UUID(as_uuid=True), ForeignKey("user_stats.id"), nullable=False)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("challenges.id"), nullable=False)
    current_progress = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    completed_at = Column(TIMESTAMP(timezone=True), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    user_stats = relationship("UserStats", back_populates="challenges")
    challenge = relationship("Challenge", back_populates="user_challenges")


class CommunicationStats(Base):
    __tablename__ = "communication_stats"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(255), nullable=False, unique=True)
    total_messages = Column(Integer, default=0)
    messages_today = Column(Integer, default=0)
    response_rate = Column(Numeric(5, 2), default=0.00)
    avg_response_time = Column(Integer, default=0)
    active_conversations = Column(Integer, default=0)
    last_activity = Column(TIMESTAMP(timezone=True), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())