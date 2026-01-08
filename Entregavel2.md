Projeto: AchaPro  
Equipe: Filipe B; Lucas M; Joao C; Cleiton V; Daniela L.

1. Documento de Arquitetura de Software (DAS)

1.1. Visão Geral e Stack Tecnológica
A solução adota uma arquitetura Serverless e Modular focada na rapidez de desenvolvimento e escalabilidade horizontal. A aplicação será desenvolvida utilizando Next.js (React) como framework principal, cobrindo tanto o Frontend quanto a camada de API (Backend-for-Frontend). A infraestrutura de dados e serviços backend será provida pelo Supabase (BaaS - Backend as a Service), e a gestão de identidade será delegada ao Clerk.
Esta escolha técnica responde diretamente ao NFR07 (Manutenibilidade e Modularidade), reduzindo a complexidade de gerenciar servidores dedicados e permitindo que a equipe foque nas regras de negócio e na usabilidade exigida pelo NFR03.

1.2. Componentes da Arquitetura
Frontend e Camada de Aplicação (Next.js)
O cliente será uma aplicação web progressiva (PWA) ou responsiva construída com Next.js.
Renderização: Utilização de Server-Side Rendering (SSR) e React Server Components para garantir que o tempo de carregamento inicial (First Contentful Paint) respeite o limite de 2 segundos estabelecido no NFR01.
Roteamento e Proteção: O Middleware do Clerk será utilizado para proteger rotas privadas (ex: /propostas, /chat), garantindo que apenas usuários autenticados (Clientes ou Prestadores) acessem funcionalidades restritas.

Gerenciamento de Identidade e Segurança (Clerk) 
Para atender aos RF01 (Cadastro de Usuários) e NFR05 (Criptografia de Senhas):
O Clerk gerenciará todo o fluxo de autenticação, incluindo sessões, hashing de senhas e verificação de e-mail.
A aplicação não armazenará senhas no banco de dados principal. O vínculo entre o usuário logado e seus dados de negócio será feito através do User ID fornecido pelo Clerk, que servirá como chave estrangeira nas tabelas do Supabase.

Backend e Persistência (Supabase) 
O Supabase atuará como o núcleo de dados, substituindo um backend tradicional monolítico.
Banco de Dados (PostgreSQL): Armazenará os perfis (RF02), tarefas (RF03), propostas (RF05) e avaliações (RF09). A integridade referencial garantirá a consistência entre "Clientes" e "Prestadores".
Armazenamento de Arquivos (Storage): As fotos de perfil (RF02) e imagens das tarefas (RF03) serão armazenadas em buckets privados ou públicos no Supabase Storage. O banco de dados guardará apenas as URLs de referência.
Tempo Real (Realtime): Para viabilizar o chat entre Cliente e Prestador (RF07), utilizaremos o recurso de Realtime do PostgreSQL. O frontend "escutará" inserções na tabela de mensagens, atualizando a interface instantaneamente sem necessidade de polling, otimizando o tráfego.

1.3. Fluxos Críticos de Dados
Publicação de Tarefa (Cliente): O usuário envia os dados do formulário e imagens. O Next.js processa o upload para o Supabase Storage, recebe a URL e insere o registro da tarefa na tabela tasks do banco de dados via cliente Supabase autenticado.
Contratação e Chat: Ao aceitar uma proposta (RF06) o sistema cria uma "sala" (registro na tabela matches). A partir desse momento, as regras de segurança (Row Level Security - RLS) do Supabase permitem que ambos os usuários subscrevam às mensagens vinculadas àquela sala específica.

2. Relatório da Revisão de Design

2.1. Avaliação de Conformidade com Requisitos (GQM)
A revisão técnica analisou se as decisões arquiteturais suportam as metas de qualidade definidas:
Desempenho (Meta 2 / NFR01 e NFR02): A escolha do Next.js com SSR é adequada para manter o carregamento abaixo de 2 segundos. No entanto, a dependência de serviços externos (Supabase e Clerk) introduz latência de rede. Veredito: O uso de Edge Functions para lógicas críticas é recomendado para garantir que a resposta da API fique abaixo de 500ms (NFR02).
Segurança (NFR05 e NFR06): A delegação da autenticação para o Clerk elimina o risco de implementação incorreta de criptografia de senhas (NFR05). Toda a comunicação com Clerk e Supabase é forçada via HTTPS/TLS, atendendo integralmente ao NFR06.
Manutenibilidade (NFR07): A separação entre frontend (Next.js) e dados (Supabase) cria um desacoplamento claro. O uso de TypeScript (padrão no Next.js) reforça a qualidade do código e a detecção precoce de erros, alinhando-se à Métrica 2.1.1 (ausência de code smells graves).



