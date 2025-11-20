Param(
  [switch]$WithDatabase
)

$ErrorActionPreference = "Stop"
$RootDir = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$BackendDir = Join-Path $RootDir "backend"
$FrontendDir = Join-Path $RootDir "frontend"

function Assert-Command($name) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    throw "Commande manquante: $name"
  }
}

Assert-Command node
Assert-Command npm

if (-not (Test-Path (Join-Path $BackendDir ".env")) -or -not (Test-Path (Join-Path $FrontendDir ".env"))) {
  Write-Host "Fichiers .env absents, génération par défaut..." -ForegroundColor Yellow
  & (Join-Path $PSScriptRoot "configure-env.ps1")
}

$envContent = Get-Content (Join-Path $BackendDir ".env") -Raw
if ($envContent -match "mysql://root:") {
  throw "Configuration invalide détectée: backend/.env utilise root. Utilise un utilisateur MySQL dédié via .\scripts\windows\configure-env.ps1."
}

Write-Host "Installation dépendances backend..." -ForegroundColor Cyan
npm --prefix "$BackendDir" install

Write-Host "Installation dépendances frontend..." -ForegroundColor Cyan
npm --prefix "$FrontendDir" install

Write-Host "Génération Prisma client..." -ForegroundColor Cyan
npm --prefix "$BackendDir" run prisma:generate

if ($WithDatabase) {
  Write-Host "Application du schéma Prisma..." -ForegroundColor Cyan
  npm --prefix "$BackendDir" run prisma:push

  Write-Host "Seed paramètres..." -ForegroundColor Cyan
  npm --prefix "$BackendDir" run seed
}

Write-Host "Setup terminé." -ForegroundColor Green
Write-Host "- Démarrage dev: .\\scripts\\windows\\start-dev.ps1"
Write-Host "- Déploiement local prod: .\\scripts\\windows\\deploy-prod.ps1"
