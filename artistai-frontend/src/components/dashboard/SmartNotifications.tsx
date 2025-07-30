'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  X, 
  Calendar, 
  TrendingUp, 
  Users, 
  MessageSquare,
  AlertTriangle,
  Info,
  CheckCircle
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: 'events' | 'leads' | 'financial' | 'system';
  actionable?: boolean;
  action?: () => void;
}

interface SmartNotificationsProps {
  upcomingEvents?: Array<{
    id: string;
    title: string;
    date: string;
    status: string;
  }>;
  recentActivities?: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
  pipelineData?: Array<{
    stage: string;
    count: number;
    value: number;
  }>;
  financialData?: {
    revenue: number;
    expenses: number;
    profit: number;
  };
}

const SmartNotifications: React.FC<SmartNotificationsProps> = ({
  upcomingEvents = [],
  recentActivities = [],
  pipelineData = [],
  financialData
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAll, setShowAll] = useState(false);

  // Gerar notificações inteligentes
  useEffect(() => {
    const generateNotifications = (): Notification[] => {
      const newNotifications: Notification[] = [];

      // Notificação de eventos próximos
      const todayEvents = upcomingEvents.filter(event => {
        const eventDate = new Date(event.date);
        const today = new Date();
        return eventDate.toDateString() === today.toDateString();
      });

      if (todayEvents.length > 0) {
        newNotifications.push({
          id: 'today-events',
          type: 'warning',
          title: 'Eventos hoje!',
          message: `Você tem ${todayEvents.length} evento(s) agendado(s) para hoje`,
          timestamp: new Date(),
          read: false,
          category: 'events',
          actionable: true
        });
      }

      // Notificação de leads quentes
      const hotLeads = pipelineData.filter(stage => 
        stage.stage?.toLowerCase().includes('negociação') && stage.count > 0
      );

      if (hotLeads.length > 0) {
        const totalHotLeads = hotLeads.reduce((acc, stage) => acc + stage.count, 0);
        newNotifications.push({
          id: 'hot-leads',
          type: 'info',
          title: 'Leads em negociação',
          message: `${totalHotLeads} lead(s) em fase de negociação precisam de atenção`,
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min atrás
          read: false,
          category: 'leads',
          actionable: true
        });
      }

      // Notificação financeira positiva
      if (financialData?.profit && financialData.profit > 0) {
        newNotifications.push({
          id: 'positive-income',
          type: 'success',
          title: 'Mês positivo!',
          message: `Lucro líquido de ${financialData.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} este mês`,
          timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hora atrás
          read: false,
          category: 'financial'
        });
      }

      // Notificação de atividade baixa
      if (recentActivities.length < 2) {
        newNotifications.push({
          id: 'low-activity',
          type: 'info',
          title: 'Atividade baixa detectada',
          message: 'Considere entrar em contato com seus leads para manter o engajamento',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
          read: false,
          category: 'system',
          actionable: true
        });
      }

      return newNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    };

    setNotifications(generateNotifications());
  }, [upcomingEvents, recentActivities, pipelineData, financialData]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'events': return <Calendar className="h-3 w-3" />;
      case 'leads': return <Users className="h-3 w-3" />;
      case 'financial': return <TrendingUp className="h-3 w-3" />;
      case 'system': return <MessageSquare className="h-3 w-3" />;
      default: return <Bell className="h-3 w-3" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return timestamp.toLocaleDateString('pt-BR');
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayNotifications = showAll ? notifications : notifications.slice(0, 3);

  if (notifications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
          <CardDescription>
            Alertas e atualizações inteligentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Nenhuma notificação no momento
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          {notifications.length > 3 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAll(!showAll)}
              className="text-xs"
            >
              {showAll ? 'Ver menos' : `Ver todas (${notifications.length})`}
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Alertas e atualizações inteligentes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayNotifications.map((notification, index) => (
          <div key={notification.id}>
            <div className={`flex items-start justify-between space-x-3 p-3 rounded-lg border transition-colors ${
              notification.read ? 'bg-muted/30' : 'bg-background'
            }`}>
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0 mt-0.5">
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`text-sm font-medium ${
                      notification.read ? 'text-muted-foreground' : 'text-foreground'
                    }`}>
                      {notification.title}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {getCategoryIcon(notification.category)}
                      <span>{formatTimestamp(notification.timestamp)}</span>
                    </div>
                  </div>
                  <p className={`text-xs ${
                    notification.read ? 'text-muted-foreground' : 'text-muted-foreground'
                  }`}>
                    {notification.message}
                  </p>
                  {notification.actionable && !notification.read && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-6 text-xs mt-2"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Marcar como lida
                    </Button>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 flex-shrink-0"
                onClick={() => dismissNotification(notification.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            {index < displayNotifications.length - 1 && <Separator />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SmartNotifications;