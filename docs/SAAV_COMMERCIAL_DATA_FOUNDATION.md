# SAAV COMMERCIAL DATA FOUNDATION

Este documento descreve a implementação da Fundação de Dados Comerciais do SAAV Cockpit (V1.1), focada na ingestão, tipagem e filtragem avançada de entidades exclusivas do Ploomes CRM (Deals e Contacts), sem mesclar métricas de ERP e preservando intacta a robustez de paginação e filtros operacionais preexistentes.

## 1. Entidades Sincronizadas
Foram adicionadas duas novas entidades vitais à pipeline ETL local do painel:
- **`Deals` (Oportunidades/Negócios)**
- **`Contacts` (Clientes/Carteira)**

O processo obedece o *rate limiting* e paginação oficial, trabalhando independentemente. Falhas na sincronização de uma entidade não corrompem o banco das demais.

## 2. Campos Utilizados (Estritamente Validados)

### Deal (`src/types/deal.ts`)
Após validação real do *payload* através do OData, os seguintes campos foram mapeados sem suposições:
- `id` e `title`
- `amount` (Valor da oportunidade — *Não denominado "Faturamento"*)
- `pipelineId` e `pipelineName` (Expandidos)
- `stageId` e `stageName` (Expandidos)
- `statusId` (Status: Aberto, Ganho, Perdido)
- `ownerId` e `ownerName` (Responsável)
- `contactId` e `contactName` (Empresa)
- `createDate`, `startDate`, `finishDate`, `lastUpdateDate`
- `daysInStage`

### Contact (`src/types/contact.ts`)
- `id`
- `name`
- `email`
- `cnpj` (Mesclado a partir de CPF/CNPJ quando disponível)

## 3. Arquitetura de Sincronização
A infraestrutura de cache local manteve a premissa de usar o sistema de arquivos para escalabilidade temporária sem ferir os custos.
- Endpoint de gravação unificado e independente: `POST /api/sync` (Atualiza JSONs individualizados: `tarefas.json`, `interacoes.json`, `deals.json`, `contacts.json`).
- Endpoints de leitura de cache adicionados para consumo imediato: `GET /api/deals` e `GET /api/contacts`.

## 4. O Hook Unificador: `useCommercialData.ts`
Implementamos o conceito de Single Source of Truth para o cockpit:
Em vez das páginas chamarem endpoints separados e lidarem com a mecânica dos filtros, o `useCommercialData` abstrai todo esse processamento.

- Ele consome `useFilterStore.ts` de maneira passiva.
- Gera os recortes (`dealsFiltrados`, `tarefasFiltradas`).
- Expõe KPIs prontos (`totalOportunidades`, `taxaConversao`, `valorPipeline`).
- É responsável pela regra temporal de negócios (*Deals* usam primariamente a data de criação ou fechamento conforme o seu status, ignorando o campo temporal inespecífico herdado das Tarefas).

## 5. KPIs Habilitados e Protegidos (Mock-Free)
A fundação aboliu 100% o Mock ou as telas de "Dados Indisponíveis" para os componentes que precisavam de Oportunidades, liberando as métricas para as páginas:
1. **Cockpit Comercial**: Valor de Pipeline (em R$), Quantidade de Oportunidades, Taxa de Conversão Real (Win/Loss) e Quantidade de Negócios Ganhos.
2. **Performance**: Listagem e volumetria real para cruzamento Disperso.
3. **Pipeline**: Volumetria do funil atual com dados extraídos dinamicamente.
4. **Clientes**: Volumetria da carteira integrada.

## 6. Preservação Total dos Filtros Globais
A infraestrutura existente de `useFilterStore` continuou governando a sessão do usuário. Se o usuário filtra um *Período*, uma *Equipe* e um *Funil*, as métricas do Pipeline (Deals) cruzam perfeitamente com essas seleções usando as chaves `ownerName`, `pipelineName` e as datas mapeadas, enquanto as *Tasks* mantêm seu filtro por status operacional. Os contextos persistem transparentemente na navegação das 4 abas do sistema.

## 7. Status Técnico (Validação)
- [x] O TypeScript compila estritamente (eliminados possíveis `any` soltos nos novos modelos).
- [x] Nenhum dado simulado para Sankhya.
- [x] Sincronização executada e cacheando centenas de entidades.
- [x] Arquitetura testada em isolamento local.
- [x] OData validado nos Endpoints sem "null ou empty".

> **Nota Crítica de Segurança**: Nenhuma chave (`User-Key`) transitou pelo escopo Client/React em toda a fundação. As requisições ocorrem invariavelmente via rotas Node no ambiente Server-Side.
