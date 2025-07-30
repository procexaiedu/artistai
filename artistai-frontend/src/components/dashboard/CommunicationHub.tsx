'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dashboardApi, CommunicationStats } from '@/lib/apiClient';
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Calendar,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Users,
  Filter,
  Search,
  MoreHorizontal,
  ExternalLink,
  Smartphone,
  Video,
  MessageCircle
} from 'lucide-react';

interface Message {
  id: string;
  type: 'whatsapp' | 'email' | 'call' | 'meeting';
  contact: {
    name: string;
    avatar?: string;
    type: 'lead' | 'client' | 'artist' | 'contractor';
  };
  subject?: string;
  preview: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'pending' | 'failed';
  priority: 'high' | 'medium' | 'low';
  isUnread: boolean;
  hasAttachment?: boolean;
  scheduledFor?: Date;
}



interface CommunicationHubProps {
  userId?: string;
  onSendMessage?: (type: string, contactId: string) => void;
  onScheduleCall?: (contactId: string) => void;
  onScheduleMeeting?: (contactId: string) => void;
  onViewConversation?: (messageId: string) => void;
}

const CommunicationHub: React.FC<CommunicationHubProps> = ({
  userId,
  onSendMessage = () => console.log('Send Message'),
  onScheduleCall = () => console.log('Schedule Call'),
  onScheduleMeeting = () => console.log('Schedule Meeting'),
  onViewConversation = () => console.log('View Conversation')
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<CommunicationStats | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCommunicationData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load communication stats
        const statsData = await dashboardApi.getCommunicationStats(userId || 'default');
        setStats(statsData);
        
        // Load recent messages
        const messagesData = await dashboardApi.getRecentMessages(userId || 'default', 20);
        
        // Transform backend data to frontend format
        const transformedMessages: Message[] = messagesData.map((msg: any) => ({
          id: msg.id,
          type: msg.type,
          contact: {
            name: msg.contact.name,
            type: msg.contact.type
          },
          subject: msg.subject,
          preview: msg.preview,
          timestamp: new Date(msg.timestamp),
          status: msg.status,
          priority: msg.priority,
          isUnread: msg.isUnread,
          hasAttachment: msg.hasAttachment,
          scheduledFor: msg.scheduledFor ? new Date(msg.scheduledFor) : undefined
        }));
        
        setMessages(transformedMessages);
        
      } catch (err) {
        console.error('Error loading communication data:', err);
        setError('Erro ao carregar dados de comunicação');
      } finally {
        setLoading(false);
      }
    };

    loadCommunicationData();
  }, [userId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Hub de Comunicação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Carregando dados de comunicação...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Hub de Comunicação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'whatsapp': return <Smartphone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      case 'meeting': return <Video className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'whatsapp': return 'text-green-600';
      case 'email': return 'text-blue-600';
      case 'call': return 'text-purple-600';
      case 'meeting': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Send className="h-3 w-3" />;
      case 'delivered': return <CheckCircle className="h-3 w-3" />;
      case 'read': return <CheckCircle className="h-3 w-3 text-blue-500" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'failed': return <AlertCircle className="h-3 w-3 text-red-500" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-gray-300';
      default: return 'border-l-gray-300';
    }
  };

  const getContactTypeColor = (type: string) => {
    switch (type) {
      case 'lead': return 'bg-blue-100 text-blue-800';
      case 'client': return 'bg-green-100 text-green-800';
      case 'artist': return 'bg-purple-100 text-purple-800';
      case 'contractor': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  const filteredMessages = messages.filter(message => {
    const matchesTab = activeTab === 'all' || message.type === activeTab;
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && message.isUnread) ||
      (filter === 'priority' && message.priority === 'high');
    const matchesSearch = searchTerm === '' || 
      message.contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.preview.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesTab && matchesFilter && matchesSearch;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Hub de Comunicação
        </CardTitle>
        <CardDescription>
          Centralize todas as suas comunicações em um só lugar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{stats?.total_messages || 0}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{messages.filter(m => m.isUnread).length}</div>
            <div className="text-xs text-muted-foreground">Não lidas</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{messages.filter(m => m.type === 'call').length}</div>
            <div className="text-xs text-muted-foreground">Ligações</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{messages.filter(m => m.type === 'meeting').length}</div>
            <div className="text-xs text-muted-foreground">Reuniões</div>
          </div>
        </div>

        <Separator />

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-2 justify-between">
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Todas
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Não lidas ({messages.filter(m => m.isUnread).length})
            </Button>
            <Button
              variant={filter === 'priority' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('priority')}
            >
              Prioridade
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Communication Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              Todas
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="text-xs">
              <Smartphone className="h-3 w-3 mr-1" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="email" className="text-xs">
              <Mail className="h-3 w-3 mr-1" />
              Email
            </TabsTrigger>
            <TabsTrigger value="call" className="text-xs">
              <Phone className="h-3 w-3 mr-1" />
              Ligações
            </TabsTrigger>
            <TabsTrigger value="meeting" className="text-xs">
              <Video className="h-3 w-3 mr-1" />
              Reuniões
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-2 mt-4">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma comunicação encontrada
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`group p-3 border rounded-lg cursor-pointer hover:shadow-sm transition-all border-l-4 ${
                    getPriorityColor(message.priority)
                  } ${message.isUnread ? 'bg-muted/30' : ''}`}
                  onClick={() => onViewConversation(message.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`flex-shrink-0 mt-0.5 ${getTypeColor(message.type)}`}>
                        {getTypeIcon(message.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-muted-foreground" />
                            <span className={`text-sm font-medium ${
                              message.isUnread ? 'font-semibold' : ''
                            }`}>
                              {message.contact.name}
                            </span>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getContactTypeColor(message.contact.type)}`}
                          >
                            {message.contact.type}
                          </Badge>
                          {message.hasAttachment && (
                            <Badge variant="outline" className="text-xs">
                              📎
                            </Badge>
                          )}
                        </div>
                        
                        {message.subject && (
                          <div className="text-sm font-medium mb-1">
                            {message.subject}
                          </div>
                        )}
                        
                        <p className={`text-sm text-muted-foreground line-clamp-2 ${
                          message.isUnread ? 'font-medium text-foreground' : ''
                        }`}>
                          {message.preview}
                        </p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(message.status)}
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(message.timestamp)}
                            </span>
                          </div>
                          
                          {message.scheduledFor && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {message.scheduledFor.toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {message.isUnread && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      >
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>

        <Separator />

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => onSendMessage('whatsapp', '')}>
            <Smartphone className="h-3 w-3 mr-1" />
            Nova Mensagem
          </Button>
          <Button variant="outline" size="sm" onClick={() => onScheduleCall('')}>
            <Phone className="h-3 w-3 mr-1" />
            Agendar Ligação
          </Button>
          <Button variant="outline" size="sm" onClick={() => onScheduleMeeting('')}>
            <Video className="h-3 w-3 mr-1" />
            Agendar Reunião
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-3 w-3 mr-1" />
            Ver Todas
          </Button>
        </div>

        {/* Performance Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>Taxa de resposta: {stats.response_rate}%</span>
          <span>Tempo médio: {stats.avg_response_time}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunicationHub;