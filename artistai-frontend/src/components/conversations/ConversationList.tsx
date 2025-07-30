"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { conversationAPI, Conversation } from "@/lib/apiClient";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageSquare, Phone } from "lucide-react";

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversation: Conversation | null;
}

export function ConversationList({ onSelectConversation, selectedConversation }: ConversationListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await conversationAPI.getConversations();
      setConversations(data);
    } catch (err) {
      setError("Erro ao carregar conversas");
      console.error("Erro ao carregar conversas:", err);
    } finally {
      setLoading(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "whatsapp":
        return <Phone className="h-4 w-4 text-green-600" />;
      case "instagram_dm":
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      case "telegram":
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      case "needs_attention":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        <p>{error}</p>
        <button 
          onClick={loadConversations}
          className="mt-2 text-sm underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Conversas ({conversations.length})
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-0">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>Nenhuma conversa encontrada</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`p-4 cursor-pointer hover:bg-gray-50 border-b transition-colors ${
                  selectedConversation?.id === conversation.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getChannelIcon(conversation.channel)}
                    <h3 className="font-medium text-sm truncate">
                      {conversation.contractor.name}
                    </h3>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${getStatusColor(conversation.status)}`}
                  >
                    {conversation.status === "open" ? "Aberta" : 
                     conversation.status === "closed" ? "Fechada" : "Atenção"}
                  </Badge>
                </div>
                
                <p className="text-xs text-gray-600 mb-1">
                  {conversation.contractor.phone}
                </p>
                
                {conversation.last_message_at && !isNaN(new Date(conversation.last_message_at).getTime()) && (
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(conversation.last_message_at), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}