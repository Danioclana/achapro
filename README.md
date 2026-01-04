# AchaPro - Marketplace de Serviços

O **AchaPro** é uma plataforma que conecta clientes a prestadores de serviços de forma rápida e segura. Este projeto é um MVP (Produto Mínimo Viável) desenvolvido como parte do trabalho de Garantia de Qualidade de Software, focado na aplicação de processos rigorosos de engenharia (Scrum, TSP) e arquitetura moderna.

## 🎯 Objetivo
Desenvolver um protótipo funcional que permita:
1.  **Clientes:** Postar tarefas, receber propostas, contratar prestadores e avaliar o serviço.
2.  **Prestadores:** Encontrar oportunidades de trabalho, enviar orçamentos e negociar via chat.

## 🛠️ Stack Tecnológica & Arquitetura

O projeto segue uma arquitetura **Serverless e Modular** definida no Documento de Arquitetura de Software (DAS):

*   **Frontend:** [Next.js 16](https://nextjs.org/) (App Router, React Server Components).
*   **Estilização:** [Tailwind CSS](https://tailwindcss.com/).
*   **Autenticação:** [Clerk](https://clerk.com/) (Gestão de Identidade e Segurança).
*   **Backend & Banco de Dados:** [Supabase](https://supabase.com/) (PostgreSQL, Storage, Realtime).
*   **ORM:** [Prisma](https://www.prisma.io/) (Modelagem de Dados).
*   **Linguagem:** TypeScript.

## 📋 Requisitos do Sistema

### Funcionais (Core Features)
- [ ] **RF01:** Cadastro de Usuários (Cliente/Prestador).
- [ ] **RF02:** Gestão de Perfil de Prestador (Bio, Fotos).
- [ ] **RF03:** Publicação de Tarefas pelo Cliente.
- [ ] **RF04:** Listagem de Tarefas disponíveis para Prestadores.
- [ ] **RF05:** Envio de Propostas de orçamento.
- [ ] **RF06:** Aceite/Recusa de propostas.
- [ ] **RF07:** Chat em Tempo Real (pós-contratação).
- [ ] **RF08:** Marcação de serviço como Concluído.
- [ ] **RF09:** Sistema de Avaliação (Rating & Review).

### Não Funcionais (Qualidade)
- **Performance:** Carregamento inicial < 2s.
- **Segurança:** Senhas criptografadas e comunicação HTTPS.
- **Usabilidade:** Fluxo de postagem intuitivo (< 3 min).

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js 18+
- Conta no Clerk (para chaves de API)
- Conta no Supabase (para URL e Anon Key)

### Instalação

1.  Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/achapro.git
    cd achapro
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  Configure as variáveis de ambiente:
    Crie um arquivo `.env.local` na raiz e adicione:
    ```env
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
    CLERK_SECRET_KEY=sk_test_...
    NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=...
    DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:6543/postgres?pgbouncer=true"
    DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
    ```

4.  Execute o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

5.  Acesse `http://localhost:3000`.

## 📂 Estrutura do Projeto

```
src/
├── app/            # Rotas e Páginas (Next.js App Router)
├── components/     # Componentes React Reutilizáveis
├── lib/            # Configurações de infra (Supabase, Utils)
├── types/          # Definições de Tipos TypeScript
└── middleware.ts   # Proteção de rotas (Clerk)
```

---
**Equipe:** Filipe B (PO), Lucas M (Dev Sr), João C (Dev Pl), Daniela L (Dev Pl), Cleiton V (QA).