2.2. Riscos Identificados e Mitigações
Durante a análise dos Requisitos Funcionais em relação à Stack, foram levantados os seguintes pontos de atenção:
Complexidade do Chat (RF07): Embora o Supabase Realtime facilite a implementação, a lógica de "quem pode falar com quem" deve ser rigorosamente controlada via Row Level Security (RLS) no banco de dados. Se as políticas de segurança falharem, um usuário poderá ler mensagens de outras negociações. Ação: Priorizar testes de segurança (Penetration Testing) especificamente nas tabelas de mensagens.
Consistência de Dados entre Clerk e Supabase: Existe o risco de um usuário ser criado no Clerk, mas a criação do perfil correspondente no Supabase falhar (ex: erro de rede). Isso quebraria o RF01 e RF02. Ação: Implementar Webhooks do Clerk que acionem uma Edge Function no Supabase para criar o registro do usuário no banco de dados de forma assíncrona e garantida, assegurando a integridade dos dados.
Escalabilidade de Uploads: O upload de múltiplas fotos de alta resolução para as tarefas (RF03) pode degradar a experiência do usuário móvel. Ação: Implementar redimensionamento de imagem no lado do cliente (browser) antes do envio para o Storage, economizando banda e armazenamento.

2.3. Parecer Final
A arquitetura proposta baseada na stack Next.js/Supabase/Clerk é Aprovada, pois oferece as ferramentas necessárias para cumprir o cronograma agressivo do MVP (Meta 3) e atende aos requisitos de qualidade. A equipe deve proceder com a configuração do ambiente e a implementação do "Módulo de Usuários" (Épico 2).

3. Relatório Qualidade

3.1. Resumo Executivo
Durante o desenvolvimento do MVP, implementamos uma estratégia completa de testes que cobriu todas as camadas da aplicação. Apesar de alguns problemas técnicos encontrados durante a execução dos testes, conseguimos identificar e corrigir todos os bugs antes da aprovação final. O sistema atingiu 100% de aprovação nos testes críticos automatizados e a cobertura ficou bem acima do planejado inicialmente.

Status Final: APROVADO para MVP

3.2. Análise de Requisitos e Riscos
Priorizamos os testes baseando-nos no risco de negócio e no impacto técnico de cada funcionalidade. A tabela abaixo mostra como cada requisito foi validado:

| ID | Descrição Resumida | Risco | Justificativa | Status Teste |
|----|-------------------|-------|---------------|--------------|
| RF01 | Cadastro de Usuários | Alto | Falha bloqueia acesso total. | ✅ E2E / Int |
| RF02 | Gestão de Perfil | Médio | Importante para conversão. | ✅ Int |
| RF03 | Postagem de Tarefas | Alto | Core business do marketplace. | ✅ Int / UI |
| RF04 | Listagem de Tarefas | Médio | Visibilidade para prestadores. | ✅ UI |
| RF05 | Envio de Propostas | Alto | Início da transação. | ✅ Int |
| RF06 | Aceite (Match) | Alto | Consolidação do contrato. | ✅ Int |
| RF07 | Chat em Tempo Real | Médio | Comunicação pós-match. | ❌ Falhou inicialmente - Correções: (BUG-02) Ajuste nas Policies da tabela messages e verificação da inscrição no canal do Supabase Realtime. (BUG-03) Implementação de lógica de deduplicação no useEffect de assinatura do Realtime (janela de tolerância de 5 segundos) para evitar mensagens duplicadas. |
| RF08 | Conclusão de Serviço | Baixo | Finalização do ciclo. | ✅ Int |
| RF09 | Avaliação | Baixo | Reputação. | ✅ Int |
| NFR | Segurança/Auth | Alto | Proteção de dados. | ✅ Int / E2E |

*Validado via testes de integração de API e E2E manuais.

3.3. Plano de Testes e Estratégia

3.3.1. Pirâmide de Testes
Seguimos a estratégia da pirâmide de testes para garantir velocidade e confiabilidade:
- Unitários (Base): Componentes UI (TaskCard) e Utilitários. Foco em renderização e lógica visual.
- Integração (Meio): Server Actions (actions.ts). Foco em regras de negócio, persistência (Prisma Mock) e segurança (Clerk Mock).
- End-to-End (Topo): Playwright. Foco na jornada do usuário e rotas públicas/protegidas.

3.3.2. Critérios de Aprovação (Exit Criteria)
- 100% dos testes de risco Alto aprovados.
- Zero defeitos bloqueantes.
- Testes de Integração cobrindo os principais fluxos de negócio (CRUD Tarefas, Propostas, Match).

3.4. Matriz de Rastreabilidade e Execução

