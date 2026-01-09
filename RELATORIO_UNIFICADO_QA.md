# Relatório Unificado de Qualidade (QA) - AchaPro

**Projeto:** AchaPro - Marketplace de Serviços
**Data:** 04/01/2026
**Responsável:** Cleiton Viana

---

## 1. Resumo Executivo
Este documento consolida toda a estratégia, planejamento, execução e gestão da qualidade do projeto AchaPro. O sistema passou por um ciclo rigoroso de validação, focando em integridade de dados, usabilidade e fluxos críticos de negócio. A execução dos testes manuais e heurísticos identificou gargalos significativos que, uma vez corrigidos, elevarão a maturidade do produto para o lançamento.

**Status Final:** ⚠️ **APROVADO COM RESSALVAS** (Correções Críticas Necessárias)

---

## 2. Análise de Requisitos e Riscos

A priorização dos testes foi baseada na classificação de risco de negócio e impacto técnico.

| ID | Descrição Resumida | Risco | Justificativa | Status Teste |
|----|-------------------|-------|---------------|--------------|
| **RF01** | Cadastro de Tarefas | **Alto** | Entrada de dados core do sistema. | ❌ Falhou (Duplicidade/Upload) |
| **RF02** | Visualização de Mural | Médio | Principal ponto de conversão. | ⚠️ Parcial (Inconsistência visual) |
| **RF03** | Envio de Orçamento | **Alto** | Início da transação comercial. | ❌ Bloqueante (Botão inexistente) |
| **NFR** | Usabilidade (UX) | **Alto** | Retenção e satisfação do usuário. | ❌ Falhou (Feedback/Contraste) |
| **NFR** | Integridade de Dados | Médio | Qualidade da base para filtros. | ⚠️ Risco (Campos livres) |

*\*Validado via testes exploratórios manuais, análise heurística e verificação de regras de negócio.*

---

## 3. Plano de Testes e Estratégia

### 3.1. Abordagem de Testes
Adotamos uma estratégia focada na experiência do usuário e na robustez das regras de negócio:
1.  **Testes Funcionais (Caixa Preta):** Validação de entradas, saídas e comportamento esperado dos formulários e botões (ex: Upload de imagens, Criação de pedidos).
2.  **Análise Heurística (UI/UX):** Avaliação da interface baseada nas Heurísticas de Nielsen, focando em visibilidade do status do sistema e prevenção de erros.
3.  **Testes de Fluxo Crítico (E2E Manual):** Simulação da jornada completa: Cadastro -> Criação de Pedido -> Tentativa de Orçamento.

### 3.2. Critérios de Aprovação (Exit Criteria)
* Correção dos bugs de severidade **Crítica** e **Alta**.
* Implementação de feedbacks visuais (*Loading States*) em todas as ações assíncronas.
* Validação das regras de negócio de upload e duplicidade.

---

## 4. Matriz de Rastreabilidade e Execução

### 4.1. Testes Funcionais e de Regra de Negócio
| ID | Cenário | Resultado Esperado | Status |
|----|---------|--------------------|--------|
| **TC-FUNC-01** | Criar Tarefa (Clique Múltiplo) | Sistema deve processar apenas uma requisição. | ❌ **Falhou** - Botão permanece ativo, gerando registros duplicados no banco. **Correção Necessária:** Implementar *debounce* e estado `disabled`. |
| **TC-FUNC-02** | Upload de Imagens (>5 arquivos) | Sistema deve bloquear o envio e alertar o usuário. | ❌ **Falhou** - Sistema aceita mais de 5 imagens, violando a regra de negócio. **Correção Necessária:** Validação front/back-end. |
| **TC-FUNC-03** | Fluxo de Orçamento (Novo Pedido) | Profissional deve ver botão "Enviar Orçamento". | ❌ **Falhou (Bloqueante)** - Botão inexistente em novos pedidos criados. **Correção Necessária:** Revisar lógica de exibição do botão. |
| **TC-FUNC-04** | Navegação Home -> Mural | Filtros da Home devem refletir no Mural. | ❌ **Falhou** - Categorias da Home não existem no Mural, levando a telas vazias. **Correção Necessária:** Sincronizar taxonomias. |

### 4.2. Análise de Interface e Usabilidade (UI/UX)
| ID | Cenário | Heurística | Status |
|----|---------|------------|--------|
| **TC-UX-01** | Feedback de Ação (Login/Cadastro) | Visibilidade do Status | ❌ **Falhou** - Ausência de *loading*, usuário sem feedback de processamento. |
| **TC-UX-02** | Legibilidade (Novo Pedido) | Estética e Design Minimalista | ❌ **Falhou** - Contraste insuficiente entre fonte e fundo nos inputs. |
| **TC-UX-03** | Mural (Pedidos Próprios) | Reconhecimento em vez de memorização | ⚠️ **Risco** - Mistura de pedidos próprios com oportunidades sem distinção visual, gerando confusão. |

---

## 5. Relatório de Defeitos e Soluções Propostas

Detalhamento técnico dos problemas encontrados e recomendações para correção imediata.

| ID | Descrição do Defeito | Severidade | Solução Técnica Recomendada |
|----|----------------------|------------|-----------------------------|
| **BUG-01** | **Duplicidade na Criação de Pedidos** | **Alta** | Implementar estado `isSubmitting` no formulário que aplica a propriedade `disabled` no botão de submit e exibe um *spinner* imediatamente após o clique. |
| **BUG-02** | **Falha na Validação de Upload (Qtd)** | **Alta** | Adicionar verificação no `onChange` do input de arquivo: `if (files.length > 5) { alert('Máx 5'); return; }`. Replicar validação no *Server Action*. |
| **BUG-03** | **Botão "Enviar Orçamento" Oculto** | **Crítica** | Debugar a lógica condicional de renderização do botão no componente do Card. Verificar se há conflito de IDs ou estados de usuário incorretos. |
| **BUG-04** | **Categorias Desconexas (Home vs Mural)** | Médio | Padronizar as constantes de categorias em um único arquivo de configuração (`constants.ts`) e usar essa fonte tanto na Home quanto no filtro do Mural. |
| **BUG-05** | **Ausência de Feedback Visual (Loading)** | Médio | Utilizar o hook `useFormStatus` (se usar Server Actions) ou estados locais de loading para renderizar componentes de feedback visual durante requisições. |
| **BUG-06** | **Contraste Insuficiente (Inputs)** | Baixo | Ajustar as classes CSS (Tailwind) dos inputs para garantir contraste mínimo (ex: mudar texto de `text-gray-400` para `text-gray-700` ou escurecer o fundo). |
| **ENH-01** | **Endereços Não Padronizados** | Melhoria | Substituir campos de texto livre por *Selects* dependentes (UF -> Cidade) ou integrar API de CEP para preenchimento automático, garantindo integridade da base. |

---

## 6. Conclusão

A avaliação de qualidade da Sprint atual evidenciou falhas que, embora tecnicamente corrigíveis, possuem alto impacto na percepção de valor e na confiança do usuário. A ausência de feedbacks visuais básicos e a quebra no fluxo principal de orçamento são impeditivos para um lançamento público.

**Próximos Passos Obrigatórios:**
1.  Priorizar a correção do **BUG-03 (Botão de Orçamento)** para desbloquear o fluxo de receita.
2.  Implementar a camada de feedback visual (**BUG-01 e BUG-05**) para evitar sujeira no banco de dados e melhorar a UX.
3.  Aplicar as validações de regra de negócio no upload de imagens (**BUG-02**).

Após essas correções, recomenda-se uma nova rodada de testes de regressão para validar as soluções.