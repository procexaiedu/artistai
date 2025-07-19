import os
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from jose import JWTError, jwt
from dotenv import load_dotenv

load_dotenv()

# Configuração do Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

if not all([SUPABASE_URL, SUPABASE_SERVICE_KEY]):
    raise ValueError("SUPABASE_URL e SUPABASE_SERVICE_KEY devem estar definidas no .env")

# Cliente Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Esquema de autenticação Bearer
security = HTTPBearer()

class User:
    def __init__(self, id: str, email: str, role: str = "authenticated"):
        self.id = id
        self.email = email
        self.role = role

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """
    Extrai e valida o token JWT do cabeçalho Authorization.
    Retorna os dados do usuário se o token for válido.
    """
    token = credentials.credentials
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token de acesso inválido",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verificar o token usando o Supabase
        response = supabase.auth.get_user(token)
        
        if not response.user:
            raise credentials_exception
            
        user = User(
            id=response.user.id,
            email=response.user.email or "",
            role=response.user.role or "authenticated"
        )
        
        return user
        
    except Exception as e:
        print(f"Erro ao validar token: {e}")
        raise credentials_exception

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[User]:
    """
    Versão opcional da autenticação - não levanta erro se não houver token.
    Útil para endpoints que podem funcionar com ou sem autenticação.
    """
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None 