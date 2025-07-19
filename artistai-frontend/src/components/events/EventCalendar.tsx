"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Event, eventsApi } from "@/lib/apiClient";
import { EventForm } from "./EventForm";

interface EventCalendarProps {
  onEventChanged: () => void;
}

export function EventCalendar({ onEventChanged }: EventCalendarProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");

  const loadEvents = async (startDate?: string, endDate?: string) => {
    try {
      const data = await eventsApi.getEvents(0, 1000, startDate, endDate);
      setEvents(data);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Converter eventos para formato do FullCalendar
  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: `${event.title} - ${event.artist.name}`,
    date: event.event_date,
    extendedProps: {
      event: event,
    },
    backgroundColor: getEventColor(event.status),
    borderColor: getEventColor(event.status),
  }));

  function getEventColor(status: string): string {
    switch (status) {
      case "confirmed":
        return "#10b981"; // Green
      case "pending_payment":
        return "#f59e0b"; // Yellow
      case "cancelled":
        return "#ef4444"; // Red
      case "completed":
        return "#6366f1"; // Blue
      default:
        return "#6b7280"; // Gray
    }
  }

  const handleDateClick = (dateInfo: { dateStr: string }) => {
    setSelectedDate(dateInfo.dateStr);
    setShowCreateForm(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEventClick = (eventInfo: any) => {
    const event = eventInfo.event.extendedProps.event;
    setEditingEvent(event);
  };

  const handleEventChanged = () => {
    loadEvents();
    onEventChanged();
  };

  const handleDatesSet = (dateInfo: { start: Date; end: Date }) => {
    // Carregar eventos quando o usuário navegar no calendário
    const startDate = dateInfo.start.toISOString().split('T')[0];
    const endDate = dateInfo.end.toISOString().split('T')[0];
    loadEvents(startDate, endDate);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={calendarEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          height="auto"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek",
          }}
          locale="pt-br"
          buttonText={{
            today: "Hoje",
            month: "Mês",
            week: "Semana",
          }}
          dayHeaderFormat={{
            weekday: "short",
          }}
          eventDisplay="block"
          dayMaxEvents={3}
          moreLinkText="mais"
          eventClassNames="cursor-pointer"
          dayCellClassNames="cursor-pointer hover:bg-gray-50"
        />
      </div>

      {/* Modal de Criação */}
      <EventForm
        open={showCreateForm}
        onClose={() => {
          setShowCreateForm(false);
          setSelectedDate("");
        }}
        onSuccess={handleEventChanged}
        selectedDate={selectedDate}
      />

      {/* Modal de Edição */}
      <EventForm
        event={editingEvent || undefined}
        open={!!editingEvent}
        onClose={() => setEditingEvent(null)}
        onSuccess={handleEventChanged}
      />
    </>
  );
} 