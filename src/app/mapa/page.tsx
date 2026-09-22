'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useTarefas } from '@/hooks/useTarefas';
import { InfoPopover } from '@/components/ui/InfoPopover';

// O mapa precisa ser renderizado no lado do cliente (CSR) por causa do 'window' do Leaflet
const MapComponent = dynamic(
  () => import('@/components/map/MapComponent'),
  { ssr: false, loading: () => (
    <div className="h-[600px] w-full rounded-2xl bg-gray-100 animate-pulse flex items-center justify-center border border-gray-200">
      <div className="text-slate-400 flex flex-col items-center">
        <span className="text-4xl mb-3">🗺️</span>
        <span className="font-bold tracking-widest uppercase text-xs">Carregando Mapa...</span>
      </div>
    </div>
  )}
);

export default function MapaPage() {
  const { interacoes, tarefasFiltradas, loading } = useTarefas();

  // Filtra as interações para exibir apenas as vinculadas às tarefas que passaram no filtro global
  const interacoesFiltradas = useMemo(() => {
    const tarefasIds = new Set(tarefasFiltradas.map((t: any) => t.id));
    return interacoes.filter((i: any) => i.task_id && tarefasIds.has(i.task_id));
  }, [interacoes, tarefasFiltradas]);

  // Quantidade de checkins na tela
  const checkinsValidos = useMemo(() => {
    return interacoesFiltradas.filter((i: any) => i.checkin_lat && i.checkin_lng).length;
  }, [interacoesFiltradas]);

  return (
    <main className="min-h-screen p-8 md:p-12 bg-gray-50 text-slate-800">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2 flex items-center">
              <span className="mr-3">📍</span> Mapa de Check-ins (GPS)
            </h1>
            <div className="text-slate-500 font-medium text-lg flex items-center">
              Geolocalização das visitas validadas no aplicativo Mobile.
              <span className="ml-2 inline-block">
                <InfoPopover content="Este mapa exibe os locais exatos onde os vendedores realizaram o Check-in/Check-out via aplicativo Ploomes." />
              </span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-200 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Mapeado</p>
              <p className="text-2xl font-black text-brand-orange">{checkinsValidos} Visitas</p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
          </div>
        ) : (
          <div className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100">
            <MapComponent interacoes={interacoesFiltradas} tarefas={tarefasFiltradas} />
          </div>
        )}
      </div>
    </main>
  );
}
