import React from 'react';
import { Interacao } from '@/types/interacao';

interface TaskInteractionsTimelineProps {
  taskId: number;
  interacoes: Interacao[];
}

export function TaskInteractionsTimeline({ taskId, interacoes }: TaskInteractionsTimelineProps) {
  const interacoesDaTarefa = interacoes
    .filter(i => i.task_id === taskId)
    .sort((a, b) => new Date(b.data_criacao_str || b.DateTime || 0).getTime() - new Date(a.data_criacao_str || a.DateTime || 0).getTime());

  if (interacoesDaTarefa.length === 0) {
    return (
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-start">
        <span className="text-xl mr-3">⚠️</span>
        <div>
          <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Sem Interações</h4>
          <p className="text-sm text-amber-700">Esta tarefa não possui nenhum registro de interação ou engajamento documentado.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center">
        <span className="mr-2">💬</span> Linha do Tempo de Interações ({interacoesDaTarefa.length})
      </h4>
      
      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        {interacoesDaTarefa.map((interacao, idx) => (
          <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <span className="text-xs font-bold">{idx + 1}</span>
            </div>
            
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {interacao.nome_vendedor || 'Sistema'}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  {interacao.data_criacao_str}
                </span>
              </div>
              <p className="text-sm text-slate-700 mb-2 leading-relaxed whitespace-pre-wrap">
                {interacao.content || 'Interação sem conteúdo de texto.'}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {interacao.checkin_validado && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center">
                    📍 Check-in Validado
                  </span>
                )}
                {interacao.duracao_segundos && interacao.duracao_segundos > 0 ? (
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full flex items-center">
                    ⏱️ {Math.round(interacao.duracao_segundos / 60)} min de duração
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
