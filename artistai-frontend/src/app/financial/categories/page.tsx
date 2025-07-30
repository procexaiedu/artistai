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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Tag,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { financialCategoriesApi } from "@/lib/apiClient";
import type { FinancialCategory, FinancialCategoryCreate, FinancialCategoryUpdate } from "@/lib/apiClient";

// Interface já definida no apiClient.ts

const categoryTypeLabels = {
  income: 'Receita',
  expense: 'Despesa',
};

const predefinedColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
];

export default function FinancialCategoriesPage() {
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<FinancialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FinancialCategory | null>(null);
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
    category_type: 'expense' as 'income' | 'expense',
    color: predefinedColors[0],
    icon: '',
    is_tax_deductible: false,
    budget_limit: '',
    parent_category_id: '',
    is_active: true,
  });

  // Carregar categorias da API
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financialCategoriesApi.getCategories();
      setCategories(data);
      setFilteredCategories(data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
      setError('Erro ao carregar categorias. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...categories];

    // Filtro de busca
    if (filters.search) {
      filtered = filtered.filter(category => 
        category.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        category.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtro de tipo
    if (filters.type !== 'all') {
      filtered = filtered.filter(category => category.category_type === filters.type);
    }

    // Filtro de status
    if (filters.status !== 'all') {
      const isActive = filters.status === 'active';
      filtered = filtered.filter(category => category.is_active === isActive);
    }

    setFilteredCategories(filtered);
  }, [categories, filters]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category_type: 'expense',
      color: predefinedColors[0],
      icon: '',
      is_tax_deductible: false,
      budget_limit: '',
      parent_category_id: '',
      is_active: true,
    });
  };

  const handleCreate = () => {
    resetForm();
    setEditingCategory(null);
    setShowCreateForm(true);
  };

  const handleEdit = (category: FinancialCategory) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      category_type: category.category_type,
      color: category.color || '',
      icon: category.icon || '',
      is_tax_deductible: category.is_tax_deductible || false,
      budget_limit: category.budget_limit?.toString() || '',
      parent_category_id: category.parent_category_id || '',
      is_active: category.is_active,
    });
    setEditingCategory(category);
    setShowCreateForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const categoryData = {
        name: formData.name,
        description: formData.description || undefined,
        category_type: formData.category_type,
        color: formData.color,
        icon: formData.icon || undefined,
        is_tax_deductible: formData.is_tax_deductible,
        budget_limit: formData.budget_limit ? parseFloat(formData.budget_limit) : undefined,
        parent_category_id: formData.parent_category_id || undefined,
        is_active: formData.is_active,
      };

      if (editingCategory) {
        // Atualizar categoria existente
        await financialCategoriesApi.updateCategory(editingCategory.id, categoryData);
      } else {
        // Criar nova categoria
        await financialCategoriesApi.createCategory(categoryData as FinancialCategoryCreate);
      }

      await loadCategories(); // Recarregar lista
      setShowCreateForm(false);
      resetForm();
      setEditingCategory(null);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      setError('Erro ao salvar categoria. Tente novamente.');
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

  const totalIncomeCategories = filteredCategories.filter(c => c.category_type === 'income' && c.is_active).length;
  const totalExpenseCategories = filteredCategories.filter(c => c.category_type === 'expense' && c.is_active).length;
  const totalTransactions = filteredCategories.reduce((sum, c) => sum + (c.total_transactions || 0), 0);
  const totalAmount = filteredCategories.reduce((sum, c) => sum + (c.total_amount || 0), 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando categorias...</p>
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
            <Button onClick={loadCategories}>Tentar Novamente</Button>
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
              <h1 className="text-3xl font-bold tracking-tight">Categorias Financeiras</h1>
              <p className="text-muted-foreground">
                Organize suas receitas e despesas por categorias
              </p>
            </div>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </div>

        {/* Resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalIncomeCategories}
              </div>
              <p className="text-xs text-muted-foreground">
                categorias ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {totalExpenseCategories}
              </div>
              <p className="text-xs text-muted-foreground">
                categorias ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transações</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalTransactions}
              </div>
              <p className="text-xs text-muted-foreground">
                total de transações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(totalAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                movimentação total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
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
                    <SelectItem value="income">Receitas</SelectItem>
                    <SelectItem value="expense">Despesas</SelectItem>
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
                    <SelectItem value="inactive">Inativas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid de Categorias */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="text-center py-8">
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma categoria encontrada</p>
              </CardContent>
            </Card>
          ) : (
            filteredCategories.map((category) => (
              <Card key={category.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge 
                            variant={category.category_type === 'income' ? 'default' : 'secondary'}
                            className={category.category_type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          >
                            {categoryTypeLabels[category.category_type]}
                          </Badge>
                          {!category.is_active && (
                            <Badge variant="outline" className="text-gray-500">
                              Inativa
                            </Badge>
                          )}
                          {category.is_tax_deductible && (
                            <Badge variant="outline" className="text-blue-600">
                              Dedutível
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(category)}>
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
                  {category.description && (
                    <CardDescription className="mt-2">
                      {category.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Transações</p>
                        <p className="font-medium">{category.total_transactions || 0}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-medium">{formatCurrency(category.total_amount || 0)}</p>
                      </div>
                    </div>
                    
                    {category.avg_transaction && category.avg_transaction > 0 && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Média por transação</p>
                        <p className="font-medium">{formatCurrency(category.avg_transaction)}</p>
                      </div>
                    )}
                    
                    {category.budget_limit && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Limite orçamentário</p>
                        <p className="font-medium">{formatCurrency(category.budget_limit)}</p>
                        {category.category_type === 'expense' && (
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ 
                                width: `${Math.min(((category.total_amount || 0) / category.budget_limit) * 100, 100)}%` 
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {category.last_transaction_date && (
                      <div className="text-sm">
                        <p className="text-muted-foreground">Última transação</p>
                        <p className="font-medium">{formatDate(category.last_transaction_date)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Modal de Criação/Edição */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria Financeira'}
              </DialogTitle>
              <DialogDescription>
                {editingCategory 
                  ? 'Atualize as informações da categoria financeira.'
                  : 'Adicione uma nova categoria para organizar suas transações.'
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
                    placeholder="Nome da categoria"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição da categoria"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category_type">Tipo</Label>
                    <Select
                      value={formData.category_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category_type: value as 'income' | 'expense' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="color">Cor</Label>
                    <div className="flex space-x-2">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 ${
                            formData.color === color ? 'border-gray-400' : 'border-gray-200'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="budget_limit">Limite Orçamentário (opcional)</Label>
                  <Input
                    id="budget_limit"
                    type="number"
                    step="0.01"
                    value={formData.budget_limit}
                    onChange={(e) => setFormData(prev => ({ ...prev, budget_limit: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_tax_deductible"
                    checked={formData.is_tax_deductible}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_tax_deductible: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="is_tax_deductible">Dedutível do imposto de renda</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="is_active">Categoria ativa</Label>
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
                  {isSubmitting ? 'Salvando...' : (editingCategory ? 'Atualizar' : 'Criar')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}