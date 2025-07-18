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


class Artist(Base):
    __tablename__ = "artists"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
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
    name = Column(String(255), nullable=False)
    cpf_cnpj = Column(String(18), unique=True)
    email = Column(String(255))
    phone = Column(String(20), nullable=False, unique=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    conversations = relationship("Conversation", back_populates="contractor")
    events = relationship("Event", back_populates="contractor")


class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
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
    artist_id = Column(UUID(as_uuid=True), ForeignKey("artists.id"), nullable=False)
    contractor_id = Column(UUID(as_uuid=True), ForeignKey("contractors.id"), nullable=False)
    title = Column(String(255), nullable=False)
    event_date = Column(Date, nullable=False)
    event_location = Column(Text)
    agreed_fee = Column(Numeric(10, 2), nullable=False)
    status = Column(event_status_enum, nullable=False, default='pending_payment')
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    artist = relationship("Artist", back_populates="events")
    contractor = relationship("Contractor", back_populates="events")


class AgentSettings(Base):
    __tablename__ = "agent_settings"
    id = Column(Integer, primary_key=True, default=1)
    is_active = Column(Boolean, nullable=False, default=True)
    buffer_seconds = Column(Integer, nullable=False, default=5)
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())