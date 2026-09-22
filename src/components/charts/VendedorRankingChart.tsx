import React, { useEffect, useState } from 'react';

export function VendedorRankingChart({ data }: { data: any[] }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl flex items-center justify-center">
        <span className="text-slate-500 font-medium tracking-wide">Sem dados suficientes</span>
      </div>
    );
  }

  // Prepara os dados
  const ranking = data.reduce((acc: any, curr: any) => {
    const nome = curr.nome_vendedor || 'Desconhecido';
    if (!acc[nome]) acc[nome] = { nome, total: 0, fechadas: 0 };
    acc[nome].total += 1;
    if (curr.finalizada) acc[nome].fechadas += 1;
    return acc;
  }, {});

  const chartData = Object.keys(ranking)
    .map(key => ({ 
      name: key.split(' ')[0], 
      total: ranking[key].total,
      fechadas: ranking[key].fechadas,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5); // Top 5

  const maxTotal = chartData.length > 0 ? chartData[0].total : 1;

  return (
    <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center">
          <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></span>
          Produtividade por Vendedor
        </h3>
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 bg-gray-100 px-2 py-1 rounded">
          Top 5 (Nativo)
        </span>
      </div>
      
      {/* Custom Bar Chart (CSS Grid) */}
      <div className="h-64 relative flex items-end justify-between px-2 pb-6 border-b border-gray-200">
        
        {/* Y-Axis Grid Lines (Decorative) */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
          {[100, 75, 50, 25, 0].map((step, i) => (
            <div key={i} className="flex items-center w-full">
              <span className="text-[10px] text-slate-400 font-mono w-6">
                {Math.round((maxTotal * step) / 100)}
              </span>
              <div className="flex-1 border-b border-dashed border-gray-200 ml-2"></div>
            </div>
          ))}
        </div>

        {/* Bars */}
        <div className="relative z-10 w-full h-full flex items-end justify-around pl-8">
          {chartData.map((item, idx) => {
            const heightPercent = Math.max((item.total / maxTotal) * 100, 2); // min height 2%
            
            return (
              <div key={idx} className="flex flex-col items-center justify-end group w-full h-full max-w-[40px] relative">
                {/* Tooltip Hover (simulated with peer/group) */}
                <div className="absolute -top-8 bg-slate-800 text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl z-20">
                  {item.total} Realizadas
                </div>
                
                {/* The Bar */}
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-indigo-400 rounded-t-md relative overflow-hidden transition-all duration-1000 ease-out shadow-sm group-hover:shadow-md"
                  style={{ height: isLoaded ? `${heightPercent}%` : '0%' }}
                >
                  {/* Subtle inner highlight */}
                  <div className="absolute inset-0 w-1/2 bg-white/10"></div>
                </div>
                
                {/* Label (Name) */}
                <span className="absolute -bottom-6 text-xs font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center mt-6 space-x-6">
        <div className="flex items-center text-xs text-slate-500 font-semibold">
          <span className="w-3 h-3 rounded bg-gradient-to-t from-blue-500 to-indigo-400 mr-2 shadow-sm"></span>
          Tarefas Realizadas
        </div>
      </div>
    </div>
  );
}
