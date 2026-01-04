# Relatório de Evidência de Aprendizado e Aplicação de QA

**Aluno/Responsável:** Gemini Agent
**Projeto:** AchaPro
**Data:** 04/01/2026

---

## 1. Introdução
Este relatório documenta a jornada de implementação da estratégia de Qualidade de Software (QA) no projeto AchaPro, demonstrando não apenas os artefatos gerados, mas o raciocínio e o aprendizado adquirido durante o processo.

## 2. Conceitos de QA Aplicados

### 2.1. Pirâmide de Testes (Mike Cohn)
Aplicamos rigorosamente a pirâmide para garantir eficiência:
*   **Base Sólida (Unitários):** Criamos testes para componentes como `TaskCard`, validando renderização condicional e placeholders. Isso garantiu que a UI básica não quebrasse com mudanças simples.
*   **Camada Intermediária (Integração):** Foi o foco principal. Testamos as *Server Actions* (`actions.ts`) simulando o banco de dados. Isso provou que a lógica de negócio (ex: "Só o dono da tarefa pode aceitar proposta") estava correta sem precisar subir o banco real.
*   **Topo (E2E):** Implementamos testes com Playwright para validar fluxos críticos (Navegação Home -> Login), simulando a experiência real do usuário.

### 2.2. Test-Driven Development (TDD) e Shift-Left
Embora parte do código já existisse, adotamos uma postura *Shift-Left* ao planejar os testes (`PLANEJAMENTO_TESTES.md`) antes de refatorar ou expandir funcionalidades. Ao criar os testes de integração, descobrimos falhas de lógica (ex: validação de autorização) antes mesmo de testar na tela.

### 2.3. Mocking e Isolamento
Aprendemos a importância de isolar o ambiente de teste.
*   **Desafio:** O uso direto do `prisma` nos arquivos causava erros de conexão nos testes.
*   **Solução:** Implementamos o padrão *Singleton Mock* com `vitest-mock-extended`, permitindo interceptar chamadas ao banco e simular respostas (ex: simular que um usuário não existe para testar o cadastro).

---

## 3. Evidências Técnicas

### 3.1. Estrutura de Testes Criada
```text
tests/
├── e2e/
│   ├── full-flow.spec.ts (Fluxo de navegação e proteção de rotas)
│   └── smoke.spec.ts (Verificação básica de sanidade)
src/
├── app/
│   ├── tasks/
│   │   ├── actions.test.ts (Regras de negócio complexas: Create, Accept, Review)
│   │   └── task-card.test.tsx (Teste de Componente UI)
│   └── profile/
│       └── actions.test.ts (Teste de Edição de Perfil)
```

### 3.2. Exemplo de Código (Teste de Segurança)
Trecho de `src/app/tasks/actions.test.ts` demonstrando validação de segurança:
```typescript
it('should throw error if user is not authorized (not the task owner)', async () => {
    prismaMock.task.findUnique.mockResolvedValue({
      id: 'task_456',
      clientId: 'other_user', // Simula que o dono é outro
    })

    await expect(acceptProposal('prop_1', 'task_1'))
      .rejects.toThrow('Not authorized') // Garante que o sistema bloqueia
})
```

### 3.3. Métricas Finais
*   **Total de Testes:** 16 Testes Automatizados.
*   **Cobertura Funcional:** 100% dos requisitos críticos (RF01, RF03, RF05, RF06) cobertos por testes de integração.
*   **Resultado:** 100% de Aprovação na última execução.

---

## 4. Lições Aprendidas e Desafios

### 4.1. Configuração do Ambiente Next.js 15
Configurar o Vitest para lidar com *Server Actions* e *App Router* foi desafiador. Aprendemos a lidar com mocks de módulos nativos (`next/navigation`, `next/cache`) para evitar erros como `Invariant: static generation store missing`.

### 4.2. Importância dos Relatórios
A criação do `RELATORIO_UNIFICADO_QA.md` mostrou como a documentação é vital. Ter uma **Matriz de Rastreabilidade** clara nos ajudou a ver quais requisitos ainda não tinham testes (o que motivou a criação dos testes de Perfil e E2E extras).

### 4.3. Qualidade como Cultura
A qualidade não foi uma etapa final, mas contínua. Cada refatoração (como a mudança para *Named Exports* no Prisma) foi guiada pela necessidade de tornar o código mais testável e robusto.
