"use client";

import { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Smartphone, CheckCircle, XCircle, Loader2, QrCode, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { whatsappApi, WhatsAppStatus } from '@/lib/apiClient';



export default function ConnectionsPage() {
  const [whatsappStatus, setWhatsappStatus] = useState<WhatsAppStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const MAX_POLLING_ATTEMPTS = 60; // 3 minutos (60 * 3 segundos)

  // Função para verificar status do WhatsApp
  const checkWhatsAppStatus = useCallback(async (isPolling = false) => {
    try {
      const response = await whatsappApi.getStatus();
      setWhatsappStatus(response);
      setError(null);
      
      // Se estiver conectado, para o polling
      if (response.connected && pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
        setQrCode(null);
        setPollingAttempts(0);
        setIsConnecting(false);
      }
    } catch (err: unknown) {
      const errorResponse = err as { response?: { status?: number } };
      if (errorResponse.response?.status === 404) {
        // Usuário não tem instância ainda
        setWhatsappStatus(null);
      } else {
        console.error('Erro ao verificar status:', err);
        if (isPolling) {
          // Durante polling, incrementa tentativas
          setPollingAttempts(prev => {
            const newAttempts = prev + 1;
            if (newAttempts >= MAX_POLLING_ATTEMPTS) {
              // Para o polling após muitas tentativas
              if (pollingInterval) {
                clearInterval(pollingInterval);
                setPollingInterval(null);
              }
              setError('Timeout: Não foi possível conectar após 3 minutos. Tente novamente.');
              setQrCode(null);
              setIsConnecting(false);
            }
            return newAttempts;
          });
        } else {
          setError('Erro ao verificar status do WhatsApp');
        }
      }
    } finally {
      if (!isPolling) {
        setIsLoading(false);
      }
    }
  }, [pollingInterval]);

  // Função para conectar WhatsApp
  const connectWhatsApp = async () => {
    setIsConnecting(true);
    setError(null);
    setQrCode(null);
    setPollingAttempts(0);
    
    // Para qualquer polling anterior
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    try {
      const response = await whatsappApi.connect();
      if (response.success) {
        if (response.already_connected) {
          // Usuário já tem WhatsApp conectado
          setError(null);
          await checkWhatsAppStatus(); // Atualiza o status
        } else if (response.qr_code) {
          setQrCode(response.qr_code);
          
          // Inicia polling para verificar quando conectar
          const interval = setInterval(() => {
            checkWhatsAppStatus(true);
          }, 3000);
          setPollingInterval(interval);
        } else {
          setError('QR Code não foi gerado. Tente novamente.');
        }
      } else {
        setError(response.message || 'Erro ao conectar WhatsApp');
      }
    } catch (err: unknown) {
      console.error('Erro ao conectar:', err);
      const errorResponse = err as { response?: { data?: { detail?: string } } };
      setError(errorResponse.response?.data?.detail || 'Erro ao conectar WhatsApp');
    } finally {
      setIsConnecting(false);
    }
  };

  // Função para forçar reconexão
  const reconnectWhatsApp = async () => {
    setIsConnecting(true);
    setError(null);
    setQrCode(null);
    setPollingAttempts(0);
    
    // Para qualquer polling anterior
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    try {
      const response = await whatsappApi.reconnect();
      
      if (response.success && response.qr_code) {
        setQrCode(response.qr_code);
        
        // Inicia polling para verificar quando conectar
        const interval = setInterval(() => {
          checkWhatsAppStatus(true);
        }, 3000);
        setPollingInterval(interval);
      } else {
        setError(response.message || 'Erro ao reconectar WhatsApp');
      }
    } catch (err: unknown) {
      console.error('Erro ao reconectar:', err);
      const errorResponse = err as { response?: { data?: { detail?: string } } };
      setError(errorResponse.response?.data?.detail || 'Erro ao reconectar WhatsApp');
    } finally {
      setIsConnecting(false);
    }
  };

  // Função para desconectar WhatsApp
  const disconnectWhatsApp = async () => {
    setIsLoading(true);
    setError(null);
    
    // Para o polling se estiver ativo
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    try {
      await whatsappApi.disconnect();
      setWhatsappStatus(null);
      setQrCode(null);
      setPollingAttempts(0);
      setIsConnecting(false);
    } catch (err: unknown) {
      console.error('Erro ao desconectar:', err);
      const errorResponse = err as { response?: { data?: { detail?: string } } };
      setError(errorResponse.response?.data?.detail || 'Erro ao desconectar WhatsApp');
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega o status inicial
  useEffect(() => {
    checkWhatsAppStatus();
  }, [checkWhatsAppStatus]);

  // Limpa o polling quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const getStatusBadge = (status: string, connected: boolean) => {
    if (connected) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />
          Conectado
        </Badge>
      );
    }
    
    if (status === 'pending') {
      return (
        <Badge variant="secondary">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Aguardando
        </Badge>
      );
    }
    
    return (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Desconectado
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/settings">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Conexões</h1>
            <p className="text-muted-foreground">
              Gerencie suas conexões com plataformas de comunicação
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          {/* WhatsApp Connection Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-green-500 text-white">
                    <Smartphone className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>WhatsApp</CardTitle>
                    <CardDescription>
                      Conecte sua conta do WhatsApp para receber e enviar mensagens
                    </CardDescription>
                  </div>
                </div>
                {whatsappStatus && getStatusBadge(whatsappStatus.status, whatsappStatus.connected)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Verificando status...</span>
                </div>
              ) : whatsappStatus?.connected ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">WhatsApp conectado com sucesso!</span>
                    </div>
                    <p className="text-sm text-green-600 mt-1">
                      Instância: {whatsappStatus.instance_name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={disconnectWhatsApp}
                      disabled={isLoading}
                    >
                      Desconectar WhatsApp
                    </Button>
                    <Button 
                      variant="secondary" 
                      onClick={reconnectWhatsApp}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Reconectando...
                        </>
                      ) : (
                        'Gerar Novo QR Code'
                      )}
                    </Button>
                  </div>
                </div>
              ) : qrCode ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <QrCode className="h-5 w-5" />
                      <span className="font-medium">Escaneie o QR Code</span>
                    </div>
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-white rounded-lg border">
                        {qrCode ? (
                          <Image
                            src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                            alt="QR Code WhatsApp"
                            width={256}
                            height={256}
                            className="rounded"
                            onError={() => {
                              setError('Erro ao carregar QR Code. Tente gerar um novo.');
                            }}
                          />
                        ) : (
                          <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded">
                            <span className="text-gray-500">Carregando QR Code...</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Abra o WhatsApp no seu celular, vá em &quot;Dispositivos Conectados&quot; e escaneie este código
                    </p>
                    {pollingInterval && (
                      <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Aguardando conexão... ({pollingAttempts}/{MAX_POLLING_ATTEMPTS})
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-blue-800">
                      <p className="font-medium">Como conectar seu WhatsApp:</p>
                      <ol className="list-decimal list-inside text-sm mt-2 space-y-1">
                        <li>Clique no botão &quot;Conectar WhatsApp&quot; abaixo</li>
                        <li>Um QR Code será gerado</li>
                        <li>Abra o WhatsApp no seu celular</li>
                        <li>Vá em &quot;Dispositivos Conectados&quot;</li>
                        <li>Escaneie o QR Code</li>
                      </ol>
                    </div>
                  </div>
                  <Button 
                    onClick={connectWhatsApp} 
                    disabled={isConnecting}
                    className="w-full"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Conectando...
                      </>
                    ) : (
                      <>
                        <Smartphone className="mr-2 h-4 w-4" />
                        Conectar WhatsApp
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Placeholder for future connections */}
          <Card className="opacity-50">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-gray-400 text-white">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle>Telegram</CardTitle>
                  <CardDescription>
                    Conecte sua conta do Telegram (Em breve)
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full">
                Em breve
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}