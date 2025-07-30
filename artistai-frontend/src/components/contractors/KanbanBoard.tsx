"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Plus, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Contractor,
  PipelineStage,
  contractorsApi,
  stagesApi,
  PipelineStageCreate,
  PipelineStageUpdate,
} from "@/lib/apiClient";

interface KanbanBoardProps {
  contractors: Contractor[];
  onContractorChanged: () => void;
  onContractorClick?: (contractorId: string) => void;
}

interface StageFormData {
  name: string;
}

export function KanbanBoard({ contractors, onContractorChanged, onContractorClick }: KanbanBoardProps) {
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateStage, setShowCreateStage] = useState(false);
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);
  const [stageForm, setStageForm] = useState<StageFormData>({ name: "" });

  const loadStages = async () => {
    try {
      setLoading(true);
      const data = await stagesApi.getStages();
      setStages(data.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error("Erro ao carregar stages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStages();
  }, []);

  const handleCreateStage = async () => {
    try {
      const newStage: PipelineStageCreate = {
        name: stageForm.name,
        order: stages.length,
      };
      await stagesApi.createStage(newStage);
      setShowCreateStage(false);
      setStageForm({ name: "" });
      loadStages();
    } catch (error) {
      console.error("Erro ao criar stage:", error);
    }
  };

  const handleUpdateStage = async () => {
    if (!editingStage) return;
    
    try {
      const updateData: PipelineStageUpdate = {
        name: stageForm.name,
      };
      await stagesApi.updateStage(editingStage.id, updateData);
      setEditingStage(null);
      setStageForm({ name: "" });
      loadStages();
    } catch (error) {
      console.error("Erro ao atualizar stage:", error);
    }
  };

  const handleDeleteStage = async (stageId: string) => {
    try {
      await stagesApi.deleteStage(stageId);
      loadStages();
    } catch (error) {
      console.error("Erro ao deletar stage:", error);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (type === "stage") {
      // Reordenar stages
      const newStages = Array.from(stages);
      const [reorderedStage] = newStages.splice(source.index, 1);
      newStages.splice(destination.index, 0, reorderedStage);

      setStages(newStages);

      try {
        await stagesApi.reorderStages(newStages.map(stage => stage.id));
      } catch (error) {
        console.error("Erro ao reordenar stages:", error);
        loadStages(); // Reverter em caso de erro
      }
    } else {
      // Mover contractor entre stages
      const contractorId = draggableId;
      const newStageId = destination.droppableId === "unassigned" ? null : destination.droppableId;

      try {
        await contractorsApi.updateContractor(contractorId, { stage_id: newStageId || undefined });
        onContractorChanged();
      } catch (error) {
        console.error("Erro ao mover contractor:", error);
      }
    }
  };

  const getContractorsByStage = (stageId: string | null) => {
    return contractors.filter(contractor => contractor.stage_id === stageId);
  };

  const openEditStage = (stage: PipelineStage) => {
    setEditingStage(stage);
    setStageForm({ name: stage.name });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pipeline de Vendas</h2>
        <Dialog open={showCreateStage} onOpenChange={setShowCreateStage}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Etapa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Etapa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="stage-name">Nome da Etapa</Label>
                <Input
                  id="stage-name"
                  value={stageForm.name}
                  onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })}
                  placeholder="Ex: Leads, Negociação, Fechamento"
                />
              </div>

              <Button onClick={handleCreateStage} className="w-full">
                Criar Etapa
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="stages" direction="horizontal" type="stage">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex gap-4 overflow-x-auto pb-4"
            >
              {/* Coluna de Não Atribuídos */}
              <div className="min-w-80 flex-shrink-0">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <span>Não Atribuídos</span>
                      <Badge variant="secondary">
                        {getContractorsByStage(null).length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Droppable droppableId="unassigned">
                      {(provided, snapshot) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className={`min-h-32 space-y-2 ${
                            snapshot.isDraggingOver ? "bg-gray-50 rounded-lg" : ""
                          }`}
                        >
                          {getContractorsByStage(null).map((contractor, index) => (
                            <Draggable
                              key={contractor.id}
                              draggableId={contractor.id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                                    snapshot.isDragging ? "rotate-2 shadow-lg" : ""
                                  }`}
                                  onClick={() => onContractorClick?.(contractor.id)}
                                >
                                  <div className="font-medium">{contractor.name}</div>
                                  <div className="text-sm text-gray-500">{contractor.phone}</div>
                                  {contractor.email && (
                                    <div className="text-sm text-gray-500">{contractor.email}</div>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              </div>

              {/* Colunas dos Stages */}
              {stages.map((stage, stageIndex) => (
                <Draggable key={stage.id} draggableId={`stage-${stage.id}`} index={stageIndex}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="min-w-80 flex-shrink-0"
                    >
                      <Card>
                        <CardHeader className="pb-3" {...provided.dragHandleProps}>
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span>{stage.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                {getContractorsByStage(stage.id).length}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem onClick={() => openEditStage(stage)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteStage(stage.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Deletar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Droppable droppableId={stage.id}>
                            {(provided, snapshot) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`min-h-32 space-y-2 ${
                                  snapshot.isDraggingOver ? "bg-gray-50 rounded-lg" : ""
                                }`}
                              >
                                {getContractorsByStage(stage.id).map((contractor, index) => (
                                  <Draggable
                                    key={contractor.id}
                                    draggableId={contractor.id}
                                    index={index}
                                  >
                                    {(provided, snapshot) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className={`p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                                          snapshot.isDragging ? "rotate-2 shadow-lg" : ""
                                        }`}
                                        onClick={() => onContractorClick?.(contractor.id)}
                                      >
                                        <div className="font-medium">{contractor.name}</div>
                                        <div className="text-sm text-gray-500">{contractor.phone}</div>
                                        {contractor.email && (
                                          <div className="text-sm text-gray-500">{contractor.email}</div>
                                        )}
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Dialog para Editar Stage */}
      <Dialog open={!!editingStage} onOpenChange={() => setEditingStage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Etapa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-stage-name">Nome da Etapa</Label>
              <Input
                id="edit-stage-name"
                value={stageForm.name}
                onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })}
                placeholder="Ex: Leads, Negociação, Fechamento"
              />
            </div>

            <Button onClick={handleUpdateStage} className="w-full">
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}