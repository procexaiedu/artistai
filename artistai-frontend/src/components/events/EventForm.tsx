"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Event, EventCreate, EventUpdate, eventsApi, Artist, Contractor, artistsApi, contractorsApi } from "@/lib/apiClient";

interface EventFormProps {
  event?: Event;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedDate?: string; // Para pre-definir data quando clicado no calendário
}

const EVENT_STATUS_OPTIONS = [
  { value: "pending_payment", label: "Pendente de Pagamento" },
  { value: "confirmed", label: "Confirmado" },
  { value: "cancelled", label: "Cancelado" },
  { value: "completed", label: "Finalizado" },
];

export function EventForm({ event, open, onClose, onSuccess, selectedDate }: EventFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [formData, setFormData] = useState({
    title: event?.title || "",
    event_date: event?.event_date || selectedDate || "",
    event_location: event?.event_location || "",
    agreed_fee: event?.agreed_fee?.toString() || "",
    status: event?.status || "pending_payment",
    artist_id: event?.artist_id || "",
    contractor_id: event?.contractor_id || "",
  });

  const isEditing = !!event;

  // Carregar artistas e contratantes para os selects
  useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoadingOptions(true);
        const [artistsData, contractorsData] = await Promise.all([
          artistsApi.getArtists(),
          contractorsApi.getContractors(),
        ]);
        setArtists(artistsData);
        setContractors(contractorsData);
      } catch (error) {
        console.error("Erro ao carregar opções:", error);
      } finally {
        setLoadingOptions(false);
      }
    };

    if (open) {
      loadOptions();
    }
  }, [open]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const cleanData = {
        title: formData.title,
        event_date: formData.event_date,
        event_location: formData.event_location || undefined,
        agreed_fee: parseFloat(formData.agreed_fee),
        status: formData.status,
        artist_id: formData.artist_id,
        contractor_id: formData.contractor_id,
      };

      if (isEditing) {
        await eventsApi.updateEvent(event.id, cleanData as EventUpdate);
      } else {
        await eventsApi.createEvent(cleanData as EventCreate);
      }

      onSuccess();
      onClose();
      setFormData({
        title: "",
        event_date: "",
        event_location: "",
        agreed_fee: "",
        status: "pending_payment",
        artist_id: "",
        contractor_id: "",
      });
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Evento" : "Novo Evento"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Faça as alterações nos dados do evento."
              : "Preencha os dados para criar um novo evento."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Nome do evento"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date">Data *</Label>
              <Input
                id="event_date"
                type="date"
                value={formData.event_date}
                onChange={(e) => handleInputChange("event_date", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agreed_fee">Valor Acordado *</Label>
              <Input
                id="agreed_fee"
                type="number"
                step="0.01"
                min="0"
                value={formData.agreed_fee}
                onChange={(e) => handleInputChange("agreed_fee", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_location">Local</Label>
            <Textarea
              id="event_location"
              value={formData.event_location}
              onChange={(e) => handleInputChange("event_location", e.target.value)}
              placeholder="Endereço ou local do evento"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Artista *</Label>
              <Select
                value={formData.artist_id}
                onValueChange={(value) => handleInputChange("artist_id", value)}
                disabled={loadingOptions}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingOptions ? "Carregando..." : "Selecione um artista"} />
                </SelectTrigger>
                <SelectContent>
                  {artists.map((artist) => (
                    <SelectItem key={artist.id} value={artist.id}>
                      {artist.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Contratante *</Label>
              <Select
                value={formData.contractor_id}
                onValueChange={(value) => handleInputChange("contractor_id", value)}
                disabled={loadingOptions}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingOptions ? "Carregando..." : "Selecione um contratante"} />
                </SelectTrigger>
                <SelectContent>
                  {contractors.map((contractor) => (
                    <SelectItem key={contractor.id} value={contractor.id}>
                      {contractor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !formData.artist_id || !formData.contractor_id}>
              {isLoading ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 