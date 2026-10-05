'use client';

import React, { useMemo } from 'react';
import { useCommercialData } from '@/hooks/useCommercialData';
import { InteracoesChart30Dias } from '@/components/charts/InteracoesChart30Dias';
import { InteracoesDiaSemana60Dias } from '@/components/charts/InteracoesDiaSemana60Dias';
import { InteracoesKpis } from '@/components/charts/InteracoesKpis';

export default function InteracoesPage() {
  const { interacoesFiltradas, loading } = useCommercialData();

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 min-h-screen">
      <header className="mb-8">
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
          Interações
        </h2>
        <p className="text-slate-500 font-medium text-sm md:text-base mt-1">
          Monitoramento e análise do registro de interações com clientes.
        </p>
      </header>

      {/* 3 KPIs */}
      <InteracoesKpis interacoes={interacoesFiltradas} loading={loading} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        {/* Interações nos últimos 30 dias */}
        <InteracoesChart30Dias interacoes={interacoesFiltradas} />

        {/* Por dia da semana - últimos 60 dias */}
        <InteracoesDiaSemana60Dias interacoes={interacoesFiltradas} />
      </div>

    </main>
  );
}
