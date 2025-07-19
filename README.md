# 🎭 artistAI - Sistema de Gerenciamento de Artistas

Sistema completo para empresários do entretenimento gerenciarem seus artistas, contratantes e eventos de forma profissional.

## 🚀 Funcionalidades Implementadas

- ✅ **Dashboard** - Visão geral do negócio
- ✅ **Gestão de Artistas** - CRUD completo com multi-tenancy
- ✅ **Gestão de Contratantes** - CRUD completo com multi-tenancy  
- ✅ **Agenda de Eventos** - Calendário interativo com FullCalendar
- ✅ **Autenticação** - Sistema seguro com Supabase Auth + JWT
- ✅ **Interface Profissional** - Design moderno com sidebar retrátil

## 🏗️ Arquitetura

### **Backend (FastAPI)**
- **Framework**: FastAPI + SQLAlchemy + Alembic
- **Banco**: PostgreSQL (Supabase)
- **Auth**: JWT com validação Supabase
- **API**: RESTful com documentação automática

### **Frontend (Next.js)**
- **Framework**: Next.js 15 + TypeScript
- **UI**: TailwindCSS + shadcn/ui
- **Calendário**: FullCalendar
- **Estado**: React Context + Axios

## 📋 Pré-requisitos

- **Python 3.8+**
- **Node.js 18+**
- **Conta Supabase** (banco PostgreSQL + auth)

## ⚡ Setup Rápido

### **1. Clone o Repositório**
```bash
git clone <seu-repositorio>
cd artistai
```

### **2. Backend Setup**
```bash
cd artistai-backend

# Criar ambiente virtual
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Instalar dependências
pip install -r requirements.txt

# Configurar banco (Supabase)
# As credenciais já estão no .env para facilitar o setup

# Executar migrações
alembic upgrade head

# Iniciar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **3. Frontend Setup**
```bash
cd artistai-frontend

# Instalar dependências
npm install

# As variáveis de ambiente já estão configuradas em .env.local

# Iniciar servidor de desenvolvimento
npm run dev
```

### **4. Acessar o Sistema**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/docs
- **Login**: Use qualquer email/senha para criar conta via Supabase

## 🗄️ Estrutura do Projeto

```
artistai/
├── artistai-backend/           # API FastAPI
│   ├── alembic/               # Migrações do banco
│   ├── app/
│   │   ├── models.py          # Modelos SQLAlchemy
│   │   ├── schemas.py         # Schemas Pydantic
│   │   ├── crud_*.py          # Operações CRUD
│   │   ├── routers/           # Endpoints da API
│   │   ├── dependencies.py    # Dependências (auth, db)
│   │   └── main.py           # Aplicação principal
│   ├── requirements.txt       # Dependências Python
│   └── .env                  # Configurações (incluídas)
│
├── artistai-frontend/         # Interface Next.js
│   ├── src/
│   │   ├── app/              # Pages (App Router)
│   │   ├── components/       # Componentes React
│   │   ├── contexts/         # Context providers
│   │   └── lib/              # Utilitários
│   ├── package.json          # Dependências Node
│   └── .env.local           # Variáveis ambiente (incluídas)
│
└── README.md                 # Este arquivo
```

## 📊 Módulos Disponíveis

### **1. Dashboard**
- Visão geral do negócio
- KPIs e estatísticas
- Navegação central

### **2. Artistas**
- Cadastro completo de artistas
- Informações: nome, cachê, cidade, status
- Upload de fotos
- Gestão de documentos

### **3. Contratantes**
- Cadastro de clientes
- Informações: nome, CPF/CNPJ, contato
- Histórico de contratações

### **4. Eventos (Calendário)**
- **Interface de calendário interativa**
- **Clique em data** → cria evento
- **Clique em evento** → edita evento
- **Cores por status**: Verde (confirmado), Amarelo (pendente), etc.
- **Filtros por período**
- **Estatísticas em tempo real**

## 🔐 Autenticação

O sistema usa **Supabase Auth** para:
- Login/registro de usuários
- Geração de tokens JWT
- Validação de sessões
- Multi-tenancy (isolamento de dados por usuário)

## 🎨 Interface

- **Design profissional** com padrão "diamond standard"
- **Sidebar retrátil** com módulos
- **Tema responsivo** para desktop e mobile
- **Componentes reutilizáveis** com shadcn/ui
- **Loading states** e tratamento de erros

## 🛠️ Comandos Úteis

### **Backend**
```bash
# Ativar ambiente
venv\Scripts\activate

# Nova migração
alembic revision -m "descrição"

# Aplicar migrações
alembic upgrade head

# Executar testes
pytest

# Iniciar backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### **Frontend**
```bash
# Instalar dependência
npm install <pacote>

# Build de produção
npm run build

# Iniciar desenvolvimento
npm run dev

# Linting
npm run lint
```

## 🔧 Configurações

### **Supabase Setup**
1. Crie projeto no Supabase
2. Configure as variáveis no `.env` (backend) e `.env.local` (frontend)
3. Execute as migrações com `alembic upgrade head`

### **Banco de Dados**
O sistema usa PostgreSQL via Supabase com as seguintes tabelas:
- `artists` - Informações dos artistas
- `contractors` - Dados dos contratantes  
- `events` - Eventos/shows agendados
- `auth.users` - Usuários (gerenciado pelo Supabase)

## 🚀 Deploy

### **Backend (Render/Railway)**
```bash
# Usar Dockerfile ou requirements.txt
# Configurar variáveis de ambiente
# Comando: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### **Frontend (Vercel/Netlify)**
```bash
# Build: npm run build
# Output: .next/
# Configurar variáveis de ambiente no painel
```

## 🆘 Troubleshooting

### **Backend não conecta**
```bash
# Verificar se está rodando
netstat -an | findstr ":8000"

# Verificar logs
# Checar configurações do .env
```

### **Frontend com loading infinito**
```bash
# Verificar se backend está rodando
# Verificar CORS no backend
# Verificar variáveis .env.local
```

### **Problemas de autenticação**
```bash
# Verificar configurações Supabase
# Verificar tokens JWT
# Verificar CORS
```

## 📞 Suporte

Para problemas ou dúvidas:
1. Verificar logs do backend e frontend
2. Conferir se todas as dependências foram instaladas
3. Validar configurações de ambiente
4. Verificar se o Supabase está configurado corretamente

---

**Status**: ✅ Produção Ready  
**Versão**: 1.0.0  
**Última atualização**: Dezembro 2024 