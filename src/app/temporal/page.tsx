'use client';

import React from 'react';
import { useCommercialData } from '@/hooks/useCommercialData';
import { HeatmapChart } from '@/components/charts/HeatmapChart';

export default function TemporalPage() {
  const { tarefasFiltradas, loading } = useCommercialData();

  return (
    <main className="min-h-screen p-8 md:p-16 bg-slate-50 text-slate-800">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
            Análise Temporal
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Sazonalidade, Rotinas e Horários de Pico da Força de Vendas
          </p>
        </header>

        <div className="mb-8">
           <HeatmapChart tarefas={tarefasFiltradas} loading={loading} />
        </div>

      </div>
    </main>
  );
}
