param(
  [switch]$NoSeed,
  [switch]$Build,
  [switch]$SkipDb
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$RootDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$DeployScript = Join-Path $RootDir "scripts\deploy-local.ps1"
$StartScript = Join-Path $RootDir "scripts\start-local.ps1"

$deployArgs = @()
if ($NoSeed) { $deployArgs += "-NoSeed" }
if ($Build) { $deployArgs += "-Build" }
if ($SkipDb) { $deployArgs += "-SkipDb" }

Write-Host "[run-local] Déploiement local (install + SQL + seed)" -ForegroundColor Cyan
& $DeployScript @deployArgs

Write-Host "[run-local] Démarrage backend + frontend" -ForegroundColor Cyan
& $StartScript
