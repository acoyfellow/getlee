#!/usr/bin/env bash
set -euo pipefail
npx tsc -p .
npx vitest run
npx vite build --config client/vite.config.ts --logLevel warn
if grep -rnE '^\s*(//|/\*)' client/src shared src test --include=*.ts; then echo "source comments found"; exit 1; fi
if grep -rnE '[0-9a-f]{32}' client/src shared src --include=*.ts | grep -v 0123456789abcdef; then echo "possible account id"; exit 1; fi
if [ -n "${BASE:-}" ]; then node scripts/receipt.mjs; fi
if [ -n "${PROD:-}" ]; then bash scripts/same-bundle.sh && BASE=https://getlee.link node scripts/short-receipt.mjs; fi
echo "all checks passed"
