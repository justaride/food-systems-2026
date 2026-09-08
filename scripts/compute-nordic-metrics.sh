#!/bin/bash
# Compatibility entry point. One generator owns country chart metrics.
set -euo pipefail
cd "$(dirname "$0")/.."
exec npm run compute-metrics
