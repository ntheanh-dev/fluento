#!/usr/bin/env sh
set -eu

ENV_JS_PATH="/usr/share/nginx/html/env.js"

# Generate a small JS file that exposes selected env vars at runtime.
# This enables changing config without rebuilding the image.
cat > "${ENV_JS_PATH}" <<EOF
window.__ENV__ = {
  VITE_API_URL: "${VITE_API_URL:-/api}",
  VITE_GOOGLE_CLIENT_ID: "${VITE_GOOGLE_CLIENT_ID:-}",
  VITE_GOOGLE_REDIRECT_URI: "${VITE_GOOGLE_REDIRECT_URI:-}",
  VITE_GOOGLE_AUTH_URI: "${VITE_GOOGLE_AUTH_URI:-}"
};
EOF

exec nginx -g 'daemon off;'

