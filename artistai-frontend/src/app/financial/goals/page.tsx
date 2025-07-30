"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ArrowLeft,
  Target,
  TrendingUp,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { format, differenceInDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { financialGoalsApi } from "@/lib/apiClient";
import type { FinancialGoal, FinancialGoalCreate, FinancialGoalUpdate } from "@/lib/apiClient";

// Interface já definida no apiClient.ts

const goalTypeLabels = {
  savings: 'Poupança',
  income: 'Receita',
  expense_reduction: 'Redução de Gastos',
  investment: 'Investimento',
};

const priorityLabels = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
};

const statusLabels = {
  active: 'Ativa',
  completed: 'Concluída',
  paused: 'Pausada',
  cancelled: 'Cancelada',
};

export default function FinancialGoalsPage() {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [filteredGoals, setFilteredGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    priority: 'all',
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    goal_type: 'savings' as 'savings' | 'income' | 'expense_reduction' | 'investment',
    target_amount: '',
    current_amount: '',
    target_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'active' as 'active' | 'completed' | 'paused' | 'cancelled',
  });

  // Carregar metas da API
  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financialGoalsApi.getGoals();
      setGoals(data);
      setFilteredGoals(data);
    } catch (err) {
      console.error('Erro ao carregar metas:', err);
      setError('Erro ao carregar metas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...goals];

    // Filtro de busca
    if (filters.search) {
      filtered = filtered.filter(goal => 
        goal.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        goal.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtro de tipo
    if (filters.type !== 'all') {
      filtered = filtered.filter(goal => goal.goal_type === filters.type);
    }

    // Filtro de status
    if (filters.status !== 'all') {
      filtered = filtered.filter(goal => goal.status === filters.status);
    }

    // Filtro de prioridade
    if (filters.priority !== 'all') {
      filtered = filtered.filter(goal => goal.priority === filters.priority);
    }

    setFilteredGoals(filtered);
  }, [goals, filters]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      goal_type: 'savings',
      target_amount: '',
      current_amount: '',
      target_date: '',
      priority: 'medium',
      status: 'active',
    });
  };

  const handleCreate = () => {
    resetForm();
    setEditingGoal(null);
    setShowCreateForm(true);
  };

  const handleEdit = (goal: FinancialGoal) => {
    setFormData({
      name: goal.name,
      description: goal.description || '',
      goal_type: goal.goal_type,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      target_date: goal.target_date,
      priority: goal.priority,
      status: goal.status,
    });
    setEditingGoal(goal);
    setShowCreateForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const goalData = {
        name: formData.name,
        description: formData.description || undefined,
        goal_type: formData.goal_type,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount || '0'),
        target_date: formData.target_date,
        priority: formData.priority,
        status: formData.status,
      };

      if (editingGoal) {
        await financialGoalsApi.updateGoal(editingGoal.id, goalData as FinancialGoalUpdate);
      } else {
        await financialGoalsApi.createGoal(goalData as FinancialGoalCreate);
      }

      await loadGoals(); // Recarregar lista
      setShowCreateForm(false);
      resetForm();
      setEditingGoal(null);
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
      setError('Erro ao salvar meta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (targetDate: string) => {
    return differenceInDays(parseISO(targetDate), new Date());
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const activeGoals = filteredGoals.filter(g => g.status === 'active').length;
  const completedGoals = filteredGoals.filter(g => g.status === 'completed').length;
  const totalTargetAmount = filteredGoals.filter(g => g.status === 'active').reduce((sum, g) => sum + g.target_amount, 0);
  const totalCurrentAmount = filteredGoals.filter(g => g.status === 'active').reduce((sum, g) => sum + g.current_amount, 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando metas...</p>
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
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={loadGoals}>Tentar Novamente</Button>
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
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/financial">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Metas Financeiras</h1>
              <p className="text-muted-foreground">
                Defina e acompanhe seus objetivos financeiros
              </p>
            </div>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Meta
          </Button>
        </div>

        {/* Resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Metas Ativas</CardTitle>
              <Target className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {activeGoals}
              </div>
              <p className="text-xs text-muted-foreground">
                em andamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {completedGoals}
              </div>
              <p className="text-xs text-muted-foreground">
                metas atingidas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Alvo</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(totalTargetAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                total das metas ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progresso</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {totalTargetAmount > 0 ? Math.round((totalCurrentAmount / totalTargetAmount) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(totalCurrentAmount)} de {formatCurrency(totalTargetAmount)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Buscar</Label>
                <Input
                  placeholder="Título ou descrição..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={filters.type}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="savings">Poupança</SelectItem>
                    <SelectItem value="income">Receita</SelectItem>
                    <SelectItem value="expense_reduction">Redução de Gastos</SelectItem>
                    <SelectItem value="investment">Investimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativas</SelectItem>
                    <SelectItem value="completed">Concluídas</SelectItem>
                    <SelectItem value="paused">Pausadas</SelectItem>
                    <SelectItem value="cancelled">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select
                  value={filters.priority}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid de Metas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGoals.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma meta encontrada</p>
              </CardContent>
            </Card>
          ) : (
            filteredGoals.map((goal) => {
              const progressPercentage = getProgressPercentage(goal.current_amount, goal.target_amount);
              const daysRemaining = getDaysRemaining(goal.target_date);
              
              return (
                <Card key={goal.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{goal.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getStatusColor(goal.status)}>
                            {statusLabels[goal.status]}
                          </Badge>
                          <Badge className={getPriorityColor(goal.priority)}>
                            {priorityLabels[goal.priority]}
                          </Badge>

                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(goal)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    {goal.description && (
                      <CardDescription className="mt-2">
                        {goal.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progresso */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Progresso</span>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(progressPercentage)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
                          <span>{formatCurrency(goal.current_amount)}</span>
                          <span>{formatCurrency(goal.target_amount)}</span>
                        </div>
                      </div>
                      
                      {/* Informações */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Tipo</p>
                          <p className="font-medium">{goalTypeLabels[goal.goal_type]}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Data Alvo</p>
                          <p className="font-medium">{formatDate(goal.target_date)}</p>
                        </div>
                      </div>
                      
                      {/* Dias restantes */}
                      {goal.status === 'active' && (
                        <div className="flex items-center space-x-2 text-sm">
                          {daysRemaining > 0 ? (
                            <>
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="text-blue-600">
                                {daysRemaining} dias restantes
                              </span>
                            </>
                          ) : daysRemaining === 0 ? (
                            <>
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                              <span className="text-orange-600">Vence hoje!</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4 text-red-600" />
                              <span className="text-red-600">
                                {Math.abs(daysRemaining)} dias em atraso
                              </span>
                            </>
                          )}
                        </div>
                      )}
                      

                      
                      {/* Notas */}
                      {goal.notes && (
                        <div className="text-sm">
                          <p className="text-muted-foreground">Observações</p>
                          <p className="text-gray-700">{goal.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Modal de Criação/Edição */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingGoal ? 'Editar Meta' : 'Nova Meta Financeira'}
              </DialogTitle>
              <DialogDescription>
                {editingGoal 
                  ? 'Atualize as informações da meta financeira.'
                  : 'Defina uma nova meta para alcançar seus objetivos financeiros.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome da meta"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição da meta"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal_type">Tipo</Label>
                    <Select
                      value={formData.goal_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, goal_type: value as 'savings' | 'income' | 'expense_reduction' | 'investment' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="savings">Poupança</SelectItem>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense_reduction">Redução de Gastos</SelectItem>
                        <SelectItem value="investment">Investimento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as 'low' | 'medium' | 'high' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target_amount">Valor Alvo</Label>
                    <Input
                      id="target_amount"
                      type="number"
                      step="0.01"
                      value={formData.target_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_amount: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="current_amount">Valor Atual</Label>
                    <Input
                      id="current_amount"
                      type="number"
                      step="0.01"
                      value={formData.current_amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, current_amount: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="target_date">Data Alvo</Label>
                    <Input
                      id="target_date"
                      type="date"
                      value={formData.target_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'active' | 'completed' | 'paused' | 'cancelled' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativa</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                        <SelectItem value="paused">Pausada</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                

              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Salvando...' : (editingGoal ? 'Atualizar' : 'Criar')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}