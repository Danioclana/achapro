# Proposta de Melhoria de Processo - Ciclo Futuro

**Projeto:** AchaPro
**Ciclo Atual:** MVP / QA Implementation
**Data:** 04/01/2026

---

## 1. Objetivo
Com base na retrospectiva do ciclo de desenvolvimento atual, esta proposta visa otimizar a qualidade, a velocidade de entrega e a confiabilidade do software para os próximos ciclos (V1.0 e V2.0).

---

## 2. Diagnóstico do Ciclo Atual (O que funcionou e o que não funcionou)

### Pontos Fortes
*   **Estratégia de Testes:** A adoção da pirâmide de testes garantiu uma base sólida sem gastar tempo excessivo em testes manuais repetitivos.
*   **Server Actions:** A arquitetura facilitou o teste de integração sem necessidade de subir APIs REST complexas.

### Pontos de Atenção (Gargalos)
*   **Configuração Manual:** A configuração inicial do ambiente de testes (Mocks, Vitest) consumiu cerca de 30% do tempo do ciclo.
*   **Dados de Teste:** A falta de um "Seeder" (gerador de dados falsos) dificultou os testes E2E, obrigando a testes mais superficiais de navegação em vez de fluxos completos de dados reais.
*   **CI/CD Inexistente:** Os testes foram rodados manualmente (`npm run test`), dependendo da disciplina do desenvolvedor.

---

## 3. Plano de Ação (Melhorias Propostas)

### 3.1. Curto Prazo (Próxima Sprint)

#### A. Automação de CI (GitHub Actions)
Implementar um pipeline de Integração Contínua que bloqueie *Pull Requests* se os testes falharem.
*   **Ação:** Criar `.github/workflows/ci.yml`.
*   **Steps:** Checkout -> Install Deps -> Lint -> Build -> Unit Tests -> E2E (Headless).
*   **Benefício:** Impede que código quebrado chegue à branch `main` (Zero Regressão).

#### B. Padronização de Code Review
Criar um *Template de Pull Request* exigindo evidência de testes.
*   **Checklist:** "Criei testes para a nova feature?", "Rodei a suite completa?", "Atualizei a documentação?".

### 3.2. Médio Prazo (Versão 1.0)

#### C. Testes Visuais (Snapshot Testing)
Utilizar o Playwright ou Chromatic para detectar regressões visuais (ex: um botão que mudou de cor ou quebrou o layout móvel acidentalmente).
*   **Ferramenta:** Playwright Screenshots comparison.

#### D. Database Seeding para E2E
Criar scripts que populam o banco de teste com dados determinísticos (Usuário "Teste", Tarefa "Teste") antes da execução do Playwright.
*   **Benefício:** Permitirá testar fluxos complexos (Login -> Aceitar Proposta) no E2E automaticamente.

### 3.3. Longo Prazo (Escala)

#### E. Monitoramento Sintético
Implementar testes que rodam em produção a cada 1 hora (ex: verificar se a Home está carregando e se o Login funciona) para alertar o time antes dos usuários reclamarem.

---

## 4. Metas de Qualidade para o Próximo Ciclo

1.  **Cobertura de Código:** Atingir > 80% em `src/lib` e `src/app`.
2.  **Tempo de Pipeline:** Garantir que todos os testes rodem em menos de 5 minutos no CI.
3.  **Bugs em Produção:** Manter média de < 1 bug crítico por release.
