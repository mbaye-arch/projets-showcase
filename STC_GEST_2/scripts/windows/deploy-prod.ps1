Param(
  [int]$FrontPort = 4173
)

$ErrorActionPreference = "Stop"
$RootDir = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$BackendDir = Join-Path $RootDir "backend"
$FrontendDir = Join-Path $RootDir "frontend"

if (-not (Test-Path (Join-Path $BackendDir ".env")) -or -not (Test-Path (Join-Path $FrontendDir ".env"))) {
  throw "Fichiers .env absents. Lance d'abord .\\scripts\\windows\\configure-env.ps1"
}

Write-Host "Installation dépendances..." -ForegroundColor Cyan
npm --prefix "$BackendDir" install
npm --prefix "$FrontendDir" install

Write-Host "Build frontend..." -ForegroundColor Cyan
npm --prefix "$FrontendDir" run build

Write-Host "Prisma generate backend..." -ForegroundColor Cyan
npm --prefix "$BackendDir" run prisma:generate

Write-Host "Démarrage PM2..." -ForegroundColor Cyan
npx pm2 delete stc-gets-backend *> $null
npx pm2 delete stc-gets-frontend *> $null

npx pm2 start "npm.cmd --prefix '$BackendDir' run start" --name stc-gets-backend
npx pm2 start "npm.cmd --prefix '$FrontendDir' run preview -- --host 0.0.0.0 --port $FrontPort" --name stc-gets-frontend
npx pm2 save

Write-Host "Déploiement local production terminé." -ForegroundColor Green
Write-Host "Frontend preview: http://localhost:$FrontPort"
Write-Host "Backend API:      http://localhost:4000"
Write-Host "Statut PM2:       npx pm2 status"
