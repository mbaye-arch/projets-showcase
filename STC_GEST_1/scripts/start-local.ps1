$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$RootDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$BackendDir = Join-Path $RootDir "backend"
$FrontendDir = Join-Path $RootDir "frontend"

Write-Host "[start] Ouverture backend (npm run dev)" -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location '$BackendDir'; npm run dev"
)

Start-Sleep -Seconds 1

Write-Host "[start] Ouverture frontend (npm run dev)" -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location '$FrontendDir'; npm run dev"
)

Write-Host "[start] Services lancés dans deux terminaux séparés." -ForegroundColor Green
Write-Host "[start] Backend: http://localhost:5000" -ForegroundColor Green
Write-Host "[start] Frontend: http://localhost:5173" -ForegroundColor Green
