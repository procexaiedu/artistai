"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar as CalendarIcon, Users, Building2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event, eventsApi } from "@/lib/apiClient";
import { EventCalendar } from "@/components/events/EventCalendar";
import { EventForm } from "@/components/events/EventForm";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventsApi.getEvents(0, 1000);
      setEvents(data);
    } catch (err) {
      setError("Erro ao carregar eventos. Verifique se o backend está rodando.");
      console.error("Erro ao carregar eventos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleEventChanged = () => {
    loadEvents();
  };

  // Calcular estatísticas
  const totalEvents = events.length;
  const confirmedEvents = events.filter(e => e.status === "confirmed").length;
  const pendingEvents = events.filter(e => e.status === "pending_payment").length;
  const totalRevenue = events
    .filter(e => e.status === "confirmed" || e.status === "completed")
    .reduce((sum, e) => sum + e.agreed_fee, 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando eventos...</p>
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
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadEvents} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agenda de Eventos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os shows e apresentações dos seus artistas
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Agendar Evento
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total de Eventos
                </p>
                <p className="text-2xl font-bold">{totalEvents}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Confirmados
                </p>
                <p className="text-2xl font-bold">{confirmedEvents}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pendentes
                </p>
                <p className="text-2xl font-bold">{pendingEvents}</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Receita Total
                </p>
                <p className="text-2xl font-bold">
                  R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legenda de Status */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span>Confirmado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span>Pendente de Pagamento</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span>Cancelado</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Finalizado</span>
          </div>
        </div>

        {/* Instruções */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Como usar o calendário:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Clique em uma data</strong> para agendar um novo evento</li>
            <li>• <strong>Clique em um evento</strong> para visualizar ou editar detalhes</li>
            <li>• Use os botões de navegação para ver meses diferentes</li>
            <li>• A cor do evento indica seu status atual</li>
          </ul>
        </div>

        {/* Calendário */}
        <EventCalendar onEventChanged={handleEventChanged} />

        {/* Modal de Criação */}
        <EventForm
          open={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleEventChanged}
        />
      </div>
    </DashboardLayout>
  );
} 