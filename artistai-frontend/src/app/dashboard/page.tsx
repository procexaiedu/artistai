"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Calendar, MessageSquare, TrendingUp, DollarSign, UserCheck, Settings } from "lucide-react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import EnhancedKpiCard from "@/components/dashboard/EnhancedKpiCard";
import { PipelineChart } from "@/components/dashboard/PipelineChart";
import { FinancialChart } from "@/components/dashboard/FinancialChart";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { RecentActivities } from "@/components/dashboard/RecentActivities";
import ActionCenter from "@/components/dashboard/ActionCenter";
import SmartNotifications from "@/components/dashboard/SmartNotifications";
import PredictiveInsights from "@/components/dashboard/PredictiveInsights";
import QuickActions from "@/components/dashboard/QuickActions";
import PersonalizationSettings from "@/components/dashboard/PersonalizationSettings";
import CommunicationHub from "@/components/dashboard/CommunicationHub";
import GamificationPanel from "@/components/dashboard/GamificationPanel";
import WorkflowOptimizer from "@/components/dashboard/WorkflowOptimizer";
import { dashboardApi, DashboardKPIs, PipelineSummaryItem, FinancialSummaryDashboard, RecentActivity, UpcomingEventSummary, ConversationsSummary } from "@/lib/apiClient";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [pipelineSummary, setPipelineSummary] = useState<PipelineSummaryItem[] | null>(null);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummaryDashboard | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[] | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEventSummary[] | null>(null);
  const [conversationsSummary, setConversationsSummary] = useState<ConversationsSummary | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [showPersonalization, setShowPersonalization] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Buscar todos os dados do dashboard
        const [kpisData, pipelineData, financialData, activitiesData, eventsData, conversationsData] = await Promise.all([
          dashboardApi.getKPIs(),
          dashboardApi.getPipelineSummary(),
          dashboardApi.getFinancialSummary(),
          dashboardApi.getRecentActivities(),
          dashboardApi.getUpcomingEvents(),
          dashboardApi.getConversationsSummary()
        ]);

        setKpis(kpisData);
        setPipelineSummary(pipelineData);
        setFinancialSummary(financialData);
        setRecentActivities(activitiesData);
        setUpcomingEvents(eventsData);
        setConversationsSummary(conversationsData);
      } catch (err: unknown) {
        console.error("Erro ao carregar dashboard:", err);
        
        // Tratamento de erro mais específico
        if (err && typeof err === 'object' && 'response' in err) {
          // Erro de resposta do servidor
          const errorResponse = err.response as { status: number; data?: { detail?: string; message?: string } };
          const status = errorResponse.status;
          const message = errorResponse.data?.detail || errorResponse.data?.message || 'Erro interno do servidor';
          
          if (status === 500) {
            setError(`Erro interno do servidor: ${message}`);
          } else if (status === 401) {
            setError("Não autorizado. Faça login novamente.");
          } else if (status === 403) {
            setError("Acesso negado.");
          } else {
            setError(`Erro ${status}: ${message}`);
          }
        } else if (err && typeof err === 'object' && 'request' in err) {
          // Erro de rede/conexão
          setError("Erro de conexão. Verifique se o backend está rodando e tente novamente.");
        } else {
          // Outros erros
          setError("Erro inesperado ao carregar dados do dashboard.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!kpis) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Nenhum dado disponível</p>
        </div>
      </DashboardLayout>
    );
  }

    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">
                Visão geral do seu negócio de gestão de artistas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPersonalization(!showPersonalization)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
              >
                <Settings className="h-4 w-4" />
                Personalizar
              </button>
            </div>
          </div>

          {/* Painel de Personalização */}
          {showPersonalization && (
            <PersonalizationSettings />
          )}

          {/* Navegação por Abas */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="communication">Comunicação</TabsTrigger>
              <TabsTrigger value="gamification">Gamificação</TabsTrigger>
              <TabsTrigger value="workflows">Fluxos</TabsTrigger>
            </TabsList>

            {/* Aba Visão Geral */}
            <TabsContent value="overview" className="space-y-6">

              {/* Métricas principais aprimoradas */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <EnhancedKpiCard
                  title="Artistas Ativos"
                  value={kpis?.active_artists_count || 0}
                  icon={<Users className="h-4 w-4" />}
                  description="Total de artistas cadastrados"
                  trend={{ direction: 'up', percentage: 2, period: "vs mês anterior" }}
                  target={{ value: 50, label: "Meta anual" }}
                  comparison={{ value: 45, label: "Meta anual" }}
                />
                
                <EnhancedKpiCard
                  title="Próximos Eventos"
                  value={kpis?.upcoming_events_count || 0}
                  icon={<Calendar className="h-4 w-4" />}
                  description="Eventos confirmados (30 dias)"
                  trend={{ direction: 'up', percentage: 5, period: "vs semana anterior" }}
                  target={{ value: 20, label: "Meta mensal" }}
                  comparison={{ value: 15, label: "Mês passado" }}
                />
                
                <EnhancedKpiCard
                  title="Leads Ativos"
                  value={kpis?.active_leads_count || 0}
                  icon={<UserCheck className="h-4 w-4" />}
                  description="Contratantes no pipeline"
                  trend={{ direction: 'up', percentage: conversationsSummary?.open_conversations || 8, period: "vs mês anterior" }}
                  target={{ value: 100, label: "Meta trimestral" }}
                  comparison={{ value: 85, label: "Trimestre" }}
                />
                
                <EnhancedKpiCard
                  title="Receita do Mês"
                  value={kpis?.monthly_revenue || 0}
                  icon={<DollarSign className="h-4 w-4" />}
                  description="Receita total do mês"
                  trend={{ direction: 'up', percentage: 20.1, period: "vs mês anterior" }}
                  target={{ value: 50000, label: "Meta mensal" }}
                  comparison={{ value: 45000, label: "Meta mensal" }}
                />
              </div>

              {/* Centro de Ações e Notificações */}
              <div className="grid gap-4 md:grid-cols-2">
                <ActionCenter
                  upcomingEvents={upcomingEvents ? upcomingEvents.map(event => ({
                    id: event.id,
                    title: event.title,
                    date: event.event_date,
                    status: event.status
                  })) : []}
                  recentActivities={(recentActivities || []).map((activity, index) => ({
                    id: `activity-${index}`,
                    type: activity.type,
                    description: activity.description,
                    timestamp: activity.timestamp
                  }))}
                  pipelineData={(pipelineSummary || []).map(item => ({
                    stage: item.stage_name,
                    count: item.contractor_count,
                    value: item.contractor_count * 5000 // Estimativa de valor por lead
                  }))}
                  financialData={financialSummary ? {
                    revenue: financialSummary.monthly_income,
                    expenses: financialSummary.monthly_expenses,
                    profit: financialSummary.net_income
                  } : undefined}
                />
                <SmartNotifications
                  upcomingEvents={upcomingEvents ? upcomingEvents.map(event => ({
                    id: event.id,
                    title: event.title,
                    date: event.event_date,
                    status: event.status
                  })) : []}
                  recentActivities={(recentActivities || []).map((activity, index) => ({
                    id: `activity-${index}`,
                    type: activity.type,
                    description: activity.description,
                    timestamp: activity.timestamp
                  }))}
                  pipelineData={(pipelineSummary || []).map(item => ({
                    stage: item.stage_name,
                    count: item.contractor_count,
                    value: item.contractor_count * 5000 // Estimativa de valor por lead
                  }))}
                  financialData={financialSummary ? {
                    revenue: financialSummary.monthly_income,
                    expenses: financialSummary.monthly_expenses,
                    profit: financialSummary.net_income
                  } : undefined}
                />
              </div>

              {/* Ações Rápidas */}
              <QuickActions />

              {/* Gráficos e informações */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Gráfico Financeiro */}
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Resumo Financeiro</CardTitle>
                    <CardDescription>
                      Receitas vs Despesas do mês atual
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FinancialChart data={financialSummary || { monthly_income: 0, monthly_expenses: 0, net_income: 0 }} />
                  </CardContent>
                </Card>

                {/* Atividades Recentes */}
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Atividade Recente</CardTitle>
                    <CardDescription>
                      Últimas interações do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RecentActivities activities={recentActivities || []} />
                  </CardContent>
                </Card>
              </div>

              {/* Pipeline e Eventos */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Gráfico do Pipeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>Pipeline de Vendas</CardTitle>
                    <CardDescription>
                      Distribuição de contratantes por etapa
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PipelineChart data={pipelineSummary || []} />
                  </CardContent>
                </Card>

                {/* Próximos Eventos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Próximos Eventos</CardTitle>
                    <CardDescription>
                      Eventos confirmados para os próximos dias
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <UpcomingEvents events={upcomingEvents || []} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Aba Insights */}
            <TabsContent value="insights" className="space-y-6">
              <PredictiveInsights
                upcomingEvents={upcomingEvents ? upcomingEvents.map(event => ({
                  id: event.id,
                  title: event.title,
                  date: event.event_date,
                  status: event.status
                })) : []}
                recentActivities={(recentActivities || []).map((activity, index) => ({
                  id: `activity-${index}`,
                  type: activity.type,
                  description: activity.description,
                  timestamp: activity.timestamp
                }))}
                pipelineData={(pipelineSummary || []).map(item => ({
                  stage: item.stage_name,
                  count: item.contractor_count,
                  value: item.contractor_count * 5000 // Estimativa de valor por lead
                }))}
                financialData={financialSummary ? {
                  revenue: financialSummary.monthly_income,
                  expenses: financialSummary.monthly_expenses,
                  profit: financialSummary.net_income
                } : undefined}
                kpis={kpis ? {
                  artists: kpis.active_artists_count,
                  events: kpis.upcoming_events_count,
                  leads: kpis.active_leads_count,
                  revenue: kpis.monthly_revenue
                } : undefined}
              />
            </TabsContent>

            {/* Aba Comunicação */}
            <TabsContent value="communication" className="space-y-6">
              <CommunicationHub userId="default" />
            </TabsContent>

            {/* Aba Gamificação */}
            <TabsContent value="gamification" className="space-y-6">
              <GamificationPanel userId="default" />
            </TabsContent>

            {/* Aba Fluxos de Trabalho */}
            <TabsContent value="workflows" className="space-y-6">
              <WorkflowOptimizer />
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    );
}