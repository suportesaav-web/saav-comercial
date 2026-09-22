'use client'

import React from 'react';
import { InfoPopover } from '@/components/ui/InfoPopover';

interface RankingTableProps {
  data: any[];
  onClientClick?: (cliente: string) => void;
}

export function RankingTable({ data, onClientClick }: RankingTableProps) {
  return (
    <div className="w-full bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
        <span className="w-1.5 h-6 bg-brand-orange rounded-full mr-3"></span>
        Top 5 Clientes (Qtd. de Tarefas)
        <InfoPopover content="As 5 empresas/pessoas que mais demandaram esforço da equipe no período. Clique em um cliente para ver o detalhamento." />
      </h3>
      
      <div className="space-y-4">
        {data.map((item, index) => {
          const percent = (item.volume / item.max) * 100;
          return (
            <div 
              key={item.id} 
              onClick={() => onClientClick && onClientClick(item.cliente)}
              className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex-1 pr-4">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-brand-orange transition-colors">
                    {item.cliente}
                  </span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900">{item.volume}</span>
                    <span className="text-xs text-slate-500 ml-1">tarefas</span>
                    
                    {item.negocios > 0 && (
                      <span className="ml-3 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                        {item.negocios} negócio{item.negocios > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-brand-orange to-brand-red rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(item.volume / item.max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
