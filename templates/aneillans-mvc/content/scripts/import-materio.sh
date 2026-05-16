#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: ./scripts/import-materio.sh <path-to-materio-repo>"
  exit 1
fi

MATERIO_PATH="$1"
TARGET_ROOT="src/MvcHost"

mkdir -p "${TARGET_ROOT}/wwwroot/assets"
cp -R "${MATERIO_PATH}/src/assets/." "${TARGET_ROOT}/wwwroot/assets/"

cat <<'EOF'
Materio assets imported.
Next steps:
1. Merge layout changes into src/MvcHost/Views/Shared/_Layout.cshtml.
2. Keep your project-level changes in Theming/MaterioOverrides.
EOF
