'use client';

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, subDays, isAfter } from 'date-fns';

export function InteracoesChart30Dias({ interacoes }: { interacoes: any[] }) {
  const data = useMemo(() => {
    if (!interacoes) return [];
    
    const limitDate = subDays(new Date(), 30);
    const valid = interacoes.filter(i => i.raw_datetime && isAfter(parseISO(i.raw_datetime), limitDate));

    const map = new Map<string, number>();
    valid.forEach(i => {
      const d = parseISO(i.raw_datetime);
      const key = format(d, 'dd/MM');
      map.set(key, (map.get(key) || 0) + 1);
    });

    const result = [];
    for(let i=29; i>=0; i--) {
       const d = subDays(new Date(), i);
       const key = format(d, 'dd/MM');
       result.push({ data: key, interacoes: map.get(key) || 0 });
    }
    return result;
  }, [interacoes]);

  return (
    <div className="w-full h-80 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center">
          <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></span>
          Últimos 30 Dias
        </h3>
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 bg-gray-100 px-2 py-1 rounded">
          Volume
        </span>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="data" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#64748b' }} minTickGap={15} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
            itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }} 
          />
          <Area type="monotone" dataKey="interacoes" name="Interações" stroke="#3b82f6" fill="#bfdbfe" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
