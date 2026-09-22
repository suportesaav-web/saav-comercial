'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useFilterStore } from '@/store/useFilterStore';

export default function ClientesPage() {
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { startDate, endDate, vendedores, clientes, tiposTarefa, status, hideInternalTasks } = useFilterStore();

  useEffect(() => {
    fetch('/api/tarefas')
      .then(res => res.json())
      .then(data => {
        setTarefas(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const tarefasFiltradas = useMemo(() => {
    return tarefas.filter((t: any) => {
      if (hideInternalTasks && t.nome_cliente && t.nome_cliente.toUpperCase().includes('SAAVEDRA')) return false;
      
      if (startDate || endDate) {
        const dateStr = t.data_evento_str || t.DateTime || t.CreateDate;
        if (dateStr) {
          let taskDate: Date;
          if (dateStr.includes('/')) {
            const [d, m, y] = dateStr.split('/');
            taskDate = new Date(`${y}-${m}-${d}`);
          } else {
            taskDate = new Date(dateStr);
          }
          if (startDate && taskDate < startDate) return false;
          if (endDate && taskDate > endDate) return false;
        }
      }
      if (status.length > 0) {
        if (!status.map(s => s.label).includes(t.status_operacional)) return false;
      }
      if (clientes.length > 0) {
        if (!clientes.map(c => c.label).includes(t.nome_cliente)) return false;
      }
      if (vendedores && vendedores.length > 0) {
        if (!vendedores.map(v => v.label).includes(t.nome_vendedor)) return false;
      }
      if (tiposTarefa.length > 0) {
        if (!tiposTarefa.map(type => type.label).includes(t.tipo_tarefa)) return false;
      }
      return true;
    });
  }, [tarefas, status, clientes, vendedores, startDate, endDate, tiposTarefa, hideInternalTasks]);

  // Agregações
  const statsPorCliente = useMemo(() => {
    const acc: Record<string, any> = {};
    tarefasFiltradas.forEach(t => {
      const c = t.nome_cliente || 'Desconhecido';
      if (c === 'Sem Contato') return;
      
      if (!acc[c]) {
        acc[c] = {
          nome: c,
          total: 0,
          visitas: 0,
          finalizadas: 0,
          pendentes: 0,
          deals: new Set()
        };
      }
      
      acc[c].total += 1;
      if (t.finalizada) acc[c].finalizadas += 1;
      else acc[c].pendentes += 1;
      
      if (t.tipo_tarefa && t.tipo_tarefa.toLowerCase().includes('visita')) {
        acc[c].visitas += 1;
      }
      if (t.deal_id) {
        acc[c].deals.add(t.deal_id);
      }
    });

    return Object.values(acc).map(v => ({
      ...v,
      negocios: v.deals.size,
      conclusao: v.total > 0 ? Math.round((v.finalizadas / v.total) * 100) : 0
    })).sort((a, b) => b.total - a.total);
  }, [tarefasFiltradas]);

  const statsPorNegocio = useMemo(() => {
    const acc: Record<string, number> = {};
    tarefasFiltradas.forEach(t => {
      const n = t.titulo_negocio || t.DealTitle || t.nome_negocio;
      if (n && n !== 'Não Vinculado' && n !== 'None' && n.trim() !== '') {
        acc[n] = (acc[n] || 0) + 1;
      }
    });
    return Object.keys(acc).map(k => ({ nome: k, total: acc[k] })).sort((a, b) => b.total - a.total).slice(0, 15);
  }, [tarefasFiltradas]);

  const top15Clientes = statsPorCliente.slice(0, 15);
  const maxCliente = top15Clientes.length > 0 ? top15Clientes[0].total : 1;
  const maxNegocio = statsPorNegocio.length > 0 ? statsPorNegocio[0].total : 1;

  return (
    <main className="min-h-screen p-8 md:p-12 bg-gray-50 text-slate-800">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">Clientes e Negócios</h1>
          <p className="text-slate-500 font-medium text-lg">Análise de contas hospitalares, intensidade e carteira de negócios</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              
              {/* Gráfico Horizontal: Top 15 Clientes */}
              <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                  <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></span>
                  Top 15 Clientes (Volume de Atividades)
                </h3>
                <div className="space-y-4">
                  {top15Clientes.map((c, idx) => {
                    const widthPct = Math.max((c.total / maxCliente) * 100, 2);
                    return (
                      <div key={idx} className="flex flex-col relative group">
                        <div className="flex justify-between items-end mb-1 z-10 relative">
                          <span className="text-sm font-semibold text-slate-700 truncate pr-4">{c.nome}</span>
                          <span className="text-sm font-bold text-slate-900">{c.total}</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 transition-all duration-1000 ease-out rounded-full group-hover:bg-blue-400"
                            style={{ width: `${widthPct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Gráfico Horizontal: Top 15 Negócios */}
              <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                  <span className="w-1.5 h-6 bg-emerald-500 rounded-full mr-3"></span>
                  Top 15 Negócios / Demandas Comerciais
                </h3>
                <div className="space-y-4">
                  {statsPorNegocio.map((n, idx) => {
                    const widthPct = Math.max((n.total / maxNegocio) * 100, 2);
                    return (
                      <div key={idx} className="flex flex-col relative group">
                        <div className="flex justify-between items-end mb-1 z-10 relative">
                          <span className="text-sm font-semibold text-slate-700 truncate pr-4">{n.nome}</span>
                          <span className="text-sm font-bold text-slate-900">{n.total}</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 transition-all duration-1000 ease-out rounded-full group-hover:bg-emerald-400"
                            style={{ width: `${widthPct}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tabela de Cobertura */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-8">
              <div className="p-5 border-b border-gray-100 bg-white">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                  <span className="w-1.5 h-6 bg-brand-orange rounded-full mr-3"></span>
                  Cobertura e Eficiência por Conta Hospitalar
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 border-b border-gray-100 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-4">Cliente / Hospital</th>
                      <th className="px-6 py-4 text-center">Atividades</th>
                      <th className="px-6 py-4 text-center">Visitas Presenciais</th>
                      <th className="px-6 py-4 text-center">Finalizadas</th>
                      <th className="px-6 py-4 text-center">Pendentes</th>
                      <th className="px-6 py-4 text-center">Negócios Distintos</th>
                      <th className="px-6 py-4 text-center">Conclusão (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {statsPorCliente.map((c, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{c.nome}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-600">{c.total}</td>
                        <td className="px-6 py-4 text-center font-bold text-slate-600">{c.visitas}</td>
                        <td className="px-6 py-4 text-center font-bold text-emerald-600">{c.finalizadas}</td>
                        <td className="px-6 py-4 text-center font-bold text-red-500">{c.pendentes > 0 ? c.pendentes : '-'}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-600">{c.negocios}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-600">
                           <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${c.conclusao >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                             {c.conclusao}%
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        )}
      </div>
    </main>
  );
}
