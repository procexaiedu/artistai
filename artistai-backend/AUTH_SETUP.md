# 🔐 Configuração de Autenticação - Supabase

## ⚙️ Configuração Necessária

### 1. Variáveis de Ambiente - Backend

Crie ou edite o arquivo `.env` em `artistai-backend/` com:

```env
DATABASE_URL=postgresql://usuario:senha@host:porta/database
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua-service-key
SUPABASE_JWT_SECRET=sua-jwt-secret
```

### 2. Variáveis de Ambiente - Frontend

Crie o arquivo `.env.local` em `artistai-frontend/` com:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
```

## 🔑 Como Obter as Chaves do Supabase

1. Acesse o [Dashboard do Supabase](https://app.supabase.com/)
2. Vá em **Settings** > **API**
3. Copie:
   - **URL**: `SUPABASE_URL`
   - **anon/public**: `SUPABASE_ANON_KEY`
   - **service_role**: `SUPABASE_SERVICE_KEY`
   - **JWT Secret**: `SUPABASE_JWT_SECRET`

## 👤 Criando Usuários de Teste

1. No Supabase Dashboard > **Authentication** > **Users**
2. Clique em **Add user** 
3. Adicione email e senha para teste

## ✅ Testando o Sistema

1. **Iniciar Backend**:
   ```bash
   cd artistai-backend
   .\venv\Scripts\activate
   python -m uvicorn app.main:app --reload --port 8000
   ```

2. **Iniciar Frontend**:
   ```bash
   cd artistai-frontend
   npm run dev
   ```

3. **Acessar**:
   - Frontend: http://localhost:3000
   - Tentar acessar `/artists` sem login → redirecionamento para `/login`
   - Fazer login com credenciais criadas no Supabase
   - Após login, acessar `/artists` funcionalmente

## 🛡️ O Que Foi Implementado

- ✅ **Autenticação JWT** completa
- ✅ **Proteção de rotas** frontend e backend
- ✅ **Context global** de usuário
- ✅ **Header dinâmico** com dados do usuário
- ✅ **Interceptor automático** de tokens na API
- ✅ **Logout funcional**
- ✅ **Redirecionamentos** automáticos 