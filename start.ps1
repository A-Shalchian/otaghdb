param([switch]$Dev)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$model = if ($env:OTAGHDB_MODEL) { $env:OTAGHDB_MODEL } else { "qwen3.5:9b" }

function Test-Up([string]$url) {
  try {
    Invoke-RestMethod $url -TimeoutSec 3 | Out-Null
    return $true
  } catch {
    return $false
  }
}

if (-not (Test-Up "http://127.0.0.1:11434/api/version")) {
  Write-Host "Starting Ollama..."
  Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden
  while (-not (Test-Up "http://127.0.0.1:11434/api/version")) { Start-Sleep -Seconds 1 }
}

if (-not (Test-Up "http://127.0.0.1:7000/health")) {
  Write-Host "Starting the vision service in its own window. The first start downloads the models."
  Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "services/vision/start.ps1"
  while (-not (Test-Up "http://127.0.0.1:7000/health")) { Start-Sleep -Seconds 2 }
}

# Loading with the same num_ctx the app sends keeps Ollama from reloading
# the model on the first real request.
Write-Host "Loading $model onto the GPU..."
$body = @{ model = $model; keep_alive = "30m"; options = @{ num_ctx = 4096 } } | ConvertTo-Json
Invoke-RestMethod "http://127.0.0.1:11434/api/generate" -Method Post -Body $body -ContentType "application/json" | Out-Null

$ps = ollama ps | Out-String
Write-Host $ps
if ($ps -notmatch "100% GPU") {
  Write-Warning "Part of the model is on the CPU, so answers will be slow. Unload models in LM Studio or Bionic, then run this again."
}

if ($Dev) {
  pnpm dev
} else {
  if (-not (Test-Path ".next/BUILD_ID")) { pnpm build }
  pnpm start
}
