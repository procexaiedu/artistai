"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  PiggyBank,
  Target,
  Plus,
  ArrowUpRight,

} from "lucide-react";
import Link from "next/link";
import { financialReportsApi, financialAccountsApi, financialTransactionsApi, financialGoalsApi, financialBudgetsApi } from "@/lib/apiClient";
import type { FinancialSummary, FinancialAccount, FinancialTransaction, FinancialGoal, FinancialBudget } from "@/lib/apiClient";

export default function FinancialPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<FinancialTransaction[]>([]);
  const [activeGoals, setActiveGoals] = useState<FinancialGoal[]>([]);
  const [activeBudgets, setActiveBudgets] = useState<FinancialBudget[]>([]);

  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Carregar dados em paralelo
        const [summaryData, accountsData, transactionsData, goalsData, budgetsData] = await Promise.all([
          financialReportsApi.getSummary(),
          financialAccountsApi.getAccounts(0, 10),
          financialTransactionsApi.getTransactions(0, 10),
          financialGoalsApi.getGoals(0, 10),
          financialBudgetsApi.getBudgets(0, 10)
        ]);

        setSummary(summaryData);
        setAccounts(accountsData);
        setRecentTransactions(transactionsData);
        setActiveGoals(goalsData.filter(goal => goal.status === 'active'));
        setActiveBudgets(budgetsData.filter(budget => budget.status === 'active'));
      } catch (err) {
        console.error('Erro ao carregar dados financeiros:', err);
        setError('Erro ao carregar dados financeiros. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadFinancialData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando dados financeiros...</p>
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
            <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
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
            <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
            <p className="text-muted-foreground">
              Gerencie suas finanças, contas, transações e orçamentos
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/financial/transactions/new">
                <Plus className="mr-2 h-4 w-4" />
                Nova Transação
              </Link>
            </Button>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {summary?.total_income?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Receitas do período
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas Totais</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {summary?.total_expenses?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Despesas do período
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                R$ {summary?.net_income?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Receitas - Despesas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendências</CardTitle>
              <CreditCard className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                R$ {summary?.total_balance?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
              </div>
              <p className="text-xs text-muted-foreground">
                Saldo total das contas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Navegação Rápida */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/financial/accounts">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contas</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{accounts.filter(acc => acc.is_active).length}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  Gerenciar contas
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/financial/transactions">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transações</CardTitle>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{recentTransactions.length}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  Ver todas as transações
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/financial/goals">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Metas</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeGoals.length}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  Acompanhar metas
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link href="/financial/budgets">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
                <PiggyBank className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeBudgets.length}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  Controlar gastos
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Resumo Recente */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
              <CardDescription>Últimas movimentações financeiras</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        transaction.transaction_type === 'income' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="text-sm font-medium">{transaction.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.transaction_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${
                      transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.transaction_type === 'income' ? '+' : '-'}
                      R$ {transaction.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
                {recentTransactions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma transação encontrada
                  </p>
                )}
              </div>
              
              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/financial/transactions">
                    Ver Todas as Transações
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metas Financeiras</CardTitle>
              <CardDescription>Progresso das suas metas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeGoals.slice(0, 3).map((goal) => {
                  const progress = (goal.current_amount / goal.target_amount) * 100;
                  return (
                    <div key={goal.id}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{goal.name}</span>
                        <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        R$ {goal.current_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de R$ {goal.target_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  );
                })}
                {activeGoals.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma meta ativa encontrada
                  </p>
                )}
              </div>
              
              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/financial/goals">
                    Ver Todas as Metas
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}