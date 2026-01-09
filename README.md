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
- [x] **RF01:** Cadastro de Usuários (Cliente/Prestador).
- [x] **RF02:** Gestão de Perfil de Prestador (Bio, Fotos).
- [x] **RF03:** Publicação de Tarefas pelo Cliente.
- [x] **RF04:** Listagem de Tarefas disponíveis para Prestadores.
- [x] **RF05:** Envio de Propostas de orçamento.
- [x] **RF06:** Aceite/Recusa de propostas.
- [x] **RF07:** Chat em Tempo Real (pós-contratação).
- [x] **RF08:** Marcação de serviço como Concluído.
- [x] **RF09:** Sistema de Avaliação (Rating & Review).
- [x] **RF10:** Perfil Público do Prestador com histórico e avaliações.

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

## 📖 Manual do Usuário - AchaPro

Bem-vindo ao **AchaPro**! Este manual completo descreve todas as funcionalidades disponíveis e como utilizá-las.

### 🎯 Visão Geral da Plataforma

O AchaPro é um marketplace de serviços que conecta **Clientes** (pessoas que precisam de serviços) a **Prestadores** (profissionais que oferecem serviços). A plataforma permite que clientes publiquem tarefas, recebam propostas de orçamento, contratem profissionais e avaliem o serviço prestado.

### 🔐 Autenticação e Cadastro

#### Como se Cadastrar

1. **Acesse a página inicial** (`/`)
2. **Clique em "Cadastrar"** no canto superior direito da barra de navegação
3. **Escolha uma opção:**
   - Preencha seus dados (nome, e-mail, senha)
   - Ou use sua conta Google para cadastro rápido
4. **Após o cadastro**, você será redirecionado para a página inicial

#### Como Fazer Login

1. **Clique em "Entrar"** na barra de navegação
2. **Digite suas credenciais** ou use o login social
3. Você será autenticado automaticamente e redirecionado

**Nota:** O sistema utiliza Clerk para autenticação, garantindo segurança e criptografia de senhas.

---

## 👤 Para Clientes (Quem Precisa de Serviços)

### 📝 Como Publicar uma Tarefa

1. **Faça login** na plataforma
2. **Clique em "+ Pedir Serviço"** na barra de navegação (ou no botão da página inicial)
3. **Preencha o formulário:**
   - **Título:** Descreva brevemente o serviço (ex: "Limpeza de Piscina", "Conserto de Torneira")
   - **Categoria:** Selecione uma das categorias disponíveis:
     - Manutenção Doméstica
     - Limpeza
     - Tecnologia
     - Aulas
     - Beleza e Estética
     - Transporte
     - Outros
   - **Descrição:** Detalhe o que precisa ser feito, especificações, urgência, etc.
   - **Localização:** Informe o endereço ou região onde o serviço será realizado
   - **Orçamento Estimado:** (Opcional) Informe um valor aproximado ou deixe "0" para "A Combinar"
   - **Fotos:** Adicione até múltiplas imagens para ilustrar o serviço necessário
4. **Clique em "Criar Tarefa"**
5. Sua tarefa será publicada no **Mural de Tarefas** e ficará visível para todos os prestadores

### 📋 Visualizar e Gerenciar Suas Tarefas

#### Ver Detalhes de uma Tarefa

1. **Acesse o Mural de Tarefas** (`/tasks`) ou clique em uma tarefa na lista
2. A página de detalhes mostra:
   - Informações completas da tarefa
   - Fotos adicionadas
   - Status atual (Aberto, Em Andamento, Concluído)
   - Lista de propostas recebidas (se você for o dono)

#### Gerenciar Propostas Recebidas

1. **Acesse a página de detalhes da sua tarefa**
2. **Visualize todas as propostas** na seção "Propostas Recebidas"
3. Cada proposta mostra:
   - Nome e foto do prestador
   - Valor proposto
   - Descrição da proposta
   - Data de envio
4. **Para aceitar uma proposta:**
   - Clique no botão **"Aceitar"** na proposta desejada
   - O sistema criará automaticamente um **Match** (contrato)
   - Você será redirecionado para o **Chat** com o prestador
   - A tarefa mudará de status para "Em Andamento"

### 💬 Sistema de Chat

#### Acessar o Chat

Após aceitar uma proposta, você pode acessar o chat de várias formas:

1. **Redirecionamento automático** após aceitar uma proposta
2. **Menu de Chat:** Clique em "Chat" na barra de navegação (ícone de mensagem)
3. **Lista de Conversas:** Acesse `/chat` para ver todas suas conversas ativas
4. **Widget de Chat:** No canto inferior direito da tela (janelas ancoradas)

#### Usar o Chat

