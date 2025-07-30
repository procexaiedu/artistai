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
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  ArrowLeft,
  Calendar,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { financialTransactionsApi, financialAccountsApi, financialCategoriesApi } from "@/lib/apiClient";
import type { FinancialTransaction, FinancialTransactionCreate, FinancialAccount, FinancialCategory } from "@/lib/apiClient";

// Interface já definida no apiClient.ts

const transactionTypeLabels = {
  income: 'Receita',
  expense: 'Despesa',
  transfer: 'Transferência',
};

const statusLabels = {
  completed: 'Concluída',
  pending: 'Pendente',
  cancelled: 'Cancelada',
};

export default function FinancialTransactionsPage() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<FinancialTransaction[]>([]);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    account: 'all',
    category: 'all',
    startDate: '',
    endDate: '',
  });

  const [formData, setFormData] = useState({
    account_id: '',
    category_id: '',
    event_id: '',
    contractor_id: '',
    transaction_type: 'income' as 'income' | 'expense' | 'transfer',
    amount: '',
    description: '',
    reference_number: '',
    transaction_date: new Date().toISOString().split('T')[0],
    due_date: '',
    status: 'completed' as 'pending' | 'completed' | 'cancelled',
    is_tax_deductible: false,
    tax_category: '',
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
      const [transactionsData, accountsData, categoriesData] = await Promise.all([
        financialTransactionsApi.getTransactions(),
        financialAccountsApi.getAccounts(),
        financialCategoriesApi.getCategories()
      ]);
      
      setTransactions(transactionsData);
      setFilteredTransactions(transactionsData);
      setAccounts(accountsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...transactions];

    // Filtro de busca
    if (filters.search) {
      filtered = filtered.filter(transaction => 
        transaction.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.reference_number?.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.account_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.category_name?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtro de tipo
    if (filters.type !== 'all') {
      filtered = filtered.filter(transaction => transaction.transaction_type === filters.type);
    }

    // Filtro de status
    if (filters.status !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === filters.status);
    }

    // Filtro de conta
    if (filters.account !== 'all') {
      filtered = filtered.filter(transaction => transaction.account_id === filters.account);
    }

    // Filtro de data
    if (filters.startDate) {
      filtered = filtered.filter(transaction => transaction.transaction_date >= filters.startDate);
    }
    if (filters.endDate) {
      filtered = filtered.filter(transaction => transaction.transaction_date <= filters.endDate);
    }

    setFilteredTransactions(filtered);
  }, [transactions, filters]);

  const resetForm = () => {
    setFormData({
      account_id: '',
      category_id: '',
      event_id: '',
      contractor_id: '',
      transaction_type: 'income',
      amount: '',
      description: '',
      reference_number: '',
      transaction_date: new Date().toISOString().split('T')[0],
      due_date: '',
      status: 'completed',
      is_tax_deductible: false,
      tax_category: '',
      notes: '',
    });
  };

  const handleCreate = () => {
    resetForm();
    setEditingTransaction(null);
    setShowCreateForm(true);
  };

  const handleEdit = (transaction: FinancialTransaction) => {
    setFormData({
      account_id: transaction.account_id,
      category_id: transaction.category_id || '',
      event_id: transaction.event_id || '',
      contractor_id: transaction.contractor_id || '',
      transaction_type: transaction.transaction_type,
      amount: transaction.amount.toString(),
      description: transaction.description,
      reference_number: transaction.reference_number || '',
      transaction_date: transaction.transaction_date,
      due_date: transaction.due_date || '',
      status: transaction.status,
      is_tax_deductible: transaction.is_tax_deductible || false,
      tax_category: transaction.tax_category || '',
      notes: transaction.notes || '',
    });
    setEditingTransaction(transaction);
    setShowCreateForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const transactionData = {
        account_id: formData.account_id,
        category_id: formData.category_id || undefined,
        event_id: formData.event_id || undefined,
        contractor_id: formData.contractor_id || undefined,
        transaction_type: formData.transaction_type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        reference_number: formData.reference_number || undefined,
        transaction_date: formData.transaction_date,
        due_date: formData.due_date || undefined,
        status: formData.status,
        is_tax_deductible: formData.is_tax_deductible,
        tax_category: formData.tax_category || undefined,
        notes: formData.notes || undefined,
      };

      if (editingTransaction) {
        // Atualizar transação existente
        await financialTransactionsApi.updateTransaction(editingTransaction.id, transactionData);
      } else {
        // Criar nova transação
        await financialTransactionsApi.createTransaction(transactionData as FinancialTransactionCreate);
      }

      await loadData(); // Recarregar dados
      setShowCreateForm(false);
      resetForm();
      setEditingTransaction(null);
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      setError('Erro ao salvar transação. Tente novamente.');
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
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const totalIncome = filteredTransactions
    .filter(t => t.transaction_type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.transaction_type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingTransactions = filteredTransactions.filter(t => t.status === 'pending').length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando transações...</p>
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
              <h1 className="text-3xl font-bold tracking-tight">Transações Financeiras</h1>
              <p className="text-muted-foreground">
                Gerencie todas as suas receitas e despesas
              </p>
            </div>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Transação
          </Button>
        </div>

        {/* Resumo */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalIncome)}
              </div>
              <p className="text-xs text-muted-foreground">
                {filteredTransactions.filter(t => t.transaction_type === 'income' && t.status === 'completed').length} transações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                {filteredTransactions.filter(t => t.transaction_type === 'expense' && t.status === 'completed').length} transações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalIncome - totalExpenses)}
              </div>
              <p className="text-xs text-muted-foreground">
                Receitas - Despesas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {pendingTransactions}
              </div>
              <p className="text-xs text-muted-foreground">
                transações pendentes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Descrição, referência..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-8"
                  />
                </div>
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
                    <SelectItem value="completed">Concluídas</SelectItem>
                    <SelectItem value="pending">Pendentes</SelectItem>
                    <SelectItem value="cancelled">Canceladas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Transações */}
        <Card>
          <CardHeader>
            <CardTitle>Transações</CardTitle>
            <CardDescription>
              {filteredTransactions.length} de {transactions.length} transações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Conta</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhuma transação encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          {formatDate(transaction.transaction_date)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            {transaction.reference_number && (
                              <p className="text-xs text-muted-foreground">
                                Ref: {transaction.reference_number}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {transaction.transaction_type === 'income' ? (
                              <ArrowUpRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4 text-red-600" />
                            )}
                            <span className={transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}>
                              {transactionTypeLabels[transaction.transaction_type]}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{transaction.account_name}</TableCell>
                        <TableCell>{transaction.category_name || '-'}</TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.transaction_type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)}>
                            {statusLabels[transaction.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Criação/Edição */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? 'Editar Transação' : 'Nova Transação Financeira'}
              </DialogTitle>
              <DialogDescription>
                {editingTransaction 
                  ? 'Atualize as informações da transação financeira.'
                  : 'Adicione uma nova transação financeira ao sistema.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="account_id">Conta</Label>
                    <Select
                      value={formData.account_id}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, account_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma conta" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="transaction_type">Tipo</Label>
                    <Select
                      value={formData.transaction_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, transaction_type: value as 'income' | 'expense' | 'transfer' }))}
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
                    <Label htmlFor="amount">Valor</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descrição da transação"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transaction_date">Data da Transação</Label>
                    <Input
                      id="transaction_date"
                      type="date"
                      value={formData.transaction_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, transaction_date: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'pending' | 'completed' | 'cancelled' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Concluída</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category_id">Categoria</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reference_number">Número de Referência</Label>
                  <Input
                    id="reference_number"
                    value={formData.reference_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                    placeholder="Ex: PAG-001"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Input
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Observações adicionais"
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
                  {isSubmitting ? 'Salvando...' : (editingTransaction ? 'Atualizar' : 'Criar')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}