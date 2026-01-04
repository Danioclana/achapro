# Planejamento de Qualidade e Testes - AchaPro

Este documento detalha a estratégia de qualidade de software para o projeto AchaPro, visando garantir a robustez, confiabilidade e manutenibilidade da aplicação (NFR07), além de assegurar o cumprimento dos requisitos não funcionais de desempenho (NFR01, NFR02).

---

## 1. Estratégia de Testes (Pirâmide de Testes)

Adotaremos a estratégia da Pirâmide de Testes, priorizando uma base sólida de testes unitários rápidos, seguidos por testes de integração e uma camada seleta de testes E2E (Ponta-a-Ponta).

### 1.1. Nível 1: Testes Unitários (Base)
**Foco:** Validar a lógica de pequenas unidades de código isoladas (funções, hooks, componentes UI puros).
*   **Ferramentas:** Vitest (Runner rápido compatível com Vite/Next.js) + React Testing Library.
*   **Escopo:**
    *   **Utils/Helpers:** Funções de formatação de moeda, data, validação de inputs.
    *   **Hooks Personalizados:** Lógica de estado complexa separada da UI (ex: `useForm`, `useTaskFilters`).
    *   **Componentes UI (Atomic Design):** Botões, Inputs, Cards. Verificar renderização correta baseada em props e disparos de eventos (clicks).
*   **Meta:** Cobrir todos os "caminhos felizes" e tratamentos de erro básicos de funções utilitárias.

### 1.2. Nível 2: Testes de Integração (Meio)
**Foco:** Validar a comunicação entre componentes e módulos (ex: Componente + API + Banco de Dados simulado).
*   **Ferramentas:** Vitest + React Testing Library + MSW (Mock Service Worker) ou Mocks manuais do Prisma.
*   **Escopo:**
    *   **Fluxos de API:** Testar Handlers de API (`route.ts`) simulando chamadas ao banco de dados (mock do Prisma Client) para garantir que retornam os status HTTP e dados corretos (200, 400, 404, 500).
    *   **Componentes Conectados:** Testar formulários (Login, Postar Tarefa) verificando se a submissão chama a função de ação correta com os dados esperados.
    *   **Context/Providers:** Verificar se temas ou estados globais de autenticação estão sendo providos corretamente para a árvore de componentes.

### 1.3. Nível 3: Testes Ponta-a-Ponta (E2E - Topo)
**Foco:** Simular o comportamento do usuário real navegando na aplicação completa.
*   **Ferramentas:** Playwright (Recomendado para Next.js devido à velocidade e isolamento).
*   **Cenários Críticos (Smoke Tests):**
    1.  **Fluxo de Contratação:** Login (Cliente) -> Criar Tarefa -> Logout -> Login (Prestador) -> Enviar Proposta.
    2.  **Fluxo de Aceite:** Login (Cliente) -> Ver Proposta -> Aceitar -> Verificar Redirecionamento para Chat.
    3.  **Fluxo de Cadastro:** Registro de novo usuário e onboarding inicial.
*   **Ambiente:** Devem rodar contra um banco de dados de teste (reseta após cada execução) ou ambiente de Staging.

---

## 2. Métricas de Qualidade e Ferramentas

### 2.1. Análise Estática (Linting & Formatting)
Garantir padrão de código e evitar erros de sintaxe antes mesmo da execução.
*   **ESLint:** Configuração estrita (`next/core-web-vitals`) para prevenir anti-patterns do React/Next.js.
*   **Prettier:** Formatação automática para consistência visual.
*   **TypeScript:** Uso de tipagem estrita (`strict: true`) no `tsconfig.json` para evitar erros de tipo em tempo de execução (undefined is not a function).

### 2.2. Cobertura de Código (Code Coverage)
*   **Meta Inicial:** 70% de cobertura de statements em Utils e Services.
*   **Monitoramento:** Relatório gerado pelo Vitest (`vitest run --coverage`).

### 2.3. Performance e Acessibilidade (Lighthouse)
*   **Auditoria Automatizada:** Uso do Google Lighthouse (via DevTools ou CI).
*   **Metas (NFR01):**
    *   **Performance:** Score > 90 (LCP < 2.5s, CLS < 0.1).
    *   **Acessibilidade:** Score > 90 (Uso correto de tags ARIA, contraste de cores, alt text em imagens).
    *   **SEO:** Score > 90 (Meta tags, estrutura semântica HTML).

---

## 3. Plano de Execução dos Testes

### Fase 1: Setup (Durante Épico 1)
*   Instalar `vitest`, `@testing-library/react`, `@testing-library/dom`.
*   Configurar script `npm run test` e `npm run test:watch`.
*   Configurar mocks globais para `next/navigation` e `prisma`.

### Fase 2: Desenvolvimento TDD (Iterativo)
*   Ao criar uma **Server Action** complexa, criar primeiro o teste de unidade/integração para definir as entradas e saídas esperadas.
*   Ao criar um **Componente UI** reutilizável (ex: `TaskCard`), criar teste de snapshot ou renderização.

### Fase 3: Validação Final (Pré-Release)
*   Execução da suíte completa de testes.
*   Rodar build de produção (`npm run build`) para verificar erros de tipagem.
*   Teste manual exploratório focando em usabilidade (UX).

---

## 4. Gestão de Bugs
*   **Prioridade Alta:** Bugs que impedem fluxos críticos (Login, Postar Tarefa, Chat). Correção imediata.
*   **Prioridade Média:** Bugs visuais ou de validação que não impedem o uso, mas degradam a experiência.
*   **Prioridade Baixa:** Melhorias visuais menores ou casos de borda raros.
