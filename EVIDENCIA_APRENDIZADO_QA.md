# Relatório de Evidência de Aprendizado e Aplicação de QA

**Aluno/Responsável:** Cleiton Viana
**Projeto:** AchaPro
**Data:** 04/01/2026

---

## 1. Introdução
Este relatório documenta a execução do ciclo de garantia de qualidade (QA) no projeto AchaPro. O foco da sprint foi a validação de regras de negócio, análise heurística de interface e testes exploratórios de fluxo crítico. O objetivo foi identificar gargalos que comprometem a integridade dos dados e a experiência do usuário final.

## 2. Conceitos de QA Aplicados

### 2.1. Testes de Caixa Preta e Limites
Aplicamos técnicas de particionamento de equivalência e análise de valor limite para validar as entradas do sistema:
* **Validação de Upload:** Testamos o limite superior de arquivos no cadastro de tarefas. Identificamos que o sistema permite o envio de mais de 5 imagens, violando a regra de negócio explícita na interface.
* **Duplicidade de Requisições:** Realizamos testes de estresse manual no botão de criação, evidenciando que a falta de bloqueio (*debounce*) gera registros duplicados no banco de dados.

### 2.2. Análise Heurística de Usabilidade (Nielsen)
Avaliamos a interface com base nas 10 Heurísticas de Nielsen, focando em "Visibilidade do Status do Sistema":
* **Ausência de Feedback (Loading):** O sistema falha em comunicar o processamento durante login, cadastro e criação de pedidos, deixando o usuário sem saber se a ação foi efetivada.
* **Legibilidade e Contraste:** Identificamos violações de acessibilidade, onde a cor da fonte (placeholder e valor) possui contraste insuficiente com o fundo, tanto nos inputs de "Novo Pedido" quanto nos títulos dos cards no Mural.

### 2.3. Testes de Fluxo Crítico (E2E Manual)
Simulamos a jornada completa do usuário (Cadastro -> Criação de Pedido -> Orçamento).
* **Bloqueio de Fluxo Core:** Descobrimos que novos pedidos criados não exibem o botão "Enviar Orçamento" para os profissionais, impossibilitando a execução do serviço principal da plataforma.

---

## 3. Evidências Técnicas

### 3.1. Falhas de Integridade e Regra de Negócio
Classificamos as falhas encontradas por severidade:
1.  **Crítico (Blocker):** Ausência do botão "Enviar Orçamento" em novos pedidos. O fluxo de contratação é interrompido.
2.  **Alto (Integridade):** Duplicidade na criação de pedidos por falta de *disable* no botão durante a requisição.
3.  **Médio (Inconsistência):** As categorias da Home (Manutenção, Reformas, Beleza, etc.) não possuem correspondência nos filtros do Mural, levando o usuário a telas vazias.

### 3.2. Cenário de Reprodução (Exemplo de Falha de Segurança/Lógica)
Detalhamento do comportamento inesperado na visualização do Mural:

**Cenário:** Usuário logado acessa o Mural de Tarefas.
**Comportamento Atual:** O sistema lista os pedidos do próprio usuário misturados com oportunidades de venda.
**Erro Lógico:** Embora o botão de orçamento seja ocultado (correto), não há distinção visual.
**Impacto:** Confusão cognitiva. O usuário acredita que o sistema travou por não ver o botão, quando na verdade é uma regra de negócio (não orçar o próprio pedido).

### 3.3. Métricas de Qualidade Atual
* **Conformidade Funcional:** 70% (Falhas críticas no fluxo de orçamento e upload).
* **Usabilidade (UX):** Necessita revisão urgente nos contrastes de cores e estados de carregamento (*loading states*).
* **Integridade de Dados:** Comprometida pela possibilidade de inserção de endereços não padronizados (texto livre).

---

## 4. Lições Aprendidas e Desafios

### 4.1. Importância do Feedback do Sistema
Aprendemos que a ausência de *Loaders* e o não bloqueio de botões durante requisições assíncronas não são apenas problemas estéticos, mas causam **sujeira no banco de dados** (registros duplicados). A implementação de estados de `loading` e `disabled` deve ser mandatória em todas as *Server Actions*.

### 4.2. Padronização de Dados de Entrada
Um dos maiores desafios identificados foi o campo de endereço com "texto livre" para Bairro e Cidade.
* **Lição:** Deixar esses campos livres inviabiliza filtros regionais futuros.
* **Melhoria Proposta:** Implementar seleção em cascata (Estado -> Seleciona Cidade -> Filtra Bairros) ou integração com API de CEP para garantir a integridade dos dados geográficos.

### 4.3. Segregação de Contexto
A mistura de "Meus Pedidos" com "Oportunidades" no mesmo mural provou ser confusa.
* **Solução Arquitetural:** A solução ideal aprendida é separar as visões: criar uma aba exclusiva "Meus Serviços" para gestão própria, e manter o Mural estritamente para buscar novos trabalhos, ou utilizar *Tags* visuais claras ("Meu Pedido") para diferenciar os contextos.