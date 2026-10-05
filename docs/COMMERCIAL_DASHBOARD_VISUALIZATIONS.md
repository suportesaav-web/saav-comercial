# Catálogo de Visualizações Comerciais - SAAV Dashboard

Este documento cataloga todas as possíveis visualizações que podem ser construídas no SAAV Dashboard com base nos dados disponíveis no Ploomes CRM e ERP Sankhya, utilizando bibliotecas de UI existentes (Recharts, TailwindCSS).

## 1. Catálogo de Visualizações (Por Categoria)

| ID | Visualização | Pergunta Respondida | Dados (Entidades / Métricas / Dimensões) | Gráfico Recomendado | Prioridade |
|---|---|---|---|---|---|
| **EXEC-01** | **Faturamento Bruto x Meta** | Estamos atingindo a meta de faturamento no período? | Deals (Ganhos) / Valor Total / Tempo | BarChart ou LineChart (Recharts) | 🔴 Alta |
| **EXEC-02** | **Valor do Pipeline Ativo** | Qual a expectativa de receita futura? | Deals (Abertos) / Valor Total / Etapa | Funil ou DonutChart | 🔴 Alta |
| **EXEC-03** | **Taxa de Conversão Global** | Qual nossa eficiência média de vendas? | Deals / % Ganhos vs Perdidos / Tempo | AreaChart (TrendChart) | 🔴 Alta |
| **VEND-01** | **Ranking de Vendedores (Receita)** | Quem está vendendo mais em valor financeiro? | Deals / Valor Total / Vendedor | VendedorRankingChart (Barras) | 🔴 Alta |
| **VEND-02** | **Produtividade vs Conversão** | Mais atividades geram mais vendas para o vendedor X? | Tasks, Deals / Qtd Tarefas, % Ganho / Vendedor | Scatter Plot (Dispersão) | 🟠 Média |
| **VEND-03** | **Ticket Médio por Vendedor** | Qual vendedor fecha negócios de maior valor? | Deals / Média de Valor / Vendedor | BarChart | 🟠 Média |
| **PIPE-01** | **Funil de Vendas (Conversão por Etapa)** | Onde estamos perdendo mais oportunidades? | Deals, Stages / Qtd e Valor / Etapa | Gráfico de Funil / BarChart Horizontal | 🔴 Alta |
| **PIPE-02** | **Oportunidades Paradas (Aging)** | Quais negócios correm risco de esfriar? | Deals / Tempo na Etapa / Negócio | Tabela (RankingTable) | 🔴 Alta |
| **PIPE-03** | **Forecast de Fechamento** | Quanto fecharemos no próximo mês? | Deals / Valor Esperado / Data Prevista | AreaChart (TrendChart) | 🟠 Média |
| **CLI-01** | **Ranking de Clientes (Curva ABC)** | Quais são nossos melhores clientes na base? | Deals, Contacts / Valor Total / Cliente | RankingTable / BarChart | 🔴 Alta |
| **CLI-02** | **Saúde da Base (Ativos vs Inativos)** | Como está a retenção de clientes? | Contacts, Deals / Qtd Clientes / Status | DonutChart | 🟠 Média |
| **CLI-03** | **Risco de Churn (Sem Movimentação)** | Quais clientes fortes estão sem interações recentes? | Contacts, Tasks / Data Última Interação / Cliente | Tabela de Alerta | 🔴 Alta |
| **PROD-01** | **Curva ABC de Produtos** | Quais SKUs representam 80% do faturamento? | DealProducts, Products / Valor e Qtd / Produto | BarChart Horizontal | 🟠 Média |
| **PROD-02** | **Mix de Produtos por Vendedor** | Quais vendedores estão diversificando vendas? | DealProducts, Users / Qtd Diferentes SKUs / Vendedor | Heatmap / Stacked BarChart | 🟢 Baixa |
| **ATIV-01** | **Visitas de GPS no Mapa** | Onde o time comercial está atuando presencialmente? | InteractionRecords / Coordenadas / Vendedor | MapComponent | 🔴 Alta |
| **ATIV-02** | **Gargalos e Omissões (Shame Ranking)** | Quem está atrasando ou omitindo reportes? | Tasks / Atrasos, Sem Engajamento / Vendedor | ShameRanking (Painel) | 🔴 Alta |
| **PERF-01** | **Dispersão: Atividades vs Faturamento** | Qual o ponto de eficiência entre esforço e resultado? | Tasks, Deals / Qtd Tarefas vs Valor Ganho / Vendedor | Scatter Plot | 🟠 Média |

