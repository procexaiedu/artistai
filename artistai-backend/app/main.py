from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import artists, contractors, events

app = FastAPI(title="artistAI API")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend Next.js
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

@app.get("/", tags=["Health Check"])
def read_root():
    """Endpoint para verificar se a API está online."""
    return {"message": "artistAI Backend is running!"}