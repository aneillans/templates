#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK_DIR="${ROOT_DIR}/.tmp/template-smoke"

rm -rf "${WORK_DIR}"
mkdir -p "${WORK_DIR}"

pushd "${ROOT_DIR}" >/dev/null

dotnet new install ./templates/aneillans-api
DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1 dotnet new aneillans-api -n Smoke.Api -o "${WORK_DIR}/Smoke.Api"
dotnet test "${WORK_DIR}/Smoke.Api/ApiHost.sln"

dotnet new install ./templates/aneillans-mvc
DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1 dotnet new aneillans-mvc -n Smoke.Mvc -o "${WORK_DIR}/Smoke.Mvc"
dotnet test "${WORK_DIR}/Smoke.Mvc/MvcHost.sln"

popd >/dev/null

echo "Template smoke tests completed successfully."
