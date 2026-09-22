<div align="center">
  <h1 style="color: #3b82f6; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Gestão de Tarefas Ploomes</h1>
  <p style="font-size: 1.2rem; color: #64748b;">Dashboard Analítico - Comercial Saavedra</p>
</div>

---

<br>

## 🚀 Visão Geral

Este projeto é um painel de inteligência comercial (Dashboard BI) construído em **Next.js** para visualizar e gerenciar as tarefas da equipe comercial sincronizadas a partir do CRM **Ploomes**. 

Ele oferece acompanhamento em tempo real de KPIs críticos, tarefas em atraso, e gráficos analíticos interativos.

<br>

## ✨ Principais Funcionalidades

- 📊 **Métricas em Tempo Real:** Visualização de tarefas totais, finalizadas, em atraso e taxa de conformidade.
- 📈 **Gráficos Analíticos:** Gráficos de tendências temporais, mapas de atividades por dia da semana e distribuição de tipos de atendimento.
- 🏢 **Detalhamento de Clientes:** Tabelas interativas detalhando o esforço comercial por cliente com possibilidade de visualizar as tarefas de cada um.
- ⚠️ **Alertas Inteligentes:** Avisos automáticos sobre tarefas atrasadas.
- ⚡ **Alta Performance:** Fetching otimizado de dados utilizando `SWR` e componentes modulares no padrão React Server Components e Client Components.

<br>

## 🛠 Tecnologias Utilizadas

<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
  <span style="background-color: #000; color: #fff; padding: 5px 10px; border-radius: 5px; font-weight: bold;">Next.js (App Router)</span>
  <span style="background-color: #3178c6; color: #fff; padding: 5px 10px; border-radius: 5px; font-weight: bold;">TypeScript</span>
  <span style="background-color: #0ea5e9; color: #fff; padding: 5px 10px; border-radius: 5px; font-weight: bold;">Tailwind CSS</span>
  <span style="background-color: #f37021; color: #fff; padding: 5px 10px; border-radius: 5px; font-weight: bold;">Recharts</span>
  <span style="background-color: #6366f1; color: #fff; padding: 5px 10px; border-radius: 5px; font-weight: bold;">SWR</span>
  <span style="background-color: #4b5563; color: #fff; padding: 5px 10px; border-radius: 5px; font-weight: bold;">Zustand</span>
</div>

<br>

## ⚙️ Como Executar o Projeto Localmente

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd saav-comercial
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Certifique-se de que o arquivo `.env.local` contém as chaves da API:
   ```env
   PLOOMES_API_KEY=sua_chave_aqui
   ```

4. **Inicie o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse no Navegador:**
   Abra [http://localhost:3000](http://localhost:3000).

<br>

<div align="center">
  <p style="color: #94a3b8; font-size: 0.9rem;">Desenvolvido com padrão de melhores práticas para o Comercial Saavedra.</p>
</div>
