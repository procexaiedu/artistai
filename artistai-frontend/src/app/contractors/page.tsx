"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, List, Kanban } from "lucide-react";
import { ContractorTable } from "@/components/contractors/ContractorTable";
import { ContractorForm } from "@/components/contractors/ContractorForm";
import { KanbanBoard } from "@/components/contractors/KanbanBoard";
import { ContractorDetails } from "@/components/contractors/ContractorDetails";
import { Contractor, contractorsApi } from "@/lib/apiClient";
import { DashboardLayout } from "@/components/DashboardLayout";

type ViewMode = "list" | "kanban" | "details";

export default function ContractorsPage() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingContractor, setEditingContractor] = useState<Contractor | undefined>(undefined);
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");
  const [selectedContractorId, setSelectedContractorId] = useState<string | undefined>(undefined);

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

  const handleCreateContractor = () => {
    setEditingContractor(undefined);
    setShowCreateForm(true);
  };

  const handleEditContractor = (contractor: Contractor) => {
    setEditingContractor(contractor);
    setShowCreateForm(true);
  };

  const handleDeleteContractor = async (id: string) => {
    try {
      await contractorsApi.deleteContractor(id);
      loadContractors();
    } catch (error) {
      console.error("Error deleting contractor:", error);
    }
  };

  const handleViewContractorDetails = (contractorId: string) => {
    setSelectedContractorId(contractorId);
    setViewMode("details");
  };

  const handleBackFromDetails = () => {
    setSelectedContractorId(undefined);
    setViewMode("kanban");
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

  // Visualização de detalhes do contractor
  if (viewMode === "details" && selectedContractorId) {
    return (
      <DashboardLayout>
        <ContractorDetails
          contractorId={selectedContractorId}
          onBack={handleBackFromDetails}
        />
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
          <Button onClick={handleCreateContractor}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Novo Contratante
          </Button>
        </div>

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as ViewMode)}>
          <TabsList>
            <TabsTrigger value="kanban" className="flex items-center gap-2">
              <Kanban className="h-4 w-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Lista
            </TabsTrigger>
          </TabsList>

          <TabsContent value="kanban" className="space-y-4">
            <KanbanBoard 
              contractors={contractors}
              onContractorChanged={handleContractorChanged}
              onContractorClick={handleViewContractorDetails} 
            />
          </TabsContent>

          <TabsContent value="list" className="space-y-4">
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
            <Card>
              <CardHeader>
                <CardTitle>Lista de Contratantes</CardTitle>
              </CardHeader>
              <CardContent>
                <ContractorTable 
                  contractors={contractors} 
                  onContractorChanged={handleContractorChanged}
                  onEdit={handleEditContractor}
                  onDelete={handleDeleteContractor}
                  onView={handleViewContractorDetails}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Criação/Edição */}
        {showCreateForm && (
          <ContractorForm
            contractor={editingContractor}
            open={showCreateForm}
            onClose={() => {
              setShowCreateForm(false);
              setEditingContractor(undefined);
            }}
            onSuccess={handleContractorChanged}
          />
        )}
      </div>
    </DashboardLayout>
  );
}