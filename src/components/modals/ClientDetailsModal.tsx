import React from 'react';
import { Tarefa } from '@/types/tarefa';

interface ClientDetailsModalProps {
  clientName: string;
  tarefas: Tarefa[];
  onClose: () => void;
}

export function ClientDetailsModal({ clientName, tarefas, onClose }: ClientDetailsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-bold text-slate-800 flex items-center">
            <span className="mr-3 text-2xl">🏢</span> Detalhes: {clientName}
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-red-600 font-bold text-xl leading-none"
          >
            &times;
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          <div className="space-y-3">
            {tarefas.filter(t => t.nome_cliente === clientName).map((tarefa, index) => (
              <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-blue-300 transition-colors">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`inline-block w-2 h-2 rounded-full ${tarefa.finalizada ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {tarefa.finalizada ? 'Finalizada' : 'Em Aberto'}
                    </span>
                    {tarefa.deal_id && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-md uppercase">Vínculo: Negócio</span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">{tarefa.titulo || 'Sem Título'}</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    <strong>Vendedor:</strong> {tarefa.nome_vendedor}
                  </p>
                </div>
                <div className="text-right whitespace-nowrap flex flex-col items-end">
                  <p className="text-sm font-bold text-slate-700">{tarefa.data_evento_str}</p>
                  <p className="text-[11px] text-slate-500 uppercase font-medium mb-2">{tarefa.tipo_tarefa}</p>
                  {tarefa.id && (
                    <a 
                      href={`https://app10.ploomes.com/Tasks/calendar/task/${tarefa.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-gray-100 hover:bg-brand-orange hover:text-white text-slate-600 text-[10px] font-bold rounded-lg transition-colors flex items-center"
                    >
                      🔗 Abrir Tarefa
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
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
