'use client';

import React, { useMemo } from 'react';
import { parseISO } from 'date-fns';
import { InfoPopover } from '@/components/ui/InfoPopover';

interface HeatmapChartProps {
  tarefas: any[];
  loading?: boolean;
}

const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
// Horários comerciais: das 07:00 às 19:00
const HORAS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

export function HeatmapChart({ tarefas, loading }: HeatmapChartProps) {
  const { matrix, maxVal } = useMemo(() => {
    // init matrix: 5 dias x 13 horas
    const m = Array(5).fill(0).map(() => Array(13).fill(0));
    let max = 0;

    if (!tarefas || tarefas.length === 0) return { matrix: m, maxVal: 0 };

    tarefas.forEach(t => {
      if (t.raw_datetime) {
        const d = parseISO(t.raw_datetime);
        const day = d.getDay(); // 0=Dom, 1=Seg...
        const hour = d.getHours();

        // Limita a seg-sex (1 a 5) e das 7h as 19h
        if (day >= 1 && day <= 5) {
          const rowIdx = day - 1;
          const colIdx = hour - 7;
          
          if (colIdx >= 0 && colIdx < 13) {
            m[rowIdx][colIdx] += 1;
            if (m[rowIdx][colIdx] > max) {
              max = m[rowIdx][colIdx];
            }
          }
        }
      }
    });

    return { matrix: m, maxVal: max };
  }, [tarefas]);

  if (loading) return <div className="h-96 flex items-center justify-center text-slate-500">Carregando...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center">
          <span className="w-1.5 h-6 bg-rose-500 rounded-full mr-3"></span>
          Heatmap de Engajamento Operacional
          <InfoPopover content="Mapa de calor mostrando a concentração de tarefas por dia da semana e horário do dia. Quanto mais escura a cor, maior o volume de atividades." />
        </h3>
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 bg-gray-100 px-2 py-1 rounded">
          Horário Comercial
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px] pt-14 pb-6 px-2">
          {/* Header das horas */}
          <div className="flex ml-20 mb-2">
            {HORAS.map(h => (
              <div key={h} className="flex-1 text-center text-xs font-semibold text-slate-400">
                {String(h).padStart(2, '0')}h
              </div>
            ))}
          </div>

          {/* Linhas dos dias */}
          {DIAS.map((dia, rowIdx) => (
            <div key={dia} className="flex items-center mb-2">
              <div className="w-20 text-sm font-semibold text-slate-500 text-right pr-4">
                {dia}
              </div>
              <div className="flex flex-1 gap-1">
                {HORAS.map((h, colIdx) => {
                  const val = matrix[rowIdx][colIdx];
                  // Calculate opacity based on max (at least 0.05 to show the square, max 1.0)
                  const opacity = maxVal > 0 ? (val / maxVal) : 0;
                  const alpha = val === 0 ? 0.05 : Math.max(0.15, opacity);
                  
                  return (
                    <div 
                      key={`${dia}-${h}`}
                      className="flex-1 aspect-square rounded-md flex items-center justify-center transition-all hover:scale-105 cursor-pointer group relative"
                      style={{ backgroundColor: `rgba(244, 63, 94, ${alpha})` }} // rose-500
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50 w-max">
                        <div className="bg-slate-800 text-white text-xs py-1 px-3 rounded shadow-xl font-medium text-center">
                          {dia} às {h}h<br/>
                          <span className="text-rose-400 font-bold">{val} tarefas</span>
                        </div>
                        <div className="w-2 h-2 bg-slate-800 rotate-45 -mt-1"></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Legenda */}
          <div className="flex items-center justify-end mt-6 mr-4 gap-2 text-xs text-slate-500 font-medium">
            <span>Menor Volume</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: `rgba(244, 63, 94, 0.05)` }}></div>
              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: `rgba(244, 63, 94, 0.4)` }}></div>
              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: `rgba(244, 63, 94, 0.7)` }}></div>
              <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: `rgba(244, 63, 94, 1.0)` }}></div>
            </div>
            <span>Maior Pico ({maxVal} tarefas)</span>
          </div>

        </div>
      </div>
    </div>
  );
}
