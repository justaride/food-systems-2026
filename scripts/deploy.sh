#!/usr/bin/env bash
set -euo pipefail

# Deploy food-systems-2026 to Coolify with correct SOURCE_COMMIT.
# Usage: ./scripts/deploy.sh
# Requires COOLIFY_API_TOKEN in .env.local or environment.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

# Load env
if [ -f "$ROOT_DIR/.env.local" ]; then
  export $(grep -v '^#' "$ROOT_DIR/.env.local" | grep -v '^$' | xargs)
fi

: "${COOLIFY_API_TOKEN:?Set COOLIFY_API_TOKEN in .env.local}"
COOLIFY_BASE_URL="${COOLIFY_BASE_URL:-http://77.42.43.227:8000}"
COOLIFY_APP_UUID="${COOLIFY_APP_UUID:-so8ko44goccc8gcgswwscgco}"

SHA=$(git -C "$ROOT_DIR" rev-parse HEAD)
SHORT_SHA="${SHA:0:7}"
BRANCH=$(git -C "$ROOT_DIR" rev-parse --abbrev-ref HEAD)

echo "Deploying $SHORT_SHA ($BRANCH) to Coolify..."

# Update SOURCE_COMMIT env var
curl -sS -X PATCH \
  -H "Authorization: Bearer $COOLIFY_API_TOKEN" \
  -H "Content-Type: application/json" \
  "$COOLIFY_BASE_URL/api/v1/applications/$COOLIFY_APP_UUID/envs" \
  -d "{\"key\":\"SOURCE_COMMIT\",\"value\":\"$SHA\"}" > /dev/null

curl -sS -X PATCH \
  -H "Authorization: Bearer $COOLIFY_API_TOKEN" \
  -H "Content-Type: application/json" \
  "$COOLIFY_BASE_URL/api/v1/applications/$COOLIFY_APP_UUID/envs" \
  -d "{\"key\":\"SOURCE_BRANCH\",\"value\":\"$BRANCH\"}" > /dev/null

# Trigger deploy
RESPONSE=$(curl -sS -X POST \
  -H "Authorization: Bearer $COOLIFY_API_TOKEN" \
  -H "Content-Type: application/json" \
  "$COOLIFY_BASE_URL/api/v1/deploy" \
  -d "{\"uuid\":\"$COOLIFY_APP_UUID\",\"force\":true}")

DEPLOY_UUID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['deployments'][0]['deployment_uuid'])" 2>/dev/null || echo "unknown")

echo "Deploy queued: $DEPLOY_UUID"
echo "Verify: curl -sS https://food-systems.naturalstateproject.com/api/version"
