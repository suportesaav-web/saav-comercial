'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { parseISO, subDays, isAfter } from 'date-fns';

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function InteracoesDiaSemana60Dias({ interacoes }: { interacoes: any[] }) {
  const data = useMemo(() => {
    if (!interacoes) return [];

    const limitDate = subDays(new Date(), 60);
    const valid = interacoes.filter(i => i.raw_datetime && isAfter(parseISO(i.raw_datetime), limitDate));

    const map = new Map<number, number>();
    valid.forEach(i => {
      const d = parseISO(i.raw_datetime);
      const day = d.getDay();
      map.set(day, (map.get(day) || 0) + 1);
    });

    const result = DIAS.map((nome, index) => ({
      dia: nome,
      volume: map.get(index) || 0
    }));

    // Remove domingo e sábado se não houver atividade para melhorar a visualização
    return result.filter((r, idx) => (idx > 0 && idx < 6) || r.volume > 0);
  }, [interacoes]);

  return (
    <div className="w-full h-80 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center">
          <span className="w-1.5 h-6 bg-emerald-500 rounded-full mr-3"></span>
          Por Dia da Semana
        </h3>
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 bg-gray-100 px-2 py-1 rounded">
          Últimos 60 Dias
        </span>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="dia" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
            cursor={{ fill: '#f8fafc' }} 
            itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
          />
          <Bar dataKey="volume" name="Interações" radius={[4, 4, 0, 0]} barSize={40} animationDuration={1500}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.volume > 0 ? '#10b981' : '#e2e8f0'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
