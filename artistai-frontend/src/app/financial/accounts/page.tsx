"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  CreditCard,
  Building,
  Wallet,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { financialAccountsApi, FinancialAccount, FinancialAccountCreate } from "@/lib/apiClient";

const accountTypeLabels = {
  checking: 'Conta Corrente',
  savings: 'Poupança',
  credit: 'Cartão de Crédito',
  investment: 'Investimento',
  cash: 'Dinheiro',
};

const accountTypeIcons = {
  checking: CreditCard,
  savings: Building,
  credit: CreditCard,
  investment: Wallet,
  cash: Wallet,
};

export default function FinancialAccountsPage() {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<FinancialAccount | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<FinancialAccount | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    account_type: 'checking' as 'checking' | 'savings' | 'credit' | 'investment' | 'cash',
    balance: '0',
    bank_name: '',
    account_number: '',
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar contas da API
  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financialAccountsApi.getAccounts();
      setAccounts(data);
    } catch (err) {
      console.error('Erro ao carregar contas:', err);
      setError('Erro ao carregar contas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      account_type: 'checking',
      balance: '0',
      bank_name: '',
      account_number: '',
      is_active: true,
    });
  };

  const handleCreate = () => {
    resetForm();
    setEditingAccount(null);
    setShowCreateForm(true);
  };

  const handleEdit = (account: FinancialAccount) => {
    setFormData({
      name: account.name,
      account_type: account.account_type as 'checking' | 'savings' | 'credit' | 'investment' | 'cash',
      balance: account.balance.toString(),
      bank_name: account.bank_name || '',
      account_number: account.account_number || '',
      is_active: account.is_active,
    });
    setEditingAccount(account);
    setShowCreateForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const accountData = {
        ...formData,
        balance: parseFloat(formData.balance) || 0,
      };

      if (editingAccount) {
        // Atualizar conta existente
        await financialAccountsApi.updateAccount(editingAccount.id, accountData);
      } else {
        // Criar nova conta
        await financialAccountsApi.createAccount(accountData as FinancialAccountCreate);
      }

      await loadAccounts(); // Recarregar lista
      setShowCreateForm(false);
      resetForm();
      setEditingAccount(null);
    } catch (error) {
      console.error('Erro ao salvar conta:', error);
      setError('Erro ao salvar conta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAccount) return;

    try {
      await financialAccountsApi.deleteAccount(deletingAccount.id);
      await loadAccounts(); // Recarregar lista
      setDeletingAccount(null);
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      setError('Erro ao deletar conta. Tente novamente.');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getAccountTypeColor = (type: string) => {
    const colors = {
      checking: 'bg-blue-100 text-blue-800',
      savings: 'bg-green-100 text-green-800',
      credit: 'bg-orange-100 text-orange-800',
      investment: 'bg-purple-100 text-purple-800',
      cash: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const activeAccounts = accounts.filter(account => account.is_active).length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando contas...</p>
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
              <h1 className="text-3xl font-bold tracking-tight">Contas Financeiras</h1>
              <p className="text-muted-foreground">
                Gerencie suas contas bancárias e cartões
              </p>
            </div>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Conta
          </Button>
        </div>

        {/* Resumo */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalBalance)}
              </div>
              <p className="text-xs text-muted-foreground">
                Soma de todas as contas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contas Ativas</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAccounts}</div>
              <p className="text-xs text-muted-foreground">
                de {accounts.length} contas totais
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tipos de Conta</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(accounts.map(acc => acc.account_type)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                tipos diferentes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Contas */}
        <Card>
          <CardHeader>
            <CardTitle>Suas Contas</CardTitle>
            <CardDescription>
              Lista de todas as suas contas financeiras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Banco</TableHead>
                    <TableHead>Número</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhuma conta encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    accounts.map((account) => {
                      const IconComponent = accountTypeIcons[account.account_type];
                      return (
                        <TableRow key={account.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center space-x-2">
                              <IconComponent className="h-4 w-4 text-muted-foreground" />
                              <span>{account.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getAccountTypeColor(account.account_type)}>
                              {accountTypeLabels[account.account_type]}
                            </Badge>
                          </TableCell>
                          <TableCell>{account.bank_name || '-'}</TableCell>
                          <TableCell>{account.account_number || '-'}</TableCell>
                          <TableCell className="text-right font-medium">
                            <span className={account.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatCurrency(account.balance)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={account.is_active ? 'default' : 'secondary'}>
                              {account.is_active ? 'Ativa' : 'Inativa'}
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
                                <DropdownMenuItem onClick={() => handleEdit(account)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setDeletingAccount(account)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Criação/Edição */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? 'Editar Conta' : 'Nova Conta Financeira'}
              </DialogTitle>
              <DialogDescription>
                {editingAccount 
                  ? 'Atualize as informações da conta financeira.'
                  : 'Adicione uma nova conta financeira ao sistema.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome da Conta</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Conta Principal"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="account_type">Tipo de Conta</Label>
                  <Select
                    value={formData.account_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, account_type: value as 'checking' | 'savings' | 'credit' | 'investment' | 'cash' }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Conta Corrente</SelectItem>
                      <SelectItem value="savings">Poupança</SelectItem>
                      <SelectItem value="credit">Cartão de Crédito</SelectItem>
                      <SelectItem value="investment">Investimento</SelectItem>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="balance">Saldo Inicial</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData(prev => ({ ...prev, balance: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="bank_name">Banco</Label>
                  <Input
                    id="bank_name"
                    value={formData.bank_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
                    placeholder="Ex: Banco do Brasil"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="account_number">Número da Conta</Label>
                  <Input
                    id="account_number"
                    value={formData.account_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                    placeholder="Ex: 12345-6"
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
                  {isSubmitting ? 'Salvando...' : (editingAccount ? 'Atualizar' : 'Criar')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal de Confirmação de Exclusão */}
        <AlertDialog open={!!deletingAccount} onOpenChange={() => setDeletingAccount(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a conta &quot;{deletingAccount?.name}&quot;? 
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}