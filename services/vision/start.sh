#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

# Once both models are cached, skip the Hugging Face network check so the
# service starts the same way with the wifi off.
hub="${HF_HOME:-$HOME/.cache/huggingface}/hub"
if [ -d "$hub/models--facebook--sam2.1-hiera-small" ] && [ -d "$hub/models--google--siglip2-base-patch16-224" ]; then
  export HF_HUB_OFFLINE=1
fi

python=.venv/bin/python
[ -x "$python" ] || python=.venv/Scripts/python.exe
exec "$python" -m uvicorn main:app --host 127.0.0.1 --port 7000
