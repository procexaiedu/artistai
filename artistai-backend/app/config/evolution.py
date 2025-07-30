import os
from typing import Optional

class EvolutionConfig:
    """Configurações centralizadas para a Evolution API"""
    
    def __init__(self):
        self.api_url = os.getenv("EVOLUTION_API_URL")
        self.global_key = os.getenv("EVOLUTION_API_GLOBAL_KEY")
        self.webhook_url = os.getenv("N8N_WHATSAPP_WEBHOOK_URL")
        self.timeout = 30.0
        
    @property
    def is_configured(self) -> bool:
        """Verifica se a Evolution API está configurada"""
        return bool(self.api_url and self.global_key)
    
    @property
    def headers(self) -> dict:
        """Headers padrão para requisições"""
        return {
            "Content-Type": "application/json",
            "apikey": self.global_key
        }
    
    def get_instance_payload(self, instance_name: str) -> dict:
        """Payload padrão para criação de instância"""
        payload = {
            "instanceName": instance_name,
            "qrcode": True,
            "integration": "WHATSAPP-BAILEYS"
        }
        
        # Adiciona webhook se configurado
        if self.webhook_url:
            payload["webhook"] = {
                "url": self.webhook_url,
                "events": ["MESSAGES_UPSERT"]
            }
        
        return payload

# Instância global
evolution_config = EvolutionConfig()