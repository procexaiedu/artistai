"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Artist, ArtistCreate, ArtistUpdate, artistsApi } from "@/lib/apiClient";

interface ArtistFormProps {
  artist?: Artist;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ArtistForm({ artist, open, onClose, onSuccess }: ArtistFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: artist?.name || "",
    photo_url: artist?.photo_url || "",
    base_fee: artist?.base_fee?.toString() || "0",
    min_fee: artist?.min_fee?.toString() || "0",
    down_payment_percentage: artist?.down_payment_percentage?.toString() || "50",
    base_city: artist?.base_city || "",
    status: artist?.status || "active",
  });

  const isEditing = !!artist;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const cleanData = {
        name: formData.name,
        photo_url: formData.photo_url || undefined,
        base_fee: parseFloat(formData.base_fee) || 0,
        min_fee: parseFloat(formData.min_fee) || 0,
        down_payment_percentage: parseInt(formData.down_payment_percentage) || 50,
        base_city: formData.base_city || undefined,
        status: formData.status,
      };

      if (isEditing) {
        await artistsApi.updateArtist(artist.id, cleanData as ArtistUpdate);
      } else {
        await artistsApi.createArtist(cleanData as ArtistCreate);
      }

      onSuccess();
      onClose();
      setFormData({
        name: "",
        photo_url: "",
        base_fee: "0",
        min_fee: "0",
        down_payment_percentage: "50",
        base_city: "",
        status: "active",
      });
    } catch (error) {
      console.error("Erro ao salvar artista:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Artista" : "Novo Artista"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Faça as alterações nos dados do artista."
              : "Preencha os dados para criar um novo artista."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Nome do artista"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo_url">URL da Foto</Label>
            <Input
              id="photo_url"
              value={formData.photo_url}
              onChange={(e) => handleInputChange("photo_url", e.target.value)}
              placeholder="https://exemplo.com/foto.jpg"
              type="url"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_fee">Cachê Base *</Label>
              <Input
                id="base_fee"
                value={formData.base_fee}
                onChange={(e) => handleInputChange("base_fee", e.target.value)}
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_fee">Cachê Mínimo *</Label>
              <Input
                id="min_fee"
                value={formData.min_fee}
                onChange={(e) => handleInputChange("min_fee", e.target.value)}
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="down_payment_percentage">% Entrada *</Label>
            <Input
              id="down_payment_percentage"
              value={formData.down_payment_percentage}
              onChange={(e) => handleInputChange("down_payment_percentage", e.target.value)}
              placeholder="50"
              type="number"
              min="0"
              max="100"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="base_city">Cidade Base</Label>
            <Input
              id="base_city"
              value={formData.base_city}
              onChange={(e) => handleInputChange("base_city", e.target.value)}
              placeholder="São Paulo, SP"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : isEditing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 