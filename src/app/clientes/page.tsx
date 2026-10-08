'use client';

import React, { useMemo } from 'react';
import { useCommercialData } from '@/hooks/useCommercialData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useRouter } from 'next/navigation';

export default function ClientesPage() {
  const { dealsFiltrados, tarefasFiltradas, contatosFiltrados, loading } = useCommercialData();
  const router = useRouter();

  const metrics = useMemo(() => {
    if (!dealsFiltrados || !tarefasFiltradas) return { totalBase: 0, ativos: 0, topDeals: [], topFinanceiro: [] };

    const totalBase = contatosFiltrados?.length || 0;
    const clientesAtivos = new Set<string>();

    const clientDealsCount = new Map<string, number>();
    const clientWonAmount = new Map<string, number>();

    dealsFiltrados.forEach(d => {
       const client = d.contactName && d.contactName.trim() !== '' ? d.contactName : 'Sem Cliente / Desconhecido';
       if (client !== 'Sem Cliente / Desconhecido') {
         clientesAtivos.add(client);
       }
       
       clientDealsCount.set(client, (clientDealsCount.get(client) || 0) + 1);

       if (d.statusId === 2 && d.amount) {
         clientWonAmount.set(client, (clientWonAmount.get(client) || 0) + d.amount);
       }
    });

    tarefasFiltradas.forEach(t => {
      if (t.nome_cliente && t.nome_cliente.trim() !== '' && t.nome_cliente !== 'Sem Cliente') {
        clientesAtivos.add(t.nome_cliente);
      }
    });

    const topDeals = Array.from(clientDealsCount.entries())
      .filter(([name]) => name !== 'Sem Cliente / Desconhecido')
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .reverse(); // reverse for horizontal bar chart

    const topFinanceiro = Array.from(clientWonAmount.entries())
      .filter(([name]) => name !== 'Sem Cliente / Desconhecido')
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
      .reverse();

    return { 
      totalBase, 
      ativos: clientesAtivos.size,
      topDeals,
      topFinanceiro
    };
  }, [dealsFiltrados, tarefasFiltradas, contatosFiltrados]);

  return (
    <main className="min-h-screen p-8 md:p-16 bg-slate-50 text-slate-800">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
            Análise de Clientes
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Inteligência de Carteira, Geração de Oportunidades e Receita
          </p>
        </header>
        
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm text-slate-500 font-bold mb-1">Clientes na Base (Sincronizados)</h3>
            <p className="text-3xl font-black text-slate-800">{loading ? '--' : metrics.totalBase}</p>
            <p className="text-xs text-slate-400 mt-2">Total de contatos cadastrados no Ploomes</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-sm text-slate-500 font-bold mb-1">Clientes Ativos no Período</h3>
            <p className="text-3xl font-black text-indigo-600">{loading ? '--' : metrics.ativos}</p>
            <p className="text-xs text-slate-400 mt-2">Contatos que geraram negócios ou interações</p>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          
          {/* Top Clientes (Geração de Negócios) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></span>
                Top 10 - Geração de Negócios
              </h3>
              <p className="text-sm text-slate-500 ml-4 mt-1">Clientes que mais geraram oportunidades de venda no período.</p>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.topDeals} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} width={160} tickFormatter={(value: string) => value.length > 22 ? value.substring(0, 22) + '...' : value} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Bar 
                    dataKey="count" 
                    name="Oportunidades" 
                    radius={[0, 4, 4, 0]} 
                    barSize={20} 
                    animationDuration={1500}
                    onClick={(data: any) => router.push(`/negocios?search=${encodeURIComponent(data?.name || '')}`)}
                    cursor="pointer"
                  >
                    {metrics.topDeals.map((entry, idx) => (
                      <Cell key={idx} fill="#3b82f6" fillOpacity={0.9} className="hover:opacity-100 transition-opacity" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Clientes (Valor Ganho) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full mr-3"></span>
                Top 5 - Curva A (Negócios Ganhos)
              </h3>
              <p className="text-sm text-slate-500 ml-4 mt-1">Clientes com maior volume em reais fechados (status ganho).</p>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.topFinanceiro} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} width={160} tickFormatter={(value: string) => value.length > 22 ? value.substring(0, 22) + '...' : value} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }} 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
                    formatter={(value: any) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0), 'Valor Ganho']}
                  />
                  <Bar 
                    dataKey="amount" 
                    name="Valor Ganho" 
                    radius={[0, 4, 4, 0]} 
                    barSize={24} 
                    animationDuration={1500}
                    onClick={(data: any) => router.push(`/negocios?search=${encodeURIComponent(data?.name || '')}`)}
                    cursor="pointer"
                  >
                    {metrics.topFinanceiro.map((entry, idx) => (
                      <Cell key={idx} fill="#10b981" fillOpacity={0.9} className="hover:opacity-100 transition-opacity" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}
