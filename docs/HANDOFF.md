# Guia de Repasse: Saavedra Comercial

## 1. Introdução
Este documento tem como objetivo servir como um guia rápido para qualquer desenvolvedor que assuma o projeto **Saavedra Comercial** na ausência do desenvolvedor principal. Ele centraliza informações sobre a arquitetura, como configurar o ambiente e o fluxo principal de dados.

## 2. Tecnologias Principais (Stack)
O projeto é um Dashboard de BI e Gestão Comercial construído em React/Next.js:
- **Next.js 16 (App Router)**: Framework principal usado tanto para Frontend (React Server Components e Client Components) quanto para as APIs (API Routes).
- **TypeScript**: Tipagem estática em todo o projeto.
- **TailwindCSS (v4)**: Estilização utilitária.
- **SWR (Vercel)**: Biblioteca de data fetching para cache de interface, deduplicação de chamadas e revalidação.
- **Zustand**: Gerenciamento de estado global (usado primariamente para os filtros globais de Vendedor, Cliente, Período, etc).
- **Recharts**: Biblioteca usada para os gráficos dinâmicos do dashboard.

## 3. Arquitetura e Integração (Ploomes CRM)
O sistema consome dados **exclusivamente do Ploomes CRM** (Contatos, Negócios, Tarefas e Agendamentos). 
Devido aos limites de requisição (Rate-Limit) da API do Ploomes, o sistema utiliza um modelo de **ETL com Cache Local**:
1. O processo de sincronização (`/sincronizacao`) ou um CRON job puxa os dados massivos da API do Ploomes via API Routes do Next.js.
2. Esses dados são limpos, transformados e salvos localmente (ex: `src/data/tarefas.json` via Node.js `fs/promises`).
3. Quando o usuário acessa o Dashboard, o SWR lê preferencialmente esse arquivo de cache local, garantindo tempo de resposta ultrarrápido.

## 4. Estrutura de Rotas (Telas)
As páginas principais do App Router estão configuradas para oferecer visões específicas da operação comercial:
- `/` - **Visão Geral**: Dashboard macro.
- `/interacoes` - **Interações**: Volume de ações da equipe.
- `/performance` - **Performance**: Vendas, funil e conversão.
- `/temporal` - **Análise Temporal**: Tendências históricas e Heatmaps.
- `/clientes` - **Clientes**: Esforço gasto por cliente.
- `/auditoria` - **Auditoria**: Qualidade e conformidade no preenchimento do CRM.
- `/sincronizacao` - **Sincronização**: Tela responsável pelo controle do Cache ETL.
- Páginas de Drill-down para tabelas detalhadas: `/negocios` e `/tarefas`.

## 5. Como Iniciar o Projeto Localmente

**Pré-requisitos:**
- Node.js v18+ 
- Acesso à Chave de API do Ploomes.

**Passos:**
1. Clone o repositório: `git clone https://github.com/suportesaav-web/saav-comercial.git`
2. Instale as dependências: `npm install`
3. Crie o arquivo `.env.local` na raiz do projeto contendo:
   ```env
   PLOOMES_API_KEY=sua_chave_de_integracao_aqui
   ```
4. Rode o servidor de desenvolvimento: `npm run dev`
5. Acesse `http://localhost:3000`

## 6. Onde Encontrar Mais Documentações
Além deste guia, verifique a pasta `docs/` no repositório. Lá você encontrará detalhamentos importantes sobre:
- **`PLOOMES_DATA_MAPPING.md`**: Como os campos do Ploomes são mapeados internamente.
- **`SAAV_COMMERCIAL_DATA_FOUNDATION.md`**: Regras da fundação de dados.
- **`COMMERCIAL_DASHBOARD_VISUALIZATIONS.md`**: Detalhes sobre as views e gráficos.
- **`regras_de_negocio.md`**: Regras específicas da operação comercial da Saavedra.

*Guia gerado para garantir a continuidade do desenvolvimento em qualquer cenário.*
