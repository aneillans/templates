#!/usr/bin/env bash
# Regenerates the Angular examples from the current template content, one per auth model.
# Run after changing templates/neillans-angular, then review the diff.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/angular-examples.XXXXXX")"
trap 'rm -rf "${WORK_DIR}"' EXIT

dotnet pack "${ROOT_DIR}/templates/neillans-angular/neillans-angular.TemplatePack.csproj" -c Release -o "${WORK_DIR}/packages" >/dev/null
dotnet new install "${WORK_DIR}"/packages/*.nupkg --debug:custom-hive "${WORK_DIR}/hive" >/dev/null

regenerate() {
  local example="$1" name="$2" auth="$3"
  local target="${ROOT_DIR}/examples/${example}/content"
  rm -rf "${target}"
  dotnet new neillans-angular -n "${name}" --auth "${auth}" -o "${target}" --debug:custom-hive "${WORK_DIR}/hive" >/dev/null
  echo "Regenerated examples/${example} (--auth ${auth})"
}

regenerate angular-demo demo-angular oidc
regenerate angular-proxy-demo demo-angular-proxy proxy