## 2. Alertas Recomendados (Sistema de Notificações)

Indicadores de exceção que devem acionar badges, ícones vermelhos ou cards de destaque (sem depender de busca manual):

* 🚨 **Oportunidade Parada:** Negócios estacionados na mesma etapa há mais de X dias.
* 🚨 **Vendedor Abaixo da Meta:** Receita acumulada do mês inferior ao *run rate* necessário.
* 🚨 **Cliente Premium Sem Interação:** Cliente "Curva A" (ERP) sem nenhuma tarefa ou visita (CRM) nos últimos 30 dias.
* 🚨 **Queda Abrupta de Conversão:** Diferença percentual semanal negativa > 15% na etapa de fechamento.
* 🚨 **Fechamento Próximo Atrasado:** Oportunidades com data de previsão de fechamento expirada ou prestes a expirar.

---

## 3. Proposta de Arquitetura do SAAV Dashboard

Com base na separação de responsabilidades para diferentes níveis hierárquicos (Diretor vs Coordenador vs Vendedor):

### Página 1 — Executive Overview
**Foco:** C-Level e Diretores. Visão macro e financeira da empresa.
* **Componentes:**
  * Cards de KPI (Scorecards): Faturamento Atual, Meta do Mês, Ticket Médio, Valor Total do Pipeline Ativo.
  * `TrendChart` (Área): Evolução do Faturamento vs Meta Histórica.
  * `DonutChart`: Taxa de Conversão Global (Win/Loss).
  * Painel de Alertas Consolidados (ex: Faturamento em Risco).

### Página 2 — Vendedores
**Foco:** Coordenadores e Vendedores. Gamificação e acompanhamento de equipe.
* **Componentes:**
  * `VendedorRankingChart`: Ranking de Vendas e Atingimento de Meta.
  * `ShameRanking`: Painel Diário Operacional de Gargalos (Atrasos).
  * `ActivityChart`: Volume de Atividades diárias (Tarefas).
  * Gráfico de Dispersão (Scatter Plot): Atividades vs Vendas Fechadas.

### Página 3 — Pipeline CRM
**Foco:** Gestores Comerciais. Acompanhamento de Oportunidades e Fluxo do Funil.
* **Componentes:**
  * Gráfico de Funil: Qtd e Valor por Etapa do Pipeline.
  * Tabela de Aging: Oportunidades Paradas e com Risco de Perda.
  * `TrendChart` (Linha): Forecast de Vendas baseadas na Previsão de Fechamento.
  * Gráfico de Barras Empilhadas: Conversão de cada etapa.

### Página 4 — Clientes
**Foco:** Farmer / CS / Gestores de Contas. Retenção e Expansão (Cross-sell/Up-sell).
* **Componentes:**
  * `RankingTable`: Curva ABC de Clientes (Top Faturamento).
  * `DonutChart`: Distribuição de Clientes (Ativos vs Inativos vs Novos).
  * Painel de Risco (Alertas): Clientes Sem Compra ou Sem Visita.

### Página 5 — Produtos
**Foco:** Marketing, Produto e Vendas. Giro de estoque e rentabilidade.
* **Componentes:**
  * Gráfico de Barras Horizontal: Top 10 Produtos Mais Vendidos (Qtd/Receita).
  * Tabela Analítica: Matriz Vendedor x Mix de Produto.
  * `DonutChart`: Distribuição de Vendas por Categoria/Origem do Produto.

### Página 6 — Atividades
**Foco:** Operacional e Backoffice de Vendas.
* **Componentes:**
  * `MapComponent`: Mapa interativo com Check-ins de GPS.
  * Gráfico de Barras: Atividades por Tipo (E-mail, Visita Presencial, WhatsApp, Reunião Online).
  * Calendário de Demandas (Agendamentos da Semana).
  * Linha do Tempo (Log de Interações Recentes).
