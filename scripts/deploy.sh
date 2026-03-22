#!/bin/bash
# deploy.sh - Build + Deploy 776f6c6e6f na Cloudflare Pages + push GitHub
# Uzycie: ./scripts/deploy.sh [--skip-build] [--skip-github] [--skip-cf]

set -euo pipefail

SITE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_NAME="776f6c6e6f"
ENV_FILE="/home/barszcz/Fraktal/.env"

cd "$SITE_DIR"

# Wczytaj credentials z .env
if [ -f "$ENV_FILE" ]; then
    export CLOUDFLARE_API_TOKEN=$(grep CLOUDFLARE_API_KEY "$ENV_FILE" | cut -d= -f2)
    export CLOUDFLARE_ACCOUNT_ID=$(grep CLOUDFLARE_ACCOUNT_ID "$ENV_FILE" | cut -d= -f2)
fi

SKIP_BUILD=false
SKIP_GITHUB=false
SKIP_CF=false

for arg in "$@"; do
    case $arg in
        --skip-build) SKIP_BUILD=true ;;
        --skip-github) SKIP_GITHUB=true ;;
        --skip-cf) SKIP_CF=true ;;
    esac
done

echo "=== Deploy $PROJECT_NAME ==="

# 1. Build
if [ "$SKIP_BUILD" = false ]; then
    echo "[1/3] Building..."
    npm run build
    echo "  OK - dist/ gotowy ($(find dist -type f | wc -l) plikow)"
else
    echo "[1/3] Build pominiety"
fi

# 2. Cloudflare Pages
if [ "$SKIP_CF" = false ]; then
    echo "[2/3] Deploy na Cloudflare Pages..."
    npx wrangler pages deploy dist/ --project-name "$PROJECT_NAME" --branch main --commit-dirty=true
    echo "  OK"
else
    echo "[2/3] CF deploy pominiety"
fi

# 3. GitHub push
if [ "$SKIP_GITHUB" = false ]; then
    if git rev-parse --git-dir > /dev/null 2>&1; then
        echo "[3/3] Push na GitHub..."
        git add -A
        if git diff --cached --quiet; then
            echo "  Brak zmian do commitowania"
        else
            git commit -m "deploy: $(date +%Y-%m-%d_%H:%M)"
            git push origin main
            echo "  OK"
        fi
    else
        echo "[3/3] Git nie zainicjalizowany - pominiety"
    fi
else
    echo "[3/3] GitHub push pominiety"
fi

echo "=== Deploy zakonczony ==="
