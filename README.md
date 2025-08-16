# 🏥 Agendix - Sistema de Gestão Multitenant para Clínicas

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Chakra UI](https://img.shields.io/badge/Chakra%20UI-2.10.9-purple.svg)](https://chakra-ui.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12.0.0-orange.svg)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-7.0.4-yellow.svg)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Vitest-1.3.1-green.svg)](https://vitest.dev/)

> **Sistema completo de gestão multitenant para clínicas e consultórios médicos, com isolamento de dados, sistema de permissões e gestão de usuários.**

## 📋 Índice

- [🎯 Visão Geral](#-visão-geral)
- [✨ Funcionalidades](#-funcionalidades)
- [🏗️ Arquitetura](#️-arquitetura)
- [🛠️ Tecnologias](#️-tecnologias)
- [🚀 Instalação](#-instalação)
- [⚙️ Configuração](#️-configuração)
- [📱 Módulos](#-módulos)
- [🔧 Desenvolvimento](#-desenvolvimento)
- [📊 Estrutura do Projeto](#-estrutura-do-projeto)
- [🎨 Interface](#-interface)
- [🔒 Segurança](#-segurança)
- [📈 Performance](#-performance)
- [🤝 Contribuição](#-contribuição)
- [📄 Licença](#-licença)

## 🎯 Visão Geral

O **Agendix** é um sistema web moderno desenvolvido para clínicas e consultórios médicos, oferecendo uma solução completa de gestão multitenant com foco em:

- **Sistema Multitenant**: Isolamento completo de dados por empresa/clínica
- **Gestão de Usuários**: Sistema de roles e permissões granulares
- **Gestão de Clientes**: Cadastro completo com informações pessoais, filhos e necessidades especiais
- **Sistema de Agendamentos**: Agendamento inteligente com controle de horários e profissionais
- **Dashboard Analítico**: Estatísticas em tempo real sobre clientes e agendamentos
- **Interface Responsiva**: Funciona perfeitamente em desktop e mobile
- **Autenticação Segura**: Sistema de login com Firebase Auth
- **Cloud Functions**: Operações administrativas seguras no backend

## ✨ Funcionalidades

### 🏢 **Sistema Multitenant**
- ✅ **Gestão de Tenants**: Criação e administração de empresas/clínicas
- ✅ **Isolamento de Dados**: Dados completamente isolados por tenant
- ✅ **Sistema de Roles**: OWNER, ADMIN, MANAGER, STAFF, VIEWER
- ✅ **Permissões Granulares**: Controle fino de acesso por funcionalidade
- ✅ **Wildcard Permissions**: Role OWNER tem acesso total (`"*"`)
- ✅ **Admin Dashboard**: Interface para administradores do sistema

### 🔐 **Autenticação e Segurança**
- ✅ Login com email/senha
- ✅ Login com Google
- ✅ Recuperação de senha
- ✅ Rotas protegidas com verificação de permissões
- ✅ Contexto de autenticação global
- ✅ Proteção multitenant

### 👥 **Gestão de Usuários**
- ✅ **Listagem de Usuários**: Visualizar todos os usuários do tenant
- ✅ **Convidar Usuários**: Modal para convidar novos usuários
- ✅ **Gestão de Roles**: Atribuir e editar roles de usuários
- ✅ **Permissões por Usuário**: Controle individual de permissões
- ✅ **Integração Firebase Auth**: Criação automática de contas
- ✅ **Email de Verificação**: Envio automático de emails de verificação

### 👥 **Gestão de Clientes**
- ✅ Cadastro completo de clientes
- ✅ Informações pessoais (nome, email, telefone, CPF)
- ✅ Cadastro de filhos com idade e necessidades especiais
- ✅ Endereço completo
- ✅ Notas e observações
- ✅ Validação de formulários em tempo real
- ✅ Máscaras para telefone e CPF
- ✅ Cálculo automático de idade
- ✅ Isolamento por tenant

### 📅 **Sistema de Agendamentos**
- ✅ Criação de agendamentos
- ✅ Seleção de clientes e filhos atendidos
- ✅ Definição de serviços e profissionais
- ✅ Controle de horários e duração
- ✅ Status de agendamento (Agendado, Em andamento, Concluído, Cancelado)
- ✅ Filtros por data, cliente, profissional e status
- ✅ Busca e ordenação
- ✅ Modal de detalhes do agendamento
- ✅ Isolamento por tenant

### 📊 **Dashboard Analítico**
- ✅ **Estatísticas de Clientes**:
  - Total de clientes
  - Clientes com filhos
  - Clientes com necessidades especiais
- ✅ **Estatísticas de Agendamentos**:
  - Total de agendamentos
  - Agendamentos por status
  - Agendamentos por período (hoje, semana, mês)
- ✅ **Dados Isolados por Tenant**

### 🎨 **Interface e UX**
- ✅ Design responsivo (desktop e mobile)
- ✅ Tema claro/escuro
- ✅ Navegação intuitiva
- ✅ Feedback visual com toasts
- ✅ Loading states
- ✅ Tratamento de erros elegante
- ✅ Componentes reutilizáveis

## 🏗️ Arquitetura

### **Padrão de Arquitetura**
```
src/
├── components/     # Componentes reutilizáveis
├── pages/         # Páginas da aplicação
├── services/      # Lógica de negócio e APIs
├── types/         # Definições TypeScript
├── utils/         # Funções utilitárias
├── hooks/         # Custom hooks
├── contexts/      # Contextos React
├── lib/           # Configurações e bibliotecas
├── test/          # Testes automatizados
└── assets/        # Recursos estáticos
```

### **Fluxo de Dados Multitenant**
```
UI Components → Custom Hooks → Services → Firebase
     ↑              ↓              ↓
  Contexts ← Error Handling ← Type Safety
     ↑              ↓
  Tenant Context ← Permission Guard
```

### **Cloud Functions**
```
Frontend → HTTPS Callable → Cloud Functions → Firebase Admin SDK
    ↑           ↓              ↓
  Response ← Validation ← Business Logic
```

## 🛠️ Tecnologias

### **Frontend**
- **React 19.1.0** - Biblioteca principal
- **TypeScript 5.8.3** - Tipagem estática
- **Chakra UI 2.10.9** - Componentes e design system
- **React Router DOM 7.7.1** - Roteamento
- **React Hook Form 7.61.1** - Gerenciamento de formulários
- **Zod 4.0.13** - Validação de schemas

### **Backend e Infraestrutura**
- **Firebase 12.0.0** - Backend como serviço
  - **Firestore** - Banco de dados NoSQL
  - **Authentication** - Sistema de autenticação
  - **Hosting** - Deploy da aplicação
  - **Cloud Functions** - Operações administrativas seguras
  - **Admin SDK** - Gerenciamento de usuários e permissões

### **Ferramentas de Desenvolvimento**
- **Vite 7.0.4** - Build tool e dev server
- **ESLint 9.30.1** - Linting de código
- **Vitest 1.3.1** - Framework de testes
- **pnpm** - Gerenciador de pacotes
- **GitHub Actions** - CI/CD pipeline

## 🚀 Instalação

### **Pré-requisitos**
- Node.js 18+ 
- pnpm (recomendado) ou npm
- Conta no Firebase
- Firebase CLI

### **1. Clone o repositório**
```bash
git clone https://github.com/seu-usuario/agendix.git
cd agendix
```

### **2. Instale as dependências**
```bash
pnpm install
```

### **3. Configure as variáveis de ambiente**
```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Firebase Configuration (Client SDK)
VITE_FIREBASE_API_KEY=sua_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu_projeto_id
VITE_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# App Configuration
VITE_APP_NAME=Agendix
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
VITE_DEFAULT_COLOR_MODE=light
```

### **4. Configure o Firebase**
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login no Firebase
firebase login

# Inicializar projeto (se necessário)
firebase init
```

### **5. Deploy das Cloud Functions**
```bash
# Deploy das funções
firebase deploy --only functions
```

### **6. Execute o projeto**
```bash
pnpm dev
```

Acesse: `http://localhost:5173`

## ⚙️ Configuração

### **Firebase Setup**

1. **Crie um projeto no Firebase Console**
2. **Ative o Authentication**:
   - Email/Password
   - Google Sign-in
3. **Configure o Firestore**:
   - Crie as coleções: `tenants`, `tenantUsers`, `userPermissions`, `clients`, `appointments`
   - Configure as regras de segurança multitenant
4. **Configure as Cloud Functions**:
   - Deploy das funções para operações administrativas
5. **Configure as variáveis de ambiente**

### **Regras do Firestore (Multitenant)**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Tenants - apenas admins podem criar
    match /tenants/{tenantId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.ownerId || 
         hasRole('admin'));
    }
    
    // TenantUsers - usuários do tenant
    match /tenantUsers/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // UserPermissions - permissões do usuário
    match /userPermissions/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // Clientes - isolamento por tenant
    match /clients/{clientId} {
      allow read, write: if request.auth != null && 
        resource.data.tenantId == getTenantId(request.auth.uid);
    }
    
    // Agendamentos - isolamento por tenant
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null && 
        resource.data.tenantId == getTenantId(request.auth.uid);
    }
  }
}
```

## 📱 Módulos

### **1. Autenticação (`/`)**
- **Login**: Email/senha ou Google
- **Recuperação de senha**: Envio de email
- **Proteção de rotas**: Redirecionamento automático
- **Verificação de tenant**: Redirecionamento para cadastro se necessário

### **2. Cadastro de Empresa (`/tenant-registration`)**
- **Criação de Tenant**: Cadastro de nova empresa/clínica
- **Configuração inicial**: Dados básicos da empresa
- **Criação do Owner**: Usuário proprietário automaticamente criado

### **3. Dashboard (`/app`)**
- **Visão geral**: Estatísticas principais do tenant
- **Cards informativos**: Dados em tempo real
- **Navegação rápida**: Links para outros módulos
- **Dados isolados**: Apenas dados do tenant atual

### **4. Clientes (`/app/clients`)**
- **Listagem**: Todos os clientes do tenant
- **Cadastro**: Formulário completo com validação
- **Edição**: Modificação de dados existentes
- **Exclusão**: Remoção segura de registros
- **Busca**: Filtros por nome e email
- **Isolamento**: Apenas clientes do tenant

### **5. Agendamentos (`/app/appointments`)**
- **Listagem**: Todos os agendamentos do tenant
- **Criação**: Formulário de novo agendamento
- **Edição**: Modificação de agendamentos
- **Status**: Controle de status (Agendado, Em andamento, etc.)
- **Filtros**: Por data, cliente, profissional, status
- **Detalhes**: Modal com informações completas
- **Isolamento**: Apenas agendamentos do tenant

### **6. Usuários (`/app/users`)**
- **Listagem**: Todos os usuários do tenant
- **Convidar**: Modal para convidar novos usuários
- **Roles**: Visualização e edição de roles
- **Permissões**: Gestão de permissões por usuário
- **Integração Firebase**: Criação automática de contas

### **7. Admin Dashboard (`/app/admin`)**
- **Gestão de Tenants**: Visualizar e gerenciar tenants
- **Estatísticas**: Dados agregados do sistema
- **Configurações**: Configurações globais
- **Acesso Restrito**: Apenas para admins do sistema

## 🔧 Desenvolvimento

### **Scripts Disponíveis**
```bash
# Desenvolvimento
pnpm dev              # Inicia o servidor de desenvolvimento
pnpm build            # Build para produção
pnpm preview          # Preview do build
pnpm lint             # Executa o linter
pnpm build:check      # Verifica tipos TypeScript

# Testes
pnpm test             # Executa testes
pnpm test:coverage    # Executa testes com cobertura
pnpm test:ui          # Interface visual para testes
pnpm test:watch       # Modo watch para testes

# Configuração
pnpm setup:env        # Configura variáveis de ambiente
```

### **Estrutura de Commits**
O projeto segue o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração
test: adiciona testes
chore: tarefas de manutenção
```

### **Padrões de Código**
- **TypeScript**: Tipagem estática em todo o projeto
- **ESLint**: Regras de linting configuradas
- **Prettier**: Formatação automática
- **Componentes**: Funcionais com hooks
- **Estados**: Gerenciados com useState/useContext
- **Multitenant**: Isolamento de dados por tenant

## 📊 Estrutura do Projeto

```
agendix/
├── public/                 # Arquivos estáticos
├── src/
│   ├── assets/            # Imagens, ícones, etc.
│   ├── components/        # Componentes reutilizáveis
│   │   ├── appointments/  # Componentes de agendamentos
│   │   ├── clients/       # Componentes de clientes
│   │   └── ui/           # Componentes de UI
│   ├── contexts/          # Contextos React
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Configurações (Firebase, etc.)
│   ├── pages/             # Páginas da aplicação
│   ├── services/          # Lógica de negócio
│   ├── types/             # Definições TypeScript
│   ├── utils/             # Funções utilitárias
│   ├── test/              # Testes automatizados
│   ├── App.tsx           # Componente principal
│   └── main.tsx          # Entry point
├── functions/             # Firebase Cloud Functions
│   ├── src/              # Código das funções
│   └── package.json      # Dependências das funções
├── docs/                  # Documentação adicional
├── scripts/               # Scripts de automação
├── .github/               # Configurações CI/CD
├── .env.example          # Exemplo de variáveis
├── package.json          # Dependências
├── tsconfig.json         # Configuração TypeScript
├── vite.config.ts        # Configuração Vite
├── firebase.json         # Configuração Firebase
└── README.md             # Esta documentação
```

### **Principais Arquivos**

#### **Tipos (`src/types/`)**
- `Tenant.ts` - Interface de tenant
- `TenantUser.ts` - Interface de usuário do tenant
- `Permissions.ts` - Sistema de permissões e roles
- `Client.ts` - Interface de cliente
- `Appointment.ts` - Interface de agendamento
- `Error.ts` - Sistema de tratamento de erros
- `validation.ts` - Schemas de validação

#### **Serviços (`src/services/`)**
- `tenantService.ts` - Operações CRUD de tenants
- `permissionsService.ts` - Gestão de permissões
- `userService.ts` - Integração com Firebase Auth via Cloud Functions
- `clientService.ts` - Operações CRUD de clientes
- `appointmentService.ts` - Operações CRUD de agendamentos

#### **Hooks (`src/hooks/`)**
- `useAuth.ts` - Hook de autenticação com contexto multitenant
- `useTenant.ts` - Hook para acesso fácil ao tenant
- `usePermissions.ts` - Hook para verificação de permissões
- `useErrorHandler.ts` - Tratamento de erros
- `useFormValidation.ts` - Validação de formulários

#### **Cloud Functions (`functions/src/`)**
- `getUserInfo` - Buscar informações de usuário
- `getUsersInfo` - Buscar informações de múltiplos usuários
- `checkEmailExists` - Verificar se email existe
- `inviteUser` - Convidar novo usuário

## 🎨 Interface

### **Design System**
- **Chakra UI**: Componentes consistentes
- **Tema**: Suporte a modo claro/escuro
- **Responsividade**: Mobile-first design
- **Acessibilidade**: Componentes acessíveis

### **Componentes Principais**
- **Menu**: Navegação principal com logo clicável
- **Dashboard**: Cards com estatísticas
- **Formulários**: Validação em tempo real
- **Modais**: Detalhes e confirmações
- **Tabelas**: Listagens responsivas
- **PermissionGuard**: Proteção de rotas por permissão

### **Estados de Interface**
- **Loading**: Spinners e skeletons
- **Error**: Tratamento elegante de erros
- **Empty**: Estados vazios informativos
- **Success**: Feedback positivo

## 🔒 Segurança

### **Sistema Multitenant**
- **Isolamento de Dados**: Todos os dados filtrados por `tenantId`
- **Permissões por Role**: Cada role tem permissões específicas
- **Wildcard Permissions**: Role OWNER tem acesso total (`"*"`)
- **Validação de Tenant**: Verificação em todas as operações
- **Proteção de Rotas**: Verificação de permissões antes do acesso

### **Autenticação**
- **Firebase Auth**: Sistema robusto de autenticação
- **Proteção de rotas**: Redirecionamento automático
- **Contexto global**: Estado de autenticação
- **Verificação de tenant**: Redirecionamento para cadastro se necessário

### **Dados**
- **Validação**: Schemas Zod para validação
- **Sanitização**: Limpeza de dados de entrada
- **Tipagem**: TypeScript para type safety
- **Isolamento**: Dados isolados por tenant

### **Firestore**
- **Regras de segurança**: Controle de acesso por usuário e tenant
- **Índices**: Otimização de consultas
- **Backup**: Backup automático do Firebase
- **Isolamento**: Dados isolados por tenant

### **Cloud Functions**
- **Operações administrativas**: Executadas no backend
- **Admin SDK**: Credenciais seguras no servidor
- **Validação**: Permissões verificadas em todas as operações
- **Isolamento**: Funções específicas por tenant
- **Deploy**: `firebase deploy --only functions`

## 📈 Performance

### **Otimizações**
- **Code splitting**: Carregamento sob demanda
- **Lazy loading**: Componentes carregados quando necessário
- **Memoização**: useMemo e useCallback
- **Virtualização**: Para listas grandes

### **Firebase**
- **Índices otimizados**: Consultas rápidas
- **Paginação**: Carregamento em lotes
- **Cache**: Dados em cache local
- **Isolamento**: Consultas filtradas por tenant

### **Bundle**
- **Tree shaking**: Remoção de código não utilizado
- **Minificação**: Código comprimido
- **Gzip**: Compressão de assets

## 🤝 Contribuição

### **Como Contribuir**
1. **Fork** o projeto
2. **Crie** uma branch para sua feature
3. **Commit** suas mudanças
4. **Push** para a branch
5. **Abra** um Pull Request

### **Padrões**
- **Commits**: Conventional Commits
- **Código**: ESLint + Prettier
- **Testes**: Cobertura mínima de 80%
- **Documentação**: Atualizar README

### **Desenvolvimento**
```bash
# Clone e setup
git clone https://github.com/seu-usuario/agendix.git
cd agendix
pnpm install

# Desenvolvimento
pnpm dev

# Testes
pnpm test

# Build
pnpm build
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🚀 Deploy

### **Firebase Hosting**
```bash
# Build do projeto
pnpm build

# Deploy para Firebase
firebase deploy
```

### **Cloud Functions**
```bash
# Deploy das funções
firebase deploy --only functions
```

### **CI/CD Pipeline**
O projeto utiliza GitHub Actions para:
- **Testes**: Linting, type checking, testes automatizados
- **Build**: Build automático para produção
- **Deploy**: Deploy automático para staging/production

### **Variáveis de Produção**
Configure as variáveis de ambiente para produção:
```env
VITE_APP_ENV=production
VITE_APP_URL=https://seu-dominio.com
```

---

## 🎯 Status do Projeto

### **✅ Implementado**
- [x] Sistema multitenant completo
- [x] Gestão de usuários e permissões
- [x] Cloud Functions para operações administrativas
- [x] Testes automatizados
- [x] CI/CD pipeline
- [x] Interface responsiva
- [x] Sistema de autenticação
- [x] Gestão de clientes e agendamentos

### **🚧 Em Desenvolvimento**
- [ ] Firestore Security Rules multitenant
- [ ] Testes de integração
- [ ] Melhorias de UX
- [ ] Documentação de API

### **📋 Próximos Passos**
- [ ] Deploy de produção
- [ ] Configuração de domínio personalizado
- [ ] Monitoramento e analytics
- [ ] Backup e recuperação de dados
