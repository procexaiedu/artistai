"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { FinancialSummaryDashboard } from "@/lib/apiClient";

interface FinancialChartProps {
  data: FinancialSummaryDashboard;
}

export function FinancialChart({ data }: FinancialChartProps) {
  const chartData = [
    {
      name: "Mês Atual",
      receitas: data.monthly_income,
      despesas: Math.abs(data.monthly_expenses),
      lucro: data.net_income
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo Financeiro do Mês</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Valor"]} />
            <Legend />
            <Bar 
              dataKey="receitas" 
              fill="#22c55e" 
              name="Receitas"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="despesas" 
              fill="#ef4444" 
              name="Despesas"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="lucro" 
              fill="#3b82f6" 
              name="Lucro Líquido"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Resumo em cards */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Receitas</p>
            <p className="text-lg font-semibold text-green-600">
              {formatCurrency(data.monthly_income)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Despesas</p>
            <p className="text-lg font-semibold text-red-600">
              {formatCurrency(Math.abs(data.monthly_expenses))}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Lucro Líquido</p>
            <p className={`text-lg font-semibold ${
              data.net_income >= 0 ? "text-blue-600" : "text-red-600"
            }`}>
              {formatCurrency(data.net_income)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}