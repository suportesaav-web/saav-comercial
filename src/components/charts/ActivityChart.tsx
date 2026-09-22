import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { InfoPopover } from '@/components/ui/InfoPopover';

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function ActivityChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-80 bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 rounded-2xl flex items-center justify-center">
        <span className="text-slate-500 font-medium tracking-wide">Sem dados suficientes</span>
      </div>
    );
  }

  // Prepara dados: agrupa tarefas por dia da semana
  const initialDays = DIAS_SEMANA.map((dia, idx) => ({ dia, idx, volume: 0 }));
  
  const chartData = data.reduce((acc, curr) => {
    let dayIdx = -1;
    
    // Prioriza raw_datetime (ISO string) e usa UTC para evitar que 00:00 vire 21:00 do dia anterior no Brasil
    if (curr.raw_datetime) {
      dayIdx = new Date(curr.raw_datetime).getUTCDay();
    } else if (curr.data_evento_str && curr.data_evento_str.includes('/')) {
      const [day, month, year] = curr.data_evento_str.split('/');
      // Força meio-dia UTC para evitar problemas de shift
      dayIdx = new Date(`${year}-${month}-${day}T12:00:00Z`).getUTCDay();
    }

    if (dayIdx >= 0 && dayIdx <= 6) {
      acc[dayIdx].volume += 1;
    }
    
    return acc;
  }, initialDays);

  // Remove Domingo e Sábado se estiverem zerados para otimizar espaço
  const filteredData = chartData.filter((d: any) => d.idx > 0 && d.idx < 6 || d.volume > 0);

  return (
    <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center">
          <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-3"></span>
          Mapa de Atividades
          <InfoPopover content="Volume histórico de tarefas distribuído pelos dias da semana. Útil para identificar os dias de maior carga operacional." />
        </h3>
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 bg-gray-100 px-2 py-1 rounded">
          Por Dia da Semana
        </span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="dia" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12 }} 
            />
            <Tooltip
              cursor={{ fill: '#f8fafc', opacity: 0.8 }}
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', color: '#1e293b', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
              labelStyle={{ color: '#64748b', marginBottom: '4px' }}
              formatter={(value: any) => [`${value} tarefas`, 'Volume de Atividade']}
            />
            <Bar dataKey="volume" radius={[6, 6, 0, 0]} barSize={40} animationDuration={1500}>
               {filteredData.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.volume > 0 ? '#3b82f6' : '#e2e8f0'} fillOpacity={entry.volume > 0 ? 0.9 : 0.6} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
