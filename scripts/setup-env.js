#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('🔧 Configurando ambiente do Agendix...\n')

// Verificar se o arquivo .env já existe
const envPath = path.join(process.cwd(), '.env')
const examplePath = path.join(process.cwd(), 'env.example')

if (fs.existsSync(envPath)) {
  console.log('⚠️  Arquivo .env já existe!')
  console.log('📝 Se quiser recriar, delete o arquivo .env e execute novamente.\n')
  process.exit(0)
}

// Verificar se o arquivo de exemplo existe
if (!fs.existsSync(examplePath)) {
  console.error('❌ Arquivo env.example não encontrado!')
  process.exit(1)
}

try {
  // Copiar o arquivo de exemplo
  const exampleContent = fs.readFileSync(examplePath, 'utf8')
  fs.writeFileSync(envPath, exampleContent)
  
  console.log('✅ Arquivo .env criado com sucesso!')
  console.log('📝 Edite o arquivo .env com suas configurações do Firebase')
  console.log('🔧 Configure as variáveis VITE_FIREBASE_* com suas credenciais reais\n')
  
  console.log('📋 Próximos passos:')
  console.log('1. Edite o arquivo .env')
  console.log('2. Configure suas credenciais do Firebase')
  console.log('3. Execute: npm run dev')
  console.log('4. Teste a aplicação\n')
  
} catch (error) {
  console.error('❌ Erro ao criar arquivo .env:', error.message)
  process.exit(1)
} 