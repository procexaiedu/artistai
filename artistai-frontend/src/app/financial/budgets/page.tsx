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
  PieChart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { financialBudgetsApi, financialCategoriesApi } from "@/lib/apiClient";
import type { FinancialBudget, FinancialBudgetCreate, FinancialBudgetUpdate, FinancialCategory, BudgetCategory } from "@/lib/apiClient";

const budgetTypeLabels = {
  monthly: 'Mensal',
  quarterly: 'Trimestral',
  yearly: 'Anual',
  project: 'Projeto',
};

const statusLabels = {
  active: 'Ativo',
  completed: 'Concluído',
  exceeded: 'Excedido',
  draft: 'Rascunho',
};

export default function FinancialBudgetsPage() {
  const [budgets, setBudgets] = useState<FinancialBudget[]>([]);
  const [filteredBudgets, setFilteredBudgets] = useState<FinancialBudget[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<FinancialBudget | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget_type: 'monthly' as 'monthly' | 'quarterly' | 'yearly' | 'project',
    period_start: '',
    period_end: '',
    total_budget: '',
    alert_threshold: '80',
    is_recurring: false,
    notes: '',
  });

  // Carregar dados da API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar dados em paralelo
      const [budgetsData, categoriesData] = await Promise.all([
        financialBudgetsApi.getBudgets(),
        financialCategoriesApi.getCategories()
      ]);
      
      setBudgets(budgetsData);
      setCategories(categoriesData);
      setFilteredBudgets(budgetsData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...budgets];

    // Filtro de busca
    if (filters.search) {
      filtered = filtered.filter(budget => 
        budget.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        budget.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtro de tipo
    if (filters.type !== 'all') {
      filtered = filtered.filter(budget => budget.budget_type === filters.type);
    }

    // Filtro de status
    if (filters.status !== 'all') {
      filtered = filtered.filter(budget => budget.status === filters.status);
    }

    setFilteredBudgets(filtered);
  }, [budgets, filters]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      budget_type: 'monthly',
      period_start: '',
      period_end: '',
      total_budget: '',
      alert_threshold: '80',
      is_recurring: false,
      notes: '',
    });
  };

  const handleCreate = () => {
    resetForm();
    setEditingBudget(null);
    setShowCreateForm(true);
  };

  const handleEdit = (budget: FinancialBudget) => {
    setFormData({
      name: budget.name,
      description: budget.description || '',
      budget_type: budget.budget_type,
      period_start: budget.period_start,
      period_end: budget.period_end,
      total_budget: budget.total_budget.toString(),
      alert_threshold: budget.alert_threshold.toString(),
      is_recurring: budget.is_recurring,
      notes: budget.notes || '',
    });
    setEditingBudget(budget);
    setShowCreateForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const budgetData = {
        name: formData.name,
        description: formData.description || undefined,
        budget_type: formData.budget_type,
        period_start: formData.period_start,
        period_end: formData.period_end,
        total_budget: parseFloat(formData.total_budget),
        alert_threshold: parseFloat(formData.alert_threshold),
        is_recurring: formData.is_recurring,
        notes: formData.notes || undefined,
      };

      if (editingBudget) {
        // Atualizar orçamento existente
        await financialBudgetsApi.updateBudget(editingBudget.id, budgetData);
      } else {
        // Criar novo orçamento
        await financialBudgetsApi.createBudget(budgetData as FinancialBudgetCreate);
      }

      await loadData(); // Recarregar dados
      setShowCreateForm(false);
      resetForm();
      setEditingBudget(null);
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      setError('Erro ao salvar orçamento. Tente novamente.');
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

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      exceeded: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getUsageColor = (percentage: number, threshold: number) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= threshold) return 'text-orange-600';
    return 'text-green-600';
  };

  const activeBudgets = filteredBudgets.filter(b => b.status === 'active').length;
  const exceededBudgets = filteredBudgets.filter(b => b.status === 'exceeded').length;
  const totalBudgeted = filteredBudgets.filter(b => b.status === 'active').reduce((sum, b) => sum + b.total_budget, 0);
  const totalSpent = filteredBudgets.filter(b => b.status === 'active').reduce((sum, b) => sum + b.spent_amount, 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando orçamentos...</p>
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
            <Button onClick={loadData}>Tentar Novamente</Button>
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
              <h1 className="text-3xl font-bold tracking-tight">Orçamentos Financeiros</h1>
              <p className="text-muted-foreground">
                Planeje e controle seus gastos por período
              </p>
            </div>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Orçamento
          </Button>
        </div>

        {/* Resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <PieChart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {activeBudgets}
              </div>
              <p className="text-xs text-muted-foreground">
                orçamentos ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Excedidos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {exceededBudgets}
              </div>
              <p className="text-xs text-muted-foreground">
                orçamentos excedidos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orçado</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalBudgeted)}
              </div>
              <p className="text-xs text-muted-foreground">
                total orçado (ativos)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gasto</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(totalSpent)}
              </div>
              <p className="text-xs text-muted-foreground">
                {totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0}% do orçado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Buscar</Label>
                <Input
                  placeholder="Nome ou descrição..."
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
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                    <SelectItem value="project">Projeto</SelectItem>
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
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="completed">Concluídos</SelectItem>
                    <SelectItem value="exceeded">Excedidos</SelectItem>
                    <SelectItem value="draft">Rascunhos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid de Orçamentos */}
        <div className="grid gap-6">
          {filteredBudgets.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum orçamento encontrado</p>
              </CardContent>
            </Card>
          ) : (
            filteredBudgets.map((budget) => {
              const usagePercentage = budget.total_budget > 0 ? (budget.spent_amount / budget.total_budget) * 100 : 0;
              
              return (
                <Card key={budget.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <CardTitle className="text-xl">{budget.name}</CardTitle>
                          <Badge className={getStatusColor(budget.status)}>
                            {statusLabels[budget.status]}
                          </Badge>
                          <Badge variant="outline">
                            {budgetTypeLabels[budget.budget_type]}
                          </Badge>
                          {budget.is_recurring && (
                            <Badge variant="outline" className="text-blue-600">
                              Recorrente
                            </Badge>
                          )}
                        </div>
                        {budget.description && (
                          <CardDescription className="mt-2">
                            {budget.description}
                          </CardDescription>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(budget)}>
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
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Resumo Geral */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Período</p>
                          <p className="font-medium">
                            {formatDate(budget.period_start)} - {formatDate(budget.period_end)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Orçamento Total</p>
                          <p className="font-medium text-lg">{formatCurrency(budget.total_budget)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Gasto</p>
                          <p className={`font-medium text-lg ${getUsageColor(usagePercentage, budget.alert_threshold)}`}>
                            {formatCurrency(budget.spent_amount)}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Restante</p>
                          <p className={`font-medium text-lg ${
                            budget.remaining_amount < 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {formatCurrency(budget.remaining_amount)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Barra de Progresso Geral */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Utilização do Orçamento</span>
                          <span className={`text-sm font-medium ${getUsageColor(usagePercentage, budget.alert_threshold)}`}>
                            {Math.round(usagePercentage)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 ${
                              usagePercentage >= 100 ? 'bg-red-600' :
                              usagePercentage >= budget.alert_threshold ? 'bg-orange-500' :
                              'bg-green-600'
                            }`}
                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                          />
                        </div>
                        {usagePercentage >= budget.alert_threshold && (
                          <div className="flex items-center mt-2 text-sm text-orange-600">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            {usagePercentage >= 100 ? 'Orçamento excedido!' : `Atenção: ${budget.alert_threshold}% do orçamento utilizado`}
                          </div>
                        )}
                      </div>
                      
                      {/* Categorias */}
                      {budget.categories && budget.categories.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-3">Categorias</h4>
                          <div className="space-y-3">
                            {budget.categories.map((category: BudgetCategory) => (
                              <div key={category.id} className="border rounded-lg p-3">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium">{category.category_name}</span>
                                  <span className={`text-sm font-medium ${getUsageColor(category.percentage_used, budget.alert_threshold || 80)}`}>
                                    {category.percentage_used}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                      category.percentage_used >= 100 ? 'bg-red-600' :
                                      category.percentage_used >= (budget.alert_threshold || 80) ? 'bg-orange-500' :
                                      'bg-blue-600'
                                    }`}
                                    style={{ width: `${Math.min(category.percentage_used, 100)}%` }}
                                  />
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                  <span>Gasto: {formatCurrency(category.spent_amount)}</span>
                                  <span>Orçado: {formatCurrency(category.allocated_amount)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Notas */}
                      {budget.notes && (
                        <div>
                          <h4 className="font-medium mb-2">Observações</h4>
                          <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                            {budget.notes}
                          </p>
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
                {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento Financeiro'}
              </DialogTitle>
              <DialogDescription>
                {editingBudget 
                  ? 'Atualize as informações do orçamento financeiro.'
                  : 'Crie um novo orçamento para controlar seus gastos.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome do orçamento"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição do orçamento"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget_type">Tipo</Label>
                    <Select
                      value={formData.budget_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, budget_type: value as 'monthly' | 'quarterly' | 'yearly' | 'project' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="quarterly">Trimestral</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                        <SelectItem value="project">Projeto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="total_budget">Valor Total</Label>
                    <Input
                      id="total_budget"
                      type="number"
                      step="0.01"
                      value={formData.total_budget}
                      onChange={(e) => setFormData(prev => ({ ...prev, total_budget: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="period_start">Data Início</Label>
                    <Input
                      id="period_start"
                      type="date"
                      value={formData.period_start}
                      onChange={(e) => setFormData(prev => ({ ...prev, period_start: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="period_end">Data Fim</Label>
                    <Input
                      id="period_end"
                      type="date"
                      value={formData.period_end}
                      onChange={(e) => setFormData(prev => ({ ...prev, period_end: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="alert_threshold">Limite de Alerta (%)</Label>
                  <Input
                    id="alert_threshold"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.alert_threshold}
                    onChange={(e) => setFormData(prev => ({ ...prev, alert_threshold: e.target.value }))}
                    placeholder="80"
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_recurring"
                    checked={formData.is_recurring}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_recurring: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="is_recurring">Orçamento recorrente</Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Observações sobre o orçamento"
                  />
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
                  {isSubmitting ? 'Salvando...' : (editingBudget ? 'Atualizar' : 'Criar')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}