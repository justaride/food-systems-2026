#!/usr/bin/env bash
set -euo pipefail

echo "ERROR: deploy.sh is retired." >&2
echo "Deploy through the protected Git/Coolify integration, then run the manual Coolify Deploy Verify workflow. Do not recreate static SOURCE_COMMIT or SOURCE_BRANCH application variables." >&2
exit 1
