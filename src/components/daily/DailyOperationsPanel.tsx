import React, { useMemo, useState } from 'react';
import { Tarefa } from '@/types/tarefa';

interface DailyOperationsPanelProps {
  tarefas: Tarefa[];
}

export function DailyOperationsPanel({ tarefas }: DailyOperationsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const { tarefasHoje, agendadasHoje, concluidasHoje, taxaConclusao, tarefasPorVendedor } = useMemo(() => {
    const hojeStr = new Date().toLocaleDateString('pt-BR');
    
    // Pega as tarefas onde o evento é HOJE, independente do filtro global
    const hoje = tarefas.filter(t => {
      // Comparação via string formatada (dd/mm/yyyy) para evitar problemas de fuso
      return t.data_evento_str === hojeStr;
    });

    const agendadas = hoje.length;
    const concluidas = hoje.filter(t => t.finalizada).length;
    const taxa = agendadas > 0 ? Math.round((concluidas / agendadas) * 100) : 0;

    // Agrupa por vendedor
    const porVendedor: Record<string, Tarefa[]> = {};
    hoje.forEach(t => {
      const v = t.nome_vendedor || 'Desconhecido';
      if (!porVendedor[v]) porVendedor[v] = [];
      porVendedor[v].push(t);
    });

    // Ordena vendedores pelo total de tarefas do dia
    const sortedVendedores = Object.entries(porVendedor).sort((a, b) => b[1].length - a[1].length);

    return { 
      tarefasHoje: hoje, 
      agendadasHoje: agendadas, 
      concluidasHoje: concluidas, 
      taxaConclusao: taxa,
      tarefasPorVendedor: sortedVendedores
    };
  }, [tarefas]);

  if (tarefasHoje.length === 0) return null; // Esconde se não tiver operação hoje

  return (
    <div className="mb-8 bg-slate-900 rounded-2xl shadow-lg border border-slate-800 overflow-hidden text-white transition-all duration-300">
      {/* Header Interativo */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center cursor-pointer hover:bg-slate-800/80 transition-colors"
      >
        <div className="flex items-center mb-4 md:mb-0">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4 shrink-0 shadow-inner">
            <span className="text-2xl">🔥</span>
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight flex items-center">
              Operação Diária (Hoje)
              <span className="ml-3 px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] uppercase tracking-widest font-bold rounded">
                Tempo Real
              </span>
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-0.5">
              Monitoramento estrito da pauta do dia atual, sem interferência de filtros de período.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Na Rua</p>
            <p className="text-2xl font-black text-white">{agendadasHoje}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Baixadas</p>
            <p className="text-2xl font-black text-emerald-400">{concluidasHoje}</p>
          </div>
          <div className="text-center border-l border-slate-700 pl-6 relative">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Ritmo</p>
            <p className="text-2xl font-black text-brand-orange">{taxaConclusao}%</p>
          </div>
          <div className="ml-4 text-slate-500 font-bold">
            {isExpanded ? '▲' : '▼'}
          </div>
        </div>
      </div>

      {/* Lista Expandida */}
      {isExpanded && (
        <div className="p-5 pt-0 border-t border-slate-800 bg-slate-900/50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {tarefasPorVendedor.map(([vendedor, listaTarefas]) => {
              const concluidas = listaTarefas.filter(t => t.finalizada).length;
              const total = listaTarefas.length;
              
              return (
                <div key={vendedor} className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm">
                  <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-700">
                    <h3 className="font-bold text-sm text-slate-200">{vendedor}</h3>
                    <span className="text-[10px] font-bold bg-slate-700 text-slate-300 px-2 py-1 rounded">
                      {concluidas}/{total}
                    </span>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {listaTarefas.map((tarefa, idx) => (
                      <a 
                        key={idx}
                        href={`https://app10.ploomes.com/Tasks/calendar/task/${tarefa.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-2 rounded-lg hover:bg-slate-700/50 transition-colors group block"
                      >
                        <div className={`w-2 h-2 rounded-full mr-3 shrink-0 ${tarefa.finalizada ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-slate-300 truncate group-hover:text-white transition-colors">{tarefa.nome_cliente || 'Sem Cliente'}</p>
                          <p className="text-[10px] text-slate-500 truncate">{tarefa.tipo_tarefa}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
