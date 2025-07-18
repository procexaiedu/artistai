# artistAI

Sistema de inteligência artificial para artistas, composto por um backend robusto em FastAPI e interface moderna.

## 📋 Progresso Atual

### ✅ Fase 1: Estruturação Inicial e Health Check

**Objetivo**: Estabelecer a base sólida do projeto com configurações essenciais.

**Concluído**:
- ✅ Criação do diretório `artistai-backend` 
- ✅ Configuração do ambiente virtual Python (`venv`)
- ✅ Instalação de dependências essenciais:
  - `fastapi` - Framework web moderno
  - `uvicorn` - Servidor ASGI
  - `sqlalchemy` - ORM para banco de dados
  - `psycopg2-binary` - Driver PostgreSQL
  - `alembic` - Sistema de migrações
  - `python-dotenv` - Gerenciamento de variáveis de ambiente
- ✅ Estrutura de diretórios organizada
- ✅ Configuração de variáveis de ambiente seguras (`.env.example`)
- ✅ Endpoint de Health Check (`GET /`) implementado

### ✅ Fase 2: Sistema de Migrações com Alembic

**Objetivo**: Configurar gerenciamento versionado do schema do banco de dados.

**Concluído**:
- ✅ Inicialização do Alembic no projeto
- ✅ Criação do módulo centralizado `app/database.py`
- ✅ Configuração dinâmica de conexão com banco via variáveis de ambiente
- ✅ Estrutura de migrações preparada e funcional
- ✅ Integração segura com Supabase (PostgreSQL)

## 🏗️ Estrutura Atual

```
artistai/
├── artistai-backend/
│   ├── alembic/                 # Sistema de migrações
│   │   ├── versions/           # Scripts de migração
│   │   ├── env.py             # Configuração do Alembic
│   │   └── script.py.mako     # Template de migração
│   ├── app/
│   │   ├── main.py            # Aplicação FastAPI principal
│   │   └── database.py        # Configuração do banco de dados
│   ├── venv/                  # Ambiente virtual Python
│   ├── alembic.ini           # Configuração do Alembic
│   ├── requirements.txt      # Dependências do projeto
│   ├── .env.example         # Exemplo de variáveis de ambiente
│   └── .env                 # Variáveis de ambiente (não versionado)
└── README.md                # Este arquivo
```

## 🚀 Como Executar

### Pré-requisitos
- Python 3.8+
- PostgreSQL (ou Supabase configurado)

### Configuração

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/procexaiedu/agentai.git
   cd agentai/artistai-backend
   ```

2. **Ative o ambiente virtual**:
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Configure as variáveis de ambiente**:
   ```bash
   cp .env.example .env
   # Edite o .env com suas credenciais do Supabase
   ```

4. **Execute a aplicação**:
   ```bash
   uvicorn app.main:app --reload
   ```

5. **Acesse**: http://localhost:8000

### Health Check
- **GET /** - Verifica se a API está online
- **Response**: `{"message": "artistAI Backend is running!"}`

## 🗄️ Banco de Dados

### Configuração
- **Provider**: Supabase (PostgreSQL)
- **ORM**: SQLAlchemy 2.0.41
- **Migrações**: Alembic 1.16.4

### Variáveis Necessárias (.env)
```env
DATABASE_URL=postgresql://usuario:senha@host:porta/database
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua-service-key
```

## 🔄 Próximos Passos

### Fase 3: Modelagem de Dados (Pendente)
- [ ] Definir modelos SQLAlchemy para o domínio
- [ ] Criar primeiras migrações do banco
- [ ] Implementar sistema de usuários

### Fase 4: Endpoints da API (Pendente)
- [ ] Autenticação e autorização
- [ ] CRUD de recursos principais
- [ ] Integração com serviços de IA

### Fase 5: Integração de IA (Pendente)
- [ ] Conectar com modelos de IA
- [ ] Processamento de imagens/arte
- [ ] Sistema de recomendações

## 🛠️ Tecnologias

- **Backend**: FastAPI 0.116.1
- **Banco**: PostgreSQL (via Supabase)
- **ORM**: SQLAlchemy 2.0.41
- **Migrações**: Alembic 1.16.4
- **Servidor**: Uvicorn 0.35.0
- **Ambiente**: Python 3.13+ com venv

## 📝 Status

**Estado Atual**: ✅ **Base Funcional Completa**

O projeto está com sua estrutura base totalmente funcional. A API pode ser executada e o sistema de migrações está configurado e pronto para uso. Estamos preparados para iniciar a definição dos modelos de dados e implementação dos endpoints principais.

---

*Projeto em desenvolvimento ativo. Última atualização: Dezembro 2024*
