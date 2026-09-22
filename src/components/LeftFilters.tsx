'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useFilterStore } from '@/store/useFilterStore';

export function LeftFilters() {
  const [tarefas, setTarefas] = useState<any[]>([]);
  
  const { 
    startDate, setStartDate,
    endDate, setEndDate,
    vendedores, setVendedores,
    clientes, setClientes,
    tiposTarefa, setTiposTarefa,
    status, setStatus,
    funis, setFunis,
    hideInternalTasks, setHideInternalTasks,
    resetFilters
  } = useFilterStore();

  useEffect(() => {
    fetch('/api/tarefas')
      .then(res => res.json())
      .then(data => setTarefas(data))
      .catch(console.error);
  }, []);

  // Extrair valores únicos
  const uniqueVendedores = useMemo(() => Array.from(new Set(tarefas.map(t => t.nome_vendedor).filter(Boolean))).sort(), [tarefas]);
  const uniqueClientes = useMemo(() => Array.from(new Set(tarefas.map(t => t.nome_cliente).filter(Boolean))).sort(), [tarefas]);
  const uniqueTipos = useMemo(() => Array.from(new Set(tarefas.map(t => t.tipo_tarefa).filter(Boolean))).sort(), [tarefas]);
  const uniqueStatus = useMemo(() => Array.from(new Set(tarefas.map(t => t.status_operacional).filter(Boolean))).sort(), [tarefas]);
  const uniqueFunis = useMemo(() => Array.from(new Set(tarefas.map(t => t.funil).filter(Boolean))).sort(), [tarefas]);

  const handleToggle = (item: string, current: {value: string, label: string}[], setter: (val: any) => void) => {
    const exists = current.find(c => c.value === item);
    if (exists) {
      setter(current.filter(c => c.value !== item));
    } else {
      setter([...current, { value: item, label: item }]);
    }
  };

  const hasActiveFilters = vendedores.length > 0 || clientes.length > 0 || tiposTarefa.length > 0 || status.length > 0 || funis.length > 0 || startDate || endDate;

  return (
    <aside className="w-full md:w-72 bg-white border-r border-gray-200 shadow-sm flex flex-col h-full overflow-hidden shrink-0">
      
      <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center">
          <span className="mr-2">🔍</span> Filtros
          {hasActiveFilters && <span className="ml-2 w-2 h-2 bg-brand-orange rounded-full animate-pulse"></span>}
        </h2>
        {hasActiveFilters && (
          <button 
            onClick={resetFilters}
            className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
          >
            Limpar
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        
        {/* Toggle Internas */}
        <label className="flex items-start space-x-3 text-sm text-slate-800 font-medium cursor-pointer p-3 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors">
          <input 
            type="checkbox" 
            checked={hideInternalTasks}
            onChange={(e) => setHideInternalTasks(e.target.checked)}
            className="mt-1 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span className="leading-tight text-blue-900 text-xs font-bold">Ocultar Reuniões Internas da Saavedra</span>
        </label>

        {/* Período */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Período (Início - Fim)</label>
          <div className="flex flex-col space-y-2">
            <input 
              type="date" 
              value={startDate ? startDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
              className="w-full text-xs p-2 border border-gray-300 rounded-md bg-white text-slate-800 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
            <input 
              type="date" 
              value={endDate ? endDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
              className="w-full text-xs p-2 border border-gray-300 rounded-md bg-white text-slate-800 font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Vendedores */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex justify-between">
            Vendedor / Equipe
            <span className="text-blue-600 font-bold">{vendedores.length > 0 ? `(${vendedores.length})` : ''}</span>
          </label>
          <div className="max-h-48 overflow-y-auto space-y-1 p-2 bg-gray-50 border border-gray-200 rounded-lg shadow-inner">
            {uniqueVendedores.map((v, idx) => (
              <label key={idx} className="flex items-center hover:bg-white p-1.5 rounded cursor-pointer transition-colors group">
                <input 
                  type="checkbox" 
                  checked={!!vendedores.find(x => x.value === v)}
                  onChange={() => handleToggle(v as string, vendedores, setVendedores)}
                  className="mr-3 rounded text-blue-600 focus:ring-blue-500 cursor-pointer border-gray-300"
                />
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">{v}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Clientes */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex justify-between">
            Clientes / Contas
            <span className="text-blue-600 font-bold">{clientes.length > 0 ? `(${clientes.length})` : ''}</span>
          </label>
          <div className="max-h-48 overflow-y-auto space-y-1 p-2 bg-gray-50 border border-gray-200 rounded-lg shadow-inner">
            {uniqueClientes.map((c, idx) => (
              <label key={idx} className="flex items-center hover:bg-white p-1.5 rounded cursor-pointer transition-colors group">
                <input 
                  type="checkbox" 
                  checked={!!clientes.find(x => x.value === c)}
                  onChange={() => handleToggle(c as string, clientes, setClientes)}
                  className="mr-3 rounded text-blue-600 focus:ring-blue-500 cursor-pointer border-gray-300 shrink-0"
                />
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">{c}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Atividade */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex justify-between">
            Atividade / Canal
            <span className="text-blue-600 font-bold">{tiposTarefa.length > 0 ? `(${tiposTarefa.length})` : ''}</span>
          </label>
          <div className="max-h-32 overflow-y-auto space-y-1 p-2 bg-gray-50 border border-gray-200 rounded-lg shadow-inner">
            {uniqueTipos.map((t, idx) => (
              <label key={idx} className="flex items-center hover:bg-white p-1.5 rounded cursor-pointer transition-colors group">
                <input 
                  type="checkbox" 
                  checked={!!tiposTarefa.find(x => x.value === t)}
                  onChange={() => handleToggle(t as string, tiposTarefa, setTiposTarefa)}
                  className="mr-3 rounded text-blue-600 focus:ring-blue-500 cursor-pointer border-gray-300"
                />
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">{t}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Funis */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex justify-between">
            Funil / Pipeline
            <span className="text-blue-600 font-bold">{funis.length > 0 ? `(${funis.length})` : ''}</span>
          </label>
          <div className="max-h-32 overflow-y-auto space-y-1 p-2 bg-gray-50 border border-gray-200 rounded-lg shadow-inner">
            {uniqueFunis.map((f, idx) => (
              <label key={idx} className="flex items-center hover:bg-white p-1.5 rounded cursor-pointer transition-colors group">
                <input 
                  type="checkbox" 
                  checked={!!funis.find(x => x.value === f)}
                  onChange={() => handleToggle(f as string, funis, setFunis)}
                  className="mr-3 rounded text-blue-600 focus:ring-blue-500 cursor-pointer border-gray-300"
                />
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700 truncate">{f}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex justify-between">
            Status da Tarefa
            <span className="text-blue-600 font-bold">{status.length > 0 ? `(${status.length})` : ''}</span>
          </label>
          <div className="space-y-1 p-2 bg-gray-50 border border-gray-200 rounded-lg shadow-inner">
            {uniqueStatus.map((s, idx) => (
              <label key={idx} className="flex items-center hover:bg-white p-1.5 rounded cursor-pointer transition-colors group">
                <input 
                  type="checkbox" 
                  checked={!!status.find(x => x.value === s)}
                  onChange={() => handleToggle(s as string, status, setStatus)}
                  className="mr-3 rounded text-blue-600 focus:ring-blue-500 cursor-pointer border-gray-300"
                />
                <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">{s}</span>
              </label>
            ))}
          </div>
        </div>

      </div>
    </aside>
  );
}
