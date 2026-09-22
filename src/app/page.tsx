'use client'

import { useState } from 'react';
import { TrendChart } from '@/components/charts/TrendChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { RankingTable } from '@/components/charts/RankingTable';
import { VendedorRankingChart } from '@/components/charts/VendedorRankingChart';
import { ActivityChart } from '@/components/charts/ActivityChart';
import { InfoPopover } from '@/components/ui/InfoPopover';
import { useTarefas } from '@/hooks/useTarefas';
import { ClientDetailsModal } from '@/components/modals/ClientDetailsModal';
import { DelayedTasksModal } from '@/components/modals/DelayedTasksModal';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientDetailsModal, setClientDetailsModal] = useState<string | null>(null);

  const {
    tarefasFiltradas,
    loading,
    kpis: {
      totalTarefas,
      tarefasFechadas,
      tarefasAtrasadas,
      mediaDiaria,
      visitasPresenciais,
      clientesAtendidos,
      negociosTrabalhados,
      horasAtendimento,
      conformidadeContatos,
      googleSyncRate
    },
    chartsData: {
      trendData,
      donutData,
      rankingData
    }
  } = useTarefas();

  return (
    <main className="min-h-screen p-8 md:p-16 font-sans selection:bg-blue-100 bg-gray-50 text-slate-800">
      
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Premium */}
        <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
              Gestão de Tarefas Ploomes
            </h1>
            <p className="text-slate-500 font-medium text-lg">
              Comercial Saavedra — Dados em Tempo Real
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center bg-white border border-gray-200 px-4 py-2 rounded-full shadow-sm">
            <span className={`w-2.5 h-2.5 rounded-full animate-pulse mr-2 ${loading ? 'bg-yellow-500' : 'bg-emerald-500'}`}></span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              {loading ? 'Sincronizando...' : 'API Online'}
            </span>
          </div>
        </header>

        {/* Diagnósticos e Alertas */}
        {!loading && (tarefasAtrasadas > 0 || conformidadeContatos < 100) && (
          <div className="mb-8 flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
            <div className="flex items-center">
              <span className="flex items-center justify-center w-10 h-10 bg-red-100 text-red-600 rounded-full mr-4 shrink-0">⚠️</span>
              <div>
                <h4 className="font-bold text-red-700">Atenção Necessária</h4>
                <p className="text-sm text-red-600/80 mt-1">
                  Existem <strong className="text-red-700">{tarefasAtrasadas} Tarefas em Atraso</strong> e <strong>{100 - conformidadeContatos}%</strong> das tarefas estão sem contato preenchido.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="hidden sm:block px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
            >
              Visualizar Detalhes
            </button>
          </div>
        )}

        {/* KPI Cards: Grid 10x */}
        {!loading && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            {[
              { label: 'Total Tarefas', value: totalTarefas, color: 'text-slate-800', tooltip: 'Todas as tarefas contabilizadas no período filtrado.' },
              { label: 'Finalizadas', value: tarefasFechadas, color: 'text-emerald-600', tooltip: 'Tarefas marcadas como concluídas no Ploomes.' },
              { label: 'Em Atraso', value: tarefasAtrasadas, color: 'text-red-600', tooltip: 'Tarefas em aberto que já passaram da data limite.' },
              { label: 'Média Diária', value: mediaDiaria, color: 'text-blue-600', tooltip: 'Média de tarefas realizadas por dia no período.' },
              { label: 'Visitas Presenc.', value: visitasPresenciais, color: 'text-slate-800', tooltip: 'Total de tarefas do tipo Visita Presencial.' },
              { label: 'Clientes Atend.', value: clientesAtendidos, color: 'text-slate-800', tooltip: 'Qtd de clientes únicos que receberam alguma atividade.' },
              { label: 'Negócios Trab.', value: negociosTrabalhados, color: 'text-slate-800', tooltip: 'Qtd de oportunidades exclusivas trabalhadas nestas tarefas.' },
              { label: 'Horas (h)', value: horasAtendimento.toFixed(1), color: 'text-slate-800', tooltip: 'Soma total da duração (length) apontada nas tarefas.' },
              { label: 'Conformidade', value: `${conformidadeContatos}%`, color: conformidadeContatos === 100 ? 'text-emerald-600' : 'text-amber-500', tooltip: '% de tarefas corretamente associadas a um contato/cliente.' },
              { label: 'Sync Google', value: `${googleSyncRate}%`, color: 'text-blue-600', tooltip: '% de tarefas enviadas ao Google Calendar.' }
            ].map((kpi, idx) => (
              <div key={idx} className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                  {kpi.label}
                  <InfoPopover content={kpi.tooltip} />
                </h3>
                <p className={`text-2xl font-black ${kpi.color}`}>{kpi.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Dashboard Analítico (BI) */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <TrendChart data={trendData} />
            </div>
            <div className="lg:col-span-1">
              <DonutChart data={donutData} />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <VendedorRankingChart data={tarefasFiltradas} />
            <ActivityChart data={tarefasFiltradas} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <RankingTable data={rankingData} onClientClick={setClientDetailsModal} />
          </div>
        </section>

      </div>

      {clientDetailsModal && (
        <ClientDetailsModal 
          clientName={clientDetailsModal} 
          tarefas={tarefasFiltradas} 
          onClose={() => setClientDetailsModal(null)} 
        />
      )}

      {isModalOpen && (
        <DelayedTasksModal 
          tarefas={tarefasFiltradas} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}

    </main>
  );
}
