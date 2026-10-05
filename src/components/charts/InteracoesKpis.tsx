'use client';
import React, { useMemo } from 'react';
import Link from 'next/link';

export function InteracoesKpis({ interacoes, loading }: { interacoes: any[], loading: boolean }) {
  const kpis = useMemo(() => {
    const total = interacoes.length;
    const duracaoTotal = interacoes.reduce((acc, i) => acc + (i.duracao_segundos || 0), 0);
    const mediaSegundos = total > 0 ? duracaoTotal / total : 0;
    const minutos = Math.floor(mediaSegundos / 60);
    
    const validadas = interacoes.filter(i => i.checkin_validado).length;
    const taxaValidacao = total > 0 ? (validadas / total) * 100 : 0;

    return { total, minutos, taxaValidacao };
  }, [interacoes]);

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Link href="/auditoria" className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group block">
        <div className="flex justify-between items-start">
          <h3 className="text-sm text-slate-500 font-bold mb-1 group-hover:text-slate-800 transition-colors">Total de Interações</h3>
          <span className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
        </div>
        <p className="text-3xl font-black text-slate-800">{loading ? '--' : kpis.total}</p>
        <p className="text-xs text-slate-400 mt-2">Volume registrado no período</p>
      </Link>
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-sm text-slate-500 font-bold mb-1">Duração Média</h3>
        <p className="text-3xl font-black text-blue-600">{loading ? '--' : `${kpis.minutos} min`}</p>
        <p className="text-xs text-slate-400 mt-2">Tempo médio por interação</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-sm text-slate-500 font-bold mb-1">Check-Ins Validados</h3>
        <p className="text-3xl font-black text-emerald-600">{loading ? '--' : `${kpis.taxaValidacao.toFixed(1)}%`}</p>
        <p className="text-xs text-slate-400 mt-2">Taxa de geolocalização comprovada</p>
      </div>
    </section>
  );
}