- **Enviar mensagens:** Digite no campo de texto e pressione Enter ou clique em "Enviar"
- **Visualizar histórico:** Todas as mensagens anteriores são carregadas automaticamente
- **Tempo real:** As mensagens aparecem instantaneamente para ambos os participantes
- **Múltiplas conversas:** Você pode ter várias conversas abertas simultaneamente

### ✅ Finalizar e Avaliar um Serviço

1. **Após o serviço ser concluído**, acesse a página de detalhes da tarefa
2. **Clique em "Concluir Serviço"** (botão visível apenas quando a tarefa está "Em Andamento")
3. **Preencha a avaliação:**
   - **Nota:** Selecione de 1 a 5 estrelas
   - **Comentário:** (Opcional) Escreva um feedback sobre o serviço
4. **Clique em "Finalizar"**
5. A tarefa mudará para status **"Concluído"** e a avaliação será publicada no perfil do prestador

---

## 🛠️ Para Prestadores (Profissionais que Oferecem Serviços)

### 🔍 Como Encontrar Oportunidades

1. **Acesse o Mural de Tarefas** (`/tasks`) no menu superior
2. **Navegue pelas tarefas disponíveis:**
   - Use os **filtros por categoria** no topo da página
   - Clique em uma tarefa para ver detalhes completos
3. **Visualize informações importantes:**
   - Descrição detalhada
   - Fotos do serviço
   - Localização
   - Status (apenas tarefas "Abertas" aceitam propostas)

### 💰 Como Enviar uma Proposta

1. **Acesse a página de detalhes de uma tarefa** que você deseja realizar
2. **Preencha o formulário de proposta:**
   - **Valor:** Informe o preço do seu serviço
   - **Descrição:** Explique como você realizará o serviço, experiência, prazo, etc.
3. **Clique em "Enviar Proposta"**
4. **Aguarde a resposta do cliente:**
   - Você receberá uma notificação quando o cliente aceitar sua proposta
   - O chat será aberto automaticamente após o aceite

### 👤 Gerenciar Seu Perfil

#### Editar Perfil

1. **Acesse seu perfil:** Clique no seu avatar no canto superior direito → "Meu Perfil"
2. **Edite as informações:**
   - **Biografia:** Escreva sobre você, sua experiência, especialidades
   - **Foto de Perfil:** Faça upload de uma foto profissional
3. **Salve as alterações**

**Dica:** Um perfil completo e profissional aumenta suas chances de ser contratado!

#### Visualizar Perfil Público

1. **Acesse qualquer perfil público** através do link `/profile/[id]`
2. O perfil público mostra:
   - Foto e biografia
   - **Avaliação média** (estrelas) e número de avaliações
   - **Portfólio de trabalhos** (fotos de tarefas concluídas)
   - **Histórico de avaliações** com comentários de clientes
   - **Estatísticas:** Tarefas concluídas, taxa de resposta

### 💬 Chat com Clientes

Após ter uma proposta aceita:

1. **Acesse o chat** através do menu ou widget flutuante
2. **Comunique-se com o cliente** para:
   - Combinar detalhes do serviço
   - Agendar data e horário
   - Esclarecer dúvidas
   - Enviar atualizações do progresso

### 📊 Acompanhar Seu Desempenho

- **Avaliações recebidas:** Visíveis no seu perfil público
- **Tarefas concluídas:** Contador no perfil
- **Reputação:** Baseada na média de estrelas recebidas

---

## 🗺️ Caminhos do Usuário (User Flows)

### Fluxo Completo: Cliente Contratando um Serviço

```
1. Cadastro/Login
   ↓
2. Publicar Tarefa (/tasks/new)
   ↓
3. Aguardar Propostas
   ↓
4. Visualizar Propostas na página da tarefa
   ↓
5. Aceitar uma Proposta
   ↓
6. Chat automático aberto (/chat/[matchId])
   ↓
7. Combinar detalhes via chat
   ↓
8. Serviço realizado
   ↓
9. Marcar como Concluído (/tasks/[id])
   ↓
10. Avaliar o prestador
```

### Fluxo Completo: Prestador Realizando um Serviço

```
1. Cadastro/Login
   ↓
2. Editar Perfil (/profile) - Adicionar bio e foto
   ↓
3. Buscar Tarefas (/tasks)
   ↓
4. Visualizar Detalhes de uma Tarefa (/tasks/[id])
   ↓
5. Enviar Proposta
   ↓
6. Aguardar Aceite
   ↓
7. Chat automático aberto após aceite
   ↓
8. Realizar o Serviço
   ↓
9. Cliente marca como Concluído
   ↓
10. Receber Avaliação (visível no perfil público)
```

### Fluxo de Navegação Rápida

