'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useFilterStore } from '@/store/useFilterStore';

export function TopBarFilters() {
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { 
    startDate, setStartDate,
    endDate, setEndDate,
    vendedores, setVendedores,
    clientes, setClientes,
    tiposTarefa, setTiposTarefa,
    status, setStatus,
    hideInternalTasks, setHideInternalTasks,
    resetFilters
  } = useFilterStore();

  useEffect(() => {
    fetch('/api/tarefas')
      .then(res => res.json())
      .then(data => setTarefas(data))
      .catch(console.error);
  }, []);

  // Extrair valores únicos para os dropdowns
  const uniqueVendedores = useMemo(() => Array.from(new Set(tarefas.map(t => t.nome_vendedor).filter(Boolean))).sort(), [tarefas]);
  const uniqueClientes = useMemo(() => Array.from(new Set(tarefas.map(t => t.nome_cliente).filter(Boolean))).sort(), [tarefas]);
  const uniqueTipos = useMemo(() => Array.from(new Set(tarefas.map(t => t.tipo_tarefa).filter(Boolean))).sort(), [tarefas]);
  const uniqueStatus = useMemo(() => Array.from(new Set(tarefas.map(t => t.status_operacional).filter(Boolean))).sort(), [tarefas]);

  // Função helper para toggles
  const handleToggle = (item: string, current: {value: string, label: string}[], setter: (val: any) => void) => {
    const exists = current.find(c => c.value === item);
    if (exists) {
      setter(current.filter(c => c.value !== item));
    } else {
      setter([...current, { value: item, label: item }]);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm relative z-40">
      <div className="px-6 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-slate-700 font-bold text-sm rounded-lg transition-colors"
          >
            <span className="mr-2">🔍</span> 
            {isExpanded ? 'Esconder Filtros' : 'Filtros Globais'}
            {(vendedores.length > 0 || clientes.length > 0 || tiposTarefa.length > 0 || status.length > 0 || startDate || endDate) && (
               <span className="ml-2 w-2 h-2 bg-brand-orange rounded-full"></span>
            )}
          </button>
          
          <label className="flex items-center space-x-2 text-sm text-slate-600 font-medium cursor-pointer">
            <input 
              type="checkbox" 
              checked={hideInternalTasks}
              onChange={(e) => setHideInternalTasks(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Esconder Reuniões Internas (Saavedra)</span>
          </label>
        </div>
        
        <button 
          onClick={resetFilters}
          className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors"
        >
          Limpar Tudo
        </button>
      </div>

      {isExpanded && (
        <div className="px-6 py-4 bg-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 border-t border-gray-100">
          
          {/* Período */}
          <div className="flex flex-col space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Período (Início - Fim)</label>
            <div className="flex space-x-2">
              <input 
                type="date" 
                value={startDate ? startDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                className="w-full text-xs p-2 border border-gray-300 rounded-md bg-white text-slate-700"
              />
              <input 
                type="date" 
                value={endDate ? endDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                className="w-full text-xs p-2 border border-gray-300 rounded-md bg-white text-slate-700"
              />
            </div>
          </div>

          {/* Vendedores */}
          <div className="flex flex-col space-y-2 relative group">
            <label className="text-xs font-bold text-slate-500 uppercase">Vendedor / Equipe</label>
            <div className="w-full text-xs p-2 border border-gray-300 rounded-md bg-white text-slate-700 cursor-pointer flex justify-between items-center">
              <span className="truncate">{vendedores.length > 0 ? `${vendedores.length} selecionado(s)` : 'Todos'}</span>
              <span>▼</span>
            </div>
            {/* Dropdown Menu */}
            <div className="absolute top-full left-0 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-md hidden group-hover:block z-50">
              {uniqueVendedores.map((v, idx) => (
                <label key={idx} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer text-xs">
                  <input 
                    type="checkbox" 
                    checked={!!vendedores.find(x => x.value === v)}
                    onChange={() => handleToggle(v as string, vendedores, setVendedores)}
                    className="mr-2"
                  />
                  {v}
                </label>
              ))}
            </div>
          </div>

          {/* Clientes */}
          <div className="flex flex-col space-y-2 relative group">
            <label className="text-xs font-bold text-slate-500 uppercase">Clientes</label>
            <div className="w-full text-xs p-2 border border-gray-300 rounded-md bg-white text-slate-700 cursor-pointer flex justify-between items-center">
              <span className="truncate">{clientes.length > 0 ? `${clientes.length} selecionado(s)` : 'Todos'}</span>
              <span>▼</span>
            </div>
            <div className="absolute top-full left-0 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-md hidden group-hover:block z-50">
              {uniqueClientes.map((c, idx) => (
                <label key={idx} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer text-xs truncate">
                  <input 
                    type="checkbox" 
                    checked={!!clientes.find(x => x.value === c)}
                    onChange={() => handleToggle(c as string, clientes, setClientes)}
                    className="mr-2 shrink-0"
                  />
                  <span className="truncate">{c}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Canal / Tipo */}
          <div className="flex flex-col space-y-2 relative group">
            <label className="text-xs font-bold text-slate-500 uppercase">Canal / Atividade</label>
            <div className="w-full text-xs p-2 border border-gray-300 rounded-md bg-white text-slate-700 cursor-pointer flex justify-between items-center">
              <span className="truncate">{tiposTarefa.length > 0 ? `${tiposTarefa.length} selecionado(s)` : 'Todos'}</span>
              <span>▼</span>
            </div>
            <div className="absolute top-full left-0 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-md hidden group-hover:block z-50">
              {uniqueTipos.map((t, idx) => (
                <label key={idx} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer text-xs">
                  <input 
                    type="checkbox" 
                    checked={!!tiposTarefa.find(x => x.value === t)}
                    onChange={() => handleToggle(t as string, tiposTarefa, setTiposTarefa)}
                    className="mr-2"
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-col space-y-2 relative group">
            <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
            <div className="w-full text-xs p-2 border border-gray-300 rounded-md bg-white text-slate-700 cursor-pointer flex justify-between items-center">
              <span className="truncate">{status.length > 0 ? `${status.length} selecionado(s)` : 'Todos'}</span>
              <span>▼</span>
            </div>
            <div className="absolute top-full right-0 mt-1 w-full max-h-48 overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-md hidden group-hover:block z-50">
              {uniqueStatus.map((s, idx) => (
                <label key={idx} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer text-xs">
                  <input 
                    type="checkbox" 
                    checked={!!status.find(x => x.value === s)}
                    onChange={() => handleToggle(s as string, status, setStatus)}
                    className="mr-2"
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
