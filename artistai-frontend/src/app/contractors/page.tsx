"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Contractor, contractorsApi } from "@/lib/apiClient";
import { ContractorTable } from "@/components/contractors/ContractorTable";
import { ContractorForm } from "@/components/contractors/ContractorForm";
import { DashboardLayout } from "@/components/DashboardLayout";

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadContractors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractorsApi.getContractors();
      setContractors(data);
    } catch (err) {
      setError("Erro ao carregar contratantes. Verifique se o backend está rodando.");
      console.error("Erro ao carregar contratantes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContractors();
  }, []);

  const handleContractorChanged = () => {
    loadContractors();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando contratantes...</p>
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
            <Button onClick={loadContractors} variant="outline">
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
            <h1 className="text-3xl font-bold tracking-tight">Contratantes</h1>
            <p className="text-muted-foreground">
              Gerencie sua carteira de clientes e contratantes
            </p>
          </div>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Novo Contratante
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total de Contratantes
                </p>
                <p className="text-2xl font-bold">{contractors.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Com Email
                </p>
                <p className="text-2xl font-bold">
                  {contractors.filter(c => c.email).length}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border p-4">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pessoas Físicas
                </p>
                <p className="text-2xl font-bold">
                  {contractors.filter(c => c.cpf_cnpj && c.cpf_cnpj.length <= 14).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Contratantes */}
        <ContractorTable contractors={contractors} onContractorChanged={handleContractorChanged} />

        {/* Modal de Criação */}
        <ContractorForm
          open={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSuccess={handleContractorChanged}
        />
      </div>
    </DashboardLayout>
  );
} 