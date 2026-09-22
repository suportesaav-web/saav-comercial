'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import { InfoPopover } from '@/components/ui/InfoPopover';

export default function TemporalPage() {
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [freqOpcao, setFreqOpcao] = useState<'Mensal' | 'Semanal'>('Mensal');

  const { startDate, endDate, vendedores, clientes, tiposTarefa, status, hideInternalTasks } = useFilterStore();

  useEffect(() => {
    fetch('/api/tarefas')
      .then(res => res.json())
      .then(data => {
        setTarefas(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const tarefasFiltradas = useMemo(() => {
    return tarefas.filter((t: any) => {
      if (hideInternalTasks && t.nome_cliente && t.nome_cliente.toUpperCase().includes('SAAVEDRA')) return false;
      
      if (startDate || endDate) {
        const dateStr = t.data_evento_str || t.DateTime || t.CreateDate;
        if (dateStr) {
          let taskDate: Date;
          if (dateStr.includes('/')) {
            const [d, m, y] = dateStr.split('/');
            taskDate = new Date(`${y}-${m}-${d}`);
          } else {
            taskDate = new Date(dateStr);
          }
          if (startDate && taskDate < startDate) return false;
          if (endDate && taskDate > endDate) return false;
        }
      }
      if (status.length > 0) {
        if (!status.map(s => s.label).includes(t.status_operacional)) return false;
      }
      if (clientes.length > 0) {
        if (!clientes.map(c => c.label).includes(t.nome_cliente)) return false;
      }
      if (vendedores && vendedores.length > 0) {
        if (!vendedores.map(v => v.label).includes(t.nome_vendedor)) return false;
      }
      if (tiposTarefa.length > 0) {
        if (!tiposTarefa.map(type => type.label).includes(t.tipo_tarefa)) return false;
      }
      return true;
    });
  }, [tarefas, status, clientes, vendedores, startDate, endDate, tiposTarefa, hideInternalTasks]);

  // --- Agregações de Tempo ---

  // 1. Tendência Temporal (Linha do Tempo)
  const timelineData = useMemo(() => {
    const acc: Record<string, { visitas: number, outros: number }> = {};
    
    tarefasFiltradas.forEach(t => {
      if (!t.raw_datetime) return;
      const d = new Date(t.raw_datetime);
      if (isNaN(d.getTime())) return;

      let chave = '';
      if (freqOpcao === 'Mensal') {
        chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; // Ex: 2026-08
      } else {
        // Lógica de semana do ano simplificada (mês-semana)
        const week = Math.ceil(d.getDate() / 7);
        chave = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')} - Sem ${week}`;
      }

      if (!acc[chave]) acc[chave] = { visitas: 0, outros: 0 };
      
      if (t.tipo_tarefa && t.tipo_tarefa.toLowerCase().includes('visita')) {
        acc[chave].visitas += 1;
      } else {
        acc[chave].outros += 1;
      }
    });

    const sortedKeys = Object.keys(acc).sort((a, b) => a.localeCompare(b));
    let max = 1;
    sortedKeys.forEach(k => {
      const total = acc[k].visitas + acc[k].outros;
      if (total > max) max = total;
    });

    return sortedKeys.map(k => ({
      periodo: k,
      visitas: acc[k].visitas,
      outros: acc[k].outros,
      total: acc[k].visitas + acc[k].outros,
      max
    }));
  }, [tarefasFiltradas, freqOpcao]);


  // 2. Heatmap de Horários (Dia da Semana x Hora)
  const heatmapData = useMemo(() => {
    // Inicializar matriz 5 dias úteis x horas comerciais (08:00 as 18:00)
    const dias = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
    const horas = Array.from({length: 11}, (_, i) => i + 8); // 8 as 18
    
    const matrix: Record<string, Record<string, number>> = {};
    dias.forEach(d => {
      matrix[d] = {};
      horas.forEach(h => matrix[d][h.toString()] = 0);
    });

    let globalMax = 1;

    tarefasFiltradas.forEach(t => {
      if (!t.raw_datetime) return;
      const d = new Date(t.raw_datetime);
      if (isNaN(d.getTime())) return;
      
      const dayIdx = d.getDay(); // 0=Dom, 1=Seg...
      if (dayIdx >= 1 && dayIdx <= 5) { // Só dias uteis
        const hour = d.getHours();
        if (hour >= 8 && hour <= 18) {
          const diaNome = dias[dayIdx - 1];
          matrix[diaNome][hour.toString()] += 1;
          if (matrix[diaNome][hour.toString()] > globalMax) {
            globalMax = matrix[diaNome][hour.toString()];
          }
        }
      }
    });

    return { dias, horas, matrix, globalMax };
  }, [tarefasFiltradas]);


  // 3. Lead Time (Antecedência de Agendamento)
  const leadTimeData = useMemo(() => {
    const bins = {
      'Mesmo dia (0 dias)': 0,
      '1 a 3 dias': 0,
      '4 a 7 dias': 0,
      'Mais de 1 semana': 0
    };

    tarefasFiltradas.forEach(t => {
      if (t.raw_datetime && t.CreateDate) {
        const agendamento = new Date(t.raw_datetime).getTime();
        const criacao = new Date(t.CreateDate).getTime();
        if (!isNaN(agendamento) && !isNaN(criacao)) {
          const diffDays = Math.floor((agendamento - criacao) / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 0) bins['Mesmo dia (0 dias)'] += 1;
          else if (diffDays <= 3) bins['1 a 3 dias'] += 1;
          else if (diffDays <= 7) bins['4 a 7 dias'] += 1;
          else bins['Mais de 1 semana'] += 1;
        }
      }
    });

    const max = Math.max(...Object.values(bins), 1);
    return Object.entries(bins).map(([label, count]) => ({ label, count, max }));
  }, [tarefasFiltradas]);

  return (
    <main className="min-h-screen p-8 md:p-12 bg-gray-50 text-slate-800">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">Análise Temporal</h1>
          <p className="text-slate-500 font-medium text-lg">Tendências cronológicas, horários de pico e antecedência (lead time)</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              
              {/* Timeline (Ocupa 2 colunas) */}
              <div className="lg:col-span-2 bg-white p-6 border border-gray-100 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></span>
                    Tendência de Atividades 
                    <InfoPopover content="Evolução do volume de tarefas ao longo do tempo. Permite visualizar sazonalidades e picos." />
                  </h3>
                  <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                      onClick={() => setFreqOpcao('Mensal')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${freqOpcao === 'Mensal' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Mensal
                    </button>
                    <button 
                      onClick={() => setFreqOpcao('Semanal')}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${freqOpcao === 'Semanal' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Semanal
                    </button>
                  </div>
                </div>
                
                <div className="flex items-end justify-center sm:justify-start h-56 space-x-4 border-b border-gray-100 pb-2">
                  {timelineData.map((d, idx) => {
                    const heightPctVisitas = Math.max((d.visitas / d.max) * 100, 0);
                    const heightPctOutros = Math.max((d.outros / d.max) * 100, 0);
                    return (
                      <div key={idx} className="flex-1 flex flex-col justify-end items-center group relative h-full max-w-[60px]">
                        {/* Tooltip */}
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded-lg pointer-events-none z-10 whitespace-nowrap">
                          {d.periodo}<br/>
                          <span className="text-blue-300 font-bold">{d.visitas} Visitas</span> | {d.outros} Outros
                        </div>
                        {/* Bar Segment Outros */}
                        <div 
                          className="w-full bg-slate-200 rounded-t-md transition-all duration-500 group-hover:bg-slate-300" 
                          style={{ height: `${heightPctOutros}%` }}
                        ></div>
                        {/* Bar Segment Visitas */}
                        <div 
                          className="w-full bg-blue-500 rounded-b-md transition-all duration-500 group-hover:bg-blue-600" 
                          style={{ height: `${heightPctVisitas}%` }}
                        ></div>
                        {/* Label Inferior */}
                        <span className="text-[10px] font-semibold text-slate-500 mt-3 whitespace-nowrap">
                          {d.periodo}
                        </span>
                      </div>
                    )
                  })}
                  {timelineData.length === 0 && (
                     <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">Sem dados para a visualização</div>
                  )}
                </div>
                <div className="flex items-center justify-center mt-6 text-xs text-slate-500 font-medium">
                   <span className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></span> Visitas Presenciais
                   <span className="w-3 h-3 bg-slate-200 rounded-sm ml-6 mr-2"></span> Outras Tarefas
                </div>
              </div>

              {/* Lead Time */}
              <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                  <span className="w-1.5 h-6 bg-brand-orange rounded-full mr-3"></span>
                  Antecedência (Lead Time)
                </h3>
                <p className="text-xs text-slate-500 mb-6 font-medium">Tempo entre a criação da tarefa no CRM e a data agendada para execução.</p>
                <div className="flex-1 space-y-5">
                  {leadTimeData.map((d, idx) => {
                    const pct = Math.max((d.count / d.max) * 100, 2);
                    return (
                      <div key={idx} className="relative">
                        <div className="flex justify-between text-sm font-semibold mb-1">
                          <span className="text-slate-700">{d.label}</span>
                          <span className="text-slate-900">{d.count}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-brand-orange transition-all duration-700 rounded-full"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* CSS Grid Heatmap */}
            <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm mb-8">
              <h3 className="text-lg font-bold text-slate-800 mb-2 flex items-center">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full mr-3"></span>
                Mapa de Calor: Concentração de Agendamentos (Dias vs Horários)
              </h3>
              <p className="text-sm text-slate-500 mb-6 ml-4">Identifica as faixas de horário com maior volume de interações comerciais.</p>
              
              <div className="overflow-x-auto pb-4">
                <div className="min-w-[600px]">
                  {/* Cabeçalho de Horas */}
                  <div className="flex mb-2 ml-24">
                    {heatmapData.horas.map(h => (
                      <div key={h} className="flex-1 text-center text-[10px] font-bold text-slate-400">
                        {h}:00
                      </div>
                    ))}
                  </div>
                  
                  {/* Linhas de Dias */}
                  <div className="space-y-1">
                    {heatmapData.dias.map(dia => (
                      <div key={dia} className="flex items-center">
                        <div className="w-24 text-xs font-bold text-slate-600 text-right pr-4">{dia}</div>
                        <div className="flex flex-1 space-x-1">
                          {heatmapData.horas.map(hora => {
                            const val = heatmapData.matrix[dia][hora.toString()];
                            // Escala de opacidade 10% a 100%
                            const opacity = val === 0 ? 0 : Math.max(0.1, val / heatmapData.globalMax);
                            
                            return (
                              <div 
                                key={hora} 
                                className="flex-1 aspect-square rounded-md transition-all duration-300 hover:ring-2 hover:ring-emerald-300 relative group flex items-center justify-center cursor-pointer"
                                style={{ backgroundColor: val === 0 ? '#f8fafc' : `rgba(16, 185, 129, ${opacity})` }} // emerald-500
                              >
                                {val > 0 && (
                                  <span className={`text-[10px] font-bold ${opacity > 0.5 ? 'text-white' : 'text-emerald-800'}`}>
                                    {val}
                                  </span>
                                )}
                                {/* Tooltip */}
                                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded-lg pointer-events-none z-10 whitespace-nowrap shadow-xl">
                                  {dia} às {hora}:00<br/>
                                  <span className="font-bold text-emerald-300">{val} Agendamentos</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end mt-4 text-xs font-semibold text-slate-400">
                Menos Volume
                <div className="flex mx-2 h-3 rounded overflow-hidden">
                  <div className="w-4 h-full bg-emerald-500 opacity-10"></div>
                  <div className="w-4 h-full bg-emerald-500 opacity-40"></div>
                  <div className="w-4 h-full bg-emerald-500 opacity-70"></div>
                  <div className="w-4 h-full bg-emerald-500 opacity-100"></div>
                </div>
                Mais Volume
              </div>
            </div>

          </>
        )}
      </div>
    </main>
  );
}
