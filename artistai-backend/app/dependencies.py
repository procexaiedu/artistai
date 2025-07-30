import os
from pathlib import Path
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from jose import JWTError, jwt
from dotenv import load_dotenv

# Carrega as variáveis de ambiente do arquivo .env
# Especifica o caminho absoluto para o arquivo .env
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

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
        # Verificar o token usando JWT direto
        if not SUPABASE_JWT_SECRET:
            print("SUPABASE_JWT_SECRET não está definido")
            raise credentials_exception
            
        print(f"Token recebido: {token[:50]}...")
        print(f"JWT Secret disponível: {bool(SUPABASE_JWT_SECRET)}")
        
        payload = jwt.decode(
            token, 
            SUPABASE_JWT_SECRET, 
            algorithms=["HS256"],
            audience="authenticated"
        )
        
        print(f"Payload decodificado: {payload}")
        
        user_id = payload.get("sub")
        email = payload.get("email")
        role = payload.get("role", "authenticated")
        
        if not user_id:
            print("user_id não encontrado no payload")
            raise credentials_exception
            
        user = User(
            id=user_id,
            email=email or "",
            role=role
        )
        
        print(f"Usuário autenticado: {user.id} - {user.email}")
        return user
        
    except JWTError as e:
        print(f"Erro JWT: {e}")
        print(f"Tipo do erro: {type(e)}")
        raise credentials_exception
    except Exception as e:
        print(f"Erro ao validar token: {e}")
        print(f"Tipo do erro: {type(e)}")
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