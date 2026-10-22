$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# Once both models are cached, skip the Hugging Face network check so the
# service starts the same way with the wifi off.
$hub = Join-Path $env:USERPROFILE ".cache/huggingface/hub"
if ((Test-Path "$hub/models--facebook--sam2.1-hiera-small") -and (Test-Path "$hub/models--google--siglip2-base-patch16-224")) {
  $env:HF_HUB_OFFLINE = "1"
}

& .\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 7000
