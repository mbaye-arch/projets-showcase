Param(
  [string]$DbUser = "stc_user",
  [string]$DbPassword = "change_me_locally",
  [string]$DbHost = "127.0.0.1",
  [string]$DbPort = "3306",
  [string]$DbName = "stc_gets",
  [string]$BackendPort = "4000",
  [string]$FrontendOrigin = "http://localhost:5173",
  [string]$ApiUrl = ""
)

$ErrorActionPreference = "Stop"
$RootDir = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$BackendEnv = Join-Path $RootDir "backend\.env"
$FrontendEnv = Join-Path $RootDir "frontend\.env"

if ([string]::IsNullOrWhiteSpace($ApiUrl)) {
  $ApiUrl = "http://localhost:$BackendPort/api"
}

$backendContent = @"
PORT=$BackendPort
DATABASE_URL=""mysql://$DbUser:$DbPassword@$DbHost:$DbPort/$DbName""
CORS_ORIGIN=""$FrontendOrigin""
APP_BASE_URL=""$FrontendOrigin""
"@

$frontendContent = @"
VITE_API_URL=$ApiUrl
"@

Set-Content -Path $BackendEnv -Value $backendContent -Encoding UTF8
Set-Content -Path $FrontendEnv -Value $frontendContent -Encoding UTF8

Write-Host "Configuration écrite:" -ForegroundColor Green
Write-Host "- $BackendEnv"
Write-Host "- $FrontendEnv"
Write-Host "DATABASE_URL => mysql://$DbUser:***@$DbHost:$DbPort/$DbName"
