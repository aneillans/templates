#!/usr/bin/env bash
# Packs the template packages, installs them into an isolated template hive,
# generates each template the way a consumer would, then builds and tests the output.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# Generated projects must live outside the repo so they do not inherit the
# repo's Directory.Build.props / central package management.
WORK_DIR="$(mktemp -d "${RUNNER_TEMP:-${TMPDIR:-/tmp}}/template-smoke.XXXXXX")"
HIVE="${WORK_DIR}/hive"
PACKAGES="${WORK_DIR}/packages"
OUT="${WORK_DIR}/out"
trap 'rm -rf "${WORK_DIR}"' EXIT

export DOTNET_SKIP_FIRST_TIME_EXPERIENCE=1
export DOTNET_NOLOGO=1

for pack in "${ROOT_DIR}"/templates/*/*.TemplatePack.csproj; do
  dotnet pack "${pack}" -c Release -o "${PACKAGES}"
done

for package in "${PACKAGES}"/*.nupkg; do
  dotnet new install "${package}" --debug:custom-hive "${HIVE}"
done

new() {
  dotnet new "$@" --debug:custom-hive "${HIVE}"
}

# Fails if packaging metadata leaked into generated output.
assert_clean_output() {
  local dir="$1"
  for stray in content _rels package '[Content_Types].xml' '*.nuspec' '*.TemplatePack.csproj'; do
    if compgen -G "${dir}/${stray}" >/dev/null; then
      echo "Generated output ${dir} contains packaging artefact '${stray}'." >&2
      exit 1
    fi
  done
}

new neillans-api -n Smoke.Api -o "${OUT}/Smoke.Api"
assert_clean_output "${OUT}/Smoke.Api"
dotnet test "${OUT}/Smoke.Api/Smoke.Api.sln"

new neillans-api -n Smoke.LeanApi --useSwagger false -o "${OUT}/Smoke.LeanApi"
assert_clean_output "${OUT}/Smoke.LeanApi"
if grep -rqiE "swagger|openapi" "${OUT}/Smoke.LeanApi/src" "${OUT}/Smoke.LeanApi/docker"; then
  echo "--useSwagger false output still references Swagger/OpenAPI." >&2
  exit 1
fi
dotnet test "${OUT}/Smoke.LeanApi/Smoke.LeanApi.sln"

new neillans-mvc -n Smoke.Mvc -o "${OUT}/Smoke.Mvc"
assert_clean_output "${OUT}/Smoke.Mvc"
dotnet test "${OUT}/Smoke.Mvc/Smoke.Mvc.sln"

# Fails if template preprocessor directives survived into generated output.
assert_no_directives() {
  if grep -rnE '^\s*(//)?#(if|else|elif|endif)\b|<!--#' "$1" --exclude-dir=node_modules; then
    echo "Generated output $1 still contains template directives." >&2
    exit 1
  fi
}

for auth in oidc proxy; do
  name="smoke-spa-${auth}"
  new neillans-angular -n "${name}" --auth "${auth}" -o "${OUT}/${name}"
  assert_clean_output "${OUT}/${name}"
  assert_no_directives "${OUT}/${name}"
  npm --prefix "${OUT}/${name}/${name}" ci
  npm --prefix "${OUT}/${name}/${name}" run lint
  npm --prefix "${OUT}/${name}/${name}" run build
  npm --prefix "${OUT}/${name}/${name}" test
done

if grep -rq "ProxyAuthService\|authProxyBasePath" "${OUT}/smoke-spa-oidc/smoke-spa-oidc/src"; then
  echo "--auth oidc output references the proxy model." >&2
  exit 1
fi
if grep -rq "OidcSecurityService\|oidcAuthority" "${OUT}/smoke-spa-proxy/smoke-spa-proxy/src"; then
  echo "--auth proxy output references the oidc model." >&2
  exit 1
fi

echo "Template smoke tests completed successfully."
