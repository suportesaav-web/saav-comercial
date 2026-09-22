import React, { useState } from 'react';
import { Tarefa } from '@/types/tarefa';
import { Interacao } from '@/types/interacao';
import { TaskInteractionsTimeline } from '@/components/timeline/TaskInteractionsTimeline';

interface KpiDetailsModalProps {
  title: string;
  tarefas: Tarefa[];
  interacoes: Interacao[];
  onClose: () => void;
}

export function KpiDetailsModal({ title, tarefas, interacoes, onClose }: KpiDetailsModalProps) {
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50">
          <h3 className="text-xl font-bold text-blue-800 flex items-center">
            <span className="mr-2">📋</span> {title} ({tarefas.length})
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-blue-600 font-bold text-xl leading-none"
          >
            &times;
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          {tarefas.length === 0 ? (
            <p className="text-center text-slate-500 font-medium py-8">Nenhuma tarefa encontrada para este indicador.</p>
          ) : (
            <div className="space-y-4">
              {tarefas.map((tarefa, index) => {
                const isExpanded = expandedTaskId === tarefa.id;
                const isOverdue = !tarefa.finalizada && tarefa.raw_datetime && new Date(tarefa.raw_datetime) < new Date();
                
                return (
                  <div key={index} className={`bg-white rounded-xl border ${isExpanded ? 'border-blue-300 shadow-md' : 'border-gray-200 shadow-sm'} transition-all overflow-hidden`}>
                    <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex gap-2 mb-2">
                          <span className={`inline-block px-2 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${tarefa.finalizada ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {tarefa.finalizada ? 'Finalizada' : 'Em Aberto'}
                          </span>
                          {isOverdue && (
                            <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-md uppercase tracking-wider">
                              Atrasada
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-slate-800">{tarefa.titulo || 'Sem Título'}</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          <strong>Vendedor:</strong> {tarefa.nome_vendedor} &nbsp;|&nbsp; 
                          <strong>Cliente:</strong> {tarefa.nome_cliente || 'Sem Contato'}
                        </p>
                      </div>
                      <div className="text-right whitespace-nowrap flex flex-col justify-between items-end gap-2">
                        <div>
                          <p className="text-xs font-bold text-slate-700">{tarefa.data_evento_str}</p>
                          <p className="text-[10px] text-slate-500 uppercase">{tarefa.tipo_tarefa}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setExpandedTaskId(isExpanded ? null : (tarefa.id as number))}
                            className="text-[10px] font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-md transition-colors"
                          >
                            {isExpanded ? 'Ocultar Detalhes' : 'Ver Interações'}
                          </button>
                          <a 
                            href={`https://app10.ploomes.com/Tasks/calendar/task/${tarefa.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-md transition-colors inline-flex items-center"
                          >
                            Ploomes ↗
                          </a>
                        </div>
                      </div>
                    </div>
                    
                    {isExpanded && tarefa.id && (
                      <div className="p-4 border-t border-blue-50 bg-slate-50/50">
                        <TaskInteractionsTimeline taskId={tarefa.id as number} interacoes={interacoes} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-white flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
