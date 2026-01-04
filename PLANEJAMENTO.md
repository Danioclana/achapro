# Planejamento de Desenvolvimento - AchaPro

Este documento consolida o roteiro de implementação técnica do projeto **AchaPro**, integrando a visão do produto, requisitos e arquitetura definidos nos artefatos originais (Entregável 1 e 2).

---

## 1. Visão Geral do Projeto

**AchaPro** é um aplicativo de *marketplace* de serviços que conecta **Clientes** (que precisam de serviços) a **Prestadores** (que oferecem serviços).

**Missão:** Desenvolver um protótipo funcional (MVP) aplicando as melhores práticas de engenharia de software, garantindo qualidade, testes e documentação.

### Dinâmica Principal:
1.  **Cliente** posta uma tarefa (ex: "Consertar pia") com fotos e descrição.
2.  **Prestadores** visualizam a lista de tarefas disponíveis e enviam propostas de orçamento.
3.  **Cliente** recebe propostas e aceita uma delas.
4.  Um **Chat** é aberto entre as partes para combinar detalhes.
5.  Após a execução, o Cliente marca como "Concluído" e **avalia** o Prestador.

---

## 2. Arquitetura de Software (Baseado no DAS)

A solução adota uma arquitetura **Serverless e Modular**, focada em rapidez de desenvolvimento e manutenibilidade (NFR07).

*   **Frontend & BFF (Backend-for-Frontend):**
    *   **Tecnologia:** Next.js 16 (App Router).
    *   **Justificativa:** Renderização híbrida (SSR/Server Components) para garantir carregamento inicial rápido (< 2s, NFR01) e SEO.
    *   **Estilização:** Tailwind CSS.

*   **Gestão de Identidade (Auth):**
    *   **Tecnologia:** Clerk.
    *   **Justificativa:** Delega a complexidade de segurança (hashing, sessões, proteção de rotas), atendendo aos requisitos de segurança (NFR05 - Senhas Criptografadas) e reduzindo risco de erros de implementação.

*   **Backend & Banco de Dados (BaaS):**
    *   **Tecnologia:** Supabase (PostgreSQL).
    *   **ORM:** Prisma (Modelagem de Dados e Type Safety).
    *   **Persistência:** PostgreSQL para dados relacionais (Perfis, Tarefas, Propostas).
    *   **Storage:** Supabase Storage para armazenamento de imagens (Fotos de perfil e evidências de tarefas).

---

## 3. Requisitos do Sistema

### Requisitos Funcionais (O que o sistema faz)
*   **RF01 - Cadastro:** O sistema permite cadastro como "Cliente" ou "Prestador".
*   **RF02 - Perfil:** O Prestador pode criar/editar perfil com descrição e fotos.
*   **RF03 - Postar Tarefa:** Cliente posta nova tarefa com descrição, categoria e fotos.
*   **RF04 - Listar Tarefas:** Prestador visualiza lista de tarefas disponíveis.
*   **RF05 - Enviar Proposta:** Prestador envia proposta (valor/descrição) para uma tarefa.
*   **RF06 - Aceitar Proposta:** Cliente aceita ou recusa propostas recebidas.
*   **RF07 - Chat:** Chat disponibilizado entre as partes após o aceite da proposta.
*   **RF08 - Conclusão:** Cliente marca o serviço como "Concluído".
*   **RF09 - Avaliação:** Cliente avalia o Prestador (nota 1-5 e comentário).

### Requisitos Não Funcionais (Como o sistema se comporta)
*   **NFR01 (Desempenho):** Carregamento de telas principais < 2 segundos.
*   **NFR02 (Latência):** API respondendo 99% das requisições em < 500ms.
*   **NFR03 (Usabilidade):** Novo usuário posta serviço em < 3 min sem tutorial.
*   **NFR05 (Segurança):** Senhas criptografadas (gerido pelo Clerk).
*   **NFR06 (Segurança):** Comunicação via HTTPS.
*   **NFR07 (Manutenibilidade):** Código modular e limpo.

---

## 4. Roteiro de Implementação Detalhado (Épicos TSP)

O desenvolvimento segue a divisão de tarefas definida no Planejamento TSP da equipe.

