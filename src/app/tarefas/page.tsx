'use client';

import React, { Suspense } from 'react';
import { useCommercialData } from '@/hooks/useCommercialData';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { TarefasTable } from '@/components/tables/TarefasTable';

/**
 * Rota: /tarefas
 * 
 * Página de visualização detalhada da base de Tarefas e Atividades.
 * Atua como página "container" que busca os dados globais do store e repassa 
 * para os componentes puros.
 */
function TarefasPageContent() {
  const { tarefasFiltradas, loading } = useCommercialData();
  const searchParams = useSearchParams();
  const router = useRouter();
  const filterType = searchParams.get('filter'); // 'abertas' | 'atrasadas' | null
  const searchQuery = searchParams.get('search'); // query de busca opcional
  
  let pageTitle = "Base de Tarefas";
  if (filterType === 'abertas') pageTitle = "Tarefas em Aberto";
  if (filterType === 'atrasadas') pageTitle = "Tarefas Atrasadas";

  // Re-calculamos o total apenas visualmente pro header bater com a tabela
  let headerTotal = tarefasFiltradas?.length || 0;
  if (tarefasFiltradas) {
    let base = tarefasFiltradas;
    if (filterType === 'abertas') {
      base = base.filter(t => !t.finalizada);
    } else if (filterType === 'atrasadas') {
      const hoje = new Date();
      hoje.setHours(0,0,0,0);
      base = base.filter(t => !t.finalizada && new Date(t.raw_datetime) < hoje);
    }

    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      base = base.filter(item => 
        (item.titulo || '').toLowerCase().includes(lower) ||
        (item.nome_cliente || '').toLowerCase().includes(lower) ||
        (item.nome_vendedor || '').toLowerCase().includes(lower) ||
        (item.tipo_tarefa || '').toLowerCase().includes(lower) ||
        (item.titulo_negocio || '').toLowerCase().includes(lower)
      );
    }
    
    headerTotal = base.length;
  }

  return (
    <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
      <header className="mb-8 shrink-0 flex items-center justify-between">
        <div>
           <button onClick={() => router.back()} className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 mb-2 transition-colors">
             <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para tela anterior
           </button>
           <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
             {pageTitle}
           </h1>
           <p className="text-slate-500 font-medium text-lg">
             Inspeção de atividades, visitas e agendamentos operacionais
           </p>
        </div>
        
        <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-200">
           <span className="text-sm font-bold text-slate-500 mr-2">Total no Filtro:</span>
           <span className="text-2xl font-black text-slate-800">{loading ? '--' : headerTotal}</span>
        </div>
      </header>

      <div className="flex-1 min-h-[600px] mb-8 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">
         <TarefasTable tarefas={tarefasFiltradas} loading={loading} />
      </div>
    </div>
  );
}

export default function TarefasPage() {
  return (
    <main className="min-h-screen p-8 md:p-16 bg-slate-50 text-slate-800 flex flex-col">
       <Suspense fallback={<div className="p-8 text-center text-slate-500">Carregando tela...</div>}>
         <TarefasPageContent />
       </Suspense>
    </main>
  );
}
