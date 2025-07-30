import asyncio
from typing import Dict, Any
from sqlalchemy.orm import Session

from .evolution_api import evolution_service
from .. import crud_whatsapp

class WhatsAppService:
    """Serviço simplificado para operações WhatsApp"""
    
    def __init__(self):
        self.evolution = evolution_service
    
    async def connect(self, user_id: str, db: Session) -> Dict[str, Any]:
        """Conecta ao WhatsApp e retorna o QR code"""
        try:
            # Nome simples da instância
            instance_name = f"user_{user_id[:8]}"
            
            # Limpa instância existente
            await self._cleanup_existing_instance(user_id, instance_name, db)
            
            # Cria nova instância
            evolution_response = await self.evolution.create_instance(instance_name)
            
            # Extrai QR code
            qr_code = self._extract_qr_code(evolution_response)
            
            # Se não obteve QR code na criação, tenta via endpoint connect
            if not qr_code:
                qr_response = await self.evolution.get_qr_code(instance_name)
                qr_code = qr_response.get("base64")
            
            # Salva no banco
            api_key = evolution_response.get("hash")
            crud_whatsapp.create_whatsapp_instance(
                db=db,
                user_id=user_id,
                instance_name=instance_name,
                api_key=api_key
            )
            
            return {
                'success': True,
                'qr_code': qr_code,
                'instance_name': instance_name,
                'message': 'QR Code gerado com sucesso'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': 'Erro ao conectar ao WhatsApp'
            }
    
    async def get_status(self, user_id: str, db: Session) -> Dict[str, Any]:
        """Verifica o status da conexão WhatsApp"""
        instance = crud_whatsapp.get_whatsapp_instance_by_user_id(db, user_id)
        if not instance:
            raise ValueError("Nenhuma instância encontrada")
        
        try:
            evolution_status = await self.evolution.get_instance_status(instance.instance_name)
            is_connected = evolution_status.get("state") == "open"
            
            # Atualiza status no banco
            new_status = "connected" if is_connected else "disconnected"
            if instance.status != new_status:
                from .. import schemas
                crud_whatsapp.update_whatsapp_instance_by_user_id(
                    db=db,
                    user_id=user_id,
                    update_data=schemas.WhatsAppInstanceUpdate(status=new_status)
                )
            
            return {
                'instance_name': instance.instance_name,
                'status': new_status,
                'connected': is_connected
            }
            
        except Exception:
            return {
                'instance_name': instance.instance_name,
                'status': instance.status,
                'connected': instance.status == "connected"
            }
    
    async def reconnect(self, user_id: str, db: Session) -> Dict[str, Any]:
        """Força a reconexão do WhatsApp"""
        # Remove instância existente
        existing_instance = crud_whatsapp.get_whatsapp_instance_by_user_id(db, user_id)
        if existing_instance:
            await self.evolution.delete_instance(existing_instance.instance_name)
            crud_whatsapp.delete_whatsapp_instance_by_user_id(db, user_id)
        
        # Conecta novamente
        return await self.connect(user_id, db)
    
    async def disconnect(self, user_id: str, db: Session) -> Dict[str, str]:
        """Desconecta e remove a instância WhatsApp"""
        instance = crud_whatsapp.get_whatsapp_instance_by_user_id(db, user_id)
        if not instance:
            raise ValueError("Nenhuma instância encontrada")
        
        try:
            await self.evolution.delete_instance(instance.instance_name)
        except Exception:
            pass  # Continua mesmo se falhar na Evolution API
        
        crud_whatsapp.delete_whatsapp_instance_by_user_id(db, user_id)
        return {"message": "Instância WhatsApp desconectada com sucesso"}
    
    async def _cleanup_existing_instance(self, user_id: str, instance_name: str, db: Session):
        """Limpa instância existente se houver"""
        # Remove do banco
        crud_whatsapp.delete_whatsapp_instance_by_user_id(db, user_id)
        
        # Remove da Evolution API
        await self.evolution.delete_instance(instance_name)
        
        # Aguarda limpeza
        await asyncio.sleep(1)
    
    def _extract_qr_code(self, evolution_response: Dict[str, Any]) -> str:
        """Extrai QR code da resposta da Evolution API"""
        if "qrcode" in evolution_response:
            qr_data = evolution_response["qrcode"]
            if isinstance(qr_data, dict) and "base64" in qr_data:
                return qr_data["base64"]
            elif isinstance(qr_data, str):
                return qr_data
        return None

# Instância global do serviço
whatsapp_service = WhatsAppService()