'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Workflow, 
  Zap, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Play,
  Pause,
  Settings,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  MessageSquare,
  DollarSign,
  FileText,
  Phone,
  Mail,
  Target,
  Lightbulb,
  RefreshCw,
  ChevronRight
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  estimatedTime: number; // in minutes
  actualTime?: number;
  assignee?: string;
  dependencies: string[];
  automatable: boolean;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'marketing' | 'events' | 'communication' | 'financial';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'paused' | 'completed' | 'draft';
  progress: number;
  steps: WorkflowStep[];
  estimatedDuration: number;
  actualDuration?: number;
  efficiency: number;
  lastRun?: Date;
  nextRun?: Date;
  isAutomated: boolean;
}

interface WorkflowSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  estimatedSavings: string;
  icon: React.ReactNode;
}

interface WorkflowOptimizerProps {
  onCreateWorkflow?: () => void;
  onEditWorkflow?: (workflowId: string) => void;
  onRunWorkflow?: (workflowId: string) => void;
  onViewAnalytics?: () => void;
}

const WorkflowOptimizer: React.FC<WorkflowOptimizerProps> = ({
  onCreateWorkflow = () => console.log('Create Workflow'),
  onEditWorkflow = () => console.log('Edit Workflow'),
  onRunWorkflow = () => console.log('Run Workflow'),
  onViewAnalytics = () => console.log('View Analytics')
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'suggestions' | 'analytics'>('active');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  // Mock data - in real app, this would come from API
  const [workflows] = useState<Workflow[]>([
    {
      id: 'lead-nurturing',
      name: 'Nutrição de Leads',
      description: 'Processo automatizado para nutrir leads até conversão',
      category: 'sales',
      priority: 'high',
      status: 'active',
      progress: 75,
      estimatedDuration: 120,
      actualDuration: 95,
      efficiency: 87,
      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 2),
      nextRun: new Date(Date.now() + 1000 * 60 * 60 * 4),
      isAutomated: true,
      steps: [
        {
          id: 'initial-contact',
          name: 'Contato Inicial',
          description: 'Enviar mensagem de boas-vindas',
          icon: <MessageSquare className="h-4 w-4" />,
          status: 'completed',
          estimatedTime: 5,
          actualTime: 3,
          dependencies: [],
          automatable: true
        },
        {
          id: 'follow-up',
          name: 'Follow-up',
          description: 'Acompanhar interesse do lead',
          icon: <Phone className="h-4 w-4" />,
          status: 'in_progress',
          estimatedTime: 15,
          dependencies: ['initial-contact'],
          automatable: false
        },
        {
          id: 'proposal',
          name: 'Enviar Proposta',
          description: 'Criar e enviar proposta personalizada',
          icon: <FileText className="h-4 w-4" />,
          status: 'pending',
          estimatedTime: 30,
          dependencies: ['follow-up'],
          automatable: true
        }
      ]
    },
    {
      id: 'event-planning',
      name: 'Planejamento de Eventos',
      description: 'Fluxo completo para organização de eventos',
      category: 'events',
      priority: 'medium',
      status: 'active',
      progress: 45,
      estimatedDuration: 180,
      efficiency: 92,
      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24),
      isAutomated: false,
      steps: [
        {
          id: 'venue-booking',
          name: 'Reserva do Local',
          description: 'Confirmar disponibilidade e reservar',
          icon: <Calendar className="h-4 w-4" />,
          status: 'completed',
          estimatedTime: 45,
          actualTime: 40,
          dependencies: [],
          automatable: false
        },
        {
          id: 'artist-booking',
          name: 'Contratação de Artistas',
          description: 'Negociar e contratar artistas',
          icon: <Users className="h-4 w-4" />,
          status: 'in_progress',
          estimatedTime: 60,
          dependencies: ['venue-booking'],
          automatable: false
        }
      ]
    },
    {
      id: 'financial-reporting',
      name: 'Relatórios Financeiros',
      description: 'Geração automática de relatórios mensais',
      category: 'financial',
      priority: 'low',
      status: 'paused',
      progress: 100,
      estimatedDuration: 30,
      actualDuration: 25,
      efficiency: 95,
      lastRun: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      nextRun: new Date(Date.now() + 1000 * 60 * 60 * 24 * 23),
      isAutomated: true,
      steps: [
        {
          id: 'data-collection',
          name: 'Coleta de Dados',
          description: 'Reunir dados financeiros do mês',
          icon: <BarChart3 className="h-4 w-4" />,
          status: 'completed',
          estimatedTime: 10,
          actualTime: 8,
          dependencies: [],
          automatable: true
        },
        {
          id: 'report-generation',
          name: 'Geração do Relatório',
          description: 'Criar relatório formatado',
          icon: <FileText className="h-4 w-4" />,
          status: 'completed',
          estimatedTime: 20,
          actualTime: 17,
          dependencies: ['data-collection'],
          automatable: true
        }
      ]
    }
  ]);

  const [suggestions] = useState<WorkflowSuggestion[]>([
    {
      id: 'automate-follow-ups',
      title: 'Automatizar Follow-ups',
      description: 'Configure lembretes automáticos para follow-ups de leads',
      category: 'Vendas',
      impact: 'high',
      effort: 'medium',
      estimatedSavings: '5h/semana',
      icon: <Zap className="h-4 w-4" />
    },
    {
      id: 'template-proposals',
      title: 'Templates de Propostas',
      description: 'Crie templates reutilizáveis para propostas comerciais',
      category: 'Vendas',
      impact: 'medium',
      effort: 'low',
      estimatedSavings: '3h/semana',
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: 'automated-invoicing',
      title: 'Faturamento Automático',
      description: 'Automatize a geração e envio de faturas',
      category: 'Financeiro',
      impact: 'high',
      effort: 'high',
      estimatedSavings: '8h/mês',
      icon: <DollarSign className="h-4 w-4" />
    },
    {
      id: 'event-reminders',
      title: 'Lembretes de Eventos',
      description: 'Configure lembretes automáticos para clientes',
      category: 'Eventos',
      impact: 'medium',
      effort: 'low',
      estimatedSavings: '2h/semana',
      icon: <Calendar className="h-4 w-4" />
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'paused': return 'text-yellow-600';
      case 'completed': return 'text-blue-600';
      case 'draft': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-gray-400" />;
      case 'skipped': return <ChevronRight className="h-4 w-4 text-gray-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sales': return 'text-green-600';
      case 'marketing': return 'text-blue-600';
      case 'events': return 'text-purple-600';
      case 'communication': return 'text-orange-600';
      case 'financial': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getEfficiencyIcon = (efficiency: number) => {
    if (efficiency >= 90) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (efficiency >= 70) return <BarChart3 className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const formatLastRun = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    return 'Agora mesmo';
  };

  const activeWorkflows = workflows.filter(w => w.status === 'active');
  const totalEfficiency = workflows.reduce((acc, w) => acc + w.efficiency, 0) / workflows.length;
  const automatedWorkflows = workflows.filter(w => w.isAutomated).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Workflow className="h-5 w-5" />
          Otimizador de Fluxos
        </CardTitle>
        <CardDescription>
          Automatize e otimize seus processos de trabalho
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{activeWorkflows.length}</div>
            <div className="text-xs text-muted-foreground">Ativos</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{Math.round(totalEfficiency)}%</div>
            <div className="text-xs text-muted-foreground">Eficiência</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{automatedWorkflows}</div>
            <div className="text-xs text-muted-foreground">Automatizados</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{suggestions.length}</div>
            <div className="text-xs text-muted-foreground">Sugestões</div>
          </div>
        </div>

        <Separator />

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg">
          {[
            { id: 'active', label: 'Fluxos Ativos', icon: <Play className="h-3 w-3" /> },
            { id: 'suggestions', label: 'Sugestões', icon: <Lightbulb className="h-3 w-3" /> },
            { id: 'analytics', label: 'Análises', icon: <BarChart3 className="h-3 w-3" /> }
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id as 'active' | 'suggestions' | 'analytics')}
              className="flex-1 h-8 text-xs"
            >
              {tab.icon}
              <span className="ml-1 hidden sm:inline">{tab.label}</span>
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'active' && (
          <div className="space-y-3">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                  selectedWorkflow === workflow.id ? 'border-primary bg-primary/5' : ''
                }`}
                onClick={() => setSelectedWorkflow(
                  selectedWorkflow === workflow.id ? null : workflow.id
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{workflow.name}</span>
                      <Badge className={getStatusBadgeColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                      {workflow.isAutomated && (
                        <Badge variant="outline" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          Auto
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {workflow.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Progresso</span>
                        <span>{workflow.progress}%</span>
                      </div>
                      <Progress value={workflow.progress} className="h-2" />
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          {getEfficiencyIcon(workflow.efficiency)}
                          {workflow.efficiency}% eficiência
                        </span>
                        {workflow.lastRun && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatLastRun(workflow.lastRun)}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRunWorkflow(workflow.id);
                          }}
                          className="h-6 px-2"
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditWorkflow(workflow.id);
                          }}
                          className="h-6 px-2"
                        >
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Workflow Steps (expanded view) */}
                {selectedWorkflow === workflow.id && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium mb-3">Etapas do Fluxo</h4>
                    <div className="space-y-2">
                      {workflow.steps.map((step, index) => (
                        <div key={step.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                          <div className="flex items-center gap-2">
                            {getStepStatusIcon(step.status)}
                            <div className="text-muted-foreground">{step.icon}</div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{step.name}</span>
                              {step.automatable && (
                                <Badge variant="outline" className="text-xs">
                                  <Zap className="h-2 w-2 mr-1" />
                                  Auto
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{step.description}</p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {step.actualTime ? 
                              `${step.actualTime}m` : 
                              `~${step.estimatedTime}m`
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-4 border rounded-lg hover:shadow-sm transition-all">
                <div className="flex items-start gap-3">
                  <div className="text-muted-foreground mt-0.5">
                    {suggestion.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{suggestion.title}</span>
                      <Badge variant="secondary">{suggestion.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {suggestion.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs">
                        <span className={`flex items-center gap-1 ${getImpactColor(suggestion.impact)}`}>
                          <Target className="h-3 w-3" />
                          Impacto: {suggestion.impact}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Esforço: {suggestion.effort}
                        </span>
                        <span className="flex items-center gap-1 text-green-600">
                          <TrendingUp className="h-3 w-3" />
                          Economia: {suggestion.estimatedSavings}
                        </span>
                      </div>
                      <Button size="sm" variant="outline">
                        Implementar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-4">
            {/* Efficiency Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Eficiência por Categoria
                </h4>
                <div className="space-y-3">
                  {['sales', 'events', 'financial'].map((category) => {
                    const categoryWorkflows = workflows.filter(w => w.category === category);
                    const avgEfficiency = categoryWorkflows.length > 0 
                      ? categoryWorkflows.reduce((acc, w) => acc + w.efficiency, 0) / categoryWorkflows.length
                      : 0;
                    
                    return (
                      <div key={category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="capitalize">{category}</span>
                          <span>{Math.round(avgEfficiency)}%</span>
                        </div>
                        <Progress value={avgEfficiency} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Tempo Economizado
                </h4>
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">24h</div>
                    <div className="text-xs text-muted-foreground">Esta semana</div>
                  </div>
                  <Separator />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Automação:</span>
                      <span>18h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Otimização:</span>
                      <span>6h</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Performance */}
            <div className="p-4 border rounded-lg">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Performance Recente
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">95%</div>
                  <div className="text-xs text-muted-foreground">Taxa de Sucesso</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">-32%</div>
                  <div className="text-xs text-muted-foreground">Tempo Médio</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-600">+18%</div>
                  <div className="text-xs text-muted-foreground">Produtividade</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={onCreateWorkflow} className="flex-1">
            <Workflow className="h-4 w-4 mr-2" />
            Novo Fluxo
          </Button>
          <Button variant="outline" onClick={onViewAnalytics}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Análises
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowOptimizer;