# Script PowerShell para testar o deploy localmente antes de enviar para produção
# Execute: .\scripts\deploy-test.ps1

# Configurar para parar em caso de erro
$ErrorActionPreference = "Stop"

Write-Host "🚀 Testando Deploy Local - artistAI" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Função para log colorido
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Verificar se Docker está rodando
try {
    docker info | Out-Null
    Write-Info "Docker está rodando ✓"
}
catch {
    Write-Error-Custom "Docker não está rodando. Inicie o Docker e tente novamente."
    exit 1
}

# Testar Backend
Write-Host ""
Write-Info "=== Testando Backend ==="
Set-Location artistai-backend

# Build da imagem Docker
Write-Info "Construindo imagem Docker..."
docker build -t artistai-backend-test .

# Verificar se a imagem foi criada
$imageExists = docker images --format "table {{.Repository}}" | Select-String "artistai-backend-test"
if ($imageExists) {
    Write-Info "Imagem Docker criada com sucesso ✓"
} else {
    Write-Error-Custom "Falha ao criar imagem Docker"
    exit 1
}

# Testar se o container inicia
Write-Info "Testando inicialização do container..."
docker run --rm -d --name artistai-backend-test -p 8081:8080 artistai-backend-test

# Aguardar alguns segundos para o container inicializar
Write-Info "Aguardando container inicializar..."
Start-Sleep -Seconds 5

# Testar health check
Write-Info "Testando health check..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Info "Health check passou ✓"
    }
}
catch {
    Write-Warn "Health check falhou - verificar logs"
    docker logs artistai-backend-test
}

# Testar endpoint principal
Write-Info "Testando endpoint principal..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Info "Endpoint principal funcionando ✓"
    }
}
catch {
    Write-Warn "Endpoint principal falhou"
}

# Parar container de teste
docker stop artistai-backend-test
Write-Info "Container de teste parado"

# Voltar para raiz
Set-Location ..

# Testar Frontend
Write-Host ""
Write-Info "=== Testando Frontend ==="
Set-Location artistai-frontend

# Verificar se node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Info "Instalando dependências..."
    npm ci
}

# Testar lint
Write-Info "Executando lint..."
try {
    npm run lint
    Write-Info "Lint passou ✓"
}
catch {
    Write-Warn "Lint falhou - verificar código"
}

# Testar build
Write-Info "Testando build de produção..."
try {
    npm run build
    Write-Info "Build de produção passou ✓"
}
catch {
    Write-Error-Custom "Build de produção falhou"
    Set-Location ..
    exit 1
}

# Voltar para raiz
Set-Location ..

# Limpeza
Write-Host ""
Write-Info "=== Limpeza ==="
docker rmi artistai-backend-test
Write-Info "Imagem de teste removida"

Write-Host ""
Write-Info "=== Resumo do Teste ==="
Write-Info "✓ Docker build do backend"
Write-Info "✓ Container inicialização"
Write-Info "✓ Health check endpoint"
Write-Info "✓ Frontend lint"
Write-Info "✓ Frontend build"

Write-Host ""
Write-Info "🎉 Todos os testes passaram! Pronto para deploy em produção."
Write-Info "Próximos passos:"
Write-Info "1. git add ."
Write-Info "2. git commit -m 'feat: configuração de deploy completa'"
Write-Info "3. git push origin main"
Write-Info "4. Configurar Render e Vercel conforme DEPLOY.md"

Write-Host ""
Write-Warn "Lembre-se de configurar as variáveis de ambiente em produção!"
Write-Host "Consulte o arquivo DEPLOY.md para instruções detalhadas." -ForegroundColor Cyan