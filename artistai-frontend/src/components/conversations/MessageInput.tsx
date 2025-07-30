"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { conversationAPI, Conversation, MessageCreate } from "@/lib/apiClient";
import { Send } from "lucide-react";

interface MessageInputProps {
  conversation: Conversation;
  onMessageSent?: () => void;
}

export function MessageInput({ conversation, onMessageSent }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim() || sending) return;

    try {
      setSending(true);
      
      const messageData: MessageCreate = {
        conversation_id: conversation.id,
        sender_type: "agent",
        content_type: "text",
        content: message.trim()
      };

      await conversationAPI.sendMessage(conversation.id, messageData);
      setMessage("");
      onMessageSent?.();
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      // Aqui você pode adicionar um toast de erro
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4">
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Digite sua mensagem..."
          className="flex-1 min-h-[40px] max-h-[120px] resize-none"
          disabled={sending}
        />
        <Button 
          onClick={handleSend}
          disabled={!message.trim() || sending}
          size="sm"
          className="self-end"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}