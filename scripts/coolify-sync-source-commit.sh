#!/usr/bin/env bash
# Synker Coolify SOURCE_COMMIT env-var med nåværende main HEAD.
# Kjøres etter PR-merge for å sikre at /api/version reflekterer riktig SHA.
#
# Bakgrunn:
# - Coolify auto-injecter ikke COOLIFY_GIT_COMMIT_SHA som build-arg
# - write-version.ts er avhengig av SOURCE_COMMIT-env satt manuelt i Coolify
# - Når env-var settes manuelt, går den IKKE auto-oppdatert per deploy
# - Dette scriptet er en bro inntil en bedre Coolify-integrasjon finnes
#
# Bruk:
#   ./scripts/coolify-sync-source-commit.sh
#   ./scripts/coolify-sync-source-commit.sh --redeploy   (trigger redeploy etter sync)
#
# Krever env-vars fra .env.local:
#   COOLIFY_API_TOKEN, COOLIFY_BASE_URL, COOLIFY_APP_UUID

set -euo pipefail

ENV_FILE="$(dirname "$0")/../.env.local"
[ -f "$ENV_FILE" ] || { echo "ERROR: .env.local mangler"; exit 1; }

TOKEN=$(grep "^COOLIFY_API_TOKEN=" "$ENV_FILE" | cut -d'=' -f2-)
BASE=$(grep "^COOLIFY_BASE_URL=" "$ENV_FILE" | cut -d'=' -f2-)
UUID=$(grep "^COOLIFY_APP_UUID=" "$ENV_FILE" | cut -d'=' -f2-)

[ -n "$TOKEN" ] && [ -n "$BASE" ] && [ -n "$UUID" ] || {
  echo "ERROR: COOLIFY_API_TOKEN / BASE_URL / APP_UUID mangler i .env.local"
  exit 1
}

# Hent siste commit på main fra GitHub
CURRENT_SHA=$(curl -sS "https://api.github.com/repos/justaride/food-systems-2026/commits/main" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['sha'])")
echo "main HEAD: $CURRENT_SHA"

# List eksisterende SOURCE_COMMIT-rader (kan være 2: en for prod og en for preview)
EXISTING=$(curl -sS -H "Authorization: Bearer $TOKEN" "$BASE/api/v1/applications/$UUID/envs" \
  | python3 -c "
import sys, json
d = json.load(sys.stdin)
envs = d if isinstance(d, list) else d.get('envs', [])
for e in envs:
    if e.get('key') == 'SOURCE_COMMIT':
        print(f\"{e['uuid']} {e.get('value','')[:8]}\")
")

if [ -z "$EXISTING" ]; then
  echo "Ingen SOURCE_COMMIT-env funnet. Oppretter ny."
  curl -sS -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    "$BASE/api/v1/applications/$UUID/envs" \
    -d "{\"key\":\"SOURCE_COMMIT\",\"value\":\"$CURRENT_SHA\"}"
  echo ""
else
  echo "Eksisterende SOURCE_COMMIT-rader:"
  echo "$EXISTING"
  while IFS= read -r line; do
    UUID_ENV=$(echo "$line" | awk '{print $1}')
    OLD_VAL=$(echo "$line" | awk '{print $2}')
    if [ "$OLD_VAL" = "${CURRENT_SHA:0:8}" ]; then
      echo "  $UUID_ENV: allerede synket ($OLD_VAL)"
    else
      echo "  $UUID_ENV: oppdaterer $OLD_VAL → ${CURRENT_SHA:0:8}"
      curl -sS -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
        "$BASE/api/v1/applications/$UUID/envs" \
        -d "{\"key\":\"SOURCE_COMMIT\",\"value\":\"$CURRENT_SHA\"}" > /dev/null
    fi
  done <<< "$EXISTING"
fi

if [ "${1:-}" = "--redeploy" ]; then
  echo ""
  echo "=== Trigger redeploy ==="
  curl -sS -X POST -H "Authorization: Bearer $TOKEN" "$BASE/api/v1/deploy?uuid=$UUID&force=true" \
    | python3 -c "import sys,json; d=json.load(sys.stdin); print('Queued:', d.get('deployments',[{}])[0].get('deployment_uuid','?'))"
fi

echo ""
echo "Ferdig."
