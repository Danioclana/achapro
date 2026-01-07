# Relatório de Bugs Corrigidos e Melhorias Técnicas

**Projeto:** AchaPro
**Data:** 07/01/2026
**Responsável:** Gemini Agent

Este documento detalha os bugs, defeitos e problemas técnicos encontrados durante o desenvolvimento e testes, bem como as soluções aplicadas (seja via código, configuração ou design).

---

## 1. Bugs de Infraestrutura e Configuração (Supabase)

### BUG-01: Erro de Permissão ao Upload de Imagens (Storage Policies)
*   **Sintoma:** Ao tentar criar uma tarefa com foto ou atualizar o avatar do perfil, o upload falhava silenciosamente ou retornava erro de permissão, resultando em cards sem imagem ou erros de console.
*   **Causa Raiz:** O bucket `tasks` e `avatars` no Supabase Storage não possuía políticas de segurança (RLS - Row Level Security) configuradas para permitir escrita por usuários autenticados e leitura pública.
*   **Solução (Configuração):**
    *   Acesso ao Dashboard do Supabase > Storage > Policies.
    *   Criação de Policy para **SELECT** (Leitura): Permitir acesso público (`public`) a todos os arquivos.
    *   Criação de Policy para **INSERT** (Escrita): Permitir upload apenas para usuários autenticados (`auth.role() = 'authenticated'`).

### BUG-02: Chat em Tempo Real Unilateral (Realtime Policies)
*   **Sintoma:** As mensagens enviadas no chat apareciam para quem enviou (devido à atualização otimista), mas não carregavam para o destinatário em tempo real.
*   **Causa Raiz:** As políticas RLS da tabela `messages` ou a configuração de Realtime não estavam propagando os eventos `INSERT` para o outro usuário participante do `matchId`.
*   **Solução (Configuração):**
    *   Ajuste nas Policies da tabela `messages` para garantir que ambos os usuários vinculados ao `match` (contratante e prestado) tenham permissão de `SELECT` nas mensagens.
    *   Verificação da inscrição no canal do Supabase Realtime no client-side.

---

## 2. Bugs de Código e Funcionalidade

### BUG-03: Mensagens Duplicadas no Chat (Deduplicação)
*   **Sintoma:** Ao enviar uma mensagem, ela aparecia duplicada na interface: uma vez instantaneamente (update otimista) e outra vez quando o evento do servidor chegava.
*   **Correção (Commit `e4bdc99`):**
    *   Implementação de lógica de **deduplicação** no `useEffect` de assinatura do Realtime.
    *   O código agora verifica se já existe uma mensagem com o mesmo conteúdo e remetente criada nos últimos 5 segundos (janela de tolerância) e, se sim, trata como a confirmação da mensagem otimista, evitando a duplicação visual.

### BUG-04: Mock do IntersectionObserver em Testes
*   **Sintoma:** Falha na execução dos testes de unidade de componentes de UI que dependem de lazy loading ou visibilidade.
*   **Correção:** Implementação de um Mock de Classe para `IntersectionObserver` no arquivo de setup global de testes (`vitest.setup.tsx`).

### BUG-05: Erro "Not Authorized" em Mocks do Prisma
*   **Sintoma:** Testes de integração falhavam ao tentar mockar chamadas de banco de dados em Server Actions.
*   **Correção:** Migração para Named Exports em `lib/prisma.ts` e configuração correta do mock global do Prisma Client no Vitest, garantindo que as chamadas sejam interceptadas sem tentar conexão real.

### BUG-06: Conflito de `revalidatePath` no Ambiente JSDOM
*   **Sintoma:** Erro ao executar testes que invocam Server Actions que utilizam revalidação de cache do Next.js.
*   **Correção:** Mock da função `revalidatePath` via `next/cache` no setup de testes.

