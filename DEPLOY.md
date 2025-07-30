# 🚀 Guia de Deploy - artistAI

Este documento descreve como configurar e fazer deploy das aplicações backend e frontend do artistAI em produção.

## 📋 Visão Geral

- **Backend**: FastAPI + Docker → Render
- **Frontend**: Next.js → Vercel
- **CI/CD**: GitHub Actions (opcional)

## 🐳 Backend - Deploy no Render

### 1. Preparação

O backend já está configurado com:
- ✅ `Dockerfile` otimizado
- ✅ `.dockerignore` para reduzir tamanho da imagem
- ✅ Health check endpoint (`/health`)
- ✅ CORS configurado para produção

### 2. Configuração no Render

1. **Criar Web Service**:
   - Acesse [render.com](https://render.com)
   - Conecte seu repositório GitHub
   - Selecione "Web Service"
   - Configure:
     - **Build Command**: `docker build -t artistai-backend .`
     - **Start Command**: `docker run -p 8080:8080 artistai-backend`
     - **Port**: `8080`

2. **Variáveis de Ambiente**:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   SUPABASE_SERVICE_KEY=your-service-key
   SUPABASE_URL=https://your-project.supabase.co
   JWT_SECRET_KEY=your-jwt-secret
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

3. **URL de Produção**:
   - Após deploy: `https://artistai-backend.onrender.com`

### 3. Verificação

```bash
# Testar health check
curl https://artistai-backend.onrender.com/health

# Testar API
curl https://artistai-backend.onrender.com/
```

## 🌐 Frontend - Deploy na Vercel

### 1. Preparação

O frontend já está configurado com:
- ✅ Variáveis de ambiente dinâmicas
- ✅ Timeout configurado para API
- ✅ Fallback para desenvolvimento local

### 2. Configuração na Vercel

1. **Criar Projeto**:
   - Acesse [vercel.com](https://vercel.com)
   - Conecte seu repositório GitHub
   - Selecione a pasta `artistai-frontend`
   - A Vercel detectará automaticamente que é Next.js

2. **Variáveis de Ambiente**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_API_BASE_URL=https://artistai-backend.onrender.com
   ```

3. **Deploy Automático**:
   - Cada push na branch `main` fará deploy automaticamente

### 3. URL de Produção

- Produção: `https://artistai-frontend.vercel.app`
- Preview: URLs únicas para cada PR

## ⚙️ GitHub Actions (Opcional)

### Configuração Automática

O workflow já está configurado em `.github/workflows/deploy.yml`:

- ✅ Testes do backend (lint, syntax)
- ✅ Testes do frontend (lint, build)
- ✅ Deploy automático na branch main

### Secrets Necessários

Se usar GitHub Actions para deploy manual:

```env
# No GitHub → Settings → Secrets
RENDER_API_KEY=your-render-api-key
VERCEL_TOKEN=your-vercel-token
```

## 🔧 Configurações Adicionais

### Banco de Dados

1. **Supabase** (Recomendado):
   - Já configurado e gratuito
   - Backup automático
   - Interface web

2. **PostgreSQL Externo**:
   - Render PostgreSQL
   - AWS RDS
   - Google Cloud SQL

### Monitoramento

1. **Health Checks**:
   - Render: Automático via `/health`
   - Vercel: Automático

2. **Logs**:
   - Render: Dashboard web
   - Vercel: Dashboard web
   - GitHub Actions: Workflow logs

### Domínio Personalizado

1. **Backend**:
   - Render: Settings → Custom Domains
   - Exemplo: `api.artistai.com`

2. **Frontend**:
   - Vercel: Settings → Domains
   - Exemplo: `app.artistai.com`

## 🚨 Troubleshooting

### Problemas Comuns

1. **CORS Error**:
   - Verificar `FRONTEND_URL` no backend
   - Verificar `allowed_origins` no main.py

2. **API Connection Failed**:
   - Verificar `NEXT_PUBLIC_API_BASE_URL`
   - Testar endpoint `/health`

3. **Build Failed**:
   - Verificar logs no Render/Vercel
   - Testar build local

### Comandos de Debug

```bash
# Testar Docker local
cd artistai-backend
docker build -t artistai-backend .
docker run -p 8080:8080 artistai-backend

# Testar frontend local
cd artistai-frontend
npm run build
npm start
```

## 📈 Próximos Passos

1. **SSL/HTTPS**: Automático no Render e Vercel
2. **CDN**: Automático na Vercel
3. **Backup**: Configurar backup do banco
4. **Monitoring**: Adicionar Sentry ou similar
5. **Analytics**: Adicionar Google Analytics

## 🔗 Links Úteis

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Status**: ✅ Pronto para deploy
**Última atualização**: $(date)
**Versão**: 1.0.0