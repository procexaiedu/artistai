"use client";

import { useState, useEffect } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AgentConfigPanel } from "@/components/agent/AgentConfigPanel";
import { PromptEngineerView } from "@/components/agent/PromptEngineerView";
import { AgentTestView } from "@/components/agent/AgentTestView";
import { AgentConfig, agentApi } from "@/lib/apiClient";
import { toast } from "sonner";

export default function AgentPage() {
  const [config, setConfig] = useState<AgentConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await agentApi.getConfig();
      setConfig(data);
    } catch (err) {
      setError("Erro ao carregar configuração do agente. Verifique se o backend está rodando.");
      console.error("Erro ao carregar configuração:", err);
      toast.error("Erro ao carregar configuração do agente");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleConfigUpdate = (updatedConfig: AgentConfig) => {
    setConfig(updatedConfig);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando configuração do agente...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !config) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || "Configuração não encontrada"}</p>
            <button 
              onClick={loadConfig}
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Agente de IA</h1>
          <p className="text-muted-foreground">
            Configure e gerencie seu agente de inteligência artificial
          </p>
        </div>
        
        <PanelGroup direction="horizontal" className="h-[calc(100vh-200px)]">
          {/* Painel de Configuração (Esquerda) */}
          <Panel defaultSize={40} minSize={30}>
            <div className="h-full pr-4">
              <AgentConfigPanel 
                config={config} 
                onConfigUpdate={handleConfigUpdate}
                onReload={loadConfig}
              />
            </div>
          </Panel>
          
          <PanelResizeHandle className="w-2 bg-border hover:bg-border/80 transition-colors" />
          
          {/* Painel de Interação (Direita) */}
          <Panel defaultSize={60} minSize={40}>
            <div className="h-full pl-4">
              <Tabs defaultValue="engineer" className="h-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="engineer">Engenheiro de Prompt</TabsTrigger>
                  <TabsTrigger value="test">Teste do Agente (Laboratório)</TabsTrigger>
                </TabsList>
                
                <TabsContent value="engineer" className="h-[calc(100%-60px)]">
                  <PromptEngineerView 
                    config={config}
                    onConfigUpdate={handleConfigUpdate}
                  />
                </TabsContent>
                
                <TabsContent value="test" className="h-[calc(100%-60px)]">
                  <AgentTestView config={config} />
                </TabsContent>
              </Tabs>
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </DashboardLayout>
  );
}