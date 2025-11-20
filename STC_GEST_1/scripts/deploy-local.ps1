param(
  [switch]$NoSeed,
  [switch]$Build,
  [switch]$SkipDb
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$RootDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$BackendDir = Join-Path $RootDir "backend"
$FrontendDir = Join-Path $RootDir "frontend"
$SqlDir = Join-Path $BackendDir "sql"

function Write-Step($Message) {
  Write-Host "[deploy] $Message" -ForegroundColor Cyan
}

function Write-WarnMsg($Message) {
  Write-Host "[deploy][warning] $Message" -ForegroundColor Yellow
}

function Ensure-Command($Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "Commande manquante: $Name"
  }
}

function Ensure-EnvFile($Target, $Source) {
  if (-not (Test-Path $Target)) {
    Copy-Item $Source $Target -Force
    Write-Step "Création $(Split-Path $Target -Leaf) depuis $(Split-Path $Source -Leaf)"
  }
}

function Get-EnvValue($Path, $Key, $Default) {
  if (-not (Test-Path $Path)) {
    return $Default
  }

  $line = Select-String -Path $Path -Pattern "^$Key=" | Select-Object -Last 1
  if (-not $line) {
    return $Default
  }

  $value = ($line.Line -split "=", 2)[1]
  $value = $value.Trim("\"", "'")

  if ([string]::IsNullOrWhiteSpace($value)) {
    return $Default
  }

  return $value
}

function Invoke-MySqlScript($BaseArgs, $ScriptPath) {
  Get-Content -Raw $ScriptPath | & mysql @BaseArgs
}

Write-Step "Vérification prérequis"
Ensure-Command node
Ensure-Command npm

Write-Step "Installation dépendances backend"
Push-Location $BackendDir
npm install
Pop-Location

Write-Step "Installation dépendances frontend"
Push-Location $FrontendDir
npm install
Pop-Location

Ensure-EnvFile (Join-Path $BackendDir ".env") (Join-Path $BackendDir ".env.example")
Ensure-EnvFile (Join-Path $FrontendDir ".env") (Join-Path $FrontendDir ".env.example")

New-Item -ItemType Directory -Path (Join-Path $BackendDir "uploads") -Force | Out-Null

if (-not $SkipDb) {
  Ensure-Command mysql

  $envFile = Join-Path $BackendDir ".env"
  $dbHost = Get-EnvValue $envFile "DB_HOST" "localhost"
  $dbPort = Get-EnvValue $envFile "DB_PORT" "3306"
  $dbUser = Get-EnvValue $envFile "DB_USER" "root"
  $dbPassword = Get-EnvValue $envFile "DB_PASSWORD" ""

  $mysqlArgs = @("--protocol=TCP", "-h", $dbHost, "-P", $dbPort, "-u", $dbUser)
  if (-not [string]::IsNullOrWhiteSpace($dbPassword)) {
    $mysqlArgs += "-p$dbPassword"
  }

  Write-Step "Test connexion MySQL ($dbUser@$dbHost:$dbPort)"
  & mysql @mysqlArgs "-e" "SELECT 1;" | Out-Null

  Write-Step "Application du schema principal"
  Invoke-MySqlScript $mysqlArgs (Join-Path $SqlDir "schema.sql")

  Write-Step "Application migration Catalogues"
  Invoke-MySqlScript $mysqlArgs (Join-Path $SqlDir "migration_catalogues.sql")

  if (-not $NoSeed) {
    Write-Step "Application des données de démonstration"
    Invoke-MySqlScript $mysqlArgs (Join-Path $SqlDir "seed.sql")
  }
  else {
    Write-Step "Seed ignoré (-NoSeed)"
  }
}
else {
  Write-WarnMsg "Migration SQL ignorée (-SkipDb)"
}

if ($Build) {
  Write-Step "Build frontend"
  Push-Location $FrontendDir
  npm run build
  Pop-Location
}

Write-Step "Déploiement local terminé"
Write-Host "Démarrage rapide: .\scripts\start-local.ps1" -ForegroundColor Green
