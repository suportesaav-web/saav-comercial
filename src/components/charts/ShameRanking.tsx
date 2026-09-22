import React, { useMemo, useState } from 'react';
import { Tarefa } from '@/types/tarefa';
import { Interacao } from '@/types/interacao';
import { KpiDetailsModal } from '@/components/modals/KpiDetailsModal';

interface ShameRankingProps {
  tarefas: Tarefa[];
  interacoes: Interacao[];
}

export function ShameRanking({ tarefas, interacoes }: ShameRankingProps) {
  const [modalData, setModalData] = useState<{ title: string; tarefas: Tarefa[] } | null>(null);

  const { pioresAtrasos, pioresEngajamentos, pioresConformidades } = useMemo(() => {
    const interacoesIds = new Set(interacoes.filter(i => i.task_id).map(i => i.task_id));

    const stats: Record<string, any> = {};

    tarefas.forEach(t => {
      const v = t.nome_vendedor || 'Desconhecido';
      if (!stats[v]) {
        stats[v] = { 
          vendedor: v,
          total: 0, 
          atrasadas: 0, 
          tarefasAtrasadasRef: [],
          finalizadas: 0,
          semEngajamento: 0,
          tarefasSemEngajamentoRef: [],
          semCliente: 0,
          tarefasSemClienteRef: []
        };
      }
      
      const s = stats[v];
      s.total += 1;

      // Atrasadas
      if (!t.finalizada && t.raw_datetime && new Date(t.raw_datetime) < new Date()) {
        s.atrasadas += 1;
        s.tarefasAtrasadasRef.push(t);
      }

      // Sem Engajamento
      if (t.finalizada) {
        s.finalizadas += 1;
        if (t.id && !interacoesIds.has(t.id as number)) {
          s.semEngajamento += 1;
          s.tarefasSemEngajamentoRef.push(t);
        }
      }

      // Sem Cliente / Sem Contato
      if (!t.contact_id || t.nome_cliente === 'Sem Contato') {
        s.semCliente += 1;
        s.tarefasSemClienteRef.push(t);
      }
    });

    // Calcular % e filtrar vendedores com mínimo de amostragem
    const list = Object.values(stats).filter(s => s.total > 5).map(s => {
      s.txAtraso = s.total > 0 ? (s.atrasadas / s.total) * 100 : 0;
      s.txSemEngajamento = s.finalizadas > 0 ? (s.semEngajamento / s.finalizadas) * 100 : 0;
      s.txSemCliente = s.total > 0 ? (s.semCliente / s.total) * 100 : 0;
      return s;
    });

    return {
      pioresAtrasos: [...list].sort((a, b) => b.txAtraso - a.txAtraso).slice(0, 3),
      pioresEngajamentos: [...list].sort((a, b) => b.txSemEngajamento - a.txSemEngajamento).slice(0, 3),
      pioresConformidades: [...list].sort((a, b) => b.txSemCliente - a.txSemCliente).slice(0, 3),
    };

  }, [tarefas, interacoes]);

  if (pioresAtrasos.length === 0) return null;

  const renderRankingCard = (
    titulo: string, 
    icone: string, 
    dados: any[], 
    campoTaxa: string, 
    campoRef: string,
    corTema: string
  ) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-3 ${corTema}`}>
          <span className="text-xl">{icone}</span>
        </div>
        <h3 className="font-black text-slate-800 leading-tight">{titulo}</h3>
      </div>
      
      <div className="space-y-3">
        {dados.map((d, idx) => (
          <div 
            key={idx} 
            onClick={() => setModalData({ title: `Detalhes: ${titulo} - ${d.vendedor}`, tarefas: d[campoRef] })}
            className={`group flex justify-between items-center p-3 rounded-lg border border-transparent hover:border-gray-200 hover:bg-gray-50 cursor-pointer transition-all ${idx === 0 ? 'bg-red-50/50 border-red-100' : ''}`}
          >
            <div className="flex items-center">
              <span className={`w-6 text-center font-bold text-sm ${idx === 0 ? 'text-red-500' : 'text-slate-400'}`}>
                {idx + 1}º
              </span>
              <p className="font-bold text-slate-700 ml-2 text-sm">{d.vendedor}</p>
            </div>
            <div className="text-right">
              <p className="font-black text-slate-900">{Math.round(d[campoTaxa])}%</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d[campoRef].length} ocorrências</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mt-12 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-900 flex items-center tracking-tight">
          <span className="mr-3">⚠️</span> Gargalos de Performance 
        </h2>
        <p className="text-slate-500 font-medium">
          Membros da equipe com os piores índices operacionais no período (mínimo de 5 tarefas).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {renderRankingCard(
          "Maiores Atrasos", 
          "⏱️", 
          pioresAtrasos, 
          "txAtraso", 
          "tarefasAtrasadasRef",
          "bg-red-100 text-red-600"
        )}
        {renderRankingCard(
          "Sem Engajamento", 
          "👻", 
          pioresEngajamentos, 
          "txSemEngajamento", 
          "tarefasSemEngajamentoRef",
          "bg-amber-100 text-amber-600"
        )}
        {renderRankingCard(
          "Falta de Conformidade", 
          "❌", 
          pioresConformidades, 
          "txSemCliente", 
          "tarefasSemClienteRef",
          "bg-rose-100 text-rose-600"
        )}
      </div>

      {modalData && (
        <KpiDetailsModal
          isOpen={true}
          onClose={() => setModalData(null)}
          kpiTitle={modalData.title}
          tarefas={modalData.tarefas}
          interacoes={interacoes}
        />
      )}
    </div>
  );
}
