param([switch]$Dev)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$model = if ($env:OTAGHDB_MODEL) { $env:OTAGHDB_MODEL } else { "qwen3.5:9b" }

function Wait-Up([string]$url, [string]$what, [int]$seconds, [string]$hint) {
  $deadline = (Get-Date).AddSeconds($seconds)
  while (-not (Test-Up $url)) {
    if ((Get-Date) -gt $deadline) { throw "$what did not start within $seconds seconds. $hint" }
    Start-Sleep -Seconds 2
  }
}

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
  Wait-Up "http://127.0.0.1:11434/api/version" "Ollama" 60 "Open the Ollama app and run this again."
}

if (-not (Test-Up "http://127.0.0.1:7000/health")) {
  Write-Host "Starting the vision service in its own window. The first start downloads the models."
  Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "services/vision/start.ps1"
  Wait-Up "http://127.0.0.1:7000/health" "The vision service" 600 "Check its window for the error."
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

function Start-PhoneLink {
  if (-not (Get-Command tailscale -ErrorAction SilentlyContinue)) {
    Write-Host "Tailscale is not installed, so phones cannot connect. The laptop works without it."
    return
  }
  try {
    $status = (tailscale status --json 2>$null | Out-String) | ConvertFrom-Json
  } catch {
    $status = $null
  }
  if (-not $status -or $status.BackendState -ne "Running") {
    Write-Host "Tailscale is not signed in, so phones cannot connect. Run 'tailscale up', then run this again."
    return
  }
  # The first serve on a tailnet can stop to ask for HTTPS to be turned on,
  # so it gets a time limit instead of holding up the app.
  $serve = Start-Process tailscale -ArgumentList "serve", "--bg", "3100" -NoNewWindow -PassThru
  # Without touching Handle first, ExitCode comes back empty and a working serve looks like a failure.
  $null = $serve.Handle
  if (-not $serve.WaitForExit(20000) -or $serve.ExitCode -ne 0) {
    if (-not $serve.HasExited) { $serve.Kill() }
    Write-Warning "tailscale serve did not finish. Turn on HTTPS Certificates at https://login.tailscale.com/admin/dns, then run this again."
    return
  }
  $hostName = $status.Self.DNSName.TrimEnd(".")
  Write-Host "Phones on your tailnet: https://$hostName/app  (or scan the code at /app/phone)"
}

Start-PhoneLink

if ($Dev) {
  pnpm dev
} else {
  if (-not (Test-Path ".next/BUILD_ID")) { pnpm build }
  pnpm start
}
