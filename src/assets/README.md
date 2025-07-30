# 📁 Assets - Agendix

## 🎨 **Estrutura de Assets**

```
src/assets/
├── images/
│   ├── logo/
│   │   ├── logo.png          # Logo principal do app
│   │   ├── logo-white.png    # Logo versão branca (se necessário)
│   │   └── logo-dark.png     # Logo versão escura (se necessário)
│   ├── icons/                # Ícones do sistema
│   └── backgrounds/          # Imagens de fundo
├── fonts/                    # Fontes customizadas
└── README.md                 # Esta documentação
```

## 🖼️ **Como Usar a Logo**

### **1. Importar a Logo**
```typescript
// Importar logo
import logo from '@/assets/images/logo/logo.png'

// Usar em componente
<Image src={logo} alt="Agendix Logo" />
```

### **2. Logo Responsiva**
```typescript
// Logo com tamanhos diferentes
<Image 
  src={logo} 
  alt="Agendix Logo"
  width={{ base: "120px", md: "150px", lg: "180px" }}
  height="auto"
/>
```

### **3. Logo com Tema**
```typescript
// Logo que muda com o tema
const logoColor = useColorModeValue(logo, logoWhite)

<Image src={logoColor} alt="Agendix Logo" />
```

## 📋 **Especificações da Logo**

### **Formatos Suportados**
- ✅ **PNG** - Para logos com transparência
- ✅ **SVG** - Para logos escaláveis
- ✅ **JPG** - Para logos simples

### **Tamanhos Recomendados**
- **Logo Principal**: 180x60px
- **Logo Pequena**: 120x40px
- **Logo Grande**: 240x80px
- **Favicon**: 32x32px

### **Resolução**
- **Mínima**: 72 DPI
- **Recomendada**: 144 DPI
- **Alta**: 300 DPI

## 🎯 **Onde Usar a Logo**

### **1. Header/Navbar**
```typescript
// Logo no cabeçalho
<Box>
  <Image src={logo} alt="Agendix" height="40px" />
</Box>
```

### **2. Login Screen**
```typescript
// Logo na tela de login
<VStack spacing={6}>
  <Image src={logo} alt="Agendix" height="60px" />
  <Text fontSize="2xl" fontWeight="bold">Bem-vindo</Text>
</VStack>
```

### **3. Loading Screen**
```typescript
// Logo na tela de carregamento
<Center h="100vh">
  <VStack spacing={4}>
    <Image src={logo} alt="Agendix" height="80px" />
    <Spinner size="lg" />
  </VStack>
</Center>
```

### **4. Email Templates**
```typescript
// Logo em emails (URL absoluta)
<img src="https://agendix.com/assets/logo.png" alt="Agendix" />
```

## 🔧 **Configuração**

### **1. Adicionar Logo**
1. Coloque o arquivo `logo.png` em `src/assets/images/logo/`
2. Importe no componente desejado
3. Use com o componente `Image` do Chakra UI

### **2. Otimização**
```bash
# Otimizar imagem (se necessário)
npm install -g imagemin-cli
imagemin src/assets/images/logo/logo.png --out-dir=src/assets/images/logo/
```

### **3. Múltiplas Versões**
```typescript
// Importar diferentes versões
import logoMain from '@/assets/images/logo/logo.png'
import logoWhite from '@/assets/images/logo/logo-white.png'
import logoDark from '@/assets/images/logo/logo-dark.png'
```

## ✅ **Checklist**

- [ ] Logo adicionada em `src/assets/images/logo/`
- [ ] Logo otimizada para web
- [ ] Logo testada em diferentes tamanhos
- [ ] Logo funciona com tema claro/escuro
- [ ] Logo responsiva implementada

**A logo está pronta para uso!** 🎨 