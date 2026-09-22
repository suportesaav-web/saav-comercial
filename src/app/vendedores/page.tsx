'use client';

import React, { useState, useMemo } from 'react';
import { VendedorRankingChart } from '@/components/charts/VendedorRankingChart';
import { InfoPopover } from '@/components/ui/InfoPopover';
import { useTarefas } from '@/hooks/useTarefas';
import { useFilterStore } from '@/store/useFilterStore';
import { TaskInteractionsTimeline } from '@/components/timeline/TaskInteractionsTimeline';
import { KpiDetailsModal } from '@/components/modals/KpiDetailsModal';
import { Tarefa } from '@/types/tarefa';

export default function VendedoresPage() {
  const [selectedTarefa, setSelectedTarefa] = useState<any | null>(null);
  const [kpiModalData, setKpiModalData] = useState<{ title: string; tarefas: Tarefa[] } | null>(null);

  const { tarefasFiltradas, loading, interacoes } = useTarefas();
  const { startDate, endDate } = useFilterStore();

  // Agregação por Vendedor
  const statsPorVendedor = useMemo(() => {
    const acc: Record<string, any> = {};
    const now = new Date();
    
    // Processamento de Interações para Adoção Mobile e Tempo Médio
    const statsInteracoes: Record<string, { checkins_validos: number, total_duracao: number, visitas_interacoes: number }> = {};
    interacoes.forEach((i: any) => {
      const v = i.nome_vendedor || 'Desconhecido';
      if (!statsInteracoes[v]) statsInteracoes[v] = { checkins_validos: 0, total_duracao: 0, visitas_interacoes: 0 };
      
      statsInteracoes[v].visitas_interacoes += 1;
      
      // Conta como adoção mobile se teve Check-in validado ou coordenadas GPS
      if (i.checkin_validado || (i.checkin_lat && i.checkin_lng)) {
        statsInteracoes[v].checkins_validos += 1;
      }
      
      if (i.duracao_segundos) {
        statsInteracoes[v].total_duracao += i.duracao_segundos;
      }
    });

    const tarefasFechadasComInteracao = new Set(interacoes.filter((i: any) => i.task_id).map((i: any) => i.task_id));

    tarefasFiltradas.forEach(t => {
      const v = t.nome_vendedor || 'Desconhecido';
      if (!acc[v]) {
        acc[v] = {
          nome: v,
          realizadas: 0,
          finalizadas: 0,
          atrasadas: 0,
          visitas: 0,
          horas: 0,
          comContato: 0,
          semEngajamento: 0,
          ultimaAtividade: null
        };
      }
      
      acc[v].realizadas += 1;
      
      if (t.finalizada) {
        acc[v].finalizadas += 1;
        if (t.id && !tarefasFechadasComInteracao.has(t.id as number)) {
          acc[v].semEngajamento += 1;
        }
      }
      
      const isOverdue = !t.finalizada && t.raw_datetime && new Date(t.raw_datetime) < now;
      if (isOverdue) acc[v].atrasadas += 1;
      
      if (t.tipo_tarefa && t.tipo_tarefa.toLowerCase().includes('visita')) {
        acc[v].visitas += 1;
      }
      
      acc[v].horas += (t.horas || 0);
      if (t.contact_id) acc[v].comContato += 1;

      // Ociosidade: buscar a data mais recente que não seja no futuro
      const rawDate = t.raw_datetime ? new Date(t.raw_datetime) : null;
      if (rawDate && rawDate <= now) {
        if (!acc[v].ultimaAtividade || rawDate > acc[v].ultimaAtividade) {
          acc[v].ultimaAtividade = rawDate;
        }
      }
    });

    let diasPeriodo = 30;
    if (startDate && endDate) {
      const diff = Math.abs(endDate.getTime() - startDate.getTime());
      diasPeriodo = Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 1);
    }

    return Object.values(acc).map(v => {
      const diasOciosidade = v.ultimaAtividade 
        ? Math.floor((now.getTime() - v.ultimaAtividade.getTime()) / (1000 * 60 * 60 * 24)) 
        : diasPeriodo; 
        
      const intStats = statsInteracoes[v.nome] || { checkins_validos: 0, total_duracao: 0, visitas_interacoes: 0 };
      const adocaoMobile = intStats.visitas_interacoes > 0 
        ? Math.round((intStats.checkins_validos / intStats.visitas_interacoes) * 100) 
        : 0;
      
      const tempoMedioVisitaMin = intStats.checkins_validos > 0 
        ? Math.round((intStats.total_duracao / intStats.checkins_validos) / 60) 
        : 0;

      return {
        ...v,
        ociosidade: Math.max(0, diasOciosidade),
        mediaDiaria: (v.realizadas / diasPeriodo).toFixed(1),
        conformidade: v.realizadas > 0 ? Math.round((v.comContato / v.realizadas) * 100) : 100,
        conclusao: v.realizadas > 0 ? Math.round((v.finalizadas / v.realizadas) * 100) : 100,
        adocaoMobile,
        tempoMedioVisitaMin,
        engajamento: v.finalizadas > 0 ? Math.round(((v.finalizadas - v.semEngajamento) / v.finalizadas) * 100) : 0
      }
    }).sort((a, b) => b.realizadas - a.realizadas);
  }, [tarefasFiltradas, interacoes, startDate, endDate]);

  // Totais (Equipe)
  const equipeRealizadas = statsPorVendedor.reduce((acc, v) => acc + v.realizadas, 0);
  const equipeFinalizadas = statsPorVendedor.reduce((acc, v) => acc + v.finalizadas, 0);
  const equipeAtrasadas = statsPorVendedor.reduce((acc, v) => acc + v.atrasadas, 0);
  const mediaDiariaEquipe = statsPorVendedor.length > 0 
    ? (statsPorVendedor.reduce((acc, v) => acc + parseFloat(v.mediaDiaria), 0) / statsPorVendedor.length).toFixed(1) 
    : "0.0";
  const mediaEngajamentoEquipe = statsPorVendedor.length > 0 
    ? Math.round(statsPorVendedor.reduce((acc, v) => acc + v.engajamento, 0) / statsPorVendedor.length) 
    : 0;
    
  // Auditoria (Tarefas Atrasadas)
  const tarefasAtrasadasDetalhes = useMemo(() => {
    return tarefasFiltradas.filter(t => !t.finalizada && t.raw_datetime && new Date(t.raw_datetime) < new Date())
      .sort((a, b) => new Date(a.raw_datetime).getTime() - new Date(b.raw_datetime).getTime());
  }, [tarefasFiltradas]);

  return (
    <main className="min-h-screen p-8 md:p-12 bg-gray-50 text-slate-800">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">Vendedores e Equipe</h1>
          <p className="text-slate-500 font-medium text-lg">Performance individual e análise de carteira</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
          </div>
        ) : (
          <>
            {/* Top KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Realizações', value: equipeRealizadas, color: 'text-slate-800', tooltip: 'Soma total de tarefas executadas pela equipe.', filteredTasks: tarefasFiltradas },
                { label: 'Finalizadas', value: equipeFinalizadas, color: 'text-emerald-600', tooltip: 'Volume de tarefas que já foram concluídas.', filteredTasks: tarefasFiltradas.filter((t: any) => t.finalizada) },
                { label: 'Atrasadas', value: equipeAtrasadas, color: 'text-red-600', tooltip: 'Tarefas da equipe que ultrapassaram o prazo.', filteredTasks: tarefasFiltradas.filter((t: any) => !t.finalizada && t.raw_datetime && new Date(t.raw_datetime) < new Date()) },
                { label: 'Média (Equipe)', value: mediaDiariaEquipe, color: 'text-blue-600', tooltip: 'Quantidade média de tarefas diárias por consultor.', filteredTasks: null },
                { label: 'Engajamento (%)', value: `${mediaEngajamentoEquipe}%`, color: 'text-indigo-600', tooltip: 'Taxa média de tarefas finalizadas com documentação de visita.', filteredTasks: null },
              ].map((kpi, idx) => (
                <div 
                  key={idx} 
                  onClick={() => kpi.filteredTasks && setKpiModalData({ title: kpi.label, tarefas: kpi.filteredTasks })}
                  className={`p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow ${kpi.filteredTasks ? 'cursor-pointer hover:border-blue-200' : ''}`}
                >
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-between">
                    {kpi.label}
                    <InfoPopover content={kpi.tooltip} />
                  </h3>
                  <p className={`text-3xl font-black ${kpi.color}`}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Graficos (Top 5 Nativo) */}
            <div className="mb-8 relative">
               <div className="absolute top-4 right-4 z-10">
                 <InfoPopover content="Volume total de tarefas realizadas por cada membro da equipe no período." />
               </div>
               <VendedorRankingChart data={tarefasFiltradas} />
            </div>

            {/* Tabela Consolidada */}
            <div className="mb-12 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                  <span className="w-1.5 h-6 bg-brand-orange rounded-full mr-3"></span>
                  Tabela Gerencial por Vendedor
                </h3>
                <InfoPopover content="Acompanhamento detalhado do funil de produtividade de cada vendedor, contendo taxas de conclusão e conformidade (preenchimento do contato)." />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-gray-50 border-b border-gray-100 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-6 py-4">Vendedor</th>
                      <th className="px-6 py-4 text-center">Realizadas</th>
                      <th className="px-6 py-4 text-center">Finalizadas</th>
                      <th className="px-6 py-4 text-center">Atrasadas</th>
                      <th className="px-6 py-4 text-center">Conclusão (%)</th>
                      <th className="px-6 py-4 text-center">Média Diária</th>
                      <th className="px-6 py-4 text-center">Visitas</th>
                      <th className="px-6 py-4 text-center">Horas (h)</th>
                      <th className="px-6 py-4 text-center">Contato (%)</th>
                      <th className="px-6 py-4 text-center">Engajamento (%)</th>
                      <th className="px-6 py-4 text-center">Check-in Mobile</th>
                      <th className="px-6 py-4 text-center">Visita (min)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {statsPorVendedor.map((v, idx) => (
                      <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{v.nome}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-600">{v.realizadas}</td>
                        <td className="px-6 py-4 text-center font-bold text-emerald-600">{v.finalizadas}</td>
                        <td className="px-6 py-4 text-center font-bold text-red-500">{v.atrasadas > 0 ? v.atrasadas : '-'}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-600">
                           <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${v.conclusao >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                             {v.conclusao}%
                           </span>
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-blue-600">{v.mediaDiaria}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-600">{v.visitas}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-600">{(v.horas / 60).toFixed(1)}</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-600">{v.conformidade}%</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-600">
                           <span className={`px-2 py-1 rounded-full text-[11px] font-bold ${v.engajamento >= 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                             {v.engajamento}%
                           </span>
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-blue-600">{v.adocaoMobile}%</td>
                        <td className="px-6 py-4 text-center font-medium text-slate-600">{v.tempoMedioVisitaMin} min</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Auditoria de Atrasos */}
            {tarefasAtrasadasDetalhes.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-2xl shadow-sm overflow-hidden mb-8">
                <div className="p-5 border-b border-red-200 flex justify-between items-center bg-red-100/50">
                  <h3 className="text-lg font-bold text-red-800 flex items-center">
                    <span className="text-2xl mr-3">🚨</span>
                    Auditoria de Tarefas em Atraso
                  </h3>
                  <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {tarefasAtrasadasDetalhes.length} Atrasos
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="border-b border-red-200 text-xs text-red-800 uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="px-6 py-3">Responsável</th>
                        <th className="px-6 py-3">Data Original</th>
                        <th className="px-6 py-3">Dias Atr.</th>
                        <th className="px-6 py-3">Cliente</th>
                        <th className="px-6 py-3">Título</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-red-100">
                      {tarefasAtrasadasDetalhes.slice(0, 50).map((t, idx) => {
                        const daysLate = Math.floor((new Date().getTime() - new Date(t.raw_datetime).getTime()) / (1000 * 60 * 60 * 24));
                        return (
                          <tr 
                            key={idx} 
                            onClick={() => setSelectedTarefa(t)}
                            className="hover:bg-red-100 transition-colors cursor-pointer"
                          >
                            <td className="px-6 py-3 font-bold text-red-900">{t.nome_vendedor}</td>
                            <td className="px-6 py-3 font-medium text-red-700">{t.data_evento_str}</td>
                            <td className="px-6 py-3 font-bold text-red-600">{daysLate} dias</td>
                            <td className="px-6 py-3 text-red-800">{t.nome_cliente || 'Sem Contato'}</td>
                            <td className="px-6 py-3 text-red-700 truncate max-w-[200px]">{t.titulo || 'Sem Título'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {tarefasAtrasadasDetalhes.length > 50 && (
                    <div className="p-3 text-center text-red-600 text-xs font-semibold bg-red-50">
                      Mostrando as 50 mais antigas.
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Detalhes da Tarefa */}
      {selectedTarefa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-red-50">
              <h3 className="text-xl font-bold text-red-800 flex items-center">
                <span className="text-2xl mr-3">🚨</span> Detalhes da Tarefa Atrasada
              </h3>
              <button 
                onClick={() => setSelectedTarefa(null)}
                className="text-slate-400 hover:text-red-600 font-bold text-2xl leading-none transition-colors"
              >
                &times;
              </button>
            </div>
            
            <div className="p-8 flex-1 bg-white overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Responsável</label>
                  <p className="text-base font-bold text-slate-800">{selectedTarefa.nome_vendedor}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Cliente / Contato</label>
                  <p className="text-base font-bold text-slate-800">{selectedTarefa.nome_cliente || 'Sem Cliente'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Data Limite (Original)</label>
                  <p className="text-base font-bold text-red-600">{selectedTarefa.data_evento_str}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">Tipo de Tarefa</label>
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full uppercase tracking-wider">
                    {selectedTarefa.tipo_tarefa || 'Não Especificado'}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-6">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Título / Descrição</label>
                <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {selectedTarefa.titulo || 'Sem título ou descrição fornecida no Ploomes.'}
                </p>
              </div>

              {/* Feed de Interações */}
              <div className="mb-6">
                <TaskInteractionsTimeline taskId={selectedTarefa.id} interacoes={interacoes} />
              </div>
              
              {selectedTarefa.deal_id && (
                <div className="mt-4 flex items-center text-sm font-bold text-blue-600 bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <span className="mr-2">💼</span> Esta tarefa está vinculada a uma Oportunidade de Negócio ativa.
                </div>
              )}
            </div>
            
            <div className="p-5 border-t border-gray-100 bg-slate-50 flex justify-between items-center">
              {selectedTarefa.id ? (
                <a 
                  href={`https://app10.ploomes.com/Tasks/calendar/task/${selectedTarefa.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-brand-orange hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm flex items-center"
                >
                  <span className="mr-2">🔗</span> Abrir no Ploomes
                </a>
              ) : (
                <span className="text-xs text-slate-400 font-medium italic">Sincronize novamente para habilitar o link.</span>
              )}
              <button 
                onClick={() => setSelectedTarefa(null)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Cliente */}
      {clientDetailsModal && (
        <ClientDetailsModal 
          isOpen={true} 
          onClose={() => setClientDetailsModal(null)} 
          clienteNome={clientDetailsModal}
        />
      )}

      {/* Modal de Detalhes de KPI */}
      {kpiModalData && (
        <KpiDetailsModal 
          isOpen={true}
          onClose={() => setKpiModalData(null)}
          kpiTitle={kpiModalData.title}
          tarefas={kpiModalData.tarefas}
          interacoes={interacoes}
        />
      )}
    </main>
  );
}
