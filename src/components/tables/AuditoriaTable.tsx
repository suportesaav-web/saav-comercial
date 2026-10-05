'use client';

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AuditoriaTableProps {
  tarefas: any[];
  interacoes: any[];
}

export function AuditoriaTable({ tarefas, interacoes }: AuditoriaTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const mappedData = useMemo(() => {
    return tarefas.map(t => {
      // Cruzamento rápido com a base de interações
      const interacao = interacoes.find(i => i.task_id === t.id);
      
      let dataFormatada = t.data_evento_str;
      if (t.raw_datetime) {
        try {
          dataFormatada = format(parseISO(t.raw_datetime), "dd/MM/yyyy 'às' HH:mm");
        } catch(e) {}
      }

      return {
        id: t.id,
        dataFormatada,
        tipo: t.tipo_tarefa || 'Outros',
        vendedor: t.nome_vendedor || 'Sem Vendedor',
        cliente: t.nome_cliente || 'Sem Cliente',
        titulo: t.titulo || 'Sem Título',
        conteudo: interacao?.conteudo || '',
        status: t.status_operacional
      };
    }).sort((a, b) => b.id - a.id); // Ordem decrescente
  }, [tarefas, interacoes]);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return mappedData;
    const lower = searchTerm.toLowerCase();
    
    return mappedData.filter(item => 
      item.titulo.toLowerCase().includes(lower) ||
      item.conteudo.toLowerCase().includes(lower) ||
      item.cliente.toLowerCase().includes(lower) ||
      item.vendedor.toLowerCase().includes(lower) ||
      item.tipo.toLowerCase().includes(lower)
    );
  }, [mappedData, searchTerm]);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col h-full">
      {/* Header com Busca */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <span className="w-1.5 h-6 bg-slate-800 rounded-full mr-3"></span>
            Auditoria Operacional
          </h3>
          <p className="text-sm text-slate-500 ml-4 mt-1">Inspeção detalhada de apontamentos de tarefas.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm"
            placeholder="Pesquise por licitação, reclamação, cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabela de Dados */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-gray-100 bg-slate-50 text-xs text-slate-500 font-bold uppercase tracking-wider">
              <th className="py-3 px-6 w-40">Data/Hora</th>
              <th className="py-3 px-6 w-48">Vendedor</th>
              <th className="py-3 px-6 w-64">Cliente</th>
              <th className="py-3 px-6 w-48">Atividade</th>
              <th className="py-3 px-6">Registro / Anotação</th>
            </tr>
          </thead>
          <tbody className="text-slate-700 text-sm">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  Nenhum registro encontrado para "{searchTerm}" no período filtrado.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors align-top">
                  <td className="py-4 px-6 text-slate-500 font-medium whitespace-nowrap">
                    {item.dataFormatada}
                    <div className="mt-1">
                       <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${item.status === 'Fechada' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                         {item.status}
                       </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-semibold">{item.vendedor}</td>
                  <td className="py-4 px-6 font-medium text-slate-800">{item.cliente}</td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-slate-700 block mb-1">{item.tipo}</span>
                    <span className="text-xs text-slate-400 line-clamp-2" title={item.titulo}>{item.titulo}</span>
                  </td>
                  <td className="py-4 px-6">
                    {item.conteudo ? (
                      <div 
                        className="text-slate-600 prose prose-sm max-w-none text-xs line-clamp-3 hover:line-clamp-none transition-all cursor-text"
                        dangerouslySetInnerHTML={{ __html: item.conteudo }}
                      />
                    ) : (
                      <span className="text-slate-300 italic text-xs">Sem anotação na interação</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Footer da tabela */}
      <div className="p-4 border-t border-gray-100 bg-slate-50 text-xs text-slate-500 flex justify-between items-center rounded-b-2xl">
        <span>Mostrando <strong>{filteredData.length}</strong> registros operacionais.</span>
        <span>A busca ocorre em memória (0 ms de latência).</span>
      </div>
    </div>
  );
}
