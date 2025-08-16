# 🏥 Agendix - Sistema de Gestão para Clínicas

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Chakra UI](https://img.shields.io/badge/Chakra%20UI-2.10.9-purple.svg)](https://chakra-ui.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12.0.0-orange.svg)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-7.0.4-yellow.svg)](https://vitejs.dev/)

> **Sistema completo de gestão para clínicas e consultórios médicos, com foco em agendamentos, cadastro de clientes e dashboard analítico.**

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

O **Agendix** é um sistema web moderno desenvolvido para clínicas e consultórios médicos, oferecendo uma solução completa de gestão com foco em:

- **Gestão de Clientes**: Cadastro completo com informações pessoais, filhos e necessidades especiais
- **Sistema de Agendamentos**: Agendamento inteligente com controle de horários e profissionais
- **Dashboard Analítico**: Estatísticas em tempo real sobre clientes e agendamentos
- **Interface Responsiva**: Funciona perfeitamente em desktop e mobile
- **Autenticação Segura**: Sistema de login com Firebase Auth

## ✨ Funcionalidades

### 🔐 **Autenticação e Segurança**
- ✅ Login com email/senha
- ✅ Login com Google
- ✅ Recuperação de senha
- ✅ Rotas protegidas
- ✅ Contexto de autenticação global

### 👥 **Gestão de Clientes**
- ✅ Cadastro completo de clientes
- ✅ Informações pessoais (nome, email, telefone, CPF)
- ✅ Cadastro de filhos com idade e necessidades especiais
- ✅ Endereço completo
- ✅ Notas e observações
- ✅ Validação de formulários em tempo real
- ✅ Máscaras para telefone e CPF
- ✅ Cálculo automático de idade

### 📅 **Sistema de Agendamentos**
- ✅ Criação de agendamentos
- ✅ Seleção de clientes e filhos atendidos
- ✅ Definição de serviços e profissionais
- ✅ Controle de horários e duração
- ✅ Status de agendamento (Agendado, Em andamento, Concluído, Cancelado)
- ✅ Filtros por data, cliente, profissional e status
- ✅ Busca e ordenação
- ✅ Modal de detalhes do agendamento

### 📊 **Dashboard Analítico**
- ✅ **Estatísticas de Clientes**:
  - Total de clientes
  - Clientes com filhos
  - Clientes com necessidades especiais
- ✅ **Estatísticas de Agendamentos**:
  - Total de agendamentos
  - Agendamentos por status
  - Agendamentos por período (hoje, semana, mês)

### 🎨 **Interface e UX**
- ✅ Design responsivo (desktop e mobile)
- ✅ Tema claro/escuro
- ✅ Navegação intuitiva
- ✅ Feedback visual com toasts
- ✅ Loading states
- ✅ Tratamento de erros elegante

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
└── assets/        # Recursos estáticos
```

### **Fluxo de Dados**
```
UI Components → Custom Hooks → Services → Firebase
     ↑              ↓              ↓
  Contexts ← Error Handling ← Type Safety
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

### **Ferramentas de Desenvolvimento**
- **Vite 7.0.4** - Build tool e dev server
- **ESLint 9.30.1** - Linting de código
- **pnpm** - Gerenciador de pacotes

## 🚀 Instalação

### **Pré-requisitos**
- Node.js 18+ 
- pnpm (recomendado) ou npm
- Conta no Firebase

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

Edite o arquivo `.env` com suas configurações do Firebase:

```env
# Firebase Configuration
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

### **4. Execute o projeto**
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
   - Crie as coleções: `clients`, `appointments`
   - Configure as regras de segurança
4. **Configure as variáveis de ambiente**

### **Regras do Firestore**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Clientes - usuário só acessa seus próprios dados
    match /clients/{clientId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Agendamentos - usuário só acessa seus próprios dados
    match /appointments/{appointmentId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## 📱 Módulos

### **1. Autenticação (`/`)**
- **Login**: Email/senha ou Google
- **Recuperação de senha**: Envio de email
- **Proteção de rotas**: Redirecionamento automático

### **2. Dashboard (`/app`)**
- **Visão geral**: Estatísticas principais
- **Cards informativos**: Dados em tempo real
- **Navegação rápida**: Links para outros módulos

### **3. Clientes (`/app/clients`)**
- **Listagem**: Todos os clientes cadastrados
- **Cadastro**: Formulário completo com validação
- **Edição**: Modificação de dados existentes
- **Exclusão**: Remoção segura de registros
- **Busca**: Filtros por nome e email

### **4. Agendamentos (`/app/appointments`)**
- **Listagem**: Todos os agendamentos
- **Criação**: Formulário de novo agendamento
- **Edição**: Modificação de agendamentos
- **Status**: Controle de status (Agendado, Em andamento, etc.)
- **Filtros**: Por data, cliente, profissional, status
- **Detalhes**: Modal com informações completas

## 🔧 Desenvolvimento

### **Scripts Disponíveis**
```bash
# Desenvolvimento
pnpm dev              # Inicia o servidor de desenvolvimento
pnpm build            # Build para produção
pnpm preview          # Preview do build
pnpm lint             # Executa o linter
pnpm build:check      # Verifica tipos TypeScript

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
│   ├── App.tsx           # Componente principal
│   └── main.tsx          # Entry point
├── docs/                  # Documentação adicional
├── scripts/               # Scripts de automação
├── .env.example          # Exemplo de variáveis
├── package.json          # Dependências
├── tsconfig.json         # Configuração TypeScript
├── vite.config.ts        # Configuração Vite
└── README.md             # Esta documentação
```

### **Principais Arquivos**

#### **Tipos (`src/types/`)**
- `Client.ts` - Interface de cliente
- `Appointment.ts` - Interface de agendamento
- `Error.ts` - Sistema de tratamento de erros
- `validation.ts` - Schemas de validação

#### **Serviços (`src/services/`)**
- `clientService.ts` - Operações CRUD de clientes
- `appointmentService.ts` - Operações CRUD de agendamentos

#### **Utilitários (`src/utils/`)**
- `formatters.ts` - Formatação de dados (CPF, telefone)
- `ageCalculator.ts` - Cálculo de idade
- `dateFormatter.ts` - Formatação de datas
- `childAgeGroups.ts` - Agrupamento por idade

#### **Hooks (`src/hooks/`)**
- `useAuth.ts` - Hook de autenticação
- `useErrorHandler.ts` - Tratamento de erros
- `useFormValidation.ts` - Validação de formulários

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

### **Estados de Interface**
- **Loading**: Spinners e skeletons
- **Error**: Tratamento elegante de erros
- **Empty**: Estados vazios informativos
- **Success**: Feedback positivo

## 🔒 Segurança

### **Autenticação**
- **Firebase Auth**: Sistema robusto de autenticação
- **Proteção de rotas**: Redirecionamento automático
- **Contexto global**: Estado de autenticação

### **Dados**
- **Validação**: Schemas Zod para validação
- **Sanitização**: Limpeza de dados de entrada
- **Tipagem**: TypeScript para type safety

### **Firestore**
- **Regras de segurança**: Controle de acesso por usuário
- **Índices**: Otimização de consultas
- **Backup**: Backup automático do Firebase

### **Firebase Cloud Functions**
- **Operações administrativas**: Executadas no backend
- **Admin SDK**: Credenciais seguras no servidor
- **Validação**: Permissões verificadas em todas as operações
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

### **Variáveis de Produção**
Configure as variáveis de ambiente para produção:
```env
VITE_APP_ENV=production
VITE_APP_URL=https://seu-dominio.com
```
