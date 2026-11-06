#!/usr/bin/env bash
# Build a Splunk Cloud AppInspect-friendly tarball from dist/.
# Strips bundled ingest data and scripts that require local files or outbound network.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STAGE="/tmp/splunk4champions2"
OUT="${ROOT}/splunk4champions2-cloud.tar.gz"

if [[ ! -d "${ROOT}/dist" ]]; then
  echo "dist/ missing — run 'make build' first" >&2
  exit 1
fi

rm -rf "${STAGE}"
cp -R "${ROOT}/dist" "${STAGE}"
APP="${STAGE}"

# --- static/: Cloud allow-list is PNG/TXT only (app icons) ---
STATIC="${APP}/static"
if [[ -d "${STATIC}" ]]; then
  find "${STATIC}" -mindepth 1 -maxdepth 1 ! -name '*.png' -delete
fi

# Broken symlink once static/meteo_historic.csv is removed
rm -f "${APP}/lookups/meteo_historic.csv"

# --- bin/: remove data ingest / download / custom-search scripts ---
BIN="${APP}/bin"
if [[ -d "${BIN}" ]]; then
  rm -f \
    "${BIN}/download_tutorialdata.py" \
    "${BIN}/download_weatherdata.py" \
    "${BIN}/download_weatherdata24.py" \
    "${BIN}/download_wwwdata.py" \
    "${BIN}/update_wwwdata.py" \
    "${BIN}/update_meteo_historic_csv.py" \
    "${BIN}/update_stock_indices.py" \
    "${BIN}/open_meteo_weather.py" \
    "${BIN}/getweather.py"
  rmdir "${BIN}/__pycache__" 2>/dev/null || true
fi

# --- conf: no monitor/script inputs; no custom commands on Cloud package ---
cat > "${APP}/default/inputs.conf" <<'EOF'
# Splunk Cloud package: workshop data is pre-seeded on the tenant.
# No file monitors or scripted inputs ship in this build.
EOF

cat > "${APP}/default/commands.conf" <<'EOF'
# Splunk Cloud package: custom search commands removed (getweather relied on static/ data).
EOF

COPYFILE_DISABLE=1 COPY_EXTENDED_ATTRIBUTES_DISABLE=1 tar \
  --format=ustar \
  --no-xattrs \
  --exclude='.DS_Store' \
  --exclude='.gitkeep' \
  --exclude='local.meta' \
  --exclude='__pycache__' \
  --exclude='./splunk4champions2/local' \
  --exclude='*.pyc' \
  -czf "${OUT}" \
  -C /tmp \
  splunk4champions2

echo "Created ${OUT} ($(du -h "${OUT}" | awk '{print $1}'))"
