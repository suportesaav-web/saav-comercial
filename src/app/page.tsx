'use client';

import React from 'react';
import Link from 'next/link';
import { useCommercialData } from '@/hooks/useCommercialData';
import { WeeklyTasksChart } from '@/components/charts/WeeklyTasksChart';
import { TopClientsBarChart } from '@/components/charts/TopClientsBarChart';

export default function CockpitComercialPage() {
  const { kpis, loading, tarefasFiltradas } = useCommercialData();

  return (
    <main className="min-h-screen p-8 md:p-16 font-sans selection:bg-blue-100 bg-slate-50 text-slate-800">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
            Visão Geral
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Visão Geral de Pessoas, Atividades e Negócios
          </p>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/negocios" className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group block">
             <div className="flex justify-between items-start">
               <h3 className="text-sm text-slate-500 font-bold mb-1 group-hover:text-blue-600 transition-colors">Total de Negócios</h3>
               <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
             </div>
             <p className="text-3xl font-black text-slate-800">{loading ? '--' : kpis.totalOportunidades}</p>
          </Link>
          <Link href="/tarefas" className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group block">
             <div className="flex justify-between items-start">
               <h3 className="text-sm text-slate-500 font-bold mb-1 group-hover:text-indigo-600 transition-colors">Tarefas</h3>
               <span className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
             </div>
             <p className="text-3xl font-black text-slate-800">{loading ? '--' : kpis.atividades}</p>
          </Link>
          <Link href="/tarefas?filter=abertas" className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group block">
             <div className="flex justify-between items-start">
               <h3 className="text-sm text-slate-500 font-bold mb-1 group-hover:text-amber-600 transition-colors">Tarefas em Aberto</h3>
               <span className="text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
             </div>
             <p className="text-3xl font-black text-amber-600">{loading ? '--' : kpis.tarefasAbertas}</p>
          </Link>
          <Link href="/tarefas?filter=atrasadas" className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-red-300 transition-all cursor-pointer group block">
             <div className="flex justify-between items-start">
               <h3 className="text-sm text-slate-500 font-bold mb-1 group-hover:text-red-600 transition-colors">Tarefas Atrasadas</h3>
               <span className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
             </div>
             <p className="text-3xl font-black text-red-600">{loading ? '--' : kpis.tarefasAtrasadas}</p>
          </Link>
        </section>

        {/* Informative Area */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <WeeklyTasksChart tarefas={tarefasFiltradas} />
          <TopClientsBarChart tarefas={tarefasFiltradas} />
        </div>

      </div>
    </main>
  );
}
