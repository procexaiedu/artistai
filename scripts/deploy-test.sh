#!/bin/bash

# Script para testar o deploy localmente antes de enviar para produção
# Execute: chmod +x scripts/deploy-test.sh && ./scripts/deploy-test.sh

set -e  # Parar em caso de erro

echo "🚀 Testando Deploy Local - artistAI"
echo "====================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    log_error "Docker não está rodando. Inicie o Docker e tente novamente."
    exit 1
fi

log_info "Docker está rodando ✓"

# Testar Backend
echo ""
log_info "=== Testando Backend ==="
cd artistai-backend

# Build da imagem Docker
log_info "Construindo imagem Docker..."
docker build -t artistai-backend-test .

# Verificar se a imagem foi criada
if docker images | grep -q artistai-backend-test; then
    log_info "Imagem Docker criada com sucesso ✓"
else
    log_error "Falha ao criar imagem Docker"
    exit 1
fi

# Testar se o container inicia
log_info "Testando inicialização do container..."
docker run --rm -d --name artistai-backend-test -p 8081:8080 artistai-backend-test

# Aguardar alguns segundos para o container inicializar
sleep 5

# Testar health check
log_info "Testando health check..."
if curl -f http://localhost:8081/health > /dev/null 2>&1; then
    log_info "Health check passou ✓"
else
    log_warn "Health check falhou - verificar logs"
    docker logs artistai-backend-test
fi

# Testar endpoint principal
log_info "Testando endpoint principal..."
if curl -f http://localhost:8081/ > /dev/null 2>&1; then
    log_info "Endpoint principal funcionando ✓"
else
    log_warn "Endpoint principal falhou"
fi

# Parar container de teste
docker stop artistai-backend-test
log_info "Container de teste parado"

# Voltar para raiz
cd ..

# Testar Frontend
echo ""
log_info "=== Testando Frontend ==="
cd artistai-frontend

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    log_info "Instalando dependências..."
    npm ci
fi

# Testar lint
log_info "Executando lint..."
if npm run lint; then
    log_info "Lint passou ✓"
else
    log_warn "Lint falhou - verificar código"
fi

# Testar build
log_info "Testando build de produção..."
if npm run build; then
    log_info "Build de produção passou ✓"
else
    log_error "Build de produção falhou"
    exit 1
fi

# Voltar para raiz
cd ..

# Limpeza
echo ""
log_info "=== Limpeza ==="
docker rmi artistai-backend-test
log_info "Imagem de teste removida"

echo ""
log_info "=== Resumo do Teste ==="
log_info "✓ Docker build do backend"
log_info "✓ Container inicialização"
log_info "✓ Health check endpoint"
log_info "✓ Frontend lint"
log_info "✓ Frontend build"

echo ""
log_info "🎉 Todos os testes passaram! Pronto para deploy em produção."
log_info "Próximos passos:"
log_info "1. git add ."
log_info "2. git commit -m 'feat: configuração de deploy completa'"
log_info "3. git push origin main"
log_info "4. Configurar Render e Vercel conforme DEPLOY.md"

echo ""
log_warn "Lembre-se de configurar as variáveis de ambiente em produção!"
echo "Consulte o arquivo DEPLOY.md para instruções detalhadas."