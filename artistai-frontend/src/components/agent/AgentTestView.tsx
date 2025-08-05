"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AgentConfig, agentApi } from "@/lib/apiClient";
import { toast } from "sonner";
import { Send, User, Bot, TestTube, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface AgentTestViewProps {
  config: AgentConfig;
}

export function AgentTestView({ config }: AgentTestViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

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
      const response = await agentApi.testLab({
        message: userMessage.content,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      toast.error("Erro ao comunicar com o agente");
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'Erro ao comunicar com o agente. Verifique se o agente está ativo e tente novamente.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.info("Chat limpo");
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Teste do Agente (Laboratório)
          </CardTitle>
          {messages.length > 0 && (
            <Button
              onClick={clearChat}
              variant="outline"
              size="sm"
            >
              Limpar Chat
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 border rounded-lg p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Teste o comportamento do seu agente de IA</p>
                <p className="text-sm mt-2">Esta conversa usa o prompt do laboratório e é sem estado</p>
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Importante:</span>
                  </div>
                  <p className="mt-1">Cada mensagem é independente. O agente não mantém contexto entre as mensagens.</p>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                {/* Message Header */}
                <div className="flex items-center gap-2">
                  {message.type === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : message.type === 'assistant' ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <Badge variant={
                    message.type === 'user' 
                      ? 'default' 
                      : message.type === 'assistant' 
                        ? 'secondary' 
                        : 'destructive'
                  }>
                    {message.type === 'user' 
                      ? 'Você' 
                      : message.type === 'assistant' 
                        ? 'Agente IA' 
                        : 'Sistema'
                    }
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(message.timestamp, "HH:mm:ss", { locale: ptBR })}
                  </span>
                </div>
                
                {/* Message Content */}
                <div className={`p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground ml-8' 
                    : message.type === 'assistant'
                      ? 'bg-muted mr-8'
                      : 'bg-destructive/10 border border-destructive/20 text-destructive'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
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
                <span className="text-sm">Agente está pensando...</span>
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
            placeholder="Digite sua mensagem para testar o agente..."
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
        
        {/* Info Footer */}
        <div className="text-xs text-muted-foreground text-center border-t pt-2">
          💡 Dica: Use Shift+Enter para quebrar linha, Enter para enviar
        </div>
      </CardContent>
    </Card>
  );
}