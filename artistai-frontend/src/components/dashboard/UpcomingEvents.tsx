import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, DollarSign, Clock } from "lucide-react";
import { UpcomingEventSummary } from "@/lib/apiClient";

interface UpcomingEventsProps {
  events: UpcomingEventSummary[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Próximos Eventos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhum evento próximo encontrado
          </p>
        ) : (
          <div className="space-y-4">
            {events.slice(0, 5).map((event) => (
              <div key={event.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{event.title}</h4>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(event.event_date)}
                      </div>
                      {event.event_location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.event_location}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(event.status)}>
                    {event.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    {event.artist_name && (
                      <span className="text-muted-foreground">
                        Artista: <span className="font-medium">{event.artist_name}</span>
                      </span>
                    )}
                    {event.contractor_name && (
                      <span className="text-muted-foreground">
                        Contratante: <span className="font-medium">{event.contractor_name}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span className="font-semibold">{formatCurrency(event.agreed_fee)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{event.days_until} dias</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}