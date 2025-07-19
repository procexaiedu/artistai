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
import { Contractor, ContractorCreate, ContractorUpdate, contractorsApi } from "@/lib/apiClient";

interface ContractorFormProps {
  contractor?: Contractor;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ContractorForm({ contractor, open, onClose, onSuccess }: ContractorFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: contractor?.name || "",
    cpf_cnpj: contractor?.cpf_cnpj || "",
    email: contractor?.email || "",
    phone: contractor?.phone || "",
  });

  const isEditing = !!contractor;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      const cleanData = {
        name: formData.name,
        cpf_cnpj: formData.cpf_cnpj || undefined,
        email: formData.email || undefined,
        phone: formData.phone,
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
      });
    } catch (error) {
      console.error("Erro ao salvar contratante:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="contato@empresa.com"
              type="email"
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