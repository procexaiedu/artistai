'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';

interface ActionItem {
  id: string;
  type: 'urgent' | 'important' | 'suggestion';
  title: string;
  description: string;
  action: string;
  icon: React.ReactNode;
  priority: 'high' | 'medium' | 'low';
  category: 'events' | 'leads' | 'financial' | 'communication';
}

interface ActionCenterProps {
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

const ActionCenter: React.FC<ActionCenterProps> = ({
  upcomingEvents = [],
  recentActivities = [],
  pipelineData = [],
  financialData
}) => {
  // Gerar ações inteligentes baseadas nos dados
  const generateActions = (): ActionItem[] => {
    const actions: ActionItem[] = [];

    // Eventos próximos que precisam de atenção
    const urgentEvents = upcomingEvents.filter(event => {
      const eventDate = new Date(event.date);
      const daysUntil = Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 7 && daysUntil > 0;
    });

    if (urgentEvents.length > 0) {
      actions.push({
        id: 'urgent-events',
        type: 'urgent',
        title: `${urgentEvents.length} evento(s) próximo(s)`,
        description: 'Eventos acontecendo nos próximos 7 dias',
        action: 'Revisar detalhes',
        icon: <Calendar className="h-4 w-4" />,
        priority: 'high',
        category: 'events'
      });
    }

    // Leads sem atividade recente
    const staleLeads = pipelineData.filter(stage => 
      stage.stage?.toLowerCase().includes('contato') || 
      stage.stage?.toLowerCase().includes('negociação')
    );

    if (staleLeads.length > 0) {
      actions.push({
        id: 'stale-leads',
        type: 'important',
        title: 'Leads precisam de follow-up',
        description: `${staleLeads.reduce((acc, stage) => acc + stage.count, 0)} leads ativos`,
        action: 'Fazer contato',
        icon: <Users className="h-4 w-4" />,
        priority: 'medium',
        category: 'leads'
      });
    }

    // Oportunidades financeiras
    if (financialData?.profit && financialData.profit > 0) {
      actions.push({
        id: 'financial-opportunity',
        type: 'suggestion',
        title: 'Mês positivo!',
        description: `Lucro de ${financialData.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
        action: 'Ver relatório',
        icon: <TrendingUp className="h-4 w-4" />,
        priority: 'low',
        category: 'financial'
      });
    }

    // Sugestão de comunicação
    if (recentActivities.length < 3) {
      actions.push({
        id: 'communication-suggestion',
        type: 'suggestion',
        title: 'Aumente o engajamento',
        description: 'Poucas atividades recentes detectadas',
        action: 'Enviar mensagens',
        icon: <MessageSquare className="h-4 w-4" />,
        priority: 'medium',
        category: 'communication'
      });
    }

    return actions;
  };

  const actions = generateActions();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'important': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'suggestion': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  if (actions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Centro de Ações
          </CardTitle>
          <CardDescription>
            Ações inteligentes baseadas nos seus dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Tudo em ordem! Não há ações urgentes no momento.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Centro de Ações
        </CardTitle>
        <CardDescription>
          Ações inteligentes baseadas nos seus dados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {actions.map((action, index) => (
          <div key={action.id}>
            <div className="flex items-start justify-between space-x-4">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0 mt-1">
                  {getTypeIcon(action.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium">{action.title}</h4>
                    <Badge variant={getPriorityColor(action.priority) as 'default' | 'secondary' | 'destructive' | 'outline'} className="text-xs">
                      {action.priority === 'high' ? 'Alta' : action.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {action.description}
                  </p>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    {action.icon}
                    <span className="ml-1">{action.action}</span>
                  </Button>
                </div>
              </div>
            </div>
            {index < actions.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ActionCenter;