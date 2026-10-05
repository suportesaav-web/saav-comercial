'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { InfoPopover } from '@/components/ui/InfoPopover';
import { format, startOfWeek, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeeklyTasksChartProps {
  tarefas: any[];
}

export function WeeklyTasksChart({ tarefas }: WeeklyTasksChartProps) {
  const data = useMemo(() => {
    if (!tarefas || tarefas.length === 0) return [];

    const finalizadas = tarefas.filter(t => t.finalizada);
    
    // Agrupar por data de início da semana
    const weeklyDataMap = new Map<number, number>();

    finalizadas.forEach(t => {
      let d: Date | null = null;
      if (t.raw_datetime) {
        d = parseISO(t.raw_datetime);
      } else if (t.data_evento_str && t.data_evento_str.includes('/')) {
        const [day, month, year] = t.data_evento_str.split('/');
        d = new Date(`${year}-${month}-${day}T12:00:00Z`);
      }

      if (d && !isNaN(d.getTime())) {
        const weekStart = startOfWeek(d, { weekStartsOn: 1 }); // Segunda-feira
        const ts = weekStart.getTime();
        weeklyDataMap.set(ts, (weeklyDataMap.get(ts) || 0) + 1);
      }
    });

    // Ordenar cronologicamente
    const sortedWeeks = Array.from(weeklyDataMap.entries()).sort((a, b) => a[0] - b[0]);

    // Limitar para as últimas 12 semanas (aprox 3 meses) para evitar gráficos muito longos
    const lastWeeks = sortedWeeks.slice(-12);

    return lastWeeks.map(([ts, total]) => ({
      semana: format(new Date(ts), 'dd/MMM', { locale: ptBR }).toUpperCase(),
      total,
      rawTs: ts
    }));
  }, [tarefas]);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center">
        <span className="text-slate-500 font-medium tracking-wide">Sem dados suficientes para exibição semanal</span>
      </div>
    );
  }

  return (
    <div className="w-full h-80 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center">
          <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></span>
          Evolução de Tarefas Realizadas
          <InfoPopover content="Volume de tarefas finalizadas agrupadas por semana (iniciando às Segundas-feiras). Mostra o ritmo de execução." />
        </h3>
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 bg-gray-100 px-2 py-1 rounded">
          Por Semana
        </span>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis 
            dataKey="semana" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
          />
          <Tooltip
            cursor={{ fill: '#f8fafc', opacity: 0.8 }}
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
            labelStyle={{ color: '#64748b', marginBottom: '4px' }}
            formatter={(value: any) => [`${value} tarefas`, 'Realizadas']}
          />
          <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={40} animationDuration={1500}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#3b82f6" fillOpacity={0.9} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
