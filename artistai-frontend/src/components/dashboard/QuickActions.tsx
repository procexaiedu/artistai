'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  MessageSquare, 
  Calendar, 
  Users, 
  FileText,
  Phone,
  Mail,
  DollarSign,
  Music,
  Zap,
  ExternalLink,
  Clock
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'create' | 'communicate' | 'manage' | 'analyze';
  priority: 'high' | 'medium' | 'low';
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  badge?: string;
}

interface QuickActionsProps {
  onCreateEvent?: () => void;
  onCreateArtist?: () => void;
  onSendMessage?: () => void;
  onScheduleCall?: () => void;
  onCreateNote?: () => void;
  onViewPipeline?: () => void;
  onViewFinancial?: () => void;
  onCreateLead?: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onCreateEvent = () => console.log('Create Event'),
  onCreateArtist = () => console.log('Create Artist'),
  onSendMessage = () => console.log('Send Message'),
  onScheduleCall = () => console.log('Schedule Call'),
  onCreateNote = () => console.log('Create Note'),
  onViewPipeline = () => console.log('View Pipeline'),
  onViewFinancial = () => console.log('View Financial'),
  onCreateLead = () => console.log('Create Lead')
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const quickActions: QuickAction[] = [
    {
      id: 'create-event',
      title: 'Novo Evento',
      description: 'Agendar um novo evento',
      icon: <Calendar className="h-4 w-4" />,
      category: 'create',
      priority: 'high',
      shortcut: 'Ctrl+E',
      onClick: onCreateEvent
    },
    {
      id: 'create-artist',
      title: 'Novo Artista',
      description: 'Cadastrar novo artista',
      icon: <Music className="h-4 w-4" />,
      category: 'create',
      priority: 'medium',
      shortcut: 'Ctrl+A',
      onClick: onCreateArtist
    },
    {
      id: 'send-message',
      title: 'Enviar Mensagem',
      description: 'Contatar leads ou clientes',
      icon: <MessageSquare className="h-4 w-4" />,
      category: 'communicate',
      priority: 'high',
      shortcut: 'Ctrl+M',
      onClick: onSendMessage,
      badge: 'WhatsApp'
    },
    {
      id: 'schedule-call',
      title: 'Agendar Ligação',
      description: 'Marcar call com prospect',
      icon: <Phone className="h-4 w-4" />,
      category: 'communicate',
      priority: 'medium',
      onClick: onScheduleCall
    },
    {
      id: 'create-note',
      title: 'Nova Anotação',
      description: 'Registrar informação importante',
      icon: <FileText className="h-4 w-4" />,
      category: 'manage',
      priority: 'low',
      shortcut: 'Ctrl+N',
      onClick: onCreateNote
    },
    {
      id: 'create-lead',
      title: 'Novo Lead',
      description: 'Adicionar prospect ao pipeline',
      icon: <Users className="h-4 w-4" />,
      category: 'create',
      priority: 'high',
      onClick: onCreateLead
    },
    {
      id: 'view-pipeline',
      title: 'Ver Pipeline',
      description: 'Analisar funil de vendas',
      icon: <Zap className="h-4 w-4" />,
      category: 'analyze',
      priority: 'medium',
      onClick: onViewPipeline
    },
    {
      id: 'view-financial',
      title: 'Relatório Financeiro',
      description: 'Visualizar dados financeiros',
      icon: <DollarSign className="h-4 w-4" />,
      category: 'analyze',
      priority: 'medium',
      onClick: onViewFinancial
    }
  ];

  const categories = [
    { id: 'all', label: 'Todas', icon: <Zap className="h-3 w-3" /> },
    { id: 'create', label: 'Criar', icon: <Plus className="h-3 w-3" /> },
    { id: 'communicate', label: 'Comunicar', icon: <MessageSquare className="h-3 w-3" /> },
    { id: 'manage', label: 'Gerenciar', icon: <FileText className="h-3 w-3" /> },
    { id: 'analyze', label: 'Analisar', icon: <Zap className="h-3 w-3" /> }
  ];

  const filteredActions = selectedCategory === 'all' 
    ? quickActions 
    : quickActions.filter(action => action.category === selectedCategory);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 hover:border-red-300';
      case 'medium': return 'border-yellow-200 hover:border-yellow-300';
      case 'low': return 'border-gray-200 hover:border-gray-300';
      default: return 'border-gray-200 hover:border-gray-300';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'create': return 'text-green-600';
      case 'communicate': return 'text-blue-600';
      case 'manage': return 'text-purple-600';
      case 'analyze': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Ações Rápidas
        </CardTitle>
        <CardDescription>
          Acesso rápido às principais funcionalidades
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="h-7 text-xs"
            >
              {category.icon}
              <span className="ml-1">{category.label}</span>
            </Button>
          ))}
        </div>

        <Separator />

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredActions.map((action) => (
            <div
              key={action.id}
              className={`group relative p-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm ${
                getPriorityColor(action.priority)
              } ${action.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={action.disabled ? undefined : action.onClick}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`flex-shrink-0 mt-0.5 ${getCategoryColor(action.category)}`}>
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium group-hover:text-primary transition-colors">
                        {action.title}
                      </h4>
                      {action.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {action.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                    {action.shortcut && (
                      <div className="flex items-center gap-1 mt-2">
                        <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border">
                          {action.shortcut}
                        </kbd>
                      </div>
                    )}
                  </div>
                </div>
                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>

        {filteredActions.length === 0 && (
          <div className="text-center py-6">
            <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhuma ação disponível nesta categoria
            </p>
          </div>
        )}

        {/* Quick Stats */}
        <Separator />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{filteredActions.length} ações disponíveis</span>
          <span>Use Ctrl+K para busca rápida</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;