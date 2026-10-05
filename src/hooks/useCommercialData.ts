import { useState, useEffect, useMemo } from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import { Tarefa } from '@/types/tarefa';
import { Interacao } from '@/types/interacao';
import { Deal } from '@/types/deal';
import { Contact } from '@/types/contact';

export function useCommercialData() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [interacoes, setInteracoes] = useState<Interacao[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros Globais
  const {
    startDate,
    endDate,
    vendedores,
    clientes,
    tiposTarefa,
    status, // Task Status
    funis,
    hideInternalTasks,
    onlyInternalTasks
  } = useFilterStore();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [tRes, iRes, dRes, cRes] = await Promise.all([
          fetch('/api/tarefas'),
          fetch('/api/interacoes'),
          fetch('/api/deals').catch(() => ({ ok: false, json: () => Promise.resolve([]) as Promise<Deal[]> })),
          fetch('/api/contacts').catch(() => ({ ok: false, json: () => Promise.resolve([]) as Promise<Contact[]> }))
        ]);

        if (tRes.ok) setTarefas(await tRes.json());
        if (iRes.ok) setInteracoes(await iRes.json());
        if (dRes.ok) setDeals(await (dRes as Response).json());
        if (cRes.ok) setContacts(await (cRes as Response).json());
      } catch (error) {
        console.error("Erro ao carregar base comercial:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // --- DERIVAÇÃO DE DATASETS ---
  
  const tarefasFiltradas = useMemo(() => {
    return tarefas.filter(t => {
      // Data
      if (startDate && endDate) {
        const d = new Date(t.raw_datetime);
        const s = new Date(startDate);
        const e = new Date(endDate);
        s.setHours(0,0,0,0); e.setHours(23,59,59,999);
        if (d < s || d > e) return false;
      }
      
      // Vendedor
      if (vendedores.length > 0) {
        if (!vendedores.some(v => v.value === t.nome_vendedor)) return false;
      }
      
      // Cliente
      if (clientes.length > 0) {
        if (!clientes.some(c => c.value === t.nome_cliente)) return false;
      }
      
      // Tipo Tarefa
      if (tiposTarefa.length > 0) {
        if (!tiposTarefa.some(ti => ti.value === t.tipo_tarefa)) return false;
      }
      
      // Funil
      if (funis.length > 0) {
        if (!funis.some(f => f.value === t.funil)) return false;
      }

      // Status
      if (status.length > 0) {
        if (!status.some(st => st.value === t.status_operacional)) return false;
      }

      // Hide internal
      const isInternal = t.nome_cliente && t.nome_cliente.toUpperCase().includes('SAAVEDRA');
      if (hideInternalTasks && isInternal) return false;
      if (onlyInternalTasks && !isInternal) return false;

      return true;
    });
  }, [tarefas, startDate, endDate, vendedores, clientes, tiposTarefa, funis, status, hideInternalTasks, onlyInternalTasks]);

  const interacoesFiltradas = useMemo(() => {
    // Interações dependem de tarefas (apenas filtramos as que estão vinculadas a tarefas filtradas, ou filtramos por periodo)
    // Para simplificar: interações do mesmo período
    return interacoes.filter(int => {
      if (startDate && endDate) {
        const d = new Date(int.raw_datetime);
        const s = new Date(startDate);
        const e = new Date(endDate);
        s.setHours(0,0,0,0); e.setHours(23,59,59,999);
        if (d < s || d > e) return false;
      }
      if (vendedores.length > 0 && !vendedores.some(v => v.value === int.nome_vendedor)) return false;
      return true;
    });
  }, [interacoes, startDate, endDate, vendedores]);

  const dealsFiltrados = useMemo(() => {
    return deals.filter(deal => {
      // Período: Vamos usar a data de criação OU a data de fechamento, dependendo se está ganho ou aberto.
      // Se tiver data de fechamento e estiver no status ganho (2), usamos finishDate.
      // Caso contrário, createDate.
      const baseDateStr = (deal.statusId === 2 && deal.finishDate) ? deal.finishDate : deal.createDate;
      
      if (startDate && endDate && baseDateStr) {
        const d = new Date(baseDateStr);
        const s = new Date(startDate);
        const e = new Date(endDate);
        s.setHours(0,0,0,0); e.setHours(23,59,59,999);
        if (d < s || d > e) return false;
      }
      
      // Vendedor
      if (vendedores.length > 0) {
        if (!vendedores.some(v => v.value === deal.ownerName)) return false;
      }
      
      // Cliente
      if (clientes.length > 0) {
        if (!clientes.some(c => c.value === deal.contactName)) return false;
      }
      
      // Funil
      if (funis.length > 0) {
        if (!funis.some(f => f.value === deal.pipelineName)) return false;
      }

      // Status (ATENÇÃO: Não aplicamos o status da Task aqui, pois é diferente!)
      // O filtro "status" do useFilterStore é focado em Tarefas ('Em Aberto', 'Fechada').

      return true;
    });
  }, [deals, startDate, endDate, vendedores, clientes, funis]);

  // Contatos globais não são filtrados por período
  const contatosFiltrados = useMemo(() => contacts, [contacts]);

  // --- KPIs ---
  const totalOportunidades = dealsFiltrados.length;
  const negociosAbertos = dealsFiltrados.filter(d => d.statusId === 1);
  const negociosGanhos = dealsFiltrados.filter(d => d.statusId === 2);
  const negociosPerdidos = dealsFiltrados.filter(d => d.statusId === 3);

  const valorPipeline = negociosAbertos.reduce((acc, d) => acc + (d.amount || 0), 0);
  const valorGanhos = negociosGanhos.reduce((acc, d) => acc + (d.amount || 0), 0);
  
  const totalResolvidos = negociosGanhos.length + negociosPerdidos.length;
  const taxaConversao = totalResolvidos > 0 ? (negociosGanhos.length / totalResolvidos) * 100 : 0;
  
  const ticketMedio = negociosGanhos.length > 0 ? valorGanhos / negociosGanhos.length : 0;

  // KPIs de Atividade
  const atividades = tarefasFiltradas.length;
  const tarefasAbertas = tarefasFiltradas.filter(t => !t.finalizada).length;
  
  const hoje = new Date();
  hoje.setHours(0,0,0,0);
  const tarefasAtrasadas = tarefasFiltradas.filter(t => !t.finalizada && new Date(t.raw_datetime) < hoje).length;

  return {
    tarefas,
    interacoes,
    deals,
    contacts,
    
    tarefasFiltradas,
    interacoesFiltradas,
    dealsFiltrados,
    contatosFiltrados,

    loading,

    kpis: {
      totalOportunidades,
      valorPipeline,
      negociosAbertos: negociosAbertos.length,
      negociosGanhos: negociosGanhos.length,
      negociosPerdidos: negociosPerdidos.length,
      taxaConversao,
      ticketMedio,
      valorGanhos,
      atividades,
      tarefasAbertas,
      tarefasAtrasadas
    }
  };
}
