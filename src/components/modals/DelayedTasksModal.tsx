import React from 'react';
import { Tarefa } from '@/types/tarefa';

interface DelayedTasksModalProps {
  tarefas: Tarefa[];
  onClose: () => void;
}

export function DelayedTasksModal({ tarefas, onClose }: DelayedTasksModalProps) {
  const tarefasAtrasadas = tarefas.filter(t => !t.finalizada && t.raw_datetime && new Date(t.raw_datetime) < new Date());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50">
          <h3 className="text-xl font-bold text-red-700 flex items-center">
            <span className="mr-2">⚠️</span> Tarefas em Atraso
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-red-600 font-bold text-xl leading-none"
          >
            &times;
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          {tarefasAtrasadas.length === 0 ? (
            <p className="text-center text-slate-500 font-medium py-8">Nenhuma tarefa em atraso no momento.</p>
          ) : (
            <div className="space-y-3">
              {tarefasAtrasadas.map((tarefa, index) => {
                const diasAtraso = Math.floor((new Date().getTime() - new Date(tarefa.raw_datetime).getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={index} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-md uppercase tracking-wider mb-2">
                        Atrasada há {diasAtraso} dia{diasAtraso !== 1 ? 's' : ''}
                      </span>
                      <h4 className="text-sm font-bold text-slate-800">{tarefa.titulo || 'Sem Título'}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        <strong>Vendedor:</strong> {tarefa.nome_vendedor} &nbsp;|&nbsp; 
                        <strong>Cliente:</strong> {tarefa.nome_cliente}
                      </p>
                    </div>
                    <div className="text-right whitespace-nowrap flex flex-col justify-between items-end">
                      <div>
                        <p className="text-xs font-bold text-slate-700">{tarefa.data_evento_str}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{tarefa.tipo_tarefa}</p>
                      </div>
                      <a 
                        href={`https://app10.ploomes.com/Tasks/calendar/task/${tarefa.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-[10px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-md transition-colors inline-flex items-center"
                      >
                        Ver no Ploomes ↗
                      </a>
                    </div>
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
