# Implementação SAAV Commercial Cockpit (V1)

## Resumo da Implementação

Este documento registra a evolução do SAAV Dashboard para o **SAAV Commercial Cockpit (V1)**, conforme os requisitos estabelecidos no mapeamento da API (`PLOOMES_DATA_MAPPING.md`) e no catálogo de visualizações (`COMMERCIAL_DASHBOARD_VISUALIZATIONS.md`).

A V1 focou em estruturar a arquitetura base em quatro pilares fundamentais, reaproveitando os componentes visuais existentes e preparando o terreno arquitetural para a ingestão dos dados financeiros das oportunidades (Deals), com ênfase total em dados do Ploomes CRM, sem mesclar com o ERP Sankhya nesta fase.

## 1. Nova Arquitetura de Navegação

A barra superior (`TopNav.tsx`) foi refatorada para comportar as 4 novas áreas obrigatórias:

* **`/` (Cockpit Comercial)**: Visão geral para responder rápido sobre oportunidades, conversão, pipeline e atividades. Substituiu a antiga Home genérica.
* **`/pipeline` (Pipeline)**: Rota dedicada para análise de negócios por etapa, forecast e oportunidades paradas (aging).
* **`/performance` (Performance Comercial)**: Substituiu a antiga rota `/vendedores`. Focada em avaliar os executivos de contas, com indicadores de conversão, atividades e ranking.
* **`/clientes` (Clientes)**: Visão da carteira, permitindo identificar oportunidades abertas, clientes sem interação recente e Curva ABC.

## 2. Refatoração e Novos Componentes

A instrução orientou o desenvolvimento e a análise da viabilidade dos componentes visuais com base estrita nos dados do Ploomes já disponíveis ou a serem sincronizados. 

### Componentes Mapeados e Arquitetados
- **KPI Cards (Cockpit)**: Desenhados na `page.tsx` para abrigar: Total de Oportunidades, Valor do Pipeline, Negócios Ganhos e Taxa de Conversão.
- **ActivityChart e TrendChart**: Migrados e perfeitamente injetados no novo Cockpit Comercial, usando os dados já operantes das tarefas (`Tasks`).
- **PipelineStageChart & PerformanceScatterChart**: Componentes mapeados nas áreas `/pipeline` e `/performance`.

## 3. Gestão de Dependências de Dados (Regra de Indisponibilidade)

Como estipulado nas "Regras de Dados":
> *Se algum componente depender de dados ainda não disponíveis: Não criar mock permanente. Registrar a dependência. Mostrar estado "Dados indisponíveis". Documentar o endpoint necessário.*

Aplicamos fielmente este padrão nas novas telas:
- O banco local possui sincronização rica de **Tarefas (`Tasks`)** e **Interações (`InteractionRecords`)**, o que alimenta com sucesso o volume de atividades.
- Porém, toda a base financeira e de negócios (Valor da oportunidade, Pipeline, Negócios ganhos/perdidos) e a base cadastral de empresas/pessoas dependem estritamente das entidades **`Deals`** e **`Contacts`**, que ainda não foram conectadas no processo de Sincronização (`/api/sync`).
- Assim, implementamos **Empty States (Telas de Alerta)** explícitas no Pipeline, Performance e Clientes relatando o endpoint que deve ser desenvolvido na V2 (ex: `GET /Deals?$expand=Stage,Pipeline`).

## 4. Vocabulário e Padrões de Design

- **Vocabulário Comercial**: Cumprimos o requisito de purificar os rótulos do sistema. Não há menções a "Faturamento", "Receita" ou termos de ERP. As interfaces adotaram a nomenclatura CRM: "Valor do Pipeline", "Valor do Negócio", "Oportunidades", "Negócios Ganhos" e "Taxa de Conversão".
- **Design de Interface**: Mantido e evoluído o uso de TailwindCSS focado em cartões brancos/cinza (`bg-slate-50`), tipografia pesada em cabeçalhos para leitura rápida, e ícones padronizados (sem poluição de *PieCharts* desnecessários).

## 5. Validação Técnica (Checklist Realizado)

- [x] Criação das rotas `/`, `/pipeline`, `/performance`, `/clientes`.
- [x] Sem geração de Mock ou Hardcode financeiro.
- [x] Ajustes nos menus e remoção de redundâncias de código.
- [x] Execução do TypeScript (`tsc --noEmit`).
- [x] Execução de Linting (`npm run lint`).
- [x] Nenhum vazamento da `PLOOMES_API_KEY` na UI.
- [x] Zero chamadas de escrita no Ploomes (mantida apenas a leitura OData).

## Próximos Passos (Para V2)

Para tirar as telas principais do estado de "Dados Indisponíveis", a próxima missão de engenharia deve focar 100% no arquivo `src/app/api/sync/route.ts`, implementando um loop de paginação para:
1. `GET /Deals?$expand=Pipeline,Stage`
2. `GET /Contacts`

Com esses dados sincronizados no arquivo JSON local de cache, os componentes `PipelineStageChart` e `PerformanceScatterChart` poderão ser codificados com dados reais utilizando o *Recharts*.