3.4.1. Testes de Unidade (UI) - src/app/tasks/task-card.test.tsx
| ID | Cenário | Resultado Esperado | Status |
|----|---------|--------------------|--------|
| TC-UI-01 | Renderização Básica | Título, Categoria e Local visíveis. | ❌ Falhou inicialmente - Correção (BUG-04): Implementado Mock de Classe para IntersectionObserver no vitest.setup.tsx para permitir execução em ambiente JSDOM. |
| TC-UI-02 | Sem Imagem | Placeholder "Sem foto" exibido. | ❌ Falhou inicialmente - Correção (BUG-04): Implementado Mock de Classe para IntersectionObserver no vitest.setup.tsx para permitir execução em ambiente JSDOM. |
| TC-UI-03 | Com Imagem | Componente next/image renderizado. | ❌ Falhou inicialmente - Correção (BUG-04): Implementado Mock de Classe para IntersectionObserver no vitest.setup.tsx para permitir execução em ambiente JSDOM. |
| TC-UI-04 | Link | Navegação aponta para /tasks/[id]. | ❌ Falhou inicialmente - Correção (BUG-04): Implementado Mock de Classe para IntersectionObserver no vitest.setup.tsx para permitir execução em ambiente JSDOM. |

3.4.2. Testes de Integração (Backend) - src/app/tasks/actions.test.ts e profile/actions.test.ts
| ID | Cenário | Tipo | Resultado Esperado | Status |
|----|---------|------|--------------------|--------|
| TC-INT-01 | Criar Tarefa (Válida) | Positivo | Tarefa criada no DB com status OPEN. | ❌ Falhou inicialmente - Correções: (BUG-05) Migrado para Named Exports em lib/prisma.ts e mock global do Prisma Client. (BUG-11) Ajuste no Schema Zod para permitir min(0) no orçamento e implementação de toast de erro no formulário. (BUG-01) Configuração de políticas RLS no Supabase Storage para permitir upload de imagens de tarefas. |
| TC-INT-02 | Criar Tarefa (Inválida) | Negativo | Erro "Missing required fields". | ❌ Falhou inicialmente - Correção (BUG-05): Migrado para Named Exports em lib/prisma.ts e mock global do Prisma Client para interceptar chamadas sem tentar conexão real. |
| TC-INT-03 | Criar Tarefa (Sem Auth) | Negativo | Erro "Unauthorized". | ❌ Falhou inicialmente - Correção (BUG-05): Migrado para Named Exports em lib/prisma.ts e mock global do Prisma Client. |
| TC-INT-04 | Enviar Proposta | Positivo | Proposta salva vinculada à tarefa. | ❌ Falhou inicialmente - Correção (BUG-05): Migrado para Named Exports em lib/prisma.ts e mock global do Prisma Client. |
| TC-INT-05 | Enviar Proposta (Preço Inválido) | Negativo | Erro de validação ou exceção tratada. | ❌ Falhou inicialmente - Correção (BUG-05): Migrado para Named Exports em lib/prisma.ts e mock global do Prisma Client. |
| TC-INT-06 | Aceitar Proposta | Positivo | Match criado, status atualizados. | ❌ Falhou inicialmente - Correções: (BUG-05) Migrado para Named Exports em lib/prisma.ts e mock global. (BUG-06) Mock da função revalidatePath via next/cache no setup do Vitest. (BUG-08) Implementado redirecionamento automático (redirect('/chat/...')) após criação do Match. (BUG-09) Configuração de mocks globais para next/navigation no vitest.setup.tsx. (BUG-12) Reforço do revalidatePath('/tasks/[id]') na action e adição de router.refresh() no front-end para invalidar cache do cliente. |
| TC-INT-07 | Aceitar Proposta (Não Dono) | Negativo | Erro "Not authorized". | ❌ Falhou inicialmente - Correções: (BUG-05) Migrado para Named Exports em lib/prisma.ts e mock global. (BUG-07) Adicionada cláusula where: { id: taskId, clientId: userId } na Server Action acceptProposal, garantindo que apenas o criador da tarefa possa fechar o negócio. |
| TC-INT-08 | Concluir e Avaliar | Positivo | Tarefa COMPLETED, Review criada. | ❌ Falhou inicialmente - Correções: (BUG-05) Migrado para Named Exports em lib/prisma.ts e mock global. (BUG-06) Mock da função revalidatePath via next/cache no setup do Vitest. |
| TC-INT-09 | Concluir (Sem Permissão) | Negativo | Erro "Not authorized". | ❌ Falhou inicialmente - Correção (BUG-05): Migrado para Named Exports em lib/prisma.ts e mock global do Prisma Client. |
| TC-INT-10 | Atualizar Perfil | Positivo | Dados (Bio/Avatar) persistidos. | ❌ Falhou inicialmente - Correções: (BUG-05) Migrado para Named Exports em lib/prisma.ts e mock global. (BUG-01) Configuração de políticas RLS no Supabase Storage para permitir upload de avatares (SELECT público, INSERT apenas autenticados). |
| TC-INT-11 | Atualizar Perfil (Sem Auth) | Negativo | Erro "Unauthorized". | ❌ Falhou inicialmente - Correção (BUG-05): Migrado para Named Exports em lib/prisma.ts e mock global do Prisma Client. |

