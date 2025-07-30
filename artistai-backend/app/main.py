import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import artists, contractors, events, conversations, whatsapp, stages, notes, financial, dashboard

app = FastAPI(title="artistAI API", version="1.0.0")

# Configurar CORS para desenvolvimento e produção
allowed_origins = [
    "http://localhost:3000",  # Frontend Next.js local
    "http://localhost:3001",  # Frontend Next.js local (porta alternativa)
    "https://*.vercel.app",   # Vercel deployments
    "https://artistai-frontend.vercel.app",  # Production frontend
]

# Adicionar origem personalizada se definida
if frontend_url := os.getenv("FRONTEND_URL"):
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir o router de artistas
app.include_router(
    artists.router,
    prefix="/api/v1",
    tags=["Artistas"]
)

# Incluir o router de contratantes
app.include_router(
    contractors.router,
    prefix="/api/v1",
    tags=["Contratantes"]
)

# Incluir o router de eventos
app.include_router(
    events.router,
    prefix="/api/v1",
    tags=["Eventos"]
)

# Incluir o router de conversas
app.include_router(
    conversations.router,
    prefix="/api/v1",
    tags=["Conversas"]
)

# Incluir o router de WhatsApp
app.include_router(
    whatsapp.router,
    prefix="/api/v1/whatsapp",
    tags=["WhatsApp"]
)

# Incluir o router de etapas do pipeline
app.include_router(
    stages.router,
    prefix="/api/v1",
    tags=["Pipeline Stages"]
)

# Incluir o router de anotações
app.include_router(
    notes.router,
    prefix="/api/v1",
    tags=["Anotações"]
)

# Incluir o router financeiro
app.include_router(
    financial.router,
    prefix="/api/v1/financial",
    tags=["Gestão Financeira"]
)

# Incluir o router de dashboard
app.include_router(
    dashboard.router,
    prefix="/api/v1/dashboard",
    tags=["Dashboard"]
)

@app.get("/", tags=["Health Check"])
def read_root():
    """Endpoint para verificar se a API está online."""
    return {"message": "artistAI Backend is running!", "version": "1.0.0"}

@app.get("/health", tags=["Health Check"])
def health_check():
    """Endpoint de health check para Docker e monitoramento."""
    return {"status": "healthy", "service": "artistAI Backend"}