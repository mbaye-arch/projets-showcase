$ErrorActionPreference = "Stop"
$RootDir = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$BackendDir = Join-Path $RootDir "backend"
$FrontendDir = Join-Path $RootDir "frontend"

if (-not (Test-Path (Join-Path $BackendDir ".env")) -or -not (Test-Path (Join-Path $FrontendDir ".env"))) {
  throw "Fichiers .env absents. Lance d'abord .\\scripts\\windows\\configure-env.ps1"
}

$ShellExe = if (Get-Command pwsh -ErrorAction SilentlyContinue) { "pwsh" } else { "powershell" }

$backendCommand = "Set-Location '$BackendDir'; npm run dev"
$frontendCommand = "Set-Location '$FrontendDir'; npm run dev"

Start-Process -FilePath $ShellExe -ArgumentList "-NoExit", "-Command", $backendCommand | Out-Null
Start-Process -FilePath $ShellExe -ArgumentList "-NoExit", "-Command", $frontendCommand | Out-Null

Write-Host "Backend et frontend démarrés dans deux terminaux." -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173"
Write-Host "Backend:  http://localhost:4000"
