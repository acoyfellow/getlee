#!/usr/bin/env bash
set -euo pipefail
local_js=$(grep -oE '/assets/index-[A-Za-z0-9_-]+\.js' dist/index.html | head -1)
prod_js=$(curl -s https://getlee.link/ | grep -oE '/assets/index-[A-Za-z0-9_-]+\.js' | head -1)
echo "local=$local_js prod=$prod_js"
[ "$local_js" = "$prod_js" ]
