from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user, User
from app.services import whatsapp_service

router = APIRouter()




@router.post("/connect")
async def connect_whatsapp(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Conecta o WhatsApp do usuário."""
    try:
        result = await whatsapp_service.connect(current_user.id, db)
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"[DEBUG] Erro inesperado ao conectar WhatsApp: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.get("/status")
async def get_whatsapp_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verifica o status da conexão WhatsApp do usuário."""
    try:
        result = await whatsapp_service.get_status(current_user.id, db)
        return result
    except Exception as e:
        print(f"[DEBUG] Erro ao verificar status do WhatsApp: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.post("/reconnect")
async def reconnect_whatsapp(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Força a reconexão do WhatsApp do usuário."""
    try:
        result = await whatsapp_service.reconnect(current_user.id, db)
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"[DEBUG] Erro ao reconectar WhatsApp: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )


@router.delete("/disconnect")
async def disconnect_whatsapp(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Desconecta o WhatsApp do usuário."""
    try:
        result = await whatsapp_service.disconnect(current_user.id, db)
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"[DEBUG] Erro ao desconectar WhatsApp: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erro interno do servidor"
        )