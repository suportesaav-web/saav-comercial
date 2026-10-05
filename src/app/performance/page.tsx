'use client';

import React, { useMemo } from 'react';
import { useCommercialData } from '@/hooks/useCommercialData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { differenceInDays, parseISO } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function PerformancePage() {
  const { dealsFiltrados, tarefasFiltradas, loading } = useCommercialData();
  const router = useRouter();

  const metrics = useMemo(() => {
    if (!dealsFiltrados) return { total: 0, conversionRate: 0, avgCycle: 0, stages: [] };

    const total = dealsFiltrados.length;
    
    // Taxa de conversão (agora com base nas tarefas encerradas)
    const totalTarefas = tarefasFiltradas?.length || 0;
    const tarefasEncerradas = tarefasFiltradas?.filter(t => t.finalizada).length || 0;
    const conversionRate = totalTarefas > 0 ? (tarefasEncerradas / totalTarefas) * 100 : 0;

    // Tempo médio de venda (só para negócios ganhos)
    const won = dealsFiltrados.filter(d => d.statusId === 2);
    let totalDays = 0;
    let validWon = 0;
    won.forEach(w => {
      if (w.createDate && w.finishDate) {
        const diff = differenceInDays(parseISO(w.finishDate), parseISO(w.createDate));
        if (diff >= 0) {
          totalDays += diff;
          validWon++;
        }
      }
    });
    const avgCycle = validWon > 0 ? Math.round(totalDays / validWon) : 0;

    // Estágios dos Negócios
    const stagesMap = new Map<string, number>();
    dealsFiltrados.forEach(d => {
       const stage = d.stageName || 'Sem Estágio / Concluído';
       stagesMap.set(stage, (stagesMap.get(stage) || 0) + 1);
    });
    const stages = Array.from(stagesMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count); // Ordena pelo maior volume

    return { total, conversionRate, avgCycle, stages };
  }, [dealsFiltrados]);

  const sellerRanking = useMemo(() => {
    if (!dealsFiltrados || !tarefasFiltradas) return [];

    const sellersMap = new Map<string, { negocios: number, tarefas: number }>();

    // Contar negócios
    dealsFiltrados.forEach(d => {
      const seller = d.ownerName || 'Sem Vendedor';
      if (!sellersMap.has(seller)) sellersMap.set(seller, { negocios: 0, tarefas: 0 });
      sellersMap.get(seller)!.negocios++;
    });

    // Contar tarefas
    tarefasFiltradas.forEach(t => {
      const seller = t.nome_vendedor || 'Sem Vendedor';
      if (!sellersMap.has(seller)) sellersMap.set(seller, { negocios: 0, tarefas: 0 });
      sellersMap.get(seller)!.tarefas++;
    });

    return Array.from(sellersMap.entries())
      .map(([name, data]) => ({ name, negocios: data.negocios, tarefas: data.tarefas }))
      .sort((a, b) => (b.negocios + b.tarefas) - (a.negocios + a.tarefas)); // Ordem pelo volume total
  }, [dealsFiltrados, tarefasFiltradas]);

  const taskTypes = useMemo(() => {
    if (!tarefasFiltradas) return [];
    const typesMap = new Map<string, number>();
    tarefasFiltradas.forEach(t => {
      const type = t.tipo_tarefa || 'Outro';
      typesMap.set(type, (typesMap.get(type) || 0) + 1);
    });
    return Array.from(typesMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [tarefasFiltradas]);

  return (
    <main className="min-h-screen p-8 md:p-16 bg-slate-50 text-slate-800">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
            Performance Comercial
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Avaliação do funil, conversão e velocidade de fechamento
          </p>
        </header>
        
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm text-slate-500 font-bold mb-1">Quantidade de Negócios</h3>
            <p className="text-3xl font-black text-slate-800">{loading ? '--' : metrics.total}</p>
            <p className="text-xs text-slate-400 mt-2">Volume total no período/funil</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm text-slate-500 font-bold mb-1">Taxa de Conversão</h3>
            <p className="text-3xl font-black text-emerald-600">{loading ? '--' : `${metrics.conversionRate.toFixed(1)}%`}</p>
            <p className="text-xs text-slate-400 mt-2">Tarefas encerradas vs total</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm text-slate-500 font-bold mb-1">Tempo Médio para Venda</h3>
            <p className="text-3xl font-black text-blue-600">{loading ? '--' : `${metrics.avgCycle} dias`}</p>
            <p className="text-xs text-slate-400 mt-2">Ciclo médio de vendas (Apenas Ganhos)</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Estágios dos Negócios */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <span className="w-1.5 h-6 bg-amber-500 rounded-full mr-3"></span>
                Estágios dos Negócios
              </h3>
              <p className="text-sm text-slate-500 ml-4 mt-1">Distribuição do volume atual de negócios em cada etapa</p>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.stages} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} width={180} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" name="Volume de Negócios" radius={[0, 4, 4, 0]} barSize={24} animationDuration={1500}>
                    {metrics.stages.map((entry, idx) => (
                      <Cell 
                        key={idx} 
                        fill="#f59e0b" 
                        fillOpacity={0.9} 
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => router.push(`/negocios?search=${encodeURIComponent(entry.name)}`)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribuição por Tipo de Tarefa (Donut) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-3"></span>
                Distribuição por Tipo de Tarefa
              </h3>
              <p className="text-sm text-slate-500 ml-4 mt-1">Esforço operacional dividido por canal de atendimento</p>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskTypes}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {taskTypes.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={['#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b', '#3b82f6'][index % 6]} 
                        onClick={() => router.push(`/tarefas?search=${encodeURIComponent(entry.name)}&from=performance`)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
                    formatter={(value: number) => [value, 'Tarefas']}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Ranking de Vendedores */}
        <div className="mb-8 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">
              <span className="w-1.5 h-6 bg-purple-500 rounded-full mr-3"></span>
              Ranking de Vendedores
            </h3>
            <p className="text-sm text-slate-500 ml-4 mt-1">Comparativo de performance e engajamento operacional</p>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[300px]">
              <thead>
                <tr className="border-b border-gray-100 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-2 w-12 text-center">Pos</th>
                  <th className="py-3 px-4">Vendedor</th>
                  <th className="py-3 px-4 text-right">Negócios</th>
                  <th className="py-3 px-4 text-right">Tarefas</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {sellerRanking.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">Nenhum dado disponível.</td>
                  </tr>
                ) : (
                  sellerRanking.map((s, idx) => (
                    <tr key={s.name} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-2 font-bold text-slate-300 text-center">#{idx + 1}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{s.name}</td>
                      <td 
                        className="py-3 px-4 text-right font-bold text-amber-600 cursor-pointer hover:text-amber-800 hover:underline"
                        onClick={() => router.push(`/negocios?search=${encodeURIComponent(s.name)}`)}
                        title="Ver Negócios"
                      >
                        {s.negocios}
                      </td>
                      <td 
                        className="py-3 px-4 text-right font-bold text-blue-600 cursor-pointer hover:text-blue-800 hover:underline"
                        onClick={() => router.push(`/tarefas?search=${encodeURIComponent(s.name)}`)}
                        title="Ver Tarefas"
                      >
                        {s.tarefas}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
