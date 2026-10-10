#!/bin/sh
# Runs from the nginx image's /docker-entrypoint.d before nginx starts.
#
# 1. Writes /deployment-config.json from environment variables, so one image serves every
#    environment. Unset or empty variables are left out and the app uses its built-in defaults
#    (src/app/core/config/deployment-config.ts).
# 2. When API_UPSTREAM is set (e.g. http://api:8080), proxies /api/ to it; otherwise /api/
#    answers 503 so a missing upstream is obvious.
set -eu

HTML_ROOT=/usr/share/nginx/html
SNIPPETS=/etc/nginx/snippets

# ENV_VAR:configKey pairs. To add a setting, add it here and to DeploymentConfig.
MAPPINGS="
API_BASE_URL:apiBaseUrl
OIDC_AUTHORITY:oidcAuthority
OIDC_CLIENT_ID:oidcClientId
OIDC_SCOPE:oidcScope
"

# Minimal JSON string escaping: backslash and double quote.
json_escape() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

json="{"
separator=""
for mapping in $MAPPINGS; do
  case "$mapping" in \#*) continue ;; esac
  var=${mapping%%:*}
  key=${mapping#*:}
  value=$(printenv "$var" || true)
  if [ -n "$value" ]; then
    json="${json}${separator}
  \"${key}\": \"$(json_escape "$value")\""
    separator=","
  fi
done
json="${json}
}"
printf '%s\n' "$json" > "$HTML_ROOT/deployment-config.json"
echo "$0: wrote $HTML_ROOT/deployment-config.json"

mkdir -p "$SNIPPETS"
rm -f "$SNIPPETS/api-proxy.conf"
if [ -n "${API_UPSTREAM:-}" ]; then
  cat > "$SNIPPETS/api-proxy.conf" <<NGINX
location /api/ {
    proxy_pass ${API_UPSTREAM%/}/;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
}
NGINX
  echo "$0: proxying /api/ to ${API_UPSTREAM}"
else
  # Without this, /api/ requests would fall through to index.html and "succeed" with HTML.
  cat > "$SNIPPETS/api-proxy.conf" <<'NGINX'
location /api/ {
    default_type application/json;
    return 503 '{"error":"API_UPSTREAM is not configured"}';
}
NGINX
fi
