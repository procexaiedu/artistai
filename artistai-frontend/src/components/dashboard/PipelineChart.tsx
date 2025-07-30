"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PipelineSummaryItem } from "@/lib/apiClient";

interface PipelineChartProps {
  data: PipelineSummaryItem[];
}

export function PipelineChart({ data }: PipelineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="stage_name" 
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis />
        <Tooltip 
          formatter={(value) => [value, "Contratantes"]}
          labelFormatter={(label) => `Etapa: ${label}`}
        />
        <Bar 
          dataKey="contractor_count" 
          fill="#8884d8" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}