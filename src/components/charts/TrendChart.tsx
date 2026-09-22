'use client'

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { InfoPopover } from '@/components/ui/InfoPopover';

interface TrendChartProps {
  data: any[];
}

export function TrendChart({ data }: TrendChartProps) {
  return (
    <div className="w-full h-80 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center">
          <span className="w-1.5 h-6 bg-brand-orange rounded-full mr-3"></span>
          Tendência de Atividades
          <InfoPopover content="Volume diário de tarefas realizadas ao longo dos últimos 15 dias, segmentado entre Atendimentos gerais e Reuniões." />
        </h3>
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 bg-gray-100 px-2 py-1 rounded">
          Últimos 15 Dias Ativos
        </span>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorAtend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F37021" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#F37021" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorReuniao" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#DA291C" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#DA291C" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="data" 
            stroke="#64748b" 
            tick={{ fill: '#64748b', fontSize: 10 }} 
            tickFormatter={(val) => val ? val.substring(0, 5) : ''}
            minTickGap={15}
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#64748b" 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            tickLine={false} 
            axisLine={false} 
          />
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              borderColor: '#e2e8f0',
              borderRadius: '12px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
            }} 
            itemStyle={{ fontWeight: 'bold' }}
            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
          />
          <Area type="monotone" dataKey="atendimentos" name="Atendimentos" stackId="1" stroke="#F37021" strokeWidth={3} fillOpacity={1} fill="url(#colorAtend)" />
          <Area type="monotone" dataKey="reunioes" name="Reuniões" stackId="1" stroke="#DA291C" strokeWidth={3} fillOpacity={1} fill="url(#colorReuniao)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
