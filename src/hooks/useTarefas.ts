import useSWR from 'swr';
import { useFilterStore } from '@/store/useFilterStore';
import { useMemo } from 'react';
import { Tarefa, Usuario } from '@/types/tarefa';
import { Interacao } from '@/types/interacao';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTarefas() {
  const { data: tarefas = [], error: errorTarefas, isLoading: isLoadingTarefas } = useSWR<Tarefa[]>('/api/tarefas', fetcher);
  const { data: usuarios = [], error: errorUsuarios, isLoading: isLoadingUsuarios } = useSWR<Usuario[]>('/api/usuarios', fetcher);
  const { data: interacoes = [], error: errorInteracoes, isLoading: isLoadingInteracoes } = useSWR<Interacao[]>('/api/interacoes', fetcher);

  const { 
    startDate, 
    endDate, 
    vendedores, 
    clientes, 
    tiposTarefa, 
    status,
    funis,
    hideInternalTasks 
  } = useFilterStore();

  const loading = isLoadingTarefas || isLoadingUsuarios || isLoadingInteracoes;
  const error = errorTarefas || errorUsuarios || errorInteracoes;

  const tarefasFiltradas = useMemo(() => {
    return tarefas.filter((t) => {
      // Regra de Negócio: Falso Positivo (Tarefas Internas)
      if (hideInternalTasks && t.nome_cliente && t.nome_cliente.toUpperCase().includes('SAAVEDRA')) {
        return false;
      }

      // Filtro de Data
      if (startDate || endDate) {
        const dateStr = t.data_evento_str || t.DateTime || t.CreateDate;
        if (dateStr) {
          let taskDate: Date;
          if (dateStr.includes('/')) {
            const [d, m, y] = dateStr.split('/');
            taskDate = new Date(`${y}-${m}-${d}`);
          } else {
            taskDate = new Date(dateStr);
          }
          if (startDate && taskDate < startDate) return false;
          if (endDate && taskDate > endDate) return false;
        }
      }
      if (status.length > 0) {
        const statusLabels = status.map(s => s.label);
        if (!statusLabels.includes(t.status_operacional)) return false;
      }
      if (clientes.length > 0) {
        const clientesLabels = clientes.map(c => c.label);
        if (!clientesLabels.includes(t.nome_cliente)) return false;
      }
      if (vendedores && vendedores.length > 0) {
        const vendedoresLabels = vendedores.map(v => v.label);
        if (!vendedoresLabels.includes(t.nome_vendedor)) return false;
      }
      if (tiposTarefa.length > 0) {
        const tiposLabels = tiposTarefa.map(t => t.label);
        if (!tiposLabels.includes(t.tipo_tarefa)) return false;
      }
      if (funis.length > 0) {
        const funisLabels = funis.map(f => f.label);
        if (t.funil && !funisLabels.includes(t.funil)) return false;
      }
      return true;
    });
  }, [tarefas, status, clientes, vendedores, startDate, endDate, tiposTarefa, funis, hideInternalTasks]);

  // KPIs Avançados
  const totalTarefas = tarefasFiltradas.length;
  const tarefasFechadas = tarefasFiltradas.filter((t) => t.finalizada).length;
  const tarefasAtrasadas = tarefasFiltradas.filter((t) => !t.finalizada && t.raw_datetime && new Date(t.raw_datetime) < new Date()).length;
  
  const tarefasFechadasComInteracao = new Set(interacoes.filter(i => i.task_id).map(i => i.task_id));
  const tarefasFechadasSemInteracao = tarefasFiltradas.filter((t) => t.finalizada && t.id && !tarefasFechadasComInteracao.has(t.id as number)).length;

  let diasPeriodo = 30;
  if (startDate && endDate) {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    diasPeriodo = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  }
  const mediaDiaria = (totalTarefas / diasPeriodo).toFixed(1);

  const visitasPresenciais = tarefasFiltradas.filter((t) => t.tipo_tarefa.toLowerCase().includes('visita')).length;
  const clientesAtendidos = new Set(tarefasFiltradas.filter((t) => t.nome_cliente && t.nome_cliente !== 'Sem Contato').map((t) => t.nome_cliente)).size;
  const negociosTrabalhados = new Set(tarefasFiltradas.filter((t) => t.deal_id).map((t) => t.deal_id)).size;
  const horasAtendimento = tarefasFiltradas.reduce((acc: number, t) => acc + (t.horas || 0), 0) / 60;
  const tarefasComContato = tarefasFiltradas.filter((t) => t.contact_id).length;
  const conformidadeContatos = totalTarefas > 0 ? Math.round((tarefasComContato / totalTarefas) * 100) : 100;
  const googleSyncCount = tarefasFiltradas.filter((t) => t.google_sync).length;
  const googleSyncRate = totalTarefas > 0 ? Math.round((googleSyncCount / totalTarefas) * 100) : 0;

  // KPIs para os Gráficos
  const trendData = useMemo(() => {
    const groups: Record<string, any> = {};
    tarefasFiltradas.forEach((t) => {
      const dateStr = t.data_evento_str;
      if (!dateStr || dateStr === 'Data não definida') return;
      if (!groups[dateStr]) groups[dateStr] = { data: dateStr, atendimentos: 0, reunioes: 0 };
      if (t.tipo_tarefa.toLowerCase().includes('reunião')) groups[dateStr].reunioes += 1;
      else groups[dateStr].atendimentos += 1;
    });
    return Object.values(groups).sort((a: any, b: any) => {
      const [da, ma, ya] = a.data.split('/');
      const [db, mb, yb] = b.data.split('/');
      return new Date(`${ya}-${ma}-${da}`).getTime() - new Date(`${yb}-${mb}-${db}`).getTime();
    }).slice(-15);
  }, [tarefasFiltradas]);

  const donutData = useMemo(() => {
    const counts: Record<string, number> = {};
    tarefasFiltradas.forEach((t) => {
      counts[t.tipo_tarefa] = (counts[t.tipo_tarefa] || 0) + 1;
    });
    return Object.keys(counts).map(k => ({ name: k, value: counts[k] }));
  }, [tarefasFiltradas]);

  const rankingData = useMemo(() => {
    const clients: Record<string, { volume: number, deals: Set<number> }> = {};
    
    tarefasFiltradas.forEach((t) => {
      const c = t.nome_cliente || 'Desconhecido';
      if (c !== 'Sem Contato') {
        if (!clients[c]) clients[c] = { volume: 0, deals: new Set() };
        clients[c].volume += 1;
        if (t.deal_id) clients[c].deals.add(t.deal_id);
      }
    });

    const sorted = Object.keys(clients)
      .map(k => ({ 
        cliente: k, 
        volume: clients[k].volume,
        negocios: clients[k].deals.size 
      }))
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 5);
      
    const max = sorted.length > 0 ? sorted[0].volume : 1;
    return sorted.map((s, idx) => ({ id: idx, cliente: s.cliente, volume: s.volume, negocios: s.negocios, max }));
  }, [tarefasFiltradas]);

  // KPIs de Planejamento (Fantasmas vs Planejadas)
  const tarefasPlanejadas = tarefasFiltradas.filter(t => {
    if (!t.CreateDate || !t.raw_datetime) return true; // Se não tem data de criação ou execução, considera normal
    const createDate = new Date(t.CreateDate).toLocaleDateString('pt-BR');
    const executeDate = new Date(t.raw_datetime).toLocaleDateString('pt-BR');
    return createDate !== executeDate && new Date(t.CreateDate) < new Date(t.raw_datetime);
  }).length;
  
  const tarefasFantasmas = totalTarefas - tarefasPlanejadas;

  return {
    tarefas,
    usuarios,
    interacoes,
    tarefasFiltradas,
    loading,
    error,
    kpis: {
      totalTarefas,
      tarefasFechadas,
      tarefasAtrasadas,
      tarefasFechadasSemInteracao,
      tarefasPlanejadas,
      tarefasFantasmas,
      mediaDiaria,
      visitasPresenciais,
      clientesAtendidos,
      negociosTrabalhados,
      horasAtendimento,
      conformidadeContatos,
      googleSyncRate
    },
    chartsData: {
      trendData,
      donutData,
      rankingData
    }
  };
}