- **Página Inicial (`/`):** Landing page com informações e CTAs
- **Mural de Tarefas (`/tasks`):** Lista todas as tarefas abertas
- **Criar Tarefa (`/tasks/new`):** Formulário para publicar nova tarefa
- **Detalhes da Tarefa (`/tasks/[id]`):** Visualização completa e gestão de propostas
- **Chat (`/chat`):** Lista de conversas ativas
- **Chat Individual (`/chat/[matchId]`):** Conversa específica
- **Meu Perfil (`/profile`):** Edição do próprio perfil
- **Perfil Público (`/profile/[id]`):** Visualização de perfil de outro usuário

---

## 🎨 Funcionalidades e Recursos

### ✅ Funcionalidades Implementadas

#### Autenticação e Segurança
- ✅ Cadastro e login via Clerk
- ✅ Autenticação social (Google)
- ✅ Proteção de rotas via Middleware
- ✅ Senhas criptografadas
- ✅ Sessões seguras

#### Gestão de Tarefas
- ✅ Criação de tarefas com múltiplas fotos
- ✅ Categorização de serviços
- ✅ Filtros por categoria
- ✅ Status de tarefas (Aberto, Em Andamento, Concluído)
- ✅ Upload de imagens otimizado (compressão no cliente)

#### Sistema de Propostas
- ✅ Envio de propostas com valor e descrição
- ✅ Listagem de propostas recebidas
- ✅ Aceite de propostas (criação de Match)
- ✅ Validação de autorização (apenas dono pode aceitar)

#### Chat em Tempo Real
- ✅ Chat instantâneo via Supabase Realtime
- ✅ Múltiplas conversas simultâneas
- ✅ Interface de chat ancorada (docked windows)
- ✅ Widget de chat global
- ✅ Histórico de mensagens
- ✅ Deduplicação de mensagens

#### Sistema de Avaliação
- ✅ Avaliação com estrelas (1-5)
- ✅ Comentários opcionais
- ✅ Cálculo de média de avaliações
- ✅ Exibição no perfil público

#### Perfis de Usuário
- ✅ Perfil editável (bio, foto)
- ✅ Perfil público com portfólio
- ✅ Histórico de trabalhos concluídos
- ✅ Exibição de avaliações recebidas
- ✅ Estatísticas do prestador

### 🔄 Status das Tarefas

- **OPEN (Aberto):** Tarefa publicada, aceitando propostas
- **IN_PROGRESS (Em Andamento):** Proposta aceita, serviço em execução
- **COMPLETED (Concluído):** Serviço finalizado e avaliado
- **CANCELLED (Cancelado):** Tarefa cancelada (não implementado na UI atual)

---

## 🚨 Limitações Conhecidas e Comportamentos

### Limitações Atuais (MVP)

1. **Sem notificações push:** As notificações de novas propostas ou mensagens não são enviadas automaticamente
2. **Sem busca textual:** A busca por palavras-chave nas tarefas não está disponível
3. **Sem pagamento integrado:** O pagamento é combinado diretamente entre cliente e prestador
4. **Sem sistema de denúncias:** Não há funcionalidade para reportar problemas
5. **Sem edição de tarefas:** Tarefas publicadas não podem ser editadas (apenas visualizadas)

### Comportamentos Importantes

- **Uma tarefa = Uma proposta aceita:** Após aceitar uma proposta, a tarefa não aceita mais propostas
- **Chat só após Match:** O chat só fica disponível após uma proposta ser aceita
- **Avaliação única:** Cada tarefa concluída pode receber apenas uma avaliação
- **Perfil público:** Todos os perfis são públicos e acessíveis via URL

---

## 🆘 Suporte e Dúvidas

### Problemas Comuns

**Não consigo fazer upload de fotos:**
- Verifique se você está logado
- Certifique-se de que as imagens estão em formato JPG, PNG ou WebP
- Tente reduzir o tamanho das imagens

**Chat não está funcionando:**
- Verifique sua conexão com a internet
- Recarregue a página
- Certifique-se de que a proposta foi aceita

**Não recebo propostas:**
- Verifique se sua tarefa está com status "Aberto"
- Certifique-se de que a descrição está clara e completa
- Adicione fotos para aumentar o interesse

### Contato

Para suporte técnico ou reportar bugs, entre em contato com a equipe de desenvolvimento através dos canais oficiais do projeto.

---

## 📊 Status do Projeto

**Versão:** Release Candidate (RC)  
**Data:** Janeiro 2026  
**Status:** ✅ Todas as funcionalidades principais implementadas e testadas

O AchaPro está pronto para uso como MVP, com todas as funcionalidades core implementadas e testadas. A plataforma passou por um ciclo completo de testes automatizados (Unitários, Integração e E2E) e está estável para uso.

---

**Equipe:** Filipe B (PO), Lucas M (Dev Sr), João C (Dev Pl), Daniela L (Dev Pl), Cleiton V (QA).