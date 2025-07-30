"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, User, Mail, Phone, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ContractorWithDetails, contractorsApi, PipelineStage, stagesApi } from "@/lib/apiClient";
import { NotesSection } from "./NotesSection";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ContractorDetailsProps {
  contractorId: string;
  onBack: () => void;
}

export function ContractorDetails({ contractorId, onBack }: ContractorDetailsProps) {
  const [contractor, setContractor] = useState<ContractorWithDetails | null>(null);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContractor = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractorsApi.getContractor(contractorId);
      setContractor(data);
    } catch (error) {
      console.error("Erro ao carregar contractor:", error);
      setError("Erro ao carregar dados do contractor");
    } finally {
      setLoading(false);
    }
  }, [contractorId]);

  const loadStages = useCallback(async () => {
    try {
      const data = await stagesApi.getStages();
      setStages(data);
    } catch (error) {
      console.error("Erro ao carregar estágios:", error);
    }
  }, []);

  useEffect(() => {
    loadContractor();
    loadStages();
  }, [contractorId, loadContractor, loadStages]);

  const getCurrentStage = () => {
    if (!contractor?.stage_id || !stages.length) return null;
    return stages.find(stage => stage.id === contractor.stage_id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !contractor) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error || "Contractor não encontrado"}</p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  const currentStage = getCurrentStage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{contractor.name}</h1>
          <p className="text-muted-foreground">Detalhes do Contractor</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do Contractor */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{contractor.email}</p>
                  </div>
                </div>

                {contractor.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Telefone</p>
                      <p className="text-sm text-muted-foreground">{contractor.phone}</p>
                    </div>
                  </div>
                )}

                {contractor.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Localização</p>
                      <p className="text-sm text-muted-foreground">{contractor.location}</p>
                    </div>
                  </div>
                )}

                {contractor.specialties && contractor.specialties.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Especialidades</p>
                    <div className="flex flex-wrap gap-2">
                      {contractor.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {contractor.bio && (
                  <div>
                    <p className="text-sm font-medium mb-2">Biografia</p>
                    <p className="text-sm text-muted-foreground">{contractor.bio}</p>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Cadastrado em</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(contractor.created_at), "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Estágio Atual */}
              <div>
                <p className="text-sm font-medium mb-2">Estágio no Pipeline</p>
                {currentStage ? (
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: currentStage.color + "20",
                      color: currentStage.color,
                      borderColor: currentStage.color + "40",
                    }}
                  >
                    {currentStage.name}
                  </Badge>
                ) : (
                  <Badge variant="outline">Sem estágio definido</Badge>
                )}
              </div>


            </CardContent>
          </Card>
        </div>

        {/* Anotações */}
        <div className="lg:col-span-2">
          <NotesSection
            contractorId={contractor.id}
            contractorName={contractor.name}
          />
        </div>
      </div>
    </div>
  );
}