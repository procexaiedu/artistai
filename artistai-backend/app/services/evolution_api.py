import httpx
from typing import Dict, Any, Optional
from fastapi import HTTPException, status

from ..config.evolution import evolution_config

class EvolutionAPIService:
    """Serviço para interação com a Evolution API"""
    
    def __init__(self):
        self.config = evolution_config
    
    def _check_config(self):
        """Verifica se a configuração está disponível"""
        if not self.config.is_configured:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Serviço WhatsApp temporariamente indisponível. Configurações não definidas."
            )
    
    async def create_instance(self, instance_name: str) -> Dict[str, Any]:
        """Cria uma instância na Evolution API"""
        self._check_config()
        
        payload = self.config.get_instance_payload(instance_name)
        
        async with httpx.AsyncClient(timeout=self.config.timeout) as client:
            try:
                response = await client.post(
                    f"{self.config.api_url}/instance/create",
                    json=payload,
                    headers=self.config.headers
                )
                
                if response.status_code != 201:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Erro ao criar instância: {response.text}"
                    )
                
                return response.json()
                
            except httpx.RequestError as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Erro de conexão: {str(e)}"
                )
    
    async def get_qr_code(self, instance_name: str) -> Dict[str, Any]:
        """Obtém o QR Code de uma instância"""
        self._check_config()
        
        async with httpx.AsyncClient(timeout=self.config.timeout) as client:
            try:
                response = await client.get(
                    f"{self.config.api_url}/instance/connect/{instance_name}",
                    headers=self.config.headers
                )
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Erro ao obter QR Code: {response.text}"
                    )
                
                return response.json()
                
            except httpx.RequestError as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Erro de conexão: {str(e)}"
                )
    
    async def get_instance_status(self, instance_name: str) -> Dict[str, Any]:
        """Verifica o status de uma instância"""
        self._check_config()
        
        async with httpx.AsyncClient(timeout=self.config.timeout) as client:
            try:
                response = await client.get(
                    f"{self.config.api_url}/instance/connectionState/{instance_name}",
                    headers=self.config.headers
                )
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail=f"Erro ao verificar status: {response.text}"
                    )
                
                return response.json()
                
            except httpx.RequestError as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Erro de conexão: {str(e)}"
                )
    
    async def delete_instance(self, instance_name: str) -> bool:
        """Deleta uma instância"""
        if not self.config.is_configured:
            return False
        
        async with httpx.AsyncClient(timeout=self.config.timeout) as client:
            try:
                response = await client.delete(
                    f"{self.config.api_url}/instance/delete/{instance_name}",
                    headers=self.config.headers
                )
                
                # Considera sucesso se retornar 200, 204 ou 404 (já não existe)
                return response.status_code in [200, 204, 404]
                
            except Exception:
                return False
    
    async def instance_exists(self, instance_name: str) -> bool:
        """Verifica se uma instância existe"""
        if not self.config.is_configured:
            return False
        
        async with httpx.AsyncClient(timeout=self.config.timeout) as client:
            try:
                response = await client.get(
                    f"{self.config.api_url}/instance/connectionState/{instance_name}",
                    headers=self.config.headers
                )
                return response.status_code == 200
            except Exception:
                return False

# Instância global do serviço
evolution_service = EvolutionAPIService()