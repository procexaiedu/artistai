"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ConversationList } from "@/components/conversations/ConversationList";
import { MessageView } from "@/components/conversations/MessageView";
import { MessageInput } from "@/components/conversations/MessageInput";
import { Conversation } from "@/lib/apiClient";

export default function ConversationsPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conversas</h1>
          <p className="text-muted-foreground">
            Gerencie suas conversas com contratantes
          </p>
        </div>

        {/* Área de Conversas */}
        <div className="h-[calc(100vh-200px)] flex rounded-lg border overflow-hidden">
      {/* Painel Esquerdo - Lista de Conversas */}
      <div className="w-1/3 border-r">
        <ConversationList 
          onSelectConversation={setSelectedConversation}
          selectedConversation={selectedConversation}
        />
      </div>

      {/* Painel Direito - Mensagens */}
      <div className="w-2/3 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Cabeçalho da Conversa */}
            <div className="p-4 border-b bg-white">
              <h2 className="text-lg font-semibold">
                {selectedConversation.contractor.name}
              </h2>
              <p className="text-sm text-gray-500">
                {selectedConversation.contractor.phone} • {selectedConversation.channel}
              </p>
            </div>

            {/* Área de Mensagens */}
            <div className="flex-1 overflow-hidden">
              <MessageView conversation={selectedConversation} />
            </div>

            {/* Campo de Input */}
            <div className="border-t bg-white">
              <MessageInput conversation={selectedConversation} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Selecione uma conversa</h3>
              <p>Escolha uma conversa da lista para visualizar as mensagens</p>
            </div>
          </div>
        )}
      </div>
        </div>
      </div>
    </DashboardLayout>
  );
}