### BUG-07: Vulnerabilidade de Segurança em Ações de Proposta
*   **Sintoma:** Durante a escrita dos testes de integração, identificou-se que não havia validação se o usuário logado era de fato o dono da tarefa ao aceitar uma proposta.
*   **Correção:** Adicionada cláusula `where: { id: taskId, clientId: userId }` na Server Action `acceptProposal`, garantindo que apenas o criador da tarefa possa fechar o negócio.

### BUG-08: Fluxo de Navegação Quebrado após Match
*   **Sintoma:** O usuário aceitava a proposta mas não recebia feedback visual imediato ou link para o chat.
*   **Correção (Commit `e4bdc99`):** Implementado redirecionamento automático (`redirect('/chat/...')`) logo após a criação do registro de Match no banco de dados.

### BUG-09: Erro de Mock no Next/Navigation (Static Generation Store)
*   **Sintoma:** Testes falhavam com erro `Invariant: static generation store missing` ao usar `useRouter` ou `redirect`.
*   **Correção:** Configuração de mocks globais para `next/navigation` no `vitest.setup.tsx`, simulando o comportamento de navegação sem exigir o contexto completo do servidor Next.js.

### BUG-10: Loop de Redirecionamento Infinito no Login (Middleware)
*   **Sintoma:** Ao tentar fazer login, o usuário era autenticado pelo Clerk mas entrava em um loop infinito de redirecionamentos entre a página de `sign-in` e a `home`.
*   **Causa Raiz:** O `middleware.ts` estava configurado com um `matcher` muito abrangente, interceptando as chamadas de callback do Clerk e tratando-as como rotas protegidas não autenticadas.
*   **Correção:** Ajuste na Regex do `matcher` do Middleware para excluir explicitamente rotas internas do Clerk e arquivos estáticos (`_next`, imagens).

### BUG-11: Falha Silenciosa ao Criar Tarefa com Orçamento Zero
*   **Sintoma:** Se o usuário definisse o orçamento como "0" (intencionalmente, para "A Combinar"), o formulário não era submetido e nenhum erro aparecia na tela.
*   **Causa Raiz:** Divergência de validação. O Schema Zod no servidor exigia `budget > 0` (positive), mas o front-end permitia 0. O erro retornado pela Server Action não estava sendo tratado/exibido no componente de formulário.
*   **Correção:** Ajuste no Schema Zod para permitir `min(0)` e implementação de um `toast` de erro genérico no `task-form.tsx` para capturar rejeições do servidor.

### BUG-12: Status "Em Aberto" Persistindo após Aceite (Cache Stale)
*   **Sintoma:** Imediatamente após aceitar uma proposta, o botão "Aceitar" continuava visível e a tarefa parecia ainda estar aberta até que o usuário recarregasse a página manualmente (F5).
*   **Causa Raiz:** A Server Action atualizava o banco de dados corretamente, mas o **Client Router Cache** do Next.js mantinha a versão cacheada da página da tarefa.
*   **Correção:** Reforço do `revalidatePath('/tasks/[id]')` na action e adição de uma chamada explicita a `router.refresh()` no callback de sucesso do front-end para garantir a invalidação imediata do cache do cliente.

---

## 3. Melhorias de Design e UX (Correções Visuais)

### UX-01: Chat Deslocado para Widget/Docked Window
*   **Problema Anterior:** O chat ocupava uma aba ou página inteira, dificultando a navegação enquanto se visualizava a proposta ou detalhes da tarefa.
*   **Melhoria (Commit `e4bdc99`):**
    *   Refatoração completa da UI do chat.
    *   Implementação de **Janelas Ancoradas (Docked Chat Windows)** na parte inferior da tela, permitindo conversar enquanto navega pelo site.
    *   Criação de um **Widget de Chat** global na barra de navegação/layout.

### UX-02: Feedback Visual de Upload
*   **Melhoria:** Adição de estados de carregamento (spinners e desabilitação de botões) durante o upload de imagens nos formulários de Tarefa e Perfil, prevenindo múltiplos envios e indicando progresso ao usuário.
