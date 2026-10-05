'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { InfoPopover } from '@/components/ui/InfoPopover';

interface TopClientsBarChartProps {
  tarefas: any[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

export function TopClientsBarChart({ tarefas }: TopClientsBarChartProps) {
  const data = useMemo(() => {
    if (!tarefas || tarefas.length === 0) return [];

    // Contagem total por cliente
    const clientCounts: Record<string, number> = {};
    tarefas.forEach(t => {
      const clientName = t.nome_cliente || 'Sem Cliente';
      if (clientName === 'Sem Cliente') return;
      clientCounts[clientName] = (clientCounts[clientName] || 0) + 1;
    });

    // Pega os Top 5 e ordena
    const top5 = Object.entries(clientCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, total]) => ({ name, total }));

    // Para barras horizontais, inverter o array faz o maior ficar no topo visualmente no Recharts
    return top5.reverse();
  }, [tarefas]);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center">
        <span className="text-slate-500 font-medium tracking-wide">Sem dados suficientes para ranking</span>
      </div>
    );
  }

  return (
    <div className="w-full h-80 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center">
          <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-3"></span>
          Top 5 Clientes (Ranking)
          <InfoPopover content="Ranking geral dos 5 clientes com o maior volume de atividades no período selecionado." />
        </h3>
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 bg-gray-100 px-2 py-1 rounded">
          Volume Total
        </span>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
          <XAxis 
            type="number"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          <YAxis 
            dataKey="name" 
            type="category"
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} 
            width={160}
            tickFormatter={(value: string) => value.length > 22 ? value.substring(0, 22) + '...' : value}
          />
          <Tooltip
            cursor={{ fill: '#f8fafc', opacity: 0.8 }}
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            labelStyle={{ color: '#64748b', marginBottom: '4px', display: 'none' }}
            formatter={(value: any, name: any, props: any) => [`${value} tarefas`, props.payload.name]}
          />
          <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1500}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[(data.length - 1 - index) % COLORS.length]} fillOpacity={0.9} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
