'use client';

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { parseISO, format } from 'date-fns';
import { useSearchParams } from 'next/navigation';

/**
 * Interface que representa os dados estruturados de Tarefas
 */
interface TarefasTableProps {
  tarefas: any[];
  loading: boolean;
}

/**
 * Componente isolado para renderização da Tabela de Tarefas.
 * Responsável por:
 * 1. Exibir a lista de tarefas passadas por prop.
 * 2. Gerenciar o estado de pesquisa local.
 * 3. Filtrar os dados em memória sem depender do servidor.
 */
export function TarefasTable({ tarefas, loading }: TarefasTableProps) {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const filterType = searchParams.get('filter'); // 'abertas' | 'atrasadas' | null
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const filteredData = useMemo(() => {
    if (!tarefas) return [];
    
    // 1. Aplica o filtro de status da URL
    let baseData = tarefas;
    if (filterType === 'abertas') {
      baseData = tarefas.filter(t => !t.finalizada);
    } else if (filterType === 'atrasadas') {
      const hoje = new Date();
      hoje.setHours(0,0,0,0);
      baseData = tarefas.filter(t => !t.finalizada && new Date(t.raw_datetime) < hoje);
    }

    // 2. Aplica o filtro de texto local
    if (!searchTerm.trim()) return baseData;
    
    const lower = searchTerm.toLowerCase();
    return baseData.filter(item => 
      (item.titulo || '').toLowerCase().includes(lower) ||
      (item.nome_cliente || '').toLowerCase().includes(lower) ||
      (item.nome_vendedor || '').toLowerCase().includes(lower) ||
      (item.tipo_tarefa || '').toLowerCase().includes(lower) ||
      (item.titulo_negocio || '').toLowerCase().includes(lower)
    );
  }, [tarefas, searchTerm, filterType]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 min-h-[400px]">
        Carregando banco de tarefas...
      </div>
    );
  }

  return (
    <>
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all sm:text-sm"
            placeholder="Pesquise por tarefa, cliente ou vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-100 bg-slate-50 text-xs text-slate-500 font-bold uppercase tracking-wider">
              <th className="py-3 px-6 w-16 text-center">Status</th>
              <th className="py-3 px-6 w-32">Data</th>
              <th className="py-3 px-6 w-64">Tarefa / Oportunidade</th>
              <th className="py-3 px-6 w-56">Cliente</th>
              <th className="py-3 px-6 w-48">Tipo</th>
              <th className="py-3 px-6 w-48">Vendedor</th>
            </tr>
          </thead>
          <tbody className="text-slate-700 text-sm">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  Nenhuma tarefa encontrada.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => {
                // Formatação da Data Original (raw_datetime)
                let dataFormatada = 'Sem data';
                if (item.raw_datetime) {
                  try {
                    dataFormatada = format(parseISO(item.raw_datetime), "dd/MM/yyyy 'às' HH:mm");
                  } catch (e) {
                    dataFormatada = item.data_evento_str || 'Data inválida';
                  }
                }

                return (
                  <tr key={item.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors align-middle">
                    <td className="py-4 px-6 text-center">
                      {item.finalizada ? (
                        <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm" title="Finalizada"></span>
                      ) : (
                        <span className="w-3 h-3 rounded-full bg-amber-400 inline-block shadow-sm" title="Pendente"></span>
                      )}
                    </td>

                    <td className="py-4 px-6 font-medium text-slate-600">
                      {dataFormatada}
                    </td>

                    <td className="py-4 px-6">
                      <a 
                        href={`https://app10.ploomes.com/task/${item.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group flex flex-col items-start hover:bg-slate-100 p-1.5 -ml-1.5 rounded-lg transition-colors"
                        title="Abrir Tarefa no Ploomes"
                      >
                        <span className="font-bold text-indigo-600 group-hover:text-indigo-800 line-clamp-2 transition-colors">
                          {item.titulo}
                          <span className="inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                        </span>
                        {item.titulo_negocio && item.titulo_negocio !== 'Não Vinculado' && (
                          <span className="text-xs font-semibold text-slate-400 mt-1 line-clamp-1">
                            {item.titulo_negocio}
                          </span>
                        )}
                      </a>
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-700">
                      {item.nome_cliente || 'Sem Cliente'}
                    </td>

                    <td className="py-4 px-6">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                        {item.tipo_tarefa || 'Geral'}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-medium">
                      {item.nome_vendedor || 'Sem Vendedor'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
