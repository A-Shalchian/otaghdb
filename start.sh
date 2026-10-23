#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

model="${OTAGHDB_MODEL:-qwen3.5:9b}"
dev=false
[ "${1:-}" = "--dev" ] && dev=true
started=""

warn() { printf 'WARNING: %s\n' "$*" >&2; }
fail() { printf '%s\n' "$*" >&2; exit 1; }
up() { curl -sf -m 3 "$1" >/dev/null 2>&1; }

wait_up() {
  local url=$1 what=$2 seconds=$3 hint=$4
  local deadline=$((SECONDS + seconds))
  until up "$url"; do
    [ "$SECONDS" -lt "$deadline" ] || fail "$what did not start within $seconds seconds. $hint"
    sleep 2
  done
}

# Ollama and the vision service run in the background here instead of in
# their own windows, so stop the ones this script started when the app stops.
stop_started() {
  for pid in $started; do kill "$pid" 2>/dev/null || true; done
}
trap stop_started EXIT
trap 'exit 130' INT TERM

command -v pnpm >/dev/null || fail "pnpm is not installed. Run 'npm install -g pnpm', then run this again."
[ -d node_modules ] || fail "Run 'pnpm install' first."
[ -d services/vision/.venv ] || fail "The vision service is not installed. Follow the setup steps in README.md."
mkdir -p data

if ! up "http://127.0.0.1:11434/api/version"; then
  command -v ollama >/dev/null || fail "Ollama is not installed. Get it from https://ollama.com, then run this again."
  echo "Starting Ollama..."
  ollama serve >data/ollama.log 2>&1 &
  started="$started $!"
  wait_up "http://127.0.0.1:11434/api/version" "Ollama" 60 "See data/ollama.log."
fi

if ! up "http://127.0.0.1:7000/health"; then
  echo "Starting the vision service, logging to data/vision.log. The first start downloads the models."
  services/vision/start.sh >data/vision.log 2>&1 &
  started="$started $!"
  wait_up "http://127.0.0.1:7000/health" "The vision service" 600 "See data/vision.log for the error."
fi

# Ollama can run its models in its own llama-server, so only other copies count.
others=$(ps -A -o command= 2>/dev/null | grep -E "[l]lama-server|[L]M Studio|[C]omfyUI" | grep -iv ollama || true)
if [ -n "$others" ]; then
  warn "LM Studio, ComfyUI or another llama-server is running and may be holding GPU memory. Unload their models if Qwen does not fit."
fi

# Loading with the same num_ctx the app sends keeps Ollama from reloading
# the model on the first real request.
echo "Loading $model onto the GPU..."
body="{\"model\":\"$model\",\"keep_alive\":\"30m\",\"options\":{\"num_ctx\":4096}}"
if curl -sf -m 600 http://127.0.0.1:11434/api/generate -H "Content-Type: application/json" -d "$body" >/dev/null; then
  ps_out=$(ollama ps 2>/dev/null || true)
  echo "$ps_out"
  case "$ps_out" in
    *"100% GPU"*) ;;
    *) warn "Part of the model is on the CPU, so answers will be slow. Close other apps that use the GPU, then run this again." ;;
  esac
else
  warn "$model did not load. Check that you ran 'ollama pull $model' and that other apps are not using the memory. The app starts anyway: adding still saves, without AI names."
fi

phone_link() {
  if ! command -v tailscale >/dev/null; then
    echo "The tailscale command is not installed, so phones cannot connect. The laptop works without it."
    return
  fi
  local state backend host pid waited=0
  state=$(tailscale status --json 2>/dev/null | node -e '
    let s = "";
    process.stdin.on("data", (d) => (s += d)).on("end", () => {
      try {
        const j = JSON.parse(s);
        console.log(j.BackendState, (j.Self?.DNSName ?? "").replace(/\.$/, ""));
      } catch {
        console.log("");
      }
    });' || true)
  read -r backend host <<<"$state" || true
  if [ "${backend:-}" != "Running" ]; then
    echo "Tailscale is not signed in, so phones cannot connect. Run 'tailscale up', then run this again."
    return
  fi
  # The first serve on a tailnet can stop to ask for HTTPS to be turned on,
  # so it gets a time limit instead of holding up the app.
  tailscale serve --bg 3100 &
  pid=$!
  while kill -0 "$pid" 2>/dev/null && [ "$waited" -lt 20 ]; do
    sleep 1
    waited=$((waited + 1))
  done
  if kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null || true
    warn "tailscale serve did not finish. Turn on HTTPS Certificates at https://login.tailscale.com/admin/dns, then run this again."
    return
  fi
  if ! wait "$pid"; then
    warn "tailscale serve failed. Turn on HTTPS Certificates at https://login.tailscale.com/admin/dns, then run this again."
    return
  fi
  echo "Phones on your tailnet: https://$host/app  (or scan the code at /app/phone)"
}

phone_link

build_stale() {
  [ -f .next/BUILD_ID ] || return 0
  [ -n "$(find src db public next.config.ts package.json pnpm-lock.yaml -type f -newer .next/BUILD_ID 2>/dev/null | head -n 1)" ]
}

if [ "$dev" = true ]; then
  pnpm dev
else
  if build_stale; then
    echo "The code changed since the last build, so building first..."
    pnpm build || fail "The build failed. Fix the error above, then run this again."
  fi
  pnpm start
fi
