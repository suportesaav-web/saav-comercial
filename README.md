<div align="center">
  <img src="https://raw.githubusercontent.com/suportesaav-web/saav-comercial/main/public/logo.png" alt="Logo Saavedra" width="150" style="margin-bottom: 20px;" />
  <h1 style="color: #3b82f6; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; font-size: 2.5rem;">Gestão Comercial Saavedra</h1>
  <p style="font-size: 1.2rem; color: #64748b; font-weight: 500;">Ecossistema de BI e Dashboard de Inteligência Comercial (Integração Ploomes CRM)</p>
</div>

<br>

## 📖 Sobre o Projeto

O **Saav-Comercial** é um sistema robusto de inteligência de negócios (BI) desenvolvido sob medida para a equipe comercial da Saavedra. Seu objetivo primário é unificar os dados extraídos do **Ploomes CRM**, transformá-los e disponibilizá-los em tempo real através de dashboards interativos e painéis analíticos.

Através de uma interface limpa, moderna e responsiva, gestores e vendedores conseguem ter uma visão 360º de todas as tarefas, negócios, atendimentos e gargalos (como tarefas atrasadas ou não sincronizadas), permitindo tomadas de decisão ágeis e baseadas em dados concretos.

---

## 🚀 Módulos e Arquitetura

O sistema não se resume a apenas uma página. Ele é dividido em múltiplos módulos focados em diferentes perspectivas do fluxo de vendas:

### 📱 Módulos de Visão (Páginas)
- 📊 **Dashboard Principal (`/`):** Visão macro da operação. Exibe KPIs gerais (Total de tarefas, finalizadas, em atraso, etc.) e gráficos consolidados do esforço da equipe.
- 👥 **Visão Vendedores (`/vendedores`):** Foco no desempenho individual. Tabelas de ranking, volume de atendimento por consultor e engajamento.
- 🏢 **Visão Clientes (`/clientes`):** Detalhamento das empresas/contatos que mais demandam esforço comercial.
- ⚙️ **Visão Operacional (`/operacional`):** Controle de qualidade. Avalia métricas de conformidade (ex: preenchimento de contatos) e sincronização com o Google Calendar.
- ⏳ **Visão Temporal (`/temporal`):** Análise de sazonalidade e tendências através de linhas do tempo e mapas de calor de atividades (dias e horários de maior fluxo).
- 🔄 **Sincronização (`/sincronizacao`):** Painel de controle do processo ETL (Extract, Transform, Load) que atualiza a base de dados local com o Ploomes.
- 📖 **Guia (`/guia`):** Base de conhecimento interna e onboarding para os usuários da ferramenta.

### 🏗 Arquitetura Técnica
- **State Management (Zustand):** Toda a cadeia de filtros (Data, Vendedor, Cliente, Funil) é gerenciada globalmente através do `useFilterStore`. Qualquer alteração no filtro reflete instantaneamente em todas as abas.
- **Data Fetching (SWR):** A comunicação com a API interna (`/api/tarefas`) utiliza a biblioteca SWR da Vercel para garantir cache em memória, deduping de requisições paralelas e _revalidate on focus_, oferecendo uma experiência extremamente rápida (near-instant).
- **Backend (Next.js API Routes):** Camada Node.js que consome a API oficial do Ploomes e também atua com uma base de cache local (`tarefas.json`) gerada assincronamente (`fs/promises`) para evitar estouros de rate-limit e acelerar as consultas.

---

## ✨ Principais Funcionalidades

- **Métricas em Tempo Real:** Visualização de tarefas totais, finalizadas, atrasadas, média diária e conformidade.
- **Filtros Globais:** Sistema avançado de filtros na barra lateral e superior que afetam todos os módulos simultaneamente.
- **Gráficos Dinâmicos (Recharts):** Gráficos de tendências temporais, mapas de atividades por dia da semana e distribuição de tipos de atendimento.
- **Detalhamento Interativo:** Componentes de Modal ricos (`ClientDetailsModal`, `DelayedTasksModal`) que exibem informações profundas sobre o cliente e links diretos para a tarefa no Ploomes.

---

## 🛠 Stack Tecnológico

<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
  <span style="background-color: #000; color: #fff; padding: 5px 12px; border-radius: 6px; font-weight: bold; border: 1px solid #333;">Next.js 16 (App Router)</span>
  <span style="background-color: #3178c6; color: #fff; padding: 5px 12px; border-radius: 6px; font-weight: bold;">TypeScript</span>
  <span style="background-color: #0ea5e9; color: #fff; padding: 5px 12px; border-radius: 6px; font-weight: bold;">Tailwind CSS v4</span>
  <span style="background-color: #f37021; color: #fff; padding: 5px 12px; border-radius: 6px; font-weight: bold;">Recharts</span>
  <span style="background-color: #000; color: #fff; padding: 5px 12px; border-radius: 6px; font-weight: bold; border: 1px solid #333;">SWR</span>
  <span style="background-color: #4b5563; color: #fff; padding: 5px 12px; border-radius: 6px; font-weight: bold;">Zustand</span>
  <span style="background-color: #339933; color: #fff; padding: 5px 12px; border-radius: 6px; font-weight: bold;">Node.js</span>
</div>

---

## ⚙️ Configuração e Instalação Local

Siga os passos abaixo para executar o ambiente de desenvolvimento localmente:

### 1. Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **NPM** ou **Yarn**

### 2. Clonando o Repositório
```bash
git clone https://github.com/suportesaav-web/saav-comercial.git
cd saav-comercial
```

### 3. Instalação de Dependências
```bash
npm install
```

### 4. Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto contendo as credenciais de integração:
```env
PLOOMES_API_KEY=sua_chave_de_acesso_ploomes_aqui
```

### 5. Rodando o Servidor de Desenvolvimento
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o sistema rodando.

---

## 📂 Estrutura de Pastas

```text
saav-comercial/
├── docs/                  # Documentações técnicas e regras de negócio
├── public/                # Assets estáticos (imagens, ícones)
├── src/
│   ├── app/               # Rotas e páginas (Next.js App Router)
│   │   ├── api/           # Endpoints de Backend (Proxy para o Ploomes)
│   │   ├── clientes/      # Módulo Visão de Clientes
│   │   ├── vendedores/    # Módulo Visão de Vendedores
│   │   └── ...            # Outros módulos
│   ├── components/        # Componentes UI reutilizáveis
│   │   ├── charts/        # Gráficos e Tabelas baseados no Recharts
│   │   ├── modals/        # Popups e Modais de detalhamento
│   │   └── ui/            # Elementos base (Botões, Popovers, etc)
│   ├── data/              # Base de cache local (JSON) populado pela Sincronização
│   ├── hooks/             # Custom Hooks (ex: useTarefas encapsulando o SWR)
│   ├── store/             # Gerenciamento de Estado Global (Zustand)
│   └── types/             # Definições de Tipagem do TypeScript (Interfaces)
└── package.json           # Dependências e scripts do projeto
```

<br>

<div align="center" style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
  <p style="color: #94a3b8; font-size: 0.95rem;">Desenvolvido com foco em alta performance e escalabilidade estrutural para o time Comercial Saavedra.</p>
</div>
