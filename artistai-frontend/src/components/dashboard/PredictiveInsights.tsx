'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  DollarSign,
  Users,
  BarChart3,
  Lightbulb,
  AlertCircle
} from 'lucide-react';

interface Insight {
  id: string;
  type: 'trend' | 'prediction' | 'recommendation' | 'alert';
  title: string;
  description: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  category: 'revenue' | 'events' | 'leads' | 'efficiency';
  trend: 'up' | 'down' | 'stable';
  value?: string;
  target?: string;
  progress?: number;
}

interface PredictiveInsightsProps {
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
  kpis?: {
    artists: number;
    events: number;
    leads: number;
    revenue: number;
  };
}

const PredictiveInsights: React.FC<PredictiveInsightsProps> = ({
  upcomingEvents = [],
  recentActivities = [],
  pipelineData = [],
  financialData,
  kpis
}) => {
  // Gerar insights preditivos baseados nos dados
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];

    // Análise de tendência de eventos
    if (upcomingEvents.length > 0) {
      const eventsThisMonth = upcomingEvents.filter(event => {
        const eventDate = new Date(event.date);
        const now = new Date();
        return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
      }).length;

      const trend = eventsThisMonth > 3 ? 'up' : eventsThisMonth < 2 ? 'down' : 'stable';
      
      insights.push({
        id: 'events-trend',
        type: 'trend',
        title: 'Tendência de Eventos',
        description: `${eventsThisMonth} eventos agendados este mês`,
        confidence: 85,
        impact: eventsThisMonth > 5 ? 'high' : 'medium',
        category: 'events',
        trend,
        value: eventsThisMonth.toString(),
        target: '5+'
      });
    }

    // Previsão de receita baseada no pipeline
    if (pipelineData.length > 0) {
      const negotiationStage = pipelineData.find(stage => 
        stage.stage?.toLowerCase().includes('negociação')
      );
      
      if (negotiationStage && negotiationStage.count > 0) {
        const estimatedRevenue = negotiationStage.count * 5000; // Estimativa média por lead
        const confidence = Math.min(90, 60 + (negotiationStage.count * 5));
        
        insights.push({
          id: 'revenue-prediction',
          type: 'prediction',
          title: 'Previsão de Receita',
          description: `Potencial de ${estimatedRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} baseado no pipeline`,
          confidence,
          impact: 'high',
          category: 'revenue',
          trend: 'up',
          value: estimatedRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
          progress: Math.min(100, (negotiationStage.count / 10) * 100)
        });
      }
    }

    // Recomendação de eficiência
    const activityRate = recentActivities.length;
    if (activityRate < 5) {
      insights.push({
        id: 'efficiency-recommendation',
        type: 'recommendation',
        title: 'Oportunidade de Melhoria',
        description: 'Aumente a frequência de contatos para melhorar a conversão',
        confidence: 75,
        impact: 'medium',
        category: 'efficiency',
        trend: 'up',
        value: `${activityRate} atividades`,
        target: '10+ atividades'
      });
    }

    // Alerta de performance financeira
    if (financialData?.profit !== undefined) {
      const isPositive = financialData.profit > 0;
      const impact = Math.abs(financialData.profit) > 10000 ? 'high' : 'medium';
      
      insights.push({
        id: 'financial-performance',
        type: isPositive ? 'trend' : 'alert',
        title: isPositive ? 'Performance Positiva' : 'Atenção Necessária',
        description: `Resultado ${isPositive ? 'positivo' : 'negativo'} de ${Math.abs(financialData.profit).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
        confidence: 95,
        impact,
        category: 'revenue',
        trend: isPositive ? 'up' : 'down',
        value: financialData.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      });
    }

    // Insight sobre leads ativos
    if (kpis?.leads !== undefined) {
      const leadsCount = kpis.leads;
      const trend = leadsCount > 10 ? 'up' : leadsCount < 5 ? 'down' : 'stable';
      
      insights.push({
        id: 'leads-insight',
        type: 'trend',
        title: 'Pipeline de Leads',
        description: `${leadsCount} leads ativos no pipeline`,
        confidence: 80,
        impact: leadsCount > 15 ? 'high' : 'medium',
        category: 'leads',
        trend,
        value: leadsCount.toString(),
        target: '15+',
        progress: Math.min(100, (leadsCount / 20) * 100)
      });
    }

    return insights.sort((a, b) => {
      // Priorizar por impacto e depois por confiança
      const impactOrder = { high: 3, medium: 2, low: 1 };
      if (impactOrder[a.impact] !== impactOrder[b.impact]) {
        return impactOrder[b.impact] - impactOrder[a.impact];
      }
      return b.confidence - a.confidence;
    });
  };

  const insights = generateInsights();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-4 w-4" />;
      case 'prediction': return <Target className="h-4 w-4" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4" />;
      case 'alert': return <AlertCircle className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />;
      case 'stable': return <BarChart3 className="h-3 w-3 text-yellow-500" />;
      default: return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue': return <DollarSign className="h-3 w-3" />;
      case 'events': return <Calendar className="h-3 w-3" />;
      case 'leads': return <Users className="h-3 w-3" />;
      case 'efficiency': return <BarChart3 className="h-3 w-3" />;
      default: return <BarChart3 className="h-3 w-3" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trend': return 'text-blue-600';
      case 'prediction': return 'text-purple-600';
      case 'recommendation': return 'text-green-600';
      case 'alert': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Insights Preditivos
          </CardTitle>
          <CardDescription>
            Análises e previsões baseadas em IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Coletando dados para gerar insights...
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
          <BarChart3 className="h-5 w-5" />
          Insights Preditivos
        </CardTitle>
        <CardDescription>
          Análises e previsões baseadas em IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div key={insight.id}>
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`flex-shrink-0 mt-1 ${getTypeColor(insight.type)}`}>
                    {getTypeIcon(insight.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium">{insight.title}</h4>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(insight.trend)}
                        {getCategoryIcon(insight.category)}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {insight.description}
                    </p>
                    
                    {insight.value && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">{insight.value}</span>
                        {insight.target && (
                          <span className="text-xs text-muted-foreground">/ {insight.target}</span>
                        )}
                      </div>
                    )}
                    
                    {insight.progress !== undefined && (
                      <div className="space-y-1">
                        <Progress value={insight.progress} className="h-2" />
                        <span className="text-xs text-muted-foreground">
                          {Math.round(insight.progress)}% do objetivo
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={getImpactColor(insight.impact) as 'default' | 'secondary' | 'destructive' | 'outline'} className="text-xs">
                    {insight.impact === 'high' ? 'Alto' : insight.impact === 'medium' ? 'Médio' : 'Baixo'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {insight.confidence}% confiança
                  </span>
                </div>
              </div>
            </div>
            {index < insights.length - 1 && <Separator className="mt-4" />}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PredictiveInsights;