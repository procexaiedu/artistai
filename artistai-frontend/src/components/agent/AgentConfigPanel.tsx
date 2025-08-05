"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AgentConfig, AgentConfigUpdate, PromptVersion, agentApi } from "@/lib/apiClient";
import { toast } from "sonner";
import { Rocket, RotateCcw, History, Calendar, GitBranch } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AgentConfigPanelProps {
  config: AgentConfig;
  onConfigUpdate: (config: AgentConfig) => void;
  onReload: () => void;
}

export function AgentConfigPanel({ config, onConfigUpdate, onReload }: AgentConfigPanelProps) {
  const [isActive, setIsActive] = useState(config.is_active);
  const [waitTime, setWaitTime] = useState(config.wait_time_buffer);
  const [labPrompt, setLabPrompt] = useState(config.system_prompt_laboratory);
  const [loading, setLoading] = useState(false);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [showVersions, setShowVersions] = useState(false);

  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      const updateData: AgentConfigUpdate = {
        is_active: isActive,
        wait_time_buffer: waitTime,
        system_prompt_laboratory: labPrompt,
      };
      
      const updatedConfig = await agentApi.updateConfig(updateData);
      onConfigUpdate(updatedConfig);
      toast.success("Configuração salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      toast.error("Erro ao salvar configuração");
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    try {
      setLoading(true);
      await agentApi.deployPrompt();
      onReload();
      toast.success("Prompt enviado para produção com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer deploy:", error);
      toast.error("Erro ao enviar prompt para produção");
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async () => {
    try {
      setLoading(true);
      const updatedConfig = await agentApi.revertPrompt();
      onConfigUpdate(updatedConfig);
      setLabPrompt(updatedConfig.system_prompt_laboratory);
      toast.success("Alterações revertidas com sucesso!");
    } catch (error) {
      console.error("Erro ao reverter:", error);
      toast.error("Erro ao reverter alterações");
    } finally {
      setLoading(false);
    }
  };

  const loadVersions = async () => {
    try {
      setVersionsLoading(true);
      const data = await agentApi.getVersions();
      setVersions(data);
    } catch (error) {
      console.error("Erro ao carregar versões:", error);
      toast.error("Erro ao carregar histórico de versões");
    } finally {
      setVersionsLoading(false);
    }
  };

  const handleRollback = async (versionId: string) => {
    try {
      setLoading(true);
      const updatedConfig = await agentApi.rollbackToVersion(versionId);
      onConfigUpdate(updatedConfig);
      setLabPrompt(updatedConfig.system_prompt_laboratory);
      setShowVersions(false);
      toast.success("Rollback realizado com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer rollback:", error);
      toast.error("Erro ao fazer rollback");
    } finally {
      setLoading(false);
    }
  };

  const isPromptsIdentical = (labPrompt || '').trim() === (config.system_prompt_production || '').trim();
  const hasUnsavedChanges = 
    isActive !== config.is_active ||
    waitTime !== config.wait_time_buffer ||
    labPrompt !== config.system_prompt_laboratory;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Configuração do Agente
        </CardTitle>
        <CardDescription>
          Configure o comportamento e os prompts do seu agente de IA
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status e Configurações Básicas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="agent-active" className="text-sm font-medium">
              Ativar Agente
            </Label>
            <Switch
              id="agent-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="wait-time" className="text-sm font-medium">
              Tempo de Espera (segundos)
            </Label>
            <Input
              id="wait-time"
              type="number"
              min="0"
              max="300"
              value={waitTime}
              onChange={(e) => setWaitTime(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Prompts */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lab-prompt" className="text-sm font-medium">
              Prompt do Laboratório
            </Label>
            <Textarea
              id="lab-prompt"
              value={labPrompt || ''}
              onChange={(e) => setLabPrompt(e.target.value)}
              placeholder="Digite o prompt do laboratório..."
              className="min-h-[120px] resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prod-prompt" className="text-sm font-medium">
              Prompt de Produção (Somente Leitura)
            </Label>
            <Textarea
              id="prod-prompt"
              value={config.system_prompt_production}
              readOnly
              className="min-h-[120px] resize-none bg-muted"
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-3">
          {hasUnsavedChanges && (
            <Button 
              onClick={handleSaveConfig} 
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              💾 Salvar Configurações
            </Button>
          )}
          
          <Button 
            onClick={handleDeploy} 
            disabled={loading || isPromptsIdentical}
            className="w-full"
          >
            <Rocket className="h-4 w-4 mr-2" />
            🚀 Enviar para Produção
          </Button>
          
          <Button 
            onClick={handleRevert} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            ⏪ Reverter Alterações
          </Button>
          
          <Dialog open={showVersions} onOpenChange={setShowVersions}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setShowVersions(true);
                  loadVersions();
                }}
              >
                <History className="h-4 w-4 mr-2" />
                🕒 Histórico de Versões
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Histórico de Versões</DialogTitle>
                <DialogDescription>
                  Visualize e restaure versões anteriores dos prompts
                </DialogDescription>
              </DialogHeader>
              
              {versionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {versions.map((version) => (
                    <Card key={version.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={version.is_deployed ? "default" : "secondary"}>
                            Versão {version.version_number}
                          </Badge>
                          {version.is_deployed && (
                            <Badge variant="outline">Em Produção</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(version.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </div>
                      </div>
                      
                      <Textarea
                        value={version.prompt_content}
                        readOnly
                        className="min-h-[100px] mb-3 bg-muted"
                      />
                      
                      <Button
                        onClick={() => handleRollback(version.id)}
                        disabled={loading || version.is_deployed}
                        size="sm"
                        variant="outline"
                      >
                        Restaurar Esta Versão
                      </Button>
                    </Card>
                  ))}
                  
                  {versions.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhuma versão encontrada
                    </p>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}