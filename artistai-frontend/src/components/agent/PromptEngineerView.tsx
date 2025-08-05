"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AgentConfig, AgentConfigUpdate, agentApi } from "@/lib/apiClient";
import { toast } from "sonner";
import { Send, Check, X, Zap, User, Bot } from "lucide-react";
import ReactDiffViewer from "react-diff-viewer";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Message {
  id: string;
  type: 'user' | 'system' | 'diff';
  content: string;
  timestamp: Date;
  originalPrompt?: string;
  modifiedPrompt?: string;
}

interface PromptEngineerViewProps {
  config: AgentConfig;
  onConfigUpdate: (config: AgentConfig) => void;
}

export function PromptEngineerView({ config, onConfigUpdate }: PromptEngineerViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await agentApi.promptEngineer({
        instruction: userMessage.content,
        current_prompt: config.system_prompt_laboratory,
      });

      const diffMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'diff',
        content: 'Prompt modificado pelo engenheiro de IA',
        timestamp: new Date(),
        originalPrompt: config.system_prompt_laboratory,
        modifiedPrompt: response.modified_prompt,
      };

      setMessages(prev => [...prev, diffMessage]);
      setPendingPrompt(response.modified_prompt || null);
    } catch (error) {
      console.error("Erro ao processar instrução:", error);
      toast.error("Erro ao processar instrução");
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'Erro ao processar a instrução. Tente novamente.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptChanges = async () => {
    if (!pendingPrompt) return;

    try {
      setLoading(true);
      const updateData: AgentConfigUpdate = {
        system_prompt_laboratory: pendingPrompt,
      };
      
      const updatedConfig = await agentApi.updateConfig(updateData);
      onConfigUpdate(updatedConfig);
      setPendingPrompt(null);
      
      const successMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: '✅ Alterações aceitas e salvas no laboratório!',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, successMessage]);
      toast.success("Prompt atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar prompt:", error);
      toast.error("Erro ao salvar prompt");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectChanges = () => {
    setPendingPrompt(null);
    
    const rejectMessage: Message = {
      id: Date.now().toString(),
      type: 'system',
      content: '❌ Alterações rejeitadas.',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, rejectMessage]);
    toast.info("Alterações rejeitadas");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Engenheiro de Prompt
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 border rounded-lg p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Envie uma instrução para modificar o prompt do laboratório</p>
                <p className="text-sm mt-2">Exemplo: "Torne o agente mais criativo" ou "Adicione instruções sobre formatação"</p>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className="space-y-3">
                {/* Message Header */}
                <div className="flex items-center gap-2">
                  {message.type === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                  <Badge variant={message.type === 'user' ? 'default' : 'secondary'}>
                    {message.type === 'user' ? 'Você' : message.type === 'diff' ? 'Engenheiro IA' : 'Sistema'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(message.timestamp, "HH:mm", { locale: ptBR })}
                  </span>
                </div>
                
                {/* Message Content */}
                {message.type === 'diff' && message.originalPrompt && message.modifiedPrompt ? (
                  <div className="space-y-3">
                    <p className="text-sm">{message.content}</p>
                    <div className="border rounded-lg overflow-hidden">
                      <ReactDiffViewer
                        oldValue={message.originalPrompt}
                        newValue={message.modifiedPrompt}
                        splitView={false}
                        hideLineNumbers
                        showDiffOnly={false}
                        styles={{
                          variables: {
                            light: {
                              codeFoldGutterBackground: '#f8f9fa',
                              codeFoldBackground: '#f8f9fa',
                            },
                          },
                        }}
                      />
                    </div>
                    
                    {pendingPrompt === message.modifiedPrompt && (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleAcceptChanges}
                          disabled={loading}
                          size="sm"
                          className="flex-1"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          ✅ Aceitar Alterações
                        </Button>
                        <Button
                          onClick={handleRejectChanges}
                          disabled={loading}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <X className="h-4 w-4 mr-2" />
                          ❌ Rejeitar
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground ml-8' 
                      : 'bg-muted mr-8'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Bot className="h-4 w-4" />
                <div className="flex items-center gap-1">
                  <div className="animate-bounce h-2 w-2 bg-current rounded-full"></div>
                  <div className="animate-bounce h-2 w-2 bg-current rounded-full" style={{ animationDelay: '0.1s' }}></div>
                  <div className="animate-bounce h-2 w-2 bg-current rounded-full" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm">Processando instrução...</span>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite uma instrução para modificar o prompt..."
            disabled={loading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={loading || !input.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}