### 🏁 Épico 1: Configuração do Ambiente e Arquitetura (Estimativa: 8 pts)
**Descrição:** Preparação da infraestrutura base, instalação de dependências e configuração dos serviços externos.
*   **Ações Técnicas:**
    *   Inicializar projeto Next.js com TypeScript e Tailwind.
    *   Instalar SDKs: `@clerk/nextjs`, `@supabase/supabase-js`.
    *   **Configuração do Prisma:**
        *   Instalar `prisma` e `@prisma/client`.
        *   Inicializar Prisma (`npx prisma init`).
        *   Definir `schema.prisma` com os modelos: `Profile`, `Task`, `Proposal`, `Match`, `Message`, `Review`.
        *   Executar migração inicial para o Supabase.
    *   Configurar variáveis de ambiente (`.env`) para conexão com Clerk, Supabase e Database URL (Prisma).
    *   Criar cliente Supabase Singleton (`src/lib/supabase.ts`) para Storage e Realtime.
    *   Criar um .env.example e atualizar o gitignore

### 👤 Épico 2: Módulo de Usuários (Estimativa: 13 pts)
**Foco:** RF01 (Cadastro) e RF02 (Perfil).
*   **Implementação:**
    *   **Auth Middleware:** Configurar proteção de rotas via Clerk Middleware.
    *   **Páginas de Auth:** Customizar telas de Login/Cadastro do Clerk.
    *   **Sincronização de Dados (Mitigação de Risco 2 - DAS):** Implementar **Webhooks do Clerk** (acionando uma API Route ou Edge Function no Next.js) para criar/atualizar o registro na tabela `profiles` do Supabase de forma assíncrona e segura, garantindo integridade dos dados.
    *   **Edição de Perfil:** Formulário para Prestadores adicionarem Bio e Foto de Perfil (Upload via Supabase Storage).

### 🛠️ Épico 3: Módulo de Serviços (Estimativa: 21 pts)
**Foco:** RF03 (Postar), RF04 (Listar). Este é o "coração" do app.
*   **Implementação:**
    *   **Criação de Tarefa (Cliente):** Tela com formulário multi-part.
    *   **Otimização de Upload (Mitigação de Risco 3 - DAS):** Implementar compressão/redimensionamento de imagens no **lado do cliente (Browser)** antes de enviar para o Supabase Storage, economizando banda e armazenamento.
    *   **Listagem (Prestador):** Feed de tarefas com cards resumidos. Implementar filtros simples (por categoria).
    *   **Detalhes:** Página dinâmica (`/tasks/[id]`) exibindo informações completas da tarefa.

### 🤝 Épico 4: Módulo de Propostas e Chat (Estimativa: 13 pts)
**Foco:** RF05, RF06 (Negociação) e RF07 (Chat).
*   **Implementação:**
    *   **Fluxo de Proposta:** Prestador envia valor e texto na tela de detalhes da tarefa.
    *   **Gestão (Cliente):** Cliente vê lista de propostas na sua tarefa e clica em "Aceitar".
    *   **Criação de Match:** Ao aceitar, sistema cria registro na tabela `matches` e libera o chat.
    *   **Chat Realtime:** Interface de chat usando `supabase.channel` para escutar novas mensagens na tabela `messages` sem precisar recarregar a página (Polling zero, conforme arquitetura).

### ⭐ Épico 5: Sistema de Avaliação (Estimativa: 8 pts)
**Foco:** RF08 (Conclusão) e RF09 (Avaliação).
*   **Implementação:**
    *   **Ação de Concluir:** Botão visível apenas para o Cliente dono da tarefa.
    *   **Feedback:** Modal solicitando Nota (1-5) e Comentário.
    *   **Persistência:** Salvar em `reviews` e atualizar reputação do prestador.

### 🧪 Épico 6: Qualidade e Testes (Contínuo)
**Foco:** Metas de Qualidade (Cobertura de Testes e Zero Bugs Críticos).
*   **Estratégia:**
    *   Testes Unitários (Jest/Vitest) para regras de negócio e componentes isolados.
    *   Code Reviews obrigatórios antes de merge (simulado via verificação de padrões).
    *   Verificação de Acessibilidade e Performance (Lighthouse) para garantir NFR01.