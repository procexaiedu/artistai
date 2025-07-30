"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { conversationAPI, Conversation, Message } from "@/lib/apiClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User, Bot } from "lucide-react";

interface MessageViewProps {
  conversation: Conversation;
}

export function MessageView({ conversation }: MessageViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    try {
      setLoading(true);
      const data = await conversationAPI.getConversationMessages(conversation.id);
      setMessages(data);
    } catch (err) {
      setError("Erro ao carregar mensagens");
      console.error("Erro ao carregar mensagens:", err);
    } finally {
      setLoading(false);
    }
  }, [conversation.id]);

  useEffect(() => {
    if (conversation) {
      loadMessages();
    }
  }, [conversation, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatMessageTime = (timestamp: string) => {
    return format(new Date(timestamp), "HH:mm", { locale: ptBR });
  };

  const formatMessageDate = (timestamp: string) => {
    return format(new Date(timestamp), "dd/MM/yyyy", { locale: ptBR });
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
            <div className="space-y-2 max-w-xs">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>{error}</p>
        <button 
          onClick={loadMessages}
          className="mt-2 text-sm underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <Card className="h-full overflow-y-auto p-4 space-y-4 rounded-none border-0">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p>Nenhuma mensagem nesta conversa</p>
        </div>
      ) : (
        <>
          {messages.map((message, index) => {
            const isUser = message.sender_type === "user";
            const showDate = index === 0 || 
              formatMessageDate(message.timestamp) !== formatMessageDate(messages[index - 1].timestamp);
            
            return (
              <div key={message.id}>
                {showDate && (
                  <div className="text-center text-xs text-gray-400 my-4">
                    {formatMessageDate(message.timestamp)}
                  </div>
                )}
                
                <div className={`flex ${isUser ? "justify-start" : "justify-end"} mb-2`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isUser 
                      ? "bg-gray-100 text-gray-900" 
                      : "bg-blue-500 text-white"
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      {isUser ? (
                        <User className="h-3 w-3" />
                      ) : (
                        <Bot className="h-3 w-3" />
                      )}
                      <span className="text-xs opacity-75">
                        {isUser ? "Cliente" : "Agente"}
                      </span>
                    </div>
                    
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    <div className="text-xs opacity-75 mt-1">
                      {formatMessageTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </>
      )}
    </Card>
  );
}