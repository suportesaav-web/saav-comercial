'use client';

import React, { useState } from 'react';

export default function GuiaUsoPage() {
  const [activeTab, setActiveTab] = useState<'navegacao' | 'kpis' | 'praticas' | 'faq'>('navegacao');

  return (
    <main className="min-h-screen p-8 md:p-12 bg-gray-50 text-slate-800 flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2 flex items-center">
            📖 Central de Ajuda & Guia do Usuário
          </h1>
          <p className="text-slate-500 font-medium text-lg">Manual operacional, glossário de indicadores e diretrizes de governança do Comercial Saavedra</p>
        </header>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('navegacao')}
            className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'navegacao' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
          >
            🧭 Navegação & Módulos
          </button>
          <button 
            onClick={() => setActiveTab('kpis')}
            className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'kpis' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
          >
            📐 Dicionário de KPIs
          </button>
          <button 
            onClick={() => setActiveTab('praticas')}
            className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'praticas' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
          >
            🎯 Melhores Práticas
          </button>
          <button 
            onClick={() => setActiveTab('faq')}
            className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'faq' ? 'border-brand-orange text-brand-orange' : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'}`}
          >
            ❓ Perguntas Frequentes (FAQ)
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white p-6 md:p-8 border border-gray-100 rounded-2xl shadow-sm min-h-[400px]">
          
          {/* Navegação */}
          {activeTab === 'navegacao' && (
            <div className="animate-fadeIn">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Como Navegar na Plataforma</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">
                A plataforma foi construída com foco em <strong className="text-slate-800">agilidade analítica</strong> e suporte à tomada de decisão da diretoria e gerência comercial.
                Abaixo está o resumo de cada página disponível no menu lateral:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-2">1. 📈 Visão Geral</h4>
                  <p className="text-sm text-slate-600 mb-4"><strong className="text-slate-700">Objetivo:</strong> Painel macro de produtividade corporativa.</p>
                  
                  <h4 className="text-lg font-bold text-slate-800 mb-2">2. 👥 Vendedores & Equipe</h4>
                  <p className="text-sm text-slate-600 mb-4"><strong className="text-slate-700">Objetivo:</strong> Gestão da força de vendas e produtividade individual. Permite filtro individual para raio-X.</p>
                  
                  <h4 className="text-lg font-bold text-slate-800 mb-2">3. 🏥 Clientes & Negócios</h4>
                  <p className="text-sm text-slate-600 mb-4"><strong className="text-slate-700">Objetivo:</strong> Cobertura de contas hospitalares e oportunidades comerciais (Top 15 clientes).</p>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800 mb-2">4. ⏳ Análise Temporal</h4>
                  <p className="text-sm text-slate-600 mb-4"><strong className="text-slate-700">Objetivo:</strong> Identificar sazonalidades, horários de pico (Heatmap) e planejamento de rotas.</p>
                  
                  <h4 className="text-lg font-bold text-slate-800 mb-2">5. 📋 Detalhamento Operacional</h4>
                  <p className="text-sm text-slate-600 mb-4"><strong className="text-slate-700">Objetivo:</strong> Auditoria granular linha a linha de cada tarefa, com busca textual livre ultrarrápida.</p>
                  
                  <h4 className="text-lg font-bold text-slate-800 mb-2">6. ⚙️ Atualizar Dados</h4>
                  <p className="text-sm text-slate-600 mb-4"><strong className="text-slate-700">Objetivo:</strong> Atualização contínua do dashboard sincronizando com a base em tempo real.</p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start">
                <span className="text-xl mr-3">💡</span>
                <p className="text-sm text-blue-800 font-medium">
                  <strong>Dica de Navegação:</strong> Os filtros aplicados no menu de topo ou lateral (período, vendedor, status) afetam simultaneamente todas as páginas analíticas, mantendo o contexto da sua análise.
                </p>
              </div>
            </div>
          )}

          {/* KPIs */}
          {activeTab === 'kpis' && (
            <div className="animate-fadeIn">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Fórmulas e Regras dos Indicadores</h3>
              <p className="text-slate-600 mb-8 leading-relaxed">Todas as métricas seguem rigorosamente as regras de governança estabelecidas pela gestão:</p>
              
              <div className="space-y-4">
                {[
                  { k: "Total de Tarefas", r: "Soma de todas as tarefas em que o vendedor participou (Titular ou Participante)." },
                  { k: "Taxa de Conclusão (%)", r: "Percentual de tarefas concluídas em relação ao total planejado no período." },
                  { k: "Tarefas em Atraso ⚠️", r: "Tarefas agendadas no passado que constam como 'Não Finalizadas'." },
                  { k: "Média de Tarefas Diárias", r: "Média considerando estritamente os dias em que o vendedor teve registro de campo." },
                  { k: "Conformidade de Contatos (%)", r: "Percentual de tarefas com o nome do interlocutor clínico preenchido (médico, enfermeiro, comprador)." },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all">
                    <h4 className="text-sm font-bold text-slate-800 mb-1">{item.k}</h4>
                    <p className="text-sm text-slate-600 font-medium">{item.r}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Práticas */}
          {activeTab === 'praticas' && (
            <div className="animate-fadeIn">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Boas Práticas de Operação no CRM</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <h4 className="text-emerald-900 font-bold mb-2 flex items-center"><span className="mr-2">✅</span> 1. Preenchimento do Interlocutor</h4>
                  <p className="text-emerald-800 text-sm font-medium">Sempre informe quem foi atendido (Ex: Dr. Roberto, Mariana da Farmácia). Isso mapeia decisores e protege a memória institucional.</p>
                </div>
                
                <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <h4 className="text-emerald-900 font-bold mb-2 flex items-center"><span className="mr-2">✅</span> 2. Duração Real</h4>
                  <p className="text-emerald-800 text-sm font-medium">Insira os minutos reais gastos. Isso ajuda no dimensionamento da força de vendas.</p>
                </div>

                <div className="p-5 bg-red-50 border border-red-100 rounded-xl">
                  <h4 className="text-red-900 font-bold mb-2 flex items-center"><span className="mr-2">⚠️</span> 3. Baixa Imediata</h4>
                  <p className="text-red-800 text-sm font-medium">Dê baixa no mesmo dia. Tarefas antigas viram "Atrasadas" e geram alertas negativos para a gerência.</p>
                </div>

                <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
                  <h4 className="text-blue-900 font-bold mb-2 flex items-center"><span className="mr-2">📅</span> 4. Google Calendar</h4>
                  <p className="text-blue-800 text-sm font-medium">Mantenha seu e-mail autenticado no Ploomes para espelhar visitas no celular.</p>
                </div>
              </div>
            </div>
          )}

          {/* FAQ */}
          {activeTab === 'faq' && (
            <div className="animate-fadeIn">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Perguntas Frequentes (FAQ)</h3>
              
              <div className="space-y-4">
                {[
                  { q: "Qual a diferença entre Vendedor Titular e Vendedor Participante?", a: "Quando duas pessoas realizam visita conjunta, o primeiro nome é o Titular e o segundo o Participante. Ambos recebem crédito nos relatórios de equipe." },
                  { q: "Como exportar os dados para Excel?", a: "Acesse a página 'Detalhamento Operacional', aplique os filtros desejados e copie/exporte a tabela diretamente da tela." },
                  { q: "Com que frequência devo atualizar a base na tela 'Atualizar Dados'?", a: "Recomenda-se no final do dia. O processo leva poucos segundos e atualiza instantaneamente os gráficos para toda a diretoria." },
                ].map((item, idx) => (
                  <div key={idx} className="p-5 border border-gray-100 rounded-xl bg-white shadow-sm">
                    <h4 className="text-md font-bold text-slate-800 mb-2">{item.q}</h4>
                    <p className="text-sm text-slate-600 font-medium">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
