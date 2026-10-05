'use client';

import React, { Suspense } from 'react';
import { useCommercialData } from '@/hooks/useCommercialData';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { NegociosTable } from '@/components/tables/NegociosTable';

function NegociosPageContent() {
  const { dealsFiltrados, loading } = useCommercialData();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  
  let headerTotal = dealsFiltrados?.length || 0;
  
  if (dealsFiltrados && searchQuery) {
    const lower = searchQuery.toLowerCase();
    headerTotal = dealsFiltrados.filter(item => 
      (item.title || '').toLowerCase().includes(lower) ||
      (item.contactName || '').toLowerCase().includes(lower) ||
      (item.ownerName || '').toLowerCase().includes(lower) ||
      (item.stageName || '').toLowerCase().includes(lower) ||
      (item.pipelineName || '').toLowerCase().includes(lower)
    ).length;
  }

  return (
    <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
      {/* Cabeçalho da Página e Botões de Navegação */}
      <header className="mb-8 shrink-0 flex items-center justify-between">
        <div>
           <button onClick={() => router.back()} className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 mb-2 transition-colors">
             <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para tela anterior
           </button>
           <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
             Base de Negócios
           </h1>
           <p className="text-slate-500 font-medium text-lg">
             Inspeção de oportunidades ativas e resolvidas
           </p>
        </div>
        
        {/* Métricas rápidas de cabeçalho */}
        <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-gray-200">
           <span className="text-sm font-bold text-slate-500 mr-2">Total no Filtro:</span>
           <span className="text-2xl font-black text-slate-800">{loading ? '--' : headerTotal}</span>
        </div>
      </header>

      {/* Container Principal do Componente Tabela */}
      <div className="flex-1 min-h-[600px] mb-8 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">
         <NegociosTable deals={dealsFiltrados} loading={loading} />
      </div>
    </div>
  );
}

export default function NegociosPage() {
  return (
    <main className="min-h-screen p-8 md:p-16 bg-slate-50 text-slate-800 flex flex-col">
       <Suspense fallback={<div className="p-8 text-center text-slate-500">Carregando tela...</div>}>
         <NegociosPageContent />
       </Suspense>
    </main>
  );
}
