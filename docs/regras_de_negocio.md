# Regras de Negócio - BI Comercial Saavedra

Este documento centraliza as premissas e regras de negócio essenciais para o correto funcionamento, manutenção e leitura dos dados no painel de Business Intelligence (BI).

## 1. Clientes Internos vs Externos (Falsos Positivos)

A gestão comercial precisa ter clareza de onde os vendedores estão atuando para evitar a contagem de "falsos positivos" de produtividade externa.

- **Cliente Interno Oficial:** `SAAVEDRA TECNOLOGIA EM SAUDE`
- **Motivo:** Quando os vendedores e técnicos marcam este cliente em suas tarefas no Ploomes, isso geralmente significa atividades administrativas, reuniões de alinhamento interno ou trabalho em escritório.
- **Impacto no BI:** Estas tarefas inflam artificialmente o volume de visitas/atendimentos se lidas em conjunto com os clientes externos. Em painéis de prospecção e esforço de vendas, as atividades ligadas a este cliente devem ser analisadas de forma separada ou excluídas da métrica de "Esforço Externo".
