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
import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle } from "lucide-react";
import { Contractor, ContractorCreate, ContractorUpdate, contractorsApi } from "@/lib/apiClient";
import axios from "axios";

interface ContractorFormProps {
  contractor?: Contractor;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ContractorForm({ contractor, open, onClose, onSuccess }: ContractorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: contractor?.name || "",
    cpf_cnpj: contractor?.cpf_cnpj || "",
    email: contractor?.email || "",
    phone: contractor?.phone || "",
    location: contractor?.location || "",
    specialties: contractor?.specialties?.join(", ") || "",
    bio: contractor?.bio || "",
  });

  const isEditing = !!contractor;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro quando usuário começar a digitar
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      
      const cleanData = {
        name: formData.name,
        cpf_cnpj: formData.cpf_cnpj || undefined,
        email: formData.email || undefined,
        phone: formData.phone,
        location: formData.location || undefined,
        specialties: formData.specialties ? formData.specialties.split(",").map(s => s.trim()).filter(s => s) : undefined,
        bio: formData.bio || undefined,
      };

      if (isEditing) {
        await contractorsApi.updateContractor(contractor.id, cleanData as ContractorUpdate);
      } else {
        await contractorsApi.createContractor(cleanData as ContractorCreate);
      }

      onSuccess();
      onClose();
      setFormData({
        name: "",
        cpf_cnpj: "",
        email: "",
        phone: "",
        location: "",
        specialties: "",
        bio: "",
      });
    } catch (error) {
      console.error("Erro ao salvar contratante:", error);
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          // Erro de conflito - CPF/CNPJ ou telefone duplicado
          const errorMessage = error.response?.data?.detail || 
            "Já existe um contratante cadastrado com estes dados (CPF/CNPJ ou telefone).";
          setError(errorMessage);
        } else if (error.response?.status === 400) {
          // Erro de validação
          const errorMessage = error.response?.data?.detail || 
            "Dados inválidos. Verifique os campos preenchidos.";
          setError(errorMessage);
        } else {
          setError("Erro ao salvar contratante. Tente novamente.");
        }
      } else {
        setError("Erro inesperado. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Contratante" : "Novo Contratante"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Faça as alterações nos dados do contratante."
              : "Preencha os dados para criar um novo contratante."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Nome do contratante"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
            <Input
              id="cpf_cnpj"
              value={formData.cpf_cnpj}
              onChange={(e) => handleInputChange("cpf_cnpj", e.target.value)}
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="(11) 99999-9999"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Cidade, Estado"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialties">Especialidades</Label>
            <Input
              id="specialties"
              value={formData.specialties}
              onChange={(e) => handleInputChange("specialties", e.target.value)}
              placeholder="Separadas por vírgula: Pintura, Escultura, Design"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografia</Label>
            <textarea
              id="bio"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Breve descrição sobre o contratante..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : (isEditing ? "Atualizar" : "Criar")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}