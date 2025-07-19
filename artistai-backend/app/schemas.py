import uuid
from datetime import datetime, date
from typing import Optional
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


class Contractor(ContractorBase):
    id: uuid.UUID
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