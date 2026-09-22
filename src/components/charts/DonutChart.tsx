'use client'

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { InfoPopover } from '@/components/ui/InfoPopover';

const COLORS = ['#F37021', '#DA291C', '#25282B', '#fbbf24'];

interface DonutChartProps {
  data: any[];
}

export function DonutChart({ data }: DonutChartProps) {
  return (
    <div className="w-full h-80 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center">
          <span className="w-1.5 h-6 bg-red-600 rounded-full mr-3"></span>
          Tipos de Atendimento
          <InfoPopover content="Proporção de tarefas categorizadas pelo tipo de canal (Visita, WhatsApp, E-mail, etc)." />
        </h3>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="45%"
              cy="50%"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
              cornerRadius={6}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b' }}
              itemStyle={{ fontWeight: 'bold' }}
            />
            <Legend 
              verticalAlign="middle" 
              align="right" 
              layout="vertical"
              iconType="circle"
              wrapperStyle={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
