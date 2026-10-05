'use client';

import React from 'react';
import { useCommercialData } from '@/hooks/useCommercialData';
import { AuditoriaTable } from '@/components/tables/AuditoriaTable';

export default function AuditoriaPage() {
  const { tarefasFiltradas, interacoes, loading } = useCommercialData();

  return (
    <main className="min-h-screen p-8 md:p-16 bg-slate-50 text-slate-800 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <header className="mb-8 shrink-0">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
            Auditoria
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Investigação em profundidade das atividades e anotações.
          </p>
        </header>

        <div className="flex-1 min-h-[600px] mb-8">
           {loading ? (
             <div className="h-full bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-center text-slate-500">
               Carregando banco de dados operacional...
             </div>
           ) : (
             <AuditoriaTable tarefas={tarefasFiltradas} interacoes={interacoes} />
           )}
        </div>
      </div>
    </main>
  );
}