3.4.3. Testes E2E (Navegação) - e2e/full-flow.spec.ts
| ID | Cenário | Resultado Esperado | Status |
|----|---------|--------------------|--------|
| TC-E2E-01 | Acesso à Home | Carregamento da Marca e Navbar. | ✅ Passou |
| TC-E2E-02 | Proteção de Rota | Acesso a /tasks/new redireciona para Login. | ❌ Falhou inicialmente - Correção (BUG-10): Ajuste na Regex do matcher do Middleware para excluir explicitamente rotas internas do Clerk e arquivos estáticos (_next, imagens), evitando loop infinito de redirecionamentos. |
| TC-E2E-03 | Navegação Login | Clique em "Entrar" leva ao fluxo Clerk. | ❌ Falhou inicialmente - Correção (BUG-10): Ajuste na Regex do matcher do Middleware para excluir rotas internas do Clerk, permitindo fluxo de autenticação correto. |
| TC-E2E-04 | Tratamento 404 | URL inválida exibe página de erro padrão. | ✅ Passou |

3.5. Relatório de Defeitos e Soluções
Durante a execução dos testes, encontramos e corrigimos vários problemas técnicos. A tabela abaixo lista todos os bugs identificados e suas respectivas soluções:

| ID | Descrição do Defeito | Solução Técnica | Testes Afetados |
|----|----------------------|-----------------|-----------------|
| BUG-01 | Erro de Permissão ao Upload de Imagens (Storage Policies) | Configuração de políticas RLS no Supabase Storage (SELECT público, INSERT apenas autenticados). | TC-INT-01, TC-INT-10 |
| BUG-02 | Chat em Tempo Real Unilateral (Realtime Policies) | Ajuste nas Policies da tabela messages e verificação da inscrição no canal do Supabase Realtime. | RF07 (Manual) |
| BUG-03 | Mensagens Duplicadas no Chat (Deduplicação) | Implementação de lógica de deduplicação no useEffect de assinatura do Realtime (janela de tolerância de 5 segundos). | RF07 (Manual) |
| BUG-04 | Mock do IntersectionObserver falhando em testes UI. | Implementado Mock de Classe no vitest.setup.tsx. | TC-UI-01, TC-UI-02, TC-UI-03, TC-UI-04 |
| BUG-05 | Mock do Prisma ignorado em Server Actions ("Not Authorized"). | Migrado para Named Exports em lib/prisma.ts e mock global do Prisma Client. | TC-INT-01 até TC-INT-11 |
| BUG-06 | revalidatePath causando erro em ambiente de teste JSDOM. | Mock da função via next/cache no setup do Vitest. | TC-INT-06, TC-INT-08 |
| BUG-07 | Vulnerabilidade de Segurança em Ações de Proposta | Adicionada cláusula where: { id: taskId, clientId: userId } na Server Action acceptProposal. | TC-INT-07 |
| BUG-08 | Fluxo de Navegação Quebrado após Match | Implementado redirecionamento automático (redirect('/chat/...')) após criação do Match. | TC-INT-06 |
| BUG-09 | Erro de Mock no Next/Navigation (Static Generation Store) | Configuração de mocks globais para next/navigation no vitest.setup.tsx. | TC-INT-06, TC-E2E |
| BUG-10 | Loop de Redirecionamento Infinito no Login (Middleware) | Ajuste na Regex do matcher do Middleware para excluir rotas internas do Clerk e arquivos estáticos. | TC-E2E-02, TC-E2E-03 |
| BUG-11 | Falha Silenciosa ao Criar Tarefa com Orçamento Zero | Ajuste no Schema Zod para permitir min(0) e implementação de toast de erro genérico no task-form.tsx. | TC-INT-01 |
| BUG-12 | Status "Em Aberto" Persistindo após Aceite (Cache Stale) | Reforço do revalidatePath('/tasks/[id]') na action e adição de router.refresh() no callback de sucesso do front-end. | TC-INT-06 |

3.6. Conclusão
O ambiente de testes do AchaPro está maduro e cobre as camadas essenciais da aplicação. A infraestrutura de Mocking para Server Actions provou-se eficaz para testar lógica de negócio complexa sem depender de um banco de dados real, garantindo velocidade no pipeline de CI/CD. Os testes E2E garantem a sanidade das rotas principais.

Recomendações Futuras:
- Implementar testes visuais (Snapshot Testing) para componentes críticos.
- Configurar ambiente de CI (GitHub Actions) para rodar o Playwright automaticamente.

link para o projeto no repositorio: https://github.com/Danioclana/achapro