# Planejamento Versão Final (Release Candidate) e Manual do Usuário

## Parte 1: Planejamento para Release Candidate (RC)

A versão *Release Candidate* (RC) é o estágio onde o software possui todas as funcionalidades previstas, sem bugs críticos conhecidos, pronto para ser validado em ambiente de produção (Staging).

### 1. Checklist de Funcionalidades (Scope Freeze)
*   [x] Módulo de Autenticação (Clerk) - **Pronto**
*   [x] Mural de Tarefas (CRUD) - **Pronto**
*   [x] Fluxo de Propostas e Match - **Pronto**
*   [x] Chat em Tempo Real - **Pronto**
*   [x] Sistema de Avaliação - **Pronto**
*   [x] Perfil Público - **Pronto**

### 2. Ciclo de Estabilização (Hardening)
*   **Code Freeze:** A partir de 05/01/2026. Nenhuma nova *feature* será adicionada. Apenas correções de bugs.
*   **Bateria de Testes Regressivos:** Executar suite completa (`npm run test` e `npx playwright test`) a cada commit.
*   **Auditoria de Segurança:** Revisar regras de RLS (Row Level Security) no Supabase e Middleware do Clerk.

### 3. Preparação para Deploy
1.  **Ambiente:** Configurar projeto na Vercel (Produção).
2.  **Banco de Dados:** Migrar Schema para banco de produção no Supabase.
3.  **Variáveis de Ambiente:** Configurar `NEXT_PUBLIC_...` seguras no painel da Vercel.
4.  **Smoke Test em Produção:** Executar roteiro `e2e/smoke.spec.ts` contra a URL de produção.

---

## Parte 2: Manual do Usuário - AchaPro

Bem-vindo ao AchaPro! Este guia ajudará você a navegar pela plataforma.

### 1. Para Clientes (Quem precisa de um serviço)

#### Como se Cadastrar
1.  Acesse a página inicial.
2.  Clique em **"Cadastrar"** no canto superior direito.
3.  Preencha seus dados ou use sua conta Google.

#### Como Pedir um Serviço
1.  No menu, clique em **"+ Pedir Serviço"**.
2.  Preencha o título (ex: "Limpeza de Piscina"), categoria e localização.
3.  Adicione fotos se necessário e clique em **"Criar Tarefa"**.
4.  Sua tarefa aparecerá no Mural para os prestadores.

#### Como Contratar
1.  Acesse sua tarefa criada.
2.  Veja a lista de **Propostas Recebidas**.
3.  Clique em **"Aceitar"** na proposta que mais lhe agradar.
4.  O sistema abrirá automaticamente o **Chat** para combinar os detalhes.

#### Finalizando
1.  Após o serviço feito, vá até a tarefa e clique em **"Concluir Serviço"**.
2.  Avalie o profissional com estrelas e um comentário.

---

### 2. Para Prestadores (Quem oferece serviços)

#### Como Encontrar Trabalho
1.  Acesse o **"Mural de Tarefas"** no menu superior.
2.  Navegue pelas tarefas disponíveis (use filtros se houver).
3.  Clique em uma tarefa para ver os detalhes.

#### Como Enviar Orçamento
1.  Dentro da tarefa, preencha o campo **"Valor"** e **"Descrição"** da sua proposta.
2.  Clique em **"Enviar Proposta"**.
3.  Aguarde o cliente aceitar.

#### Chat e Perfil
*   **Chat:** Suas conversas ativas ficam no menu "Chat" ou no ícone flutuante no canto inferior direito.
*   **Perfil:** Mantenha seu perfil atualizado com uma boa Bio e Foto para aumentar suas chances de ser contratado. Acesse clicando no seu avatar -> "Meu Perfil".

---

### 3. Suporte e Dúvidas
Caso encontre problemas (Bugs), entre em contato com o suporte técnico ou utilize a função de Feedback no rodapé da página.
