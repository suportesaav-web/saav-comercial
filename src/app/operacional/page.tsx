'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useFilterStore } from '@/store/useFilterStore';

export default function OperacionalPage() {
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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
    let filtered = tarefas.filter((t: any) => {
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

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        (t.titulo || '').toLowerCase().includes(q) ||
        (t.nome_cliente || '').toLowerCase().includes(q) ||
        (t.titulo_negocio || '').toLowerCase().includes(q) ||
        (t.nome_vendedor || '').toLowerCase().includes(q) ||
        (t.descricao || '').toLowerCase().includes(q) ||
        (t.tipo_tarefa || '').toLowerCase().includes(q)
      );
    }

    // Ordenar da mais recente para a mais antiga
    return filtered.sort((a, b) => {
      const dateA = a.raw_datetime ? new Date(a.raw_datetime).getTime() : 0;
      const dateB = b.raw_datetime ? new Date(b.raw_datetime).getTime() : 0;
      return dateB - dateA;
    });
  }, [tarefas, status, clientes, vendedores, startDate, endDate, tiposTarefa, hideInternalTasks, searchQuery]);


  return (
    <main className="min-h-screen p-8 md:p-12 bg-gray-50 text-slate-800 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">Detalhamento Operacional</h1>
            <p className="text-slate-500 font-medium text-lg">Auditoria e busca livre em todas as tarefas do CRM</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center">
            <span className="text-2xl font-black text-blue-600 mr-2">{loading ? '...' : tarefasFiltradas.length}</span>
            <span className="text-sm text-slate-500 uppercase tracking-widest font-semibold">Tarefas Encontradas</span>
          </div>
        </header>

        {/* Barra de Busca */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex items-center">
          <span className="text-2xl text-slate-400 mr-4">🔎</span>
          <input 
            type="text" 
            placeholder="Pesquisa rápida (Título, Cliente, Negócio, Vendedor ou Observação)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400 font-medium"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-red-500 font-bold ml-4">
              Limpar
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
          </div>
        ) : (
          <div className="flex-1 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
            <div className="overflow-auto flex-1">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs text-slate-500 uppercase tracking-wider font-semibold sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4">Data/Hora</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Vendedor</th>
                    <th className="px-6 py-4">Cliente / Conta</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Título da Tarefa</th>
                    <th className="px-6 py-4">Negócio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tarefasFiltradas.length > 0 ? tarefasFiltradas.slice(0, 300).map((t, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-700">{t.data_evento_str}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          t.finalizada 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : (t.raw_datetime && new Date(t.raw_datetime) < new Date() ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700')
                        }`}>
                          {t.finalizada ? 'Finalizada' : (t.raw_datetime && new Date(t.raw_datetime) < new Date() ? 'Atrasada' : 'Pendente')}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-semibold text-slate-800">{t.nome_vendedor}</td>
                      <td className="px-6 py-3 text-slate-600 font-medium truncate max-w-[200px]">{t.nome_cliente || '-'}</td>
                      <td className="px-6 py-3 text-slate-600">{t.tipo_tarefa}</td>
                      <td className="px-6 py-3 text-slate-800 truncate max-w-[250px]">{t.titulo || '-'}</td>
                      <td className="px-6 py-3 text-slate-500 truncate max-w-[200px]">{t.titulo_negocio || '-'}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                        Nenhuma tarefa encontrada. Tente ajustar os filtros ou o termo de busca.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {tarefasFiltradas.length > 300 && (
                <div className="p-3 text-center text-slate-500 text-xs font-semibold bg-gray-50">
                  Exibindo as 300 mais recentes. Refine sua busca para resultados mais específicos.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
