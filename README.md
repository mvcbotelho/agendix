# 🏢 Agendix - Sistema de Gestão de Clientes

Sistema completo de gestão de clientes com Firebase, Chakra UI e TypeScript. Desenvolvido para facilitar o cadastro, edição e gerenciamento de informações de clientes com validações robustas e interface moderna.

## ✅ **Funcionalidades Implementadas**

### **🎯 Gestão de Clientes**
- ✅ Cadastro completo de clientes
- ✅ Edição de dados existentes
- ✅ Listagem com cards informativos
- ✅ Exclusão de clientes
- ✅ Busca e filtros (em desenvolvimento)

### **📝 Formulários Inteligentes**
- ✅ Validação em tempo real
- ✅ Máscaras automáticas (CPF, telefone)
- ✅ Cálculo automático de idade
- ✅ Validação de datas e CPF
- ✅ Feedback visual de erros

### **👨‍👩‍👧‍👦 Gestão de Filhos**
- ✅ Cadastro de filhos dos clientes
- ✅ Edição de dados dos filhos
- ✅ Cálculo de idade para filhos
- ✅ Condições especiais
- ✅ Adição/remoção dinâmica

### **🏠 Endereços**
- ✅ Cadastro completo de endereços
- ✅ Validação de CEP
- ✅ Seção opcional (expandir/colapsar)
- ✅ Formatação automática

### **🔐 Autenticação**
- ✅ Login com Email/Senha
- ✅ Login com Google
- ✅ Recuperação de Senha
- ✅ Proteção de Rotas
- ✅ Logout seguro

## 🚀 **Configuração Rápida**

### **1. Instalar Dependências**
```bash
pnpm install
```

### **2. Configurar Ambiente**
```bash
cp env.example .env
```

### **3. Configurar Firebase**
Edite o arquivo `.env` com suas credenciais:

```env
VITE_FIREBASE_API_KEY=sua-api-key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### **4. Executar Projeto**
```bash
pnpm dev
```

## 📁 **Estrutura do Projeto**

```
src/
├── components/
│   ├── clients/
│   │   ├── ClientForm.tsx      # Formulário de clientes
│   │   └── ClientCard.tsx      # Card de exibição
│   ├── ui/
│   │   ├── FormField.tsx       # Campo de formulário
│   │   └── ValidatedForm.tsx   # Formulário validado
│   └── ErrorBoundary.tsx       # Tratamento de erros
├── contexts/
│   └── AuthContext.tsx         # Contexto de autenticação
├── hooks/
│   ├── useAuth.ts              # Hook de autenticação
│   ├── useErrorHandler.ts      # Hook de tratamento de erros
│   └── useFormValidation.ts    # Hook de validação
├── lib/
│   ├── firebase.ts             # Configuração Firebase
│   ├── config.ts               # Configurações
│   ├── errorHandler.ts         # Sistema de erros
│   └── security.ts             # Utilitários de segurança
├── pages/
│   ├── Login.tsx               # Tela de login
│   ├── ForgotPassword.tsx      # Recuperação de senha
│   └── Clients.tsx             # Gestão de clientes
├── services/
│   └── clientService.ts        # Serviços de cliente
├── types/
│   ├── Client.ts               # Tipos de cliente
│   ├── Error.ts                # Tipos de erro
│   └── validation.ts           # Schemas de validação
├── utils/
│   ├── ageCalculator.ts        # Cálculo de idade
│   └── formatters.ts           # Formatadores
├── App.tsx                     # Componente principal
└── main.tsx                    # Entry point
```

## 🎯 **Funcionalidades Detalhadas**

### **📋 Cadastro de Clientes**
- **Informações Básicas**: Nome, email, telefone, CPF, data de nascimento
- **Validações**: Email válido, CPF válido, telefone com 10+ dígitos
- **Máscaras**: CPF (000.000.000-00), telefone ((00) 00000-0000)
- **Cálculo de Idade**: Automático baseado na data de nascimento

### **👨‍👩‍👧‍👦 Gestão de Filhos**
- **Adicionar Filhos**: Nome, data de nascimento, condições especiais
- **Editar Filhos**: Interface inline para edição
- **Remover Filhos**: Exclusão individual
- **Validação**: Mesmas regras do cliente principal

### **🏠 Endereços**
- **Campos**: Rua, número, complemento, bairro, cidade, estado, CEP
- **Validação**: CEP no formato 00000-000, estado com 2 caracteres
- **Opcional**: Seção expansível/colapsável

### **🔍 Sistema de Validação**
- **Tempo Real**: Validação durante digitação
- **Feedback Visual**: Mensagens de erro claras
- **Prevenção**: Impede envio com dados inválidos
- **Acessibilidade**: Suporte a leitores de tela

## 🧪 **Como Usar**

### **1. Login**
- Acesse a aplicação
- Faça login com email/senha ou Google
- Será redirecionado para a gestão de clientes

### **2. Cadastrar Cliente**
- Clique em "Adicionar Cliente"
- Preencha as informações básicas
- Adicione filhos se necessário
- Preencha endereço se desejar
- Clique em "Cadastrar"

### **3. Editar Cliente**
- Clique no ícone de editar no card do cliente
- Modifique os dados desejados
- Edite filhos individualmente
- Clique em "Atualizar"

### **4. Gerenciar Filhos**
- **Adicionar**: Preencha nome e data, clique em "Adicionar Filho"
- **Editar**: Clique no ícone de editar no filho
- **Remover**: Clique no ícone de remover

## 📊 **Scripts Disponíveis**

```bash
pnpm dev              # Desenvolvimento
pnpm build            # Build de produção
pnpm preview          # Preview do build
pnpm lint             # Verificar código
pnpm type-check       # Verificar TypeScript
```

## 🎨 **Tecnologias**

- **React 19** - Biblioteca de UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool rápida
- **Chakra UI** - Componentes modernos
- **Firebase** - Backend e autenticação
- **React Router** - Navegação
- **Zod** - Validação de schemas (parcialmente implementado)

## 🔐 **Segurança**

- ✅ Configurações sensíveis protegidas
- ✅ Validação de dados no frontend
- ✅ Autenticação Firebase
- ✅ Proteção de rotas
- ✅ Tratamento de erros robusto

## 📈 **Performance**

- ✅ Build otimizado (Vite + TypeScript)
- ✅ Componentes lazy loading
- ✅ Validação eficiente
- ✅ Interface responsiva
- ✅ Animações suaves

## 🚀 **Próximos Passos**

1. **Busca e Filtros** - Implementar busca por nome, email, CPF
2. **Exportação** - Exportar dados em PDF/Excel
3. **Dashboard** - Estatísticas e gráficos
4. **Notificações** - Sistema de alertas
5. **Backup** - Sincronização automática

## ✅ **Status do Projeto**

- ✅ **Sistema de Autenticação** - Completo
- ✅ **Gestão de Clientes** - Completo
- ✅ **Validações** - Implementadas
- ✅ **Interface** - Moderna e responsiva
- ✅ **Firebase** - Integrado e configurado
- ✅ **Tratamento de Erros** - Robusto
- ✅ **Testes** - Funcionando

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**O sistema está pronto para uso em produção!** 🚀

Para suporte ou dúvidas, abra uma issue no repositório.
