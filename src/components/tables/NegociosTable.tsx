'use client';

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

/**
 * Interface que representa os dados estruturados de um Negócio
 */
interface NegociosTableProps {
  deals: any[];
  loading: boolean;
}

/**
 * Componente isolado para renderização da Tabela de Negócios.
 * Responsável por:
 * 1. Exibir a lista de negócios passados por prop.
 * 2. Gerenciar o estado de pesquisa local.
 * 3. Filtrar os dados em memória sem depender do servidor (alta performance).
 */
export function NegociosTable({ deals, loading }: NegociosTableProps) {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Filtro de dados em memória (re-calcula apenas se o termo de busca ou array original mudarem)
  const filteredData = useMemo(() => {
    if (!deals) return [];
    if (!searchTerm.trim()) return deals;
    
    const lower = searchTerm.toLowerCase();
    
    // Busca "full-text" verificando multiplas colunas
    return deals.filter(item => 
      (item.title || '').toLowerCase().includes(lower) ||
      (item.contactName || '').toLowerCase().includes(lower) ||
      (item.ownerName || '').toLowerCase().includes(lower) ||
      (item.stageName || '').toLowerCase().includes(lower) ||
      (item.pipelineName || '').toLowerCase().includes(lower)
    );
  }, [deals, searchTerm]);

  // Exibe skeleton de carregamento enquanto o hook do store busca na API
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 min-h-[400px]">
        Carregando banco de negócios...
      </div>
    );
  }

  return (
    <>
      {/* Barra de Pesquisa */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm"
            placeholder="Pesquise por cliente, título ou vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {/* Container da Tabela (com scroll horizontal para telas menores) */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-100 bg-slate-50 text-xs text-slate-500 font-bold uppercase tracking-wider">
              <th className="py-3 px-6 w-16 text-center">Status</th>
              <th className="py-3 px-6 w-16 text-center">Avisos</th>
              <th className="py-3 px-6 w-64">Oportunidade</th>
              <th className="py-3 px-6 w-56">Cliente (Empresa)</th>
              <th className="py-3 px-6 w-56">Funil / Etapa</th>
              <th className="py-3 px-6 w-48">Vendedor</th>
            </tr>
          </thead>
          <tbody className="text-slate-700 text-sm">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  Nenhum negócio encontrado.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors align-middle">
                  
                  {/* Status Renderizado via Bolinhas Coloridas (Badges) */}
                  <td className="py-4 px-6 text-center">
                    {item.statusId === 1 && <span className="w-3 h-3 rounded-full bg-amber-400 inline-block shadow-sm" title="Em Aberto"></span>}
                    {item.statusId === 2 && <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-sm" title="Ganho"></span>}
                    {item.statusId === 3 && <span className="w-3 h-3 rounded-full bg-rose-500 inline-block shadow-sm" title="Perdido"></span>}
                  </td>

                  {/* Avisos e Pendências (Regras de Ouro) */}
                  <td className="py-4 px-6 text-center">
                    {/* Exibe alerta se o negócio estiver em aberto (status 1) e faltar o Contato (PersonId) */}
                    {item.statusId === 1 && !item.personId ? (
                      <span className="flex items-center justify-center text-rose-500 font-bold cursor-help" title="Pendência: Contato e Telefone não preenchidos no Ploomes">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path></svg>
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* Identificação Primária (Título e ID) com Link Externo */}
                  <td className="py-4 px-6">
                    <a 
                      href={`https://app10.ploomes.com/deal/${item.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex flex-col items-start hover:bg-slate-100 p-1.5 -ml-1.5 rounded-lg transition-colors"
                      title="Abrir Negócio no Ploomes"
                    >
                      <span className="font-bold text-blue-600 group-hover:text-blue-800 line-clamp-2 transition-colors">
                        {item.title}
                        <span className="inline-block ml-1 opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                      </span>
                      <span className="text-xs text-slate-400 mt-1 block">ID: {item.id}</span>
                    </a>
                  </td>

                  {/* Empresa Alvo (ContactName) e Contato (PersonName) */}
                  <td className="py-4 px-6">
                    <span className="font-semibold text-slate-700 block">{item.contactName || 'Sem Cliente'}</span>
                    {item.personName && (
                      <span className="text-xs text-slate-500 mt-0.5 flex items-center">
                        <svg className="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        {item.personName}
                      </span>
                    )}
                  </td>

                  {/* Informações do Estágio (Pipeline & Stage) */}
                  <td className="py-4 px-6">
                    <span className="block text-xs font-bold uppercase text-slate-400">{item.pipelineName || '-'}</span>
                    <span className="font-medium text-slate-600">{item.stageName || 'Concluído'}</span>
                  </td>

                  {/* Responsável da Equipe (OwnerName) */}
                  <td className="py-4 px-6 font-medium">
                    {item.ownerName || 'Sem Vendedor'}
                  </td>
                  
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
