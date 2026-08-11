#!/usr/bin/env bash
set -euo pipefail

echo "ERROR: coolify-sync-source-commit.sh is retired." >&2
echo "Remove any static SOURCE_COMMIT app variable, enable Coolify source-commit injection, deploy through the Git integration, then run the manual Coolify Deploy Verify workflow." >&2
exit